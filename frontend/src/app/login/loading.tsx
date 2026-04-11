export default function LoginLoading() {
    return (
        <div className="flex-1 flex items-center justify-center px-4 py-16 animate-pulse">
            <div className="w-full max-w-sm flex flex-col items-center gap-8">
                {/* Icon + title */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-[72px] h-[72px] rounded-full bg-current/8" />
                    <div className="h-8 w-48 rounded bg-current/10" />
                    <div className="h-4 w-40 rounded bg-current/8" />
                </div>

                {/* Login card */}
                <div className="w-full border border-current/10 p-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="h-3 w-16 rounded bg-current/10" />
                        <div className="h-6 w-56 rounded bg-current/10" />
                        <div className="h-3 w-full rounded bg-current/8 mt-1" />
                        <div className="h-3 w-3/4 rounded bg-current/8" />
                    </div>

                    {/* Auth buttons placeholder */}
                    <div className="flex flex-col gap-3">
                        <div className="h-10 w-full border border-current/10 bg-current/5" />
                        <div className="h-10 w-full border border-current/10 bg-current/5" />
                    </div>
                </div>
            </div>
        </div>
    );
}
