"use client";

import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import AuthBox from "@/components/AuthBox";

export function LoginClient() {
    return (
        <div className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-sm flex flex-col items-center gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-3"
                >
                    <div className="rounded-full bg-brand/10 p-5">
                        <Pencil className="h-8 w-8 text-brand" />
                    </div>
                    <h1 className="font-mono text-3xl font-bold tracking-tight">
                        CHAT<span className="text-brand">JOURNAL</span>
                    </h1>
                    <p className="font-mono text-sm opacity-60 text-center">
                        Your thoughts, in conversation.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full border border-current/10 p-8 flex flex-col gap-6"
                >
                    <div className="flex flex-col gap-1">
                        <p className="font-mono text-xs text-brand tracking-widest uppercase">
                            Welcome
                        </p>
                        <h2 className="font-mono text-xl font-bold">
                            Login or create an account
                        </h2>
                        <p className="font-mono text-xs opacity-50 leading-relaxed mt-1">
                            Sign up for free and write your first entry in seconds.
                        </p>
                    </div>
                    <AuthBox />
                </motion.div>
            </div>
        </div>
    );
}

export function AlreadyLoggedIn() {
    return (
        <div className="flex-1 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-4 text-center"
            >
                <div className="rounded-full bg-brand/10 p-5">
                    <Pencil className="h-8 w-8 text-brand" />
                </div>
                <h1 className="font-mono text-2xl font-bold">YOU&apos;RE ALREADY IN</h1>
                <p className="font-mono text-sm opacity-60 max-w-xs">
                    You&apos;re already logged in. Head to your journal.
                </p>
                <a
                    href="/chat"
                    className="mt-2 flex items-center gap-2 px-8 py-3 bg-brand hover:bg-brand/90 text-white font-mono font-semibold text-sm transition-colors"
                >
                    GO TO CHAT
                </a>
            </motion.div>
        </div>
    );
}
