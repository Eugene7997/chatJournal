export default function AboutLoading() {
    return (
        <div className="container mx-auto px-4 animate-pulse">
            {/* Mission */}
            <section className="flex flex-col items-center text-center py-24 gap-6 max-w-3xl mx-auto">
                <div className="h-3 w-20 rounded bg-current/10" />
                <div className="h-12 sm:h-16 w-80 rounded bg-current/10" />
                <div className="flex flex-col gap-2 w-full items-center">
                    <div className="h-4 rounded bg-current/8 w-full" />
                    <div className="h-4 rounded bg-current/8 w-5/6" />
                    <div className="h-4 rounded bg-current/8 w-4/6" />
                </div>
                <div className="flex flex-col gap-2 w-full items-center">
                    <div className="h-4 rounded bg-current/8 w-full" />
                    <div className="h-4 rounded bg-current/8 w-3/4" />
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 max-w-5xl mx-auto w-full">
                <div className="h-3 w-20 rounded bg-current/10 mx-auto mb-3" />
                <div className="h-9 w-48 rounded bg-current/10 mx-auto mb-12" />
                <div className="grid grid-cols-1 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex flex-col gap-4 p-8 border bg-background">
                            <div className="h-12 w-12 rounded bg-current/8" />
                            <div className="h-6 w-32 rounded bg-current/10" />
                            <div className="flex flex-col gap-2">
                                <div className="h-4 rounded bg-current/8 w-full" />
                                <div className="h-4 rounded bg-current/8 w-5/6" />
                                <div className="h-4 rounded bg-current/8 w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Philosophy */}
            <section className="py-16 max-w-5xl mx-auto w-full">
                <div className="h-3 w-24 rounded bg-current/10 mx-auto mb-3" />
                <div className="h-9 w-56 rounded bg-current/10 mx-auto mb-12" />
                <div className="grid grid-cols-1 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex flex-col items-center text-center p-8 border bg-background gap-4">
                            <div className="w-16 h-16 rounded-full bg-current/8" />
                            <div className="h-5 w-44 rounded bg-current/10" />
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
            <section className="flex flex-col items-center text-center py-20 gap-4">
                <div className="h-9 w-56 rounded bg-current/10" />
                <div className="h-4 w-48 rounded bg-current/8" />
                <div className="h-11 w-44 bg-current/10 mt-2" />
            </section>
        </div>
    );
}
