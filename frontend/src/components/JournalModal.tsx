"use client";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";

export default function JournalModal({ title, content, onClose, onSave }: { title: string; content: string; onClose: () => void; onSave: () => Promise<void> }) {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    async function handleSave() {
        setSaving(true);
        await onSave();
        setSaving(false);
        setSaved(true);
    }
    const lines = content.split("\n");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-background border border-current/10 shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-current/10">
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wide">{title || "Journal Entry"}</h2>
                    <button
                        onClick={onClose}
                        className="opacity-40 hover:opacity-100 hover:text-brand transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed opacity-80">
                        {lines.map((line, i) => {
                            if (line.startsWith("Date:")) {
                                return (
                                    <p key={i} className="font-bold opacity-100 mb-3 text-brand">
                                        {line}
                                    </p>
                                );
                            }
                            if (line.startsWith("Feelings:")) {
                                return (
                                    <p key={i} className="mt-3 opacity-60 italic">
                                        {line}
                                    </p>
                                );
                            }
                            if (line.trim() === "") {
                                return <br key={i} />;
                            }
                            return <p key={i}>{line}</p>;
                        })}
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-current/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 font-mono text-xs font-semibold border border-current/20 hover:border-current/40 hover:opacity-60 transition-colors"
                    >
                        CLOSE
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || saved}
                        className="flex items-center gap-2 px-4 py-2 font-mono text-xs font-semibold bg-brand hover:bg-brand/90 text-white disabled:opacity-40 transition-colors"
                    >
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        {saving ? "SAVING..." : saved ? "SAVED!" : "SAVE JOURNAL"}
                    </button>
                </div>
            </div>
        </div>
    );
}
