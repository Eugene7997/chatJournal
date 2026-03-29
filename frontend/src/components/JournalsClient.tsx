"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IoSearchOutline } from "react-icons/io5";
import type { Journal } from "@/lib/types/types";
import { FaRegTrashCan } from "react-icons/fa6";

// ─── Date helpers ────────────────────────────────────────────────────────────

function dayTs(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function isSameDay(a: Date, b: Date): boolean {
    return dayTs(a) === dayTs(b);
}

function isInRange(day: Date, a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    const t = dayTs(day);
    return t >= Math.min(dayTs(a), dayTs(b)) && t <= Math.max(dayTs(a), dayTs(b));
}

function rangeEdge(day: Date, a: Date | null, b: Date | null): "start" | "end" | "single" | null {
    if (!a || !b) return null;
    const lo = dayTs(a) <= dayTs(b) ? a : b;
    const hi = dayTs(a) <= dayTs(b) ? b : a;
    if (isSameDay(lo, hi) && isSameDay(day, lo)) return "single";
    if (isSameDay(day, lo)) return "start";
    if (isSameDay(day, hi)) return "end";
    return null;
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function prevMonth(year: number, month: number) {
    return month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
}

function nextMonth(year: number, month: number) {
    return month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
}

function Calendar({
    journals,
    rangeStart,
    rangeEnd,
    onRangeChange,
}: {
    journals: Journal[];
    rangeStart: Date | null;
    rangeEnd: Date | null;
    onRangeChange: (start: Date | null, end: Date | null) => void;
}) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    // Drag state — dragAnchor being non-null means a drag is in progress
    const [dragAnchor, setDragAnchor] = useState<Date | null>(null);
    const [dragCursor, setDragCursor] = useState<Date | null>(null);

    // Days with at least one journal
    const journalDays = new Set(journals.map(j => dayTs(new Date(j.created_at))));

    // Build cell array: nulls for leading blanks, then Date objects
    const leadingBlanks = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [
        ...Array(leadingBlanks).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
    ];

    // During drag show live anchor/cursor; when idle fall back to confirmed range
    const previewA = dragAnchor ?? rangeStart;
    const previewB = dragCursor ?? rangeEnd;

    // Global mouseup to finalise drag
    useEffect(() => {
        function onMouseUp() {
            if (!dragAnchor) return;
            if (dragCursor) {
                const lo = new Date(Math.min(dayTs(dragAnchor), dayTs(dragCursor)));
                const hi = new Date(Math.max(dayTs(dragAnchor), dayTs(dragCursor)));
                hi.setHours(23, 59, 59, 999);
                onRangeChange(lo, hi);
            }
            setDragAnchor(null);
            setDragCursor(null);
        }
        window.addEventListener("mouseup", onMouseUp);
        return () => window.removeEventListener("mouseup", onMouseUp);
    }, [dragAnchor, dragCursor, onRangeChange]);

    function handleMouseDown(day: Date) {
        setDragAnchor(day);
        setDragCursor(day);
    }

    function handleMouseEnter(day: Date) {
        if (dragAnchor) setDragCursor(day);
    }

    function goBack() {
        const { year, month } = prevMonth(viewYear, viewMonth);
        setViewYear(year);
        setViewMonth(month);
    }

    function goForward() {
        const { year, month } = nextMonth(viewYear, viewMonth);
        setViewYear(year);
        setViewMonth(month);
    }

    return (
        <div className="select-none p-4 border border-current/10 rounded-2xl">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={goBack}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-current/10 transition-colors text-lg leading-none opacity-60 hover:opacity-100"
                >
                    ‹
                </button>
                <span className="text-sm font-semibold">
                    {MONTHS[viewMonth]} {viewYear}
                </span>
                <button
                    onClick={goForward}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-current/10 transition-colors text-lg leading-none opacity-60 hover:opacity-100"
                >
                    ›
                </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map(d => (
                    <span key={d} className="text-center text-xs opacity-30 py-1">
                        {d}
                    </span>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
                {cells.map((day, i) => {
                    if (!day) return <div key={`blank-${i}`} className="h-8" />;

                    const inRange = isInRange(day, previewA, previewB);
                    const edge = rangeEdge(day, previewA, previewB);
                    const hasJournal = journalDays.has(dayTs(day));
                    const isToday = isSameDay(day, today);

                    // Background strip for in-range days
                    let bgClass = "hover:bg-current/8";
                    if (inRange && !edge) bgClass = "bg-blue-500/15";
                    if (edge === "start") bgClass = "bg-gradient-to-r from-transparent to-blue-500/15";
                    if (edge === "end") bgClass = "bg-gradient-to-l from-transparent to-blue-500/15";
                    if (edge === "single") bgClass = "";

                    // Inner circle for edge days
                    let circleClass = "";
                    if (edge) circleClass = "bg-blue-500 text-white";
                    else if (isToday && !inRange) circleClass = "ring-1 ring-current/30";

                    return (
                        <div
                            key={day.toISOString()}
                            className={`h-8 flex items-center justify-center cursor-pointer transition-colors ${bgClass}`}
                            onMouseDown={() => handleMouseDown(day)}
                            onMouseEnter={() => handleMouseEnter(day)}
                        >
                            <span
                                className={`relative w-7 h-7 flex items-center justify-center rounded-full text-xs transition-colors ${circleClass}`}
                            >
                                {day.getDate()}
                                {hasJournal && (
                                    <span
                                        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${edge ? "bg-white/70" : "bg-blue-500/60"}`}
                                    />
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Clear button */}
            {(rangeStart || rangeEnd) && (
                <div className="mt-3 flex justify-end">
                    <button
                        onClick={() => onRangeChange(null, null)}
                        className="text-xs opacity-40 hover:opacity-70 transition-opacity"
                    >
                        Clear filter
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main client component ────────────────────────────────────────────────────

export default function JournalsClient({ journals }: { journals: Journal[] }) {
    const [search, setSearch] = useState("");
    const [rangeStart, setRangeStart] = useState<Date | null>(null);
    const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
    const [journalList, setJournalList] = useState<Journal[]>(journals);
    const [deleteConfirmPending, setDeleteConfirmPending] = useState(false);

    async function handleDeleteJournal(journalId: string) {
        try {
            const response = await fetch("/api/journals", {
                method: "DELETE",
                body: JSON.stringify({ journalId }),
            });
            if (!response.ok) {
                console.error(`Failed to delete journal: ${response.statusText}`);
                return;
            }
            setJournalList(prev => prev.filter(j => j.id !== journalId));
        } catch (error) {
            console.error(`Error deleting journal: ${error}`);
        }
    }

    async function handleDeleteAllJournals() {
        try {
            const response = await fetch("/api/journals", {
                method: "DELETE",
                body: JSON.stringify({ deleteAll: true }),
            });
            if (!response.ok) {
                console.error(`Failed to delete all journals: ${response.statusText}`);
                return;
            }
            setJournalList([]);
            setDeleteConfirmPending(false);
        } 
        catch (error) {
            console.error(`Error deleting all journals: ${error}`);
        }
    }

    const filtered = journalList.filter(j => {
        if (search) {
            if (!j.content.toLowerCase().includes(search.toLowerCase())) return false;
        }
        if (rangeStart && rangeEnd) {
            const t = new Date(j.created_at).getTime();
            if (t < rangeStart.getTime() || t > rangeEnd.getTime()) return false;
        }
        return true;
    });

    return (
        <div>
            {/* Search bar */}
            <div className="relative mb-8">
                <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-lg" />
                <input
                    type="text"
                    placeholder="Search journals…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-current/15 bg-transparent focus:outline-none focus:border-current/40 transition-colors text-sm"
                />
            </div>

            {journalList.length > 0 && (
                <div className="flex justify-end items-center gap-3 mb-4">
                    {deleteConfirmPending ? (
                        <>
                            <span className="text-xs opacity-60">This will permanently delete all your journals.</span>
                            <button
                                onClick={handleDeleteAllJournals}
                                className="text-xs px-2.5 py-1 rounded-lg border border-red-500/40 text-red-500 opacity-70 hover:opacity-100 transition-opacity"
                            >
                                Confirm delete all
                            </button>
                            <button
                                onClick={() => setDeleteConfirmPending(false)}
                                className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setDeleteConfirmPending(true)}
                            className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                        >
                            Delete all journals
                        </button>
                    )}
                </div>
            )}

            <div className="flex gap-8 items-start">
                {/* Calendar sidebar */}
                <div className="w-64 flex-none sticky top-6">
                    <p className="text-xs font-semibold uppercase tracking-widest opacity-30 mb-3">
                        Filter by date
                    </p>
                    <Calendar
                        journals={journalList}
                        rangeStart={rangeStart}
                        rangeEnd={rangeEnd}
                        onRangeChange={(s, e) => { setRangeStart(s); setRangeEnd(e); }}
                    />
                    {rangeStart && rangeEnd && (
                        <p className="mt-2 text-xs opacity-40 text-center">
                            {rangeStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            {" – "}
                            {rangeEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                    )}
                </div>

                {/* Journal list */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {filtered.length === 0 ? (
                        <p className="opacity-40 text-sm text-center mt-16">
                            {search || rangeStart ? "No journals match your filters." : "No saved journals yet."}
                        </p>
                    ) : (
                        filtered.map(journal => {
                            const lines = journal.content.split("\n");
                            const date = new Date(journal.created_at).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            });

                            return (
                                <details key={journal.id} className="border border-current/10 rounded-2xl overflow-hidden group">
                                    <summary className="px-6 py-4 cursor-pointer flex justify-between items-center hover:bg-current/5 transition-colors list-none gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="font-semibold truncate">
                                                {journal.title || date}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-none">
                                            <span className="text-xs opacity-30">{date}</span>
                                            <Link
                                                href={`/chat?session=${journal.session_id}`}
                                                onClick={e => e.stopPropagation()}
                                                className="text-xs px-2.5 py-1 rounded-lg border border-current/20 opacity-50 hover:opacity-100 transition-opacity whitespace-nowrap"
                                            >
                                                View chat →
                                            </Link>
                                        </div>
                                    </summary>
                                    <div className="px-6 py-4 border-t border-current/10">
                                        <div className="flex justify-end mb-2">
                                            <button
                                                onClick={() => handleDeleteJournal(journal.id)}
                                                className="opacity-50 hover:opacity-100 transition-opacity"
                                            >
                                                <FaRegTrashCan />
                                            </button>
                                        </div>
                                        <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed opacity-80">
                                        {lines.map((line, i) => {
                                            if (line.startsWith("Date:")) {
                                                return <p key={i} className="font-semibold opacity-100 mb-3">{line}</p>;
                                            }
                                            if (line.startsWith("Feelings:")) {
                                                return <p key={i} className="mt-3 opacity-60 italic">{line}</p>;
                                            }
                                            if (line.trim() === "") return <br key={i} />;
                                            return <p key={i}>{line}</p>;
                                        })}
                                        </div>
                                    </div>
                                </details>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
