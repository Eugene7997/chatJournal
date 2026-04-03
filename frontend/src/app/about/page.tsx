export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Mission */}
      <section className="flex flex-col items-center text-center px-6 py-12 sm:py-24 gap-6 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">About ChatJournal</h1>
        <p className="text-base sm:text-xl opacity-70 leading-relaxed">
          ChatJournal was born from a simple idea: journaling shouldn&apos;t feel
          like homework. Most people want to reflect and grow, but staring at a
          blank page is intimidating. We built a space where your thoughts flow
          naturally — through conversation.
        </p>
        <p className="text-base sm:text-xl opacity-70 leading-relaxed">
          Whether you&apos;re processing a hard day, tracking your goals, or just
          thinking out loud, ChatJournal meets you where you are — no templates,
          no pressure, no judgment.
        </p>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-8 py-10 sm:py-16 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              step: "1",
              title: "Start a Session",
              description:
                "Open a new chat and write whatever is on your mind. There's no right or wrong way to begin.",
            },
            {
              step: "2",
              title: "Reflect & Respond",
              description:
                "ChatJournal gently prompts you to go deeper, helping you uncover patterns and insights in your thinking.",
            },
            {
              step: "3",
              title: "Look Back",
              description:
                "Revisit past sessions anytime. Watch how your perspective shifts and your self-awareness grows over time.",
            },
          ].map(({ step, title, description }) => (
            <div
              key={step}
              className="flex flex-col gap-3 p-6 rounded-2xl border border-current/10 bg-foreground/5"
            >
              <span className="text-3xl font-bold opacity-20">{step}</span>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="opacity-60 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="px-4 sm:px-8 py-10 sm:py-16 max-w-3xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Our Philosophy</h2>
        <div className="flex flex-col gap-6">
          {[
            {
              title: "Reflection over perfection",
              description:
                "We believe the value of journaling is in the act itself — not in producing polished prose. ChatJournal is designed to lower the barrier, not raise the stakes.",
            },
            {
              title: "Privacy by default",
              description:
                "Your journal is deeply personal. We take that seriously. Your entries are private to your account and will never be used for advertising or sold to third parties.",
            },
            {
              title: "Conversation as a tool for growth",
              description:
                "Dialogue — even with yourself — is one of the most powerful ways humans make sense of the world. We built ChatJournal around that belief.",
            },
          ].map(({ title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-2 p-6 rounded-2xl border border-current/10 bg-foreground/5"
            >
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="opacity-60 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center text-center px-6 py-12 sm:py-20 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Ready to begin?</h2>
        <p className="opacity-60 max-w-md">
          Your first entry is just a conversation away.
        </p>
        <a
          href="/login"
          className="mt-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold text-lg hover:opacity-80 transition-opacity"
        >
          Get Started Free
        </a>
      </section>
    </div>
  );
}
