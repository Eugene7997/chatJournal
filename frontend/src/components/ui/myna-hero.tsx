"use client";

import * as React from "react";
import {
  ArrowRight,
  BookOpen,
  Lock,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const labels = [
  { icon: MessageSquare, label: "Conversational" },
  { icon: Sparkles, label: "AI-Assisted" },
  { icon: Lock, label: "Private & Secure" },
];

const features = [
  {
    icon: MessageSquare,
    label: "Conversational Journaling",
    description:
      "Write journal entries the way you talk. No rigid formats — just you and your thoughts.",
  },
  {
    icon: BookOpen,
    label: "Revisit Past Entries",
    description:
      "Scroll back through your conversations and rediscover how your thinking has evolved.",
  },
  {
    icon: Lock,
    label: "Private & Secure",
    description:
      "Your journal is yours alone. Entries are tied to your account and never shared.",
  },
];

const titleWords = ["YOUR", "THOUGHTS,", "IN", "CONVERSATION."];

export function MynaHero() {
  return (
    <div className="container mx-auto px-4 min-h-screen bg-background">
      <main>
        <section className="container py-24">
          <div className="flex flex-col items-center text-center">
            <motion.h1
              initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative font-mono text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto leading-tight"
            >
              {titleWords.map((text, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.15,
                    duration: 0.6,
                  }}
                  className="inline-block mx-2 md:mx-4"
                >
                  {text}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mx-auto mt-8 max-w-2xl text-xl text-foreground font-mono opacity-70"
            >
              ChatJournal lets you journal through natural conversation. Reflect,
              revisit, and grow — one message at a time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-12 flex flex-wrap justify-center gap-6"
            >
              {labels.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1.2 + index * 0.15,
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                  }}
                  className="flex items-center gap-2 px-6"
                >
                  <feature.icon className="h-5 w-5 text-brand" />
                  <span className="text-sm font-mono">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.8,
                duration: 0.6,
                type: "spring",
                stiffness: 100,
                damping: 10,
              }}
              className="flex gap-4 mt-12"
            >
              <Button
                size="lg"
                className="cursor-pointer rounded-none bg-brand hover:bg-brand/90 font-mono"
                asChild
              >
                <Link href="/login">GET STARTED <ArrowRight className="ml-1 w-4 h-4" /></Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="cursor-pointer rounded-none font-mono"
                asChild
              >
                <Link href="/about">LEARN MORE</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section id="features" className="container pb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 2.2,
              duration: 0.6,
              type: "spring",
              stiffness: 100,
              damping: 10,
            }}
            className="text-center text-4xl font-mono font-bold mb-6"
          >
            Why ChatJournal?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4, duration: 0.6 }}
            className="grid md:grid-cols-3 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 2.4 + index * 0.2,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                }}
                className="flex flex-col items-center text-center p-8 bg-background border"
              >
                <div className="mb-6 rounded-full bg-brand/10 p-4">
                  <feature.icon className="h-8 w-8 text-brand" />
                </div>
                <h3 className="mb-4 text-xl font-mono font-bold">
                  {feature.label}
                </h3>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="container pb-24 flex flex-col items-center text-center gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.2, duration: 0.6 }}
            className="text-2xl sm:text-3xl font-bold font-mono"
          >
            READY TO START JOURNALING?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.4, duration: 0.6 }}
            className="opacity-60 max-w-md font-mono text-sm"
          >
            Sign up for free and write your first entry in seconds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.6, duration: 0.6 }}
          >
            <Button
              size="lg"
              className="cursor-pointer rounded-none mt-2 bg-brand hover:bg-brand/90 font-mono"
              asChild
            >
              <Link href="/login">CREATE AN ACCOUNT <ArrowRight className="ml-1 w-4 h-4" /></Link>
            </Button>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
