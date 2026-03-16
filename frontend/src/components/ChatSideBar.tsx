"use client";

export default function ChatSideBar({ sessions, onItemClick }: { sessions: string[], onItemClick: (index: string) => void}) {
    return (
        <div className="flex-2 bg-amber-200 flex flex-col">
            <div>
                <h1>Sessions</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
                <ul className="flex flex-col gap-4 p-2 ">
                    {sessions && sessions.map((session) => (
                        <li key={session} className="cursor-pointer" onClick={() => onItemClick(session)}>
                            {session}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}