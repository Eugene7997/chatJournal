export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-12 sm:py-24 gap-6">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
          Your thoughts, in conversation.
        </h1>
        <p className="text-base sm:text-xl max-w-xl opacity-70">
          ChatJournal lets you journal through natural conversation. Reflect,
          revisit, and grow — one message at a time.
        </p>
        <div className="flex gap-4 mt-2">
          <a
            href="/login"
            className="px-6 py-3 rounded-xl bg-foreground text-background font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            Get Started
          </a>
          <a
            href="/about"
            className="px-6 py-3 rounded-xl border border-current font-semibold text-lg hover:opacity-60 transition-opacity"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4 sm:px-8 py-10 sm:py-16 max-w-5xl mx-auto w-full">
        {[
          {
            icon: "💬",
            title: "Conversational Journaling",
            description:
              "Write journal entries the way you talk. No rigid formats — just you and your thoughts.",
          },
          {
            icon: "📖",
            title: "Revisit Past Entries",
            description:
              "Scroll back through your conversations and rediscover how your thinking has evolved.",
          },
          {
            icon: "🔒",
            title: "Private & Secure",
            description:
              "Your journal is yours alone. Entries are tied to your account and never shared.",
          },
        ].map(({ icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col gap-3 p-6 rounded-2xl border border-current/10 bg-foreground/5"
          >
            <span className="text-4xl">{icon}</span>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="opacity-60 text-sm leading-relaxed">{description}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center text-center px-6 py-12 sm:py-20 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Ready to start journaling?</h2>
        <p className="opacity-60 max-w-md">
          Sign up for free and write your first entry in seconds.
        </p>
        <a
          href="/login"
          className="mt-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold text-lg hover:opacity-80 transition-opacity"
        >
          Create an Account
        </a>
      </section>
    </div>
  );
}
