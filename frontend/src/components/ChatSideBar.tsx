"use client";

import { useState, useEffect } from "react";

export default function ChatSideBar({ sessions, onItemClick, onDeleteSession, loading }: { sessions: string[], onItemClick: (index: string) => void, onDeleteSession: (sessionId: string) => void, loading: boolean }) {
    const [openMenuSessionId, setOpenMenuSessionId] = useState<string | null>(null);

    useEffect(() => {
        function handleClickOutside() {
            setOpenMenuSessionId(null);
        }
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    function toggleMenu(e: React.MouseEvent, sessionId: string) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        setOpenMenuSessionId(prev => prev === sessionId ? null : sessionId);
    }

    function handleDelete(e: React.MouseEvent, sessionId: string) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        setOpenMenuSessionId(null);
        onDeleteSession(sessionId);
    }

    return (
        <div className="flex-2 bg-amber-200 flex flex-col">
            <div>
                <h1>Sessions</h1>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {loading ?
                    <p>Loading</p>
                    :
                    <ul className="flex flex-col gap-4 p-2">
                        {sessions && sessions.map((session) => (
                            <li
                                key={session}
                                className="relative cursor-pointer flex items-center justify-between"
                                onClick={() => {
                                    setOpenMenuSessionId(null);
                                    onItemClick(session);
                                }}
                            >
                                <span className="truncate">{session}</span>
                                <div className="relative">
                                    <button
                                        className="px-1 hover:opacity-60"
                                        onClick={(e) => toggleMenu(e, session)}
                                        aria-label="Session options"
                                    >
                                        &#8943;
                                    </button>
                                    {openMenuSessionId === session && (
                                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-md z-10 min-w-[100px]">
                                            <button
                                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                onClick={(e) => handleDelete(e, session)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                }
            </div>
        </div>
    )
}
