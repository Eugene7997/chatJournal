"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, MessageSquare, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const howItWorks = [
  {
    step: "01",
    title: "Start a Session",
    description:
      "Open a new chat and write whatever is on your mind. There's no right or wrong way to begin.",
  },
  {
    step: "02",
    title: "Reflect & Respond",
    description:
      "ChatJournal gently prompts you to go deeper, helping you uncover patterns and insights in your thinking.",
  },
  {
    step: "03",
    title: "Look Back",
    description:
      "Revisit past sessions anytime. Watch how your perspective shifts and your self-awareness grows over time.",
  },
];

const philosophy = [
  {
    icon: BookOpen,
    title: "Reflection over perfection",
    description:
      "We believe the value of journaling is in the act itself — not in producing polished prose. ChatJournal is designed to lower the barrier, not raise the stakes.",
  },
  {
    icon: MessageSquare,
    title: "Conversation as a tool for growth",
    description:
      "Dialogue — even with yourself — is one of the most powerful ways humans make sense of the world. We built ChatJournal around that belief.",
  },
  {
    icon: Shield,
    title: "Privacy by default",
    description:
      "Your journal is deeply personal. We take that seriously. Your entries are private to your account and will never be used for advertising or sold to third parties.",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4">
      {/* Mission */}
      <section className="flex flex-col items-center text-center py-24 gap-6 max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs font-mono text-brand tracking-widest uppercase"
        >
          Our Story
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-mono text-4xl sm:text-6xl font-bold leading-tight"
        >
          ABOUT CHAT
          <span className="text-brand">JOURNAL</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-base sm:text-lg font-mono opacity-60 leading-relaxed"
        >
          ChatJournal was born from a simple idea: journaling shouldn&apos;t
          feel like homework. Most people want to reflect and grow, but staring
          at a blank page is intimidating. We built a space where your thoughts
          flow naturally — through conversation.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="text-base sm:text-lg font-mono opacity-60 leading-relaxed"
        >
          Whether you&apos;re processing a hard day, tracking your goals, or
          just thinking out loud, ChatJournal meets you where you are — no
          templates, no pressure, no judgment.
        </motion.p>
      </section>

      {/* How It Works */}
      <section className="py-16 max-w-5xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-xs font-mono text-brand tracking-widest uppercase text-center mb-3"
        >
          The Process
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="text-3xl sm:text-4xl font-mono font-bold text-center mb-12"
        >
          HOW IT WORKS
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {howItWorks.map(({ step, title, description }, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.6 + index * 0.2,
                duration: 0.6,
                type: "spring",
                stiffness: 100,
                damping: 10,
              }}
              className="flex flex-col gap-4 p-8 border bg-background"
            >
              <span className="font-mono text-5xl font-bold text-brand/20">
                {step}
              </span>
              <h3 className="text-xl font-mono font-bold">{title}</h3>
              <p className="font-mono text-sm opacity-60 leading-relaxed">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 max-w-5xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className="text-xs font-mono text-brand tracking-widest uppercase text-center mb-3"
        >
          What We Believe
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.6 }}
          className="text-3xl sm:text-4xl font-mono font-bold text-center mb-12"
        >
          OUR PHILOSOPHY
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {philosophy.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.3 + index * 0.2,
                duration: 0.6,
                type: "spring",
                stiffness: 100,
                damping: 10,
              }}
              className="flex flex-col items-center text-center p-8 border bg-background"
            >
              <div className="mb-6 rounded-full bg-brand/10 p-4">
                <Icon className="h-8 w-8 text-brand" />
              </div>
              <h3 className="text-lg font-mono font-bold mb-4">{title}</h3>
              <p className="font-mono text-sm opacity-60 leading-relaxed">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center text-center py-20 gap-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.6 }}
          className="text-2xl sm:text-4xl font-mono font-bold"
        >
          READY TO BEGIN?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="opacity-60 max-w-md font-mono text-sm"
        >
          Your first entry is just a conversation away.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.6 }}
        >
          <Button
            size="lg"
            className="cursor-pointer rounded-none mt-2 bg-brand hover:bg-brand/90 font-mono"
            asChild
          >
            <Link href="/login">GET STARTED FREE <ArrowRight className="ml-1 w-4 h-4" /></Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
