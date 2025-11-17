"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppShell } from "@/components/AppShell";
import {
  BookOpen,
  Sparkles,
  Target,
  TrendingUp,
  ArrowRight,
  Zap,
  Brain,
  BarChart3,
  ChevronRight
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function LandingPage() {
  const shouldReduceMotion = useReducedMotion();

  const features = [
    {
      icon: BookOpen,
      title: "Multiple Reading Modes",
      description: "Word-by-word display for focused reading, chunk-of-meaning groups for natural flow, and paragraph highlighting for structured content.",
      color: "from-blue-500 to-cyan-500",
      delay: 0.1
    },
    {
      icon: Sparkles,
      title: "AI Content Generation",
      description: "Generate reading material on any topic using Google's Gemini AI. Perfect for practice sessions tailored to your interests.",
      color: "from-purple-500 to-pink-500",
      delay: 0.2
    },
    {
      icon: Target,
      title: "Comprehension Testing",
      description: "Built-in quizzes after each session to measure understanding. Get instant feedback with detailed explanations.",
      color: "from-orange-500 to-red-500",
      delay: 0.3
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track your progress over time. Monitor reading speed improvements, comprehension scores, and session statistics.",
      color: "from-green-500 to-emerald-500",
      delay: 0.4
    }
  ];

  const stats = [
    { label: "Average Speed Increase", value: "40%", icon: TrendingUp },
    { label: "Comprehension Rate", value: "85%", icon: Brain },
    { label: "Reading Modes", value: "3", icon: Zap }
  ];

  return (
    <AppShell>
      <div className="relative">
        {/* Hero Section */}
        <section aria-label="Hero introduction" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(74,222,128,0.1),transparent_50%)]" />

          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6 }}
              className="text-center"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
              >
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium text-primary">
                  AI-Powered Reading Enhancement
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
              >
                Read Faster,{" "}
                <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                  Understand Better
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
              >
                Transform your reading skills with our modern web app. Multiple reading modes,
                AI-generated content, comprehension testing, and detailed analytics to track your progress.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="group text-base px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/reader" className="flex items-center gap-2">
                    Start Reading Now
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-6 h-auto"
                >
                  <button
                    onClick={() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2"
                  >
                    Explore Features
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto"
              >
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50"
                  >
                    <stat.icon className="h-6 w-6 text-primary mb-1" aria-hidden="true" />
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" aria-label="Product features" className="py-20 sm:py-28 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to improve your reading speed and comprehension in one place
              </p>
            </motion.div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: feature.delay }}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -5 }}
                  whileFocus={shouldReduceMotion ? {} : { scale: 1.02, y: -5 }}
                  tabIndex={0}
                  className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
                >
                  <Card className="h-full border-2 border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur">
                    <CardContent className="p-8">
                      {/* Icon with Gradient Background */}
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-6`}
                      >
                        <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center">
                          <feature.icon className="h-7 w-7 text-foreground" aria-hidden="true" />
                        </div>
                      </motion.div>

                      {/* Content */}
                      <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section aria-label="Call to action" className="py-20 sm:py-28 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.15),transparent_70%)]" />

          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Card className="border-2 border-primary/20 bg-card/80 backdrop-blur shadow-2xl">
                <CardContent className="p-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6"
                  >
                    <BookOpen className="h-8 w-8 text-primary" aria-hidden="true" />
                  </motion.div>

                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                    Ready to Boost Your Reading Speed?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Start your journey to faster, more effective reading today.
                    No registration required.
                  </p>

                  <Button
                    asChild
                    size="lg"
                    className="group text-base px-10 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href="/reader" className="flex items-center gap-2">
                      Get Started Free
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
