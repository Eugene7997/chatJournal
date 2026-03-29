"use client";

import { useState, useEffect, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import type { ChatSession } from "@/lib/types/types";

export default function ChatSideBar({ sessions, onItemClick, onNewSession, onDeleteSession, onRenameSession, loading }: {
    sessions: ChatSession[];
    onItemClick: (id: string) => void;
    onNewSession: () => void;
    onDeleteSession: (sessionId: string) => void;
    onRenameSession: (sessionId: string, name: string) => void;
    loading: boolean;
}) {
    const [openMenuSessionId, setOpenMenuSessionId] = useState<string | null>(null);
    const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState<string>("");
    const renameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleClickOutside() {
            setOpenMenuSessionId(null);
        }
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        if (renamingSessionId) {
            renameInputRef.current?.focus();
            renameInputRef.current?.select();
        }
    }, [renamingSessionId]);

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

    function handleRenameClick(e: React.MouseEvent, session: ChatSession) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        setOpenMenuSessionId(null);
        setRenamingSessionId(session.id);
        setRenameValue(session.name ?? "");
    }

    function commitRename(sessionId: string) {
        const trimmed = renameValue.trim();
        if (trimmed) {
            onRenameSession(sessionId, trimmed);
        }
        setRenamingSessionId(null);
    }

    function handleRenameKeyDown(e: React.KeyboardEvent, sessionId: string) {
        if (e.key === "Enter") {
            commitRename(sessionId);
        } else if (e.key === "Escape") {
            setRenamingSessionId(null);
        }
    }

    return (
        <div className="flex-2 border-r border-current/10 flex flex-col">
            <div className="px-4 py-4 border-b border-current/10 flex items-center justify-between">
                <h1 className="text-sm font-semibold opacity-60 uppercase tracking-wide">Sessions</h1>
                <button
                    className="text-sm px-2 py-1 rounded-lg hover:bg-foreground/5 transition-opacity opacity-60 hover:opacity-100"
                    onClick={onNewSession}
                    aria-label="New conversation"
                    title="New conversation"
                >
                    <FaPlus />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {loading ?
                    <p className="px-4 py-3 text-sm opacity-40">Loading...</p>
                    :
                    <ul className="flex flex-col p-2">
                        {sessions && sessions.map((session) => (
                            <li
                                key={session.id}
                                className="relative cursor-pointer flex items-center justify-between rounded-xl px-3 py-2 hover:bg-foreground/5 transition-opacity"
                                onClick={() => {
                                    if (renamingSessionId === session.id) return;
                                    setOpenMenuSessionId(null);
                                    onItemClick(session.id);
                                }}
                            >
                                {renamingSessionId === session.id ? (
                                    <input
                                        ref={renameInputRef}
                                        className="flex-1 text-sm px-1 rounded border border-current/20 bg-transparent"
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onBlur={() => commitRename(session.id)}
                                        onKeyDown={(e) => handleRenameKeyDown(e, session.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <span className="truncate text-sm">{session.name ?? session.id}</span>
                                )}
                                <div className="relative">
                                    <button
                                        className="px-1 hover:opacity-60 transition-opacity"
                                        onClick={(e) => toggleMenu(e, session.id)}
                                        aria-label="Session options"
                                    >
                                        &#8943;
                                    </button>
                                    {openMenuSessionId === session.id && (
                                        <div className="absolute right-0 top-full mt-1 bg-background border border-current/10 rounded-xl shadow-md z-10 min-w-25">
                                            <button
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-foreground/5 rounded-t-xl"
                                                onClick={(e) => handleRenameClick(e, session)}
                                            >
                                                Rename
                                            </button>
                                            <button
                                                className="w-full text-left px-3 py-2 text-sm opacity-60 hover:bg-foreground/5 rounded-b-xl"
                                                onClick={(e) => handleDelete(e, session.id)}
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
