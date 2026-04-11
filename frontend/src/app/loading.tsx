export default function HomeLoading() {
    return (
        <div className="container mx-auto px-4 min-h-screen animate-pulse">
            {/* Hero */}
            <section className="container py-24">
                <div className="flex flex-col items-center text-center">
                    {/* Title words */}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8">
                        {[120, 164, 80, 220].map((w, i) => (
                            <div key={i} className="h-12 sm:h-16 md:h-20 rounded bg-current/10" style={{ width: `${w}px` }} />
                        ))}
                    </div>

                    {/* Subtitle */}
                    <div className="h-5 w-2/3 max-w-lg rounded bg-current/8 mb-2" />
                    <div className="h-5 w-1/2 max-w-md rounded bg-current/8 mb-10" />

                    {/* Feature labels */}
                    <div className="flex flex-wrap justify-center gap-6 mt-2 mb-10">
                        {[128, 110, 136].map((w, i) => (
                            <div key={i} className="h-5 rounded bg-current/8" style={{ width: `${w}px` }} />
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <div className="h-11 w-36 bg-current/10" />
                        <div className="h-11 w-32 border border-current/10 bg-current/5" />
                    </div>
                </div>
            </section>

            {/* Features grid */}
            <section className="container pb-24">
                <div className="h-9 w-52 rounded bg-current/10 mx-auto mb-10" />
                <div className="grid md:grid-cols-3 max-w-6xl mx-auto">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex flex-col items-center text-center p-8 border bg-background gap-4">
                            <div className="w-16 h-16 rounded-full bg-current/8" />
                            <div className="h-6 w-40 rounded bg-current/10" />
                            <div className="flex flex-col gap-2 w-full items-center">
                                <div className="h-4 rounded bg-current/8 w-full" />
                                <div className="h-4 rounded bg-current/8 w-5/6" />
                                <div className="h-4 rounded bg-current/8 w-4/6" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="container pb-24 flex flex-col items-center text-center gap-4">
                <div className="h-8 w-72 rounded bg-current/10" />
                <div className="h-4 w-56 rounded bg-current/8" />
                <div className="h-11 w-48 bg-current/10 mt-2" />
            </section>
        </div>
    );
}
