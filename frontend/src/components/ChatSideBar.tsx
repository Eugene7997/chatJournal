"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
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
        <div className="h-full border-r border-current/10 flex flex-col">
            <div className="px-4 py-4 border-b border-current/10 flex items-center justify-between">
                <h1 className="font-mono text-xs font-bold opacity-40 uppercase tracking-widest">Sessions</h1>
                <button
                    className="p-1.5 hover:text-brand transition-colors opacity-60 hover:opacity-100"
                    onClick={onNewSession}
                    aria-label="New conversation"
                    title="New conversation"
                >
                    <Plus size={16} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {loading ? (
                    <div className="flex justify-center items-center py-8 opacity-40">
                        <Loader2 className="animate-spin" size={18} />
                    </div>
                ) : (
                    <ul className="flex flex-col p-2">
                        {sessions && sessions.map((session) => (
                            <li
                                key={session.id}
                                className="relative cursor-pointer flex items-center justify-between px-3 py-2 hover:bg-foreground/5 transition-colors"
                                onClick={() => {
                                    if (renamingSessionId === session.id) return;
                                    setOpenMenuSessionId(null);
                                    onItemClick(session.id);
                                }}
                            >
                                {renamingSessionId === session.id ? (
                                    <input
                                        ref={renameInputRef}
                                        className="flex-1 font-mono text-xs px-2 py-1 border border-current/20 bg-transparent focus:outline-none focus:border-brand transition-colors"
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onBlur={() => setRenamingSessionId(null)}
                                        onKeyDown={(e) => handleRenameKeyDown(e, session.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <span className="truncate font-mono text-xs">{session.name ?? session.id}</span>
                                )}
                                <div className="relative">
                                    <button
                                        className="px-1 opacity-40 hover:opacity-100 hover:text-brand transition-colors font-mono"
                                        onClick={(e) => toggleMenu(e, session.id)}
                                        aria-label="Session options"
                                    >
                                        &#8943;
                                    </button>
                                    {openMenuSessionId === session.id && (
                                        <div className="absolute right-0 top-full mt-1 bg-background border border-current/10 shadow-md z-10 min-w-28">
                                            <button
                                                className="w-full text-left px-3 py-2 font-mono text-xs hover:bg-foreground/5 hover:text-brand transition-colors border-b border-current/10"
                                                onClick={(e) => handleRenameClick(e, session)}
                                            >
                                                Rename
                                            </button>
                                            <button
                                                className="w-full text-left px-3 py-2 font-mono text-xs opacity-60 hover:opacity-100 hover:text-red-500 hover:bg-foreground/5 transition-colors"
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
                )}
            </div>
        </div>
    );
}
