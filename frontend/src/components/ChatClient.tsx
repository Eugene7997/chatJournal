"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ChatSideBar from "@/src/components/ChatSideBar";
import JournalModal from "@/src/components/JournalModal";
import type { ChatCompletionResponse, ChatMessage, ChatSession, Usage } from "@/lib/types/types";

// TODOs:
// Consider adding react toastify for errors
// Implement markdown in chatbot's reply
// Implement auto scrolling down when chatbot replies or user presses enter

export default function ChatClient({ initialSessionId }: { initialSessionId?: string }) {
    const router = useRouter();
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentChatSession, setCurrentChatSession] = useState<string>("");
    const [userMsg, setUserMsg] = useState<string>("");
    const [chatBotResponse, setChatBotResponse] = useState<string>("");
    const [stream, setStream] = useState<boolean>(true);
    const tokenQueue = useRef<string[]>([]);
    const flushTimer = useRef<NodeJS.Timeout | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [error, setError] = useState<string>("");
    const [disableChatbox, setDisableChatbox] = useState<boolean>(false);
    const [sendingUserMessage, setSendingUserMessage] = useState<boolean>(false);
    const [loadingSessionBar, setLoadingSessionBar] = useState<boolean>(false);
    const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
    const [journalContent, setJournalContent] = useState<string>("");
    const [journalTitle, setJournalTitle] = useState<string>("");
    const [journalSaved, setJournalSaved] = useState<boolean>(false);
    const [generatingJournal, setGeneratingJournal] = useState<boolean>(false);

    async function saveMessage(
        sessionId: string,
        role: string,
        content: string,
        model: string,
        usage?: { openrouterId?: string; provider?: string; promptTokens?: number; completionTokens?: number; totalTokens?: number; cost?: number }
    ) {
        try {
            await fetch("/api/chat/save_message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ sessionId, role, content, model, ...usage })
            });
        }
        catch (error) {
            console.error(`Couldn't save message.\n${error}`);
        }
    }

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        let chatSessionId;

        if (messages.length <= 0 && currentChatSession.length <= 0) {
            try {
                const response = await fetch("/api/chat/chat_session", {
                    method: "POST",
                });

                if (!response.ok) {
                    setDisableChatbox(true);
                    setError("Unable to create a chat session. Please try again later.");
                }

                const data = await response.json();

                if (!data) {
                    setDisableChatbox(true);
                    setError("Unable to create a chat session. Please try again later.");
                }

                chatSessionId = data.chat_session_id;
                setCurrentChatSession(chatSessionId);
                setSessions([{ id: chatSessionId, name: null }, ...sessions]);
            }
            catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                }
                else {
                    setError(String(error));
                }
            }
        }

        chatSessionId = currentChatSession || chatSessionId;

        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setChatBotResponse("");

        const response = await fetch("/api/chat/message", {
            method: "POST",
            body: JSON.stringify({
                "sessionId": chatSessionId,
                "message": userMsg,
                "role": "user",
                "stream": stream
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        setUserMsg("");

        if (!stream) {
            let data = await response.json();
            data = data.data as ChatCompletionResponse;
            const assistantContent = data.choices[0].message.content;
            setMessages(prev => [...prev, { role: "assistant", content: assistantContent }]);
            // Please note that chatbot response messages are saved by the route
            // when not streaming. Do not use saveMessages()
            return;
        }

        if (chatSessionId) {
            await saveMessage(chatSessionId, "user", userMsg, "")
        }
        
        // TODO: Implement logic for stream cancellation

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No stream");
        const decoder = new TextDecoder();
        let buffer = "";
        const finalResponse = {
            id: "",
            model: "",
            provider: "",
            choices: [{
                index: 0,
                message: {
                    role: "assistant",
                    content: ""
                },
                finish_reason: ""
            }]
        } as ChatCompletionResponse & { provider: string };


        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            while (true) {
                const lineEnd = buffer.indexOf("\n");
                if (lineEnd === -1) break;

                const line = buffer.slice(0, lineEnd).trim();
                buffer = buffer.slice(lineEnd + 1);

                if (line.startsWith("data: ")) {
                    const data = line.slice(6);
                    if (data === "[DONE]") {
                        const assistantContent = finalResponse.choices[0].message.content;
                        tokenQueue.current = [];
                        setChatBotResponse("");
                        setMessages(prev => [...prev, { role: "assistant", content: assistantContent }]);

                        if (chatSessionId) {
                            await saveMessage(
                                chatSessionId,
                                "assistant",
                                assistantContent,
                                finalResponse.model,
                                {
                                    openrouterId: finalResponse.id,
                                    provider: finalResponse.provider,
                                    promptTokens: finalResponse.usage?.prompt_tokens,
                                    completionTokens: finalResponse.usage?.completion_tokens,
                                    totalTokens: finalResponse.usage?.total_tokens,
                                    cost: (finalResponse.usage as Usage)?.cost,
                                }
                            );
                        }
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        
                        if (!finalResponse.id) {
                            finalResponse.id = parsed.id;
                            finalResponse.model = parsed.model;
                            finalResponse.provider = parsed.provider ?? "";
                        }

                        const delta = parsed.choices[0]?.delta;
                        if (delta?.content) {
                            finalResponse.choices[0].message.content += delta.content;
                        }

                        if (parsed.choices[0]?.finish_reason) {
                            finalResponse.choices[0].finish_reason = parsed.choices[0].finish_reason;
                        }

                        if (parsed.usage) {
                            finalResponse.usage = parsed.usage;
                        }

                        const content = parsed.choices[0].delta.content;

                        if (content) {
                            tokenQueue.current.push(content);
                        }
                    } 
                    catch (error) {
                        console.error(error);
                    }
                }
            }
        }
    }

    async function fetchSessionMessages(index: string) {
        setLoadingMessages(true);

        try {
            const response = await fetch(`/api/chat/message?sessionId=${index}`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data || !data.messages) {
                throw new Error("Invalid response from server");
            }

                const retrieved = data.messages.map((row: ChatMessage) => ({
                role: row.role as "user" | "assistant",
                content: row.content,
            }));

            setMessages([...retrieved]);
            setChatBotResponse("");
        }
        catch (error) {
            console.error(`${error}`);
        }

        setLoadingMessages(false);
    }

    function handleNewSession() {
        setCurrentChatSession("");
        setMessages([]);
        setChatBotResponse("");
        router.replace("/chat");
    }

    function handleSessionClick(index: string) {
        setCurrentChatSession(index);
        fetchSessionMessages(index);
        router.replace(`/chat?session=${index}`);
    }

    async function handleDeleteSession(sessionId: string) {
        try {
            const response = await fetch("/api/chat/chat_session", {
                method: "DELETE",
                body: JSON.stringify({ sessionId }),
            });

            if (!response.ok) {
                console.error(`Failed to delete session: ${response.statusText}`);
                return;
            }

            setSessions(prev => prev.filter(s => s.id !== sessionId));

            if (currentChatSession === sessionId) {
                setCurrentChatSession("");
                setMessages([]);
                router.replace("/chat");
            }
        }
        catch (error) {
            console.error(`Error deleting session: ${error}`);
        }
    }

    async function handleRenameSession(sessionId: string, name: string) {
        try {
            const response = await fetch("/api/chat/chat_session", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, name }),
            });

            if (!response.ok) {
                console.error(`Failed to rename session: ${response.statusText}`);
                return;
            }

            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, name } : s));
        }
        catch (error) {
            console.error(`Error renaming session: ${error}`);
        }
    }

    async function generateJournal() {
        if (!currentChatSession) return;
        setGeneratingJournal(true);
        try {
            const response = await fetch("/api/chat/journal", {
                method: "POST",
                body: JSON.stringify({ sessionId: currentChatSession }),
            });

            if (!response.ok) {
                console.error(`Journal generation failed: ${response.statusText}`);
                return;
            }
            
            const data = await response.json();

            setJournalContent(data.content ?? "");
            setJournalTitle(data.title ?? "");
            setJournalSaved(false);
        }
        catch (error) {
            console.error(`Journal generation error: ${error}`);
        }
        setGeneratingJournal(false);
    }

    async function saveJournal() {
        if (!currentChatSession || !journalContent) return;
        try {
            await fetch("/api/journals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: currentChatSession, title: journalTitle, content: journalContent }),
            });
            setJournalSaved(true);
        }
        catch (error) {
            console.error(`Failed to save journal: ${error}`);
        }
    }

    async function fetchSessions() {
        setLoadingSessionBar(true);

        try {
            const response = await fetch("/api/chat/chat_session", {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data || !data.sessions) {
                throw new Error("Invalid response from server");
            }

            setSessions(data.sessions);
        }
        catch (error) {
            setError(`Unable to load session, ${currentChatSession}.\n${error}`);
            console.error(`error: ${error}`);
        }
        setLoadingSessionBar(false);
    }

    useEffect(() => {
        if (initialSessionId) {
            setCurrentChatSession(initialSessionId);
            fetchSessionMessages(initialSessionId);
        }

        fetchSessions();

        flushTimer.current = setInterval(() => {
            if (tokenQueue.current.length === 0) {
                return;
            }

            const chunk = tokenQueue.current.join("");
            tokenQueue.current = [];
            setChatBotResponse(prev => prev + chunk);

        }, 30);

        const form = formRef.current;
        const textarea = textareaRef.current;

        function handleTextAreaCustomEnter(e: KeyboardEvent) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // stop newline
                form?.requestSubmit();
            }
        }

        textarea?.addEventListener("keydown", handleTextAreaCustomEnter);

        return () => {
            textarea?.removeEventListener("keydown", handleTextAreaCustomEnter);
            if (flushTimer.current) {
                clearInterval(flushTimer.current);
            }
        }
    }, []);

    return (
        <div className="absolute inset-0 flex">
            {journalContent && <JournalModal title={journalTitle} content={journalContent} onClose={() => setJournalContent("")} onSave={saveJournal} />}
            <ChatSideBar sessions={sessions} onItemClick={handleSessionClick} onNewSession={handleNewSession} onDeleteSession={handleDeleteSession} onRenameSession={handleRenameSession} loading={loadingSessionBar} />
            <div className="flex-8 flex flex-col">
                {currentChatSession && (
                    <div className="flex-none flex justify-end px-6 py-2 border-b border-slate-100">
                        <button
                            onClick={generateJournal}
                            disabled={generatingJournal}
                            className="text-sm px-3 py-1.5 rounded-xl border border-current font-semibold hover:opacity-60 disabled:opacity-30 transition-opacity"
                        >
                            {generatingJournal ? "Generating..." : "Generate Journal"}
                        </button>
                    </div>
                )}
                {error ? (
                    <div className="flex-1 flex justify-center items-center text-red-500">
                        {error}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-6 py-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                                    msg.role === "user"
                                        ? "bg-foreground text-background"
                                        : "bg-foreground/5 border border-current/10"
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {chatBotResponse && (
                            <div className="flex justify-start">
                                <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-foreground/5 border border-current/10">
                                    {chatBotResponse}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <footer className="flex-none backdrop-blur-lg border-t border-slate-200">
                    <form
                        ref={formRef}
                        className="w-full flex gap-8 px-8 py-4"
                        onSubmit={handleSubmit}
                    >
                        <textarea
                            ref={textareaRef}
                            className="flex-1 border-2 border-gray-300 rounded-xl p-4"
                            placeholder="Start typing!"
                            value={userMsg}
                            onChange={(e) => setUserMsg(e.target.value)}
                            disabled={disableChatbox}
                        />
                        <button
                            className="border-gray-300 rounded-xl"
                            disabled={disableChatbox}
                        >
                            Send
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
}
