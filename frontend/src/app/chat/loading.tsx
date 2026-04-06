export default function ChatLoading() {
    return (
        <div className="absolute inset-0 flex overflow-hidden animate-pulse">
            {/* Sidebar skeleton */}
            <div className="hidden md:flex flex-col w-56 border-r border-current/10 p-3 gap-2">
                <div className="h-9 rounded-xl bg-current/8 mb-2" />
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-8 rounded-lg bg-current/5" />
                ))}
            </div>

            {/* Main area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <div className="flex-none flex items-center justify-end px-6 py-2 border-b border-slate-100">
                    <div className="h-8 w-36 rounded-xl bg-current/8" />
                </div>

                {/* Messages area */}
                <div className="flex-1 flex flex-col gap-3 px-6 py-4 overflow-hidden">
                    <div className="flex justify-end">
                        <div className="h-10 w-48 rounded-2xl bg-current/10" />
                    </div>
                    <div className="flex justify-start">
                        <div className="h-16 w-72 rounded-2xl bg-current/5" />
                    </div>
                    <div className="flex justify-end">
                        <div className="h-10 w-32 rounded-2xl bg-current/10" />
                    </div>
                    <div className="flex justify-start">
                        <div className="h-24 w-80 rounded-2xl bg-current/5" />
                    </div>
                </div>

                {/* Input footer */}
                <div className="flex-none border-t border-slate-200 px-8 py-4 flex gap-8">
                    <div className="flex-1 h-14 rounded-xl bg-current/8" />
                    <div className="flex gap-2">
                        <div className="w-14 h-14 rounded-xl bg-current/8" />
                        <div className="w-14 h-14 rounded-xl bg-current/8" />
                        <div className="w-20 h-14 rounded-xl bg-current/8" />
                    </div>
                </div>
            </div>
        </div>
    );
}
