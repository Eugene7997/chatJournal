"use client";

import React, { useState, useEffect, useRef } from "react";

export default function Chat() {
    const [userMsg, setUserMsg] = useState<string>("");
    const formRef = useRef<HTMLFormElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);


    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        alert(userMsg)
    }

    useEffect(() => {
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
        }
    }, []);

    return (
        <>
            <div className="flex-1 flex justify-center items-center">
                {userMsg}
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
