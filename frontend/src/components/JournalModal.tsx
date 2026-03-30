"use client";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background border border-current/10 rounded-2xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-current/10">
                    <h2 className="text-lg font-semibold">{title || "Journal Entry"}</h2>
                    <button
                        onClick={onClose}
                        className="opacity-40 hover:opacity-70 text-xl leading-none transition-opacity"
                        aria-label="Close"
                    >
                        <IoMdClose />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed opacity-80">
                        {lines.map((line, i) => {
                            if (line.startsWith("Date:")) {
                                return (
                                    <p key={i} className="font-semibold opacity-100 mb-3">
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
                        onClick={handleSave}
                        disabled={saving || saved}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-current font-semibold text-sm hover:opacity-70 disabled:opacity-30 transition-opacity"
                    >
                        {saving && <AiOutlineLoading3Quarters className="animate-spin" />}
                        {saving ? "Saving..." : saved ? "Saved!" : "Save Journal"}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-current font-semibold text-sm hover:opacity-60 transition-opacity"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
