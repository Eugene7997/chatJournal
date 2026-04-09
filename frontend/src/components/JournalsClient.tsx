"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Trash2, Pencil } from "lucide-react";
import type { Journal } from "@/lib/types/types";

// ─── Date helpers ────────────────────────────────────────────────────────────

export function dayTs(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function isSameDay(a: Date, b: Date): boolean {
    return dayTs(a) === dayTs(b);
}

export function isInRange(day: Date, a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    const t = dayTs(day);
    return t >= Math.min(dayTs(a), dayTs(b)) && t <= Math.max(dayTs(a), dayTs(b));
}

export function rangeEdge(day: Date, a: Date | null, b: Date | null): "start" | "end" | "single" | null {
    if (!a || !b) return null;
    const lo = dayTs(a) <= dayTs(b) ? a : b;
    const hi = dayTs(a) <= dayTs(b) ? b : a;
    if (isSameDay(lo, hi) && isSameDay(day, lo)) return "single";
    if (isSameDay(day, lo)) return "start";
    if (isSameDay(day, hi)) return "end";
    return null;
}

// ─── Content helpers ──────────────────────────────────────────────────────────

export function extractDateLine(content: string): { dateLine: string; editableContent: string } {
    const lines = content.split("\n");
    const idx = lines.findIndex(l => l.startsWith("Date:"));
    if (idx === -1) return { dateLine: "", editableContent: content };
    const dateLine = lines[idx];
    const remaining = [...lines.slice(0, idx), ...lines.slice(idx + 1)];
    return { dateLine, editableContent: remaining.join("\n").replace(/^\n+|\n+$/g, "") };
}

export function reconstructContent(editableContent: string, dateLine: string): string {
    if (!dateLine) return editableContent;
    return `${dateLine}\n\n${editableContent}`;
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
    const gridRef = useRef<HTMLDivElement>(null);

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

    // Global mouseup/touchend to finalise drag
    useEffect(() => {
        function onDragEnd() {
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
        window.addEventListener("mouseup", onDragEnd);
        window.addEventListener("touchend", onDragEnd);
        return () => {
            window.removeEventListener("mouseup", onDragEnd);
            window.removeEventListener("touchend", onDragEnd);
        };
    }, [dragAnchor, dragCursor, onRangeChange]);

    // Non-passive touch listeners on the grid so we can preventDefault (stops page scroll during drag)
    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        function dateFromPoint(x: number, y: number): Date | null {
            const el = document.elementFromPoint(x, y);
            const str = (el as HTMLElement | null)?.closest("[data-date]")?.getAttribute("data-date");
            return str ? new Date(str) : null;
        }

        function onTouchStart(e: TouchEvent) {
            const t = e.touches[0];
            const day = dateFromPoint(t.clientX, t.clientY);
            if (!day) return;
            e.preventDefault();
            setDragAnchor(day);
            setDragCursor(day);
        }

        function onTouchMove(e: TouchEvent) {
            const t = e.touches[0];
            const day = dateFromPoint(t.clientX, t.clientY);
            if (!day) return;
            e.preventDefault();
            setDragCursor(day);
        }

        grid.addEventListener("touchstart", onTouchStart, { passive: false });
        grid.addEventListener("touchmove", onTouchMove, { passive: false });
        return () => {
            grid.removeEventListener("touchstart", onTouchStart);
            grid.removeEventListener("touchmove", onTouchMove);
        };
    }, []);

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
        <div className="select-none p-4 border border-current/10">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={goBack}
                    className="w-7 h-7 flex items-center justify-center hover:text-brand transition-colors text-lg leading-none opacity-60 hover:opacity-100"
                >
                    ‹
                </button>
                <span className="font-mono text-xs font-bold uppercase tracking-widest opacity-60">
                    {MONTHS[viewMonth]} {viewYear}
                </span>
                <button
                    onClick={goForward}
                    className="w-7 h-7 flex items-center justify-center hover:text-brand transition-colors text-lg leading-none opacity-60 hover:opacity-100"
                >
                    ›
                </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map(d => (
                    <span key={d} className="text-center font-mono text-xs opacity-30 py-1">
                        {d}
                    </span>
                ))}
            </div>

            {/* Day cells */}
            <div ref={gridRef} className="grid grid-cols-7">
                {cells.map((day, i) => {
                    if (!day) return <div key={`blank-${i}`} className="h-8" />;

                    const inRange = isInRange(day, previewA, previewB);
                    const edge = rangeEdge(day, previewA, previewB);
                    const hasJournal = journalDays.has(dayTs(day));
                    const isToday = isSameDay(day, today);

                    // Background strip for in-range days
                    let bgClass = "hover:bg-current/8";
                    if (inRange && !edge) bgClass = "bg-brand/10";
                    if (edge === "start") bgClass = "bg-gradient-to-r from-transparent to-brand/10";
                    if (edge === "end") bgClass = "bg-gradient-to-l from-transparent to-brand/10";
                    if (edge === "single") bgClass = "";

                    // Inner circle for edge days
                    let circleClass = "";
                    if (edge) circleClass = "bg-brand text-white";
                    else if (isToday && !inRange) circleClass = "ring-1 ring-brand/40";

                    return (
                        <div
                            key={day.toISOString()}
                            data-date={day.toISOString()}
                            className={`h-8 flex items-center justify-center cursor-pointer transition-colors ${bgClass}`}
                            onMouseDown={() => handleMouseDown(day)}
                            onMouseEnter={() => handleMouseEnter(day)}
                        >
                            <span
                                className={`relative w-7 h-7 flex items-center justify-center rounded-full font-mono text-xs transition-colors ${circleClass}`}
                            >
                                {day.getDate()}
                                {hasJournal && (
                                    <span
                                        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${edge ? "bg-white/70" : "bg-brand/60"}`}
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
                        className="font-mono text-xs opacity-40 hover:opacity-70 hover:text-brand transition-colors"
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
    const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const editTitleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingJournalId) editTitleRef.current?.focus();
    }, [editingJournalId]);

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

    function handleStartEdit(journal: Journal) {
        const { editableContent } = extractDateLine(journal.content);
        setEditTitle(journal.title);
        setEditContent(editableContent);
        setEditingJournalId(journal.id);
    }

    function handleCancelEdit() {
        setEditingJournalId(null);
    }

    async function handleSaveEdit(journal: Journal) {
        const { dateLine } = extractDateLine(journal.content);
        const fullContent = reconstructContent(editContent, dateLine);
        try {
            const response = await fetch("/api/journals", {
                method: "PATCH",
                body: JSON.stringify({ journalId: journal.id, title: editTitle, content: fullContent }),
            });
            if (!response.ok) {
                console.error(`Failed to save journal: ${response.statusText}`);
                return;
            }
            setJournalList(prev => prev.map(j => j.id === journal.id ? { ...j, title: editTitle, content: fullContent } : j));
            setEditingJournalId(null);
        }
        catch (error) {
            console.error(`Error saving journal: ${error}`);
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={16} />
                <input
                    type="text"
                    placeholder="Search journals…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full font-mono text-sm pl-10 pr-4 py-3 border border-current/15 bg-transparent focus:outline-none focus:border-brand transition-colors"
                />
            </div>

            {journalList.length > 0 && (
                <div className="flex justify-end items-center gap-3 mb-4">
                    {deleteConfirmPending ? (
                        <>
                            <span className="font-mono text-xs opacity-60">This will permanently delete all your journals.</span>
                            <button
                                onClick={handleDeleteAllJournals}
                                className="font-mono text-xs px-3 py-1 border border-red-500/40 text-red-500 opacity-70 hover:opacity-100 transition-opacity"
                            >
                                Confirm delete all
                            </button>
                            <button
                                onClick={() => setDeleteConfirmPending(false)}
                                className="font-mono text-xs opacity-50 hover:opacity-100 transition-opacity"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setDeleteConfirmPending(true)}
                            className="font-mono text-xs opacity-40 hover:opacity-70 transition-opacity"
                        >
                            Delete all journals
                        </button>
                    )}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 sm:items-start">
                {/* Calendar sidebar */}
                <div className="w-full sm:w-64 flex-none sm:sticky top-6">
                    <p className="font-mono text-xs font-bold uppercase tracking-widest opacity-30 mb-3">
                        Filter by date
                    </p>
                    <Calendar
                        journals={journalList}
                        rangeStart={rangeStart}
                        rangeEnd={rangeEnd}
                        onRangeChange={(s, e) => { setRangeStart(s); setRangeEnd(e); }}
                    />
                    {rangeStart && rangeEnd && (
                        <p className="mt-2 font-mono text-xs opacity-40 text-center">
                            {rangeStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            {" – "}
                            {rangeEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                    )}
                </div>

                {/* Journal list */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                    {filtered.length === 0 ? (
                        <p className="font-mono text-xs opacity-40 text-center mt-16">
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
                            const { dateLine } = extractDateLine(journal.content);

                            return (
                                <details key={journal.id} className="border border-current/10 overflow-hidden group">
                                    <summary className="px-4 sm:px-6 py-4 cursor-pointer flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-current/5 transition-colors list-none gap-2 sm:gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="font-mono font-semibold text-sm truncate">
                                                {journal.title || date}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-none">
                                            <span className="font-mono text-xs opacity-30 hidden sm:inline">{date}</span>
                                            <Link
                                                href={`/chat?session=${journal.session_id}`}
                                                onClick={e => e.stopPropagation()}
                                                className="font-mono text-xs px-2.5 py-1 border border-current/20 opacity-50 hover:opacity-100 hover:border-brand hover:text-brand transition-colors whitespace-nowrap"
                                            >
                                                View chat →
                                            </Link>
                                        </div>
                                    </summary>
                                    {editingJournalId === journal.id ? (
                                        <div className="px-6 py-4 border-t border-current/10 flex flex-col gap-3">
                                            <input
                                                ref={editTitleRef}
                                                value={editTitle}
                                                onChange={e => setEditTitle(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === "Enter") handleSaveEdit(journal);
                                                    if (e.key === "Escape") handleCancelEdit();
                                                }}
                                                className="w-full font-mono text-sm px-3 py-2 border border-current/20 bg-transparent focus:outline-none focus:border-brand transition-colors"
                                                placeholder="Title"
                                            />
                                            {dateLine && (
                                                <p className="font-mono text-xs opacity-40 px-1">
                                                    {dateLine} <span className="opacity-60">(not editable)</span>
                                                </p>
                                            )}
                                            <textarea
                                                value={editContent}
                                                onChange={e => setEditContent(e.target.value)}
                                                onKeyDown={e => { if (e.key === "Escape") handleCancelEdit(); }}
                                                rows={8}
                                                className="w-full font-mono text-sm px-3 py-2 border border-current/20 bg-transparent focus:outline-none focus:border-brand transition-colors resize-y leading-relaxed"
                                                placeholder="Journal content…"
                                            />
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="font-mono text-xs opacity-50 hover:opacity-100 transition-opacity"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleSaveEdit(journal)}
                                                    className="font-mono text-xs px-3 py-1.5 bg-brand hover:bg-brand/90 text-white transition-colors"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="px-6 py-4 border-t border-current/10">
                                            <div className="flex justify-end gap-3 mb-3">
                                                <button
                                                    onClick={() => handleStartEdit(journal)}
                                                    className="opacity-40 hover:opacity-100 hover:text-brand transition-colors"
                                                    aria-label="Edit journal"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteJournal(journal.id)}
                                                    className="opacity-40 hover:opacity-100 hover:text-red-500 transition-colors"
                                                    aria-label="Delete journal"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                            <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed opacity-80">
                                                {lines.map((line, i) => {
                                                    if (line.startsWith("Date:")) {
                                                        return <p key={i} className="font-bold text-brand opacity-100 mb-3">{line}</p>;
                                                    }
                                                    if (line.startsWith("Feelings:")) {
                                                        return <p key={i} className="mt-3 opacity-60 italic">{line}</p>;
                                                    }
                                                    if (line.trim() === "") return <br key={i} />;
                                                    return <p key={i}>{line}</p>;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </details>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
