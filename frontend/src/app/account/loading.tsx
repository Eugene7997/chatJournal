export default function AccountLoading() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 animate-pulse">
            <div className="w-full max-w-sm">
                {/* Avatar + name */}
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="w-20 h-20 rounded-full bg-current/10" />
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-5 w-36 rounded bg-current/10" />
                        <div className="h-3 w-48 rounded bg-current/8" />
                    </div>
                </div>

                {/* Details panel */}
                <div className="border border-current/10 mb-6">
                    <div className="px-5 py-3 border-b border-current/10 flex justify-between items-center">
                        <div className="h-3 w-20 rounded bg-current/8" />
                        <div className="h-3 w-24 rounded bg-current/10" />
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center gap-4">
                        <div className="h-3 w-14 rounded bg-current/8 flex-none" />
                        <div className="h-3 w-32 rounded bg-current/10" />
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                    <div className="h-11 w-full border border-current/10 bg-current/5" />
                    <div className="h-11 w-full border border-current/10 bg-current/5" />
                </div>
            </div>
        </div>
    );
}
