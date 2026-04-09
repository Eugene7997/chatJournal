/// <reference types="dom-speech-recognition" />

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, Mic, MicOff, AudioLines, Menu } from "lucide-react";
import ChatSideBar from "@/src/components/ChatSideBar";
import JournalModal from "@/src/components/JournalModal";
import type { ChatCompletionResponse, ChatMessage, ChatSession, Usage } from "@/lib/types/types";

// TODOs:
// Implement markdown in chatbot's reply

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
    const [disableChatbox, setDisableChatbox] = useState<boolean>(false);
    const [sendingUserMessage, setSendingUserMessage] = useState<boolean>(false);
    const [loadingSessionBar, setLoadingSessionBar] = useState<boolean>(false);
    const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
    const [journalContent, setJournalContent] = useState<string>("");
    const [journalTitle, setJournalTitle] = useState<string>("");
    const [journalSaved, setJournalSaved] = useState<boolean>(false);
    const [generatingJournal, setGeneratingJournal] = useState<boolean>(false);
    const [listening, setListening] = useState<boolean>(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [conversationalModeActive, setConversationalModeActive] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [convStatus, setConvStatus] = useState<"listening" | "thinking" | "speaking">("listening");
    const conversationalModeRef = useRef<boolean>(false);
    const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
    const speakKeepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const sendingRef = useRef<boolean>(false);

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

        const messageToSend = userMsg.trim();
        if (!messageToSend) return;

        setUserMsg("");

        let chatSessionId;

        if (messages.length <= 0 && currentChatSession.length <= 0) {
            try {
                const response = await fetch("/api/chat/chat_session", {
                    method: "POST",
                });

                if (!response.ok) {
                    setUserMsg(messageToSend);
                    setDisableChatbox(true);
                    toast.error("Unable to create a chat session. Please try again later.");
                    return;
                }

                const data = await response.json();

                if (!data) {
                    setDisableChatbox(true);
                    toast.error("Unable to create a chat session. Please try again later.");
                    return;
                }

                chatSessionId = data.chat_session_id;
                setCurrentChatSession(chatSessionId);
                setSessions([{ id: chatSessionId, name: null }, ...sessions]);
            }
            catch (error) {
                setUserMsg(messageToSend);
                setDisableChatbox(true);
                toast.error(error instanceof Error ? error.message : String(error));
                return;
            }
        }

        chatSessionId = currentChatSession || chatSessionId;

        setMessages(prev => [...prev, { role: "user", content: messageToSend }]);
        setChatBotResponse("");

        const response = await fetch("/api/chat/message", {
            method: "POST",
            body: JSON.stringify({
                "sessionId": chatSessionId,
                "message": messageToSend,
                "role": "user",
                "stream": stream
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });

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
            await saveMessage(chatSessionId, "user", messageToSend, "")
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

                        if (conversationalModeRef.current) {
                            sendingRef.current = false;
                            setConvStatus("speaking");
                            await speakText(assistantContent);
                            if (conversationalModeRef.current) {
                                startConversationalListening();
                            }
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
                        setUserMsg(messageToSend);
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
            toast.error("Failed to load messages. Please try again.");
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
                toast.error("Failed to delete session. Please try again.");
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
            toast.error("Failed to delete session. Please try again.");
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
                toast.error("Failed to rename session. Please try again.");
                return;
            }

            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, name } : s));
        }
        catch (error) {
            toast.error("Failed to rename session. Please try again.");
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
                toast.error("Failed to generate journal. Please try again.");
                console.error(`Journal generation failed: ${response.statusText}`);
                return;
            }

            const data = await response.json();

            setJournalContent(data.content ?? "");
            setJournalTitle(data.title ?? "");
            setJournalSaved(false);
        }
        catch (error) {
            toast.error("Failed to generate journal. Please try again.");
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
            toast.error("Failed to save journal. Please try again.");
            console.error(`Failed to save journal: ${error}`);
        }
    }

    function toggleMic() {
        const SpeechRecognitionAPI =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            toast.error("Speech recognition is not supported in this browser.");
            return;
        }

        if (listening) {
            recognitionRef.current?.stop();
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (e: SpeechRecognitionEvent) => {
            const transcript = Array.from(e.results)
                .slice(e.resultIndex)
                .map((r) => r[0].transcript)
                .join("");
            setUserMsg(prev => prev + transcript);
        };

        recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
            if (e.error !== "aborted") {
                toast.error(`Speech recognition error: ${e.error}`);
            }
            setListening(false);
        };

        recognition.onend = () => setListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
    }

    function speakText(text: string): Promise<void> {
        return new Promise((resolve) => {
            if (speakKeepAliveRef.current) {
                clearInterval(speakKeepAliveRef.current);
                speakKeepAliveRef.current = null;
            }

            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";

            // Mobile browsers (iOS/Android) silently pause long utterances — resume() keeps it alive
            speakKeepAliveRef.current = setInterval(() => {
                if (window.speechSynthesis.paused) {
                    window.speechSynthesis.resume();
                }
            }, 250);

            const cleanup = () => {
                if (speakKeepAliveRef.current) {
                    clearInterval(speakKeepAliveRef.current);
                    speakKeepAliveRef.current = null;
                }
            };

            utterance.onend = () => { cleanup(); resolve(); };
            utterance.onerror = () => { cleanup(); resolve(); };
            synthRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        });
    }

    function startConversationalListening() {
        if (!conversationalModeRef.current) return;

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            toast.error("Speech recognition is not supported in this browser.");
            stopConversationalMode();
            return;
        }

        setConvStatus("listening");

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        let hasResult = false;

        recognition.onresult = (e: SpeechRecognitionEvent) => {
            const transcript = Array.from(e.results).map((r) => r[0].transcript).join("").trim();
            if (transcript) { hasResult = true; setUserMsg(transcript); }
        };

        recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
            if (e.error !== "aborted") console.warn(`Conv recognition error: ${e.error}`);
        };

        recognition.onend = () => {
            if (!conversationalModeRef.current) return;
            if (hasResult) {
                setConvStatus("thinking");
                sendingRef.current = true;
                formRef.current?.requestSubmit();
            }
            else {
                startConversationalListening();
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }

    function startConversationalMode() {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            toast.error("Speech recognition is not supported in this browser.");
            return;
        }
        if (listening) { recognitionRef.current?.stop(); setListening(false); }

        // Unlock speech synthesis on the user gesture — mobile browsers (iOS/Android Chrome)
        // block speechSynthesis.speak() in async contexts; priming it here makes later calls work.
        const unlock = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(unlock);
        window.speechSynthesis.cancel();

        conversationalModeRef.current = true;
        setConversationalModeActive(true);
        startConversationalListening();
    }

    function stopConversationalMode() {
        conversationalModeRef.current = false;
        sendingRef.current = false;
        if (speakKeepAliveRef.current) {
            clearInterval(speakKeepAliveRef.current);
            speakKeepAliveRef.current = null;
        }
        window.speechSynthesis.cancel();
        synthRef.current = null;
        recognitionRef.current?.abort();
        recognitionRef.current = null;
        setConversationalModeActive(false);
        setConvStatus("listening");
        setUserMsg("");
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
            toast.error("Unable to load sessions. Please refresh and try again.");
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
            if (speakKeepAliveRef.current) {
                clearInterval(speakKeepAliveRef.current);
            }
            window.speechSynthesis?.cancel();
            recognitionRef.current?.abort();
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, chatBotResponse]);

    return (
        <div className="absolute inset-0 flex overflow-hidden">
            {journalContent && <JournalModal title={journalTitle} content={journalContent} onClose={() => setJournalContent("")} onSave={saveJournal} />}

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar: drawer on mobile, inline on desktop */}
            <div className={`fixed md:relative inset-y-0 left-0 z-40 md:z-auto w-64 md:w-auto md:flex-2 bg-background md:bg-transparent transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <ChatSideBar
                    sessions={sessions}
                    onItemClick={(id) => { handleSessionClick(id); setSidebarOpen(false); }}
                    onNewSession={() => { handleNewSession(); setSidebarOpen(false); }}
                    onDeleteSession={handleDeleteSession}
                    onRenameSession={handleRenameSession}
                    loading={loadingSessionBar}
                />
            </div>

            <div className="flex-1 md:flex-8 flex flex-col min-w-0">
                {/* Top bar: hamburger on mobile + generate journal button */}
                <div className={`flex-none flex items-center justify-between px-3 sm:px-6 py-2 border-b border-current/10 ${!currentChatSession ? "md:hidden" : ""}`}>
                    <button
                        className="md:hidden p-1.5 hover:text-brand transition-colors"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sessions"
                    >
                        <Menu size={18} />
                    </button>
                    {currentChatSession && (
                        <button
                            onClick={generateJournal}
                            disabled={generatingJournal}
                            className="ml-auto flex items-center gap-2 font-mono text-xs px-3 py-1.5 border border-current/20 font-semibold hover:border-brand hover:text-brand disabled:opacity-30 transition-colors"
                        >
                            {generatingJournal && <Loader2 size={12} className="animate-spin" />}
                            {generatingJournal ? "GENERATING..." : "GENERATE JOURNAL"}
                        </button>
                    )}
                </div>

                {loadingMessages ? (
                    <div className="flex-1 flex justify-center items-center opacity-40">
                        <Loader2 className="animate-spin" size={22} />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-3 sm:px-6 py-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-3 font-mono text-sm leading-relaxed whitespace-pre-wrap ${
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
                                <div className="max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-3 font-mono text-sm leading-relaxed whitespace-pre-wrap bg-foreground/5 border border-current/10">
                                    {chatBotResponse}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                <footer className="flex-none border-t border-current/10">
                    <form
                        ref={formRef}
                        className="w-full flex gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4"
                        onSubmit={handleSubmit}
                    >
                        {!conversationalModeActive && (
                            <textarea
                                ref={textareaRef}
                                className="flex-1 border border-current/20 font-mono text-sm p-3 bg-transparent focus:outline-none focus:border-brand transition-colors resize-none"
                                placeholder="Start typing…"
                                rows={1}
                                value={userMsg}
                                onChange={(e) => setUserMsg(e.target.value)}
                                disabled={disableChatbox}
                            />
                        )}
                        <div className="flex flex-row gap-2 items-stretch">
                            <button
                                type="button"
                                onClick={toggleMic}
                                disabled={disableChatbox || conversationalModeActive}
                                className={`p-3 flex items-center justify-center border transition-colors disabled:opacity-30 ${
                                    listening
                                        ? "bg-brand border-brand text-white animate-pulse"
                                        : "border-current/20 hover:border-brand hover:text-brand"
                                }`}
                                title={listening ? "Stop recording" : "Start recording"}
                            >
                                {listening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                            <button
                                type="button"
                                onClick={startConversationalMode}
                                disabled={disableChatbox}
                                className={`p-3 flex items-center justify-center border transition-colors disabled:opacity-30 ${
                                    conversationalModeActive
                                        ? "bg-brand border-brand text-white"
                                        : "border-current/20 hover:border-brand hover:text-brand"
                                }`}
                                title="Start conversational mode"
                            >
                                <AudioLines size={18} />
                            </button>
                            {!conversationalModeActive && (
                                <button
                                    type="submit"
                                    className="px-4 sm:px-6 border border-current/20 font-mono text-xs font-semibold hover:bg-brand hover:border-brand hover:text-white transition-colors disabled:opacity-30"
                                    disabled={disableChatbox}
                                >
                                    SEND
                                </button>
                            )}
                        </div>
                    </form>

                    {conversationalModeActive && (
                        <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 border border-current/10 bg-background/90 backdrop-blur-lg shadow-lg">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                                convStatus === "listening" ? "bg-green-500 animate-pulse" :
                                convStatus === "thinking"  ? "bg-brand animate-spin" :
                                "bg-brand animate-pulse"
                            }`} />
                            <span className="font-mono text-xs font-semibold uppercase tracking-wide">
                                {convStatus === "listening" ? "Listening..." :
                                 convStatus === "thinking"  ? "Thinking..." : "Speaking..."}
                            </span>
                            <button
                                type="button"
                                onClick={stopConversationalMode}
                                className="ml-2 px-3 py-1.5 border border-current/20 font-mono text-xs font-semibold hover:border-brand hover:text-brand transition-colors"
                            >
                                END
                            </button>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
}
