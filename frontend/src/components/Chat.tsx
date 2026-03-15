"use client";

import React, { useState, useEffect, useRef } from "react";

export default function Chat() {
    console.log("render");

    const [userMsg, setUserMsg] = useState<string>("");
    const [chatBotResponse, setChatBotResponse] = useState<string>("");
    const [stream, setStream] = useState<boolean>(true);
    const tokenQueue = useRef<string[]>([]);
    const flushTimer = useRef<NodeJS.Timeout | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        let response = await fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({
                "message": userMsg,
                "role": "user",
                "stream": stream
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!stream) {
            let data = await response.json();
            setChatBotResponse(data);
            return;
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No stream");
        const decoder = new TextDecoder();
        let buffer = "";

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
                    if (data === "[DONE]") return;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0].delta.content;

                        if (content) {
                            tokenQueue.current.push(content);
                        }
                    } catch { }
                }
            }
        }
    }

    useEffect(() => {
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
        <>
            <div className="flex-1 flex justify-center items-center">
                {chatBotResponse}
            </div>
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
                        onChange={(e) => setUserMsg(e.target.value)}
                    />
                    <button
                        className="border-gray-300 rounded-xl"
                    >
                        Send
                    </button>
                </form>
            </footer>
        </>
    );
}
