export default function JournalsLoading() {
    return (
        <div className="max-w-5xl mx-auto w-full px-4 py-10 animate-pulse">
            {/* Title */}
            <div className="h-9 w-48 rounded-xl bg-current/10 mb-8" />

            {/* Search bar */}
            <div className="h-12 rounded-xl bg-current/8 mb-8" />

            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 sm:items-start">
                {/* Calendar sidebar skeleton */}
                <div className="w-full sm:w-64 flex-none">
                    <div className="h-4 w-24 rounded bg-current/10 mb-3" />
                    <div className="border border-current/10 rounded-2xl p-4">
                        <div className="flex justify-between mb-4">
                            <div className="w-6 h-6 rounded-lg bg-current/8" />
                            <div className="h-5 w-32 rounded bg-current/10" />
                            <div className="w-6 h-6 rounded-lg bg-current/8" />
                        </div>
                        <div className="grid grid-cols-7 gap-y-1">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="h-8 flex items-center justify-center">
                                    <div className="w-7 h-7 rounded-full bg-current/5" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Journal list skeleton */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="border border-current/10 rounded-2xl px-6 py-4 flex justify-between items-center">
                            <div className="h-5 rounded bg-current/10" style={{ width: `${140 + i * 30}px` }} />
                            <div className="flex gap-3 items-center">
                                <div className="h-4 w-24 rounded bg-current/8 hidden sm:block" />
                                <div className="h-7 w-20 rounded-lg bg-current/8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
