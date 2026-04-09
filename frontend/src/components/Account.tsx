"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Trash2, User } from "lucide-react";
import type { User as UserType } from "@/lib/types/types";

export default function Account({ user }: { user: UserType }) {
    const router = useRouter();
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    async function handleDeleteAccount() {
        try {
            const response = await fetch("/api/auth/delete", {
                method: "DELETE",
            });

            const data = await response.json();

            if (data) {
                router.push("/auth/logout");
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm"
            >
                {/* Header */}
                <div className="flex flex-col items-center gap-4 mb-8">
                    {user.picture ? (
                        <Image
                            src={user.picture}
                            alt="Profile picture"
                            width={80}
                            height={80}
                            className="rounded-full border-2 border-brand/30"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-brand/10 border-2 border-brand/30 flex items-center justify-center">
                            <User className="h-8 w-8 text-brand" />
                        </div>
                    )}
                    <div className="text-center">
                        <h1 className="font-mono text-xl font-bold">{user.name || "Your Account"}</h1>
                        <p className="font-mono text-xs opacity-50 mt-1">{user.email}</p>
                    </div>
                </div>

                {/* Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="border border-current/10 mb-6"
                >
                    <div className="px-5 py-3 border-b border-current/10 flex justify-between items-center">
                        <span className="font-mono text-xs opacity-40 uppercase tracking-widest">Nickname</span>
                        <span className="font-mono text-xs">{user.nickname || "N/A"}</span>
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center gap-4">
                        <span className="font-mono text-xs opacity-40 uppercase tracking-widest flex-none">Auth ID</span>
                        <span className="font-mono text-xs opacity-60 truncate text-right">
                            {user.sub?.split("|")[1] || user.sub}
                        </span>
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex flex-col gap-3"
                >
                    <a
                        href="/auth/logout"
                        className="flex items-center justify-center gap-2 w-full py-3 font-mono text-xs font-semibold border border-current/20 hover:border-brand hover:text-brand transition-colors"
                    >
                        <LogOut size={14} />
                        SIGN OUT
                    </a>

                    {deleteConfirm ? (
                        <div className="border border-red-500/30 p-4 flex flex-col gap-3">
                            <p className="font-mono text-xs text-center opacity-60">
                                This will permanently delete your account and all data.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(false)}
                                    className="flex-1 py-2 font-mono text-xs border border-current/20 hover:opacity-60 transition-opacity"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex-1 py-2 font-mono text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                                >
                                    CONFIRM
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setDeleteConfirm(true)}
                            className="flex items-center justify-center gap-2 w-full py-3 font-mono text-xs font-semibold border border-red-500/30 text-red-500 opacity-60 hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={14} />
                            DELETE ACCOUNT
                        </button>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
