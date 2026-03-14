"use client";

import React, { useState } from "react";

export default function Chat() {
    const [userMsg, setUserMsg] = useState<string>("");

    function handleSubmit(e : React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        alert(userMsg)
    }

    return (
        <>
            <div className="flex-1 flex justify-center items-center">
                {userMsg}
            </div>
            <footer className="flex-none backdrop-blur-lg border-t border-slate-200">
                <form
                    className="w-full flex gap-8 px-8 py-4"
                    onSubmit={handleSubmit}
                >
                    <textarea
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
