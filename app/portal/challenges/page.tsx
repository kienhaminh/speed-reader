"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Lock,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Star,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

// Mock challenges data
const mockChallenges = [
  {
    id: 1,
    title: "The Morning Routine",
    difficulty: "Beginner",
    level: 1,
    xpReward: 50,
    estimatedTime: "3 min",
    wordCount: 250,
    description: "A simple story about starting your day right",
    completed: true,
    locked: false,
    score: 95,
    difficultyColor: "from-green-500 to-emerald-500"
  },
  {
    id: 2,
    title: "The Coffee Shop",
    difficulty: "Beginner",
    level: 1,
    xpReward: 50,
    estimatedTime: "3 min",
    wordCount: 280,
    description: "A cozy tale of community and connection",
    completed: true,
    locked: false,
    score: 88,
    difficultyColor: "from-green-500 to-emerald-500"
  },
  {
    id: 3,
    title: "Technology Evolution",
    difficulty: "Intermediate",
    level: 3,
    xpReward: 100,
    estimatedTime: "5 min",
    wordCount: 400,
    description: "Exploring the rapid changes in modern technology",
    completed: false,
    locked: false,
    score: null,
    difficultyColor: "from-blue-500 to-cyan-500"
  },
  {
    id: 4,
    title: "The Digital Nomad",
    difficulty: "Intermediate",
    level: 3,
    xpReward: 100,
    estimatedTime: "5 min",
    wordCount: 420,
    description: "Life and work in the age of remote everything",
    completed: false,
    locked: false,
    score: null,
    difficultyColor: "from-blue-500 to-cyan-500"
  },
  {
    id: 5,
    title: "Quantum Computing",
    difficulty: "Advanced",
    level: 5,
    xpReward: 150,
    estimatedTime: "7 min",
    wordCount: 550,
    description: "Understanding the future of computation",
    completed: false,
    locked: true,
    score: null,
    difficultyColor: "from-purple-500 to-pink-500"
  },
  {
    id: 6,
    title: "Artificial Intelligence Ethics",
    difficulty: "Advanced",
    level: 5,
    xpReward: 150,
    estimatedTime: "7 min",
    wordCount: 580,
    description: "The moral implications of AI development",
    completed: false,
    locked: true,
    score: null,
    difficultyColor: "from-purple-500 to-pink-500"
  },
  {
    id: 7,
    title: "The Philosophy of Consciousness",
    difficulty: "Expert",
    level: 8,
    xpReward: 200,
    estimatedTime: "10 min",
    wordCount: 700,
    description: "Deep dive into the nature of awareness",
    completed: false,
    locked: true,
    score: null,
    difficultyColor: "from-orange-500 to-red-500"
  },
  {
    id: 8,
    title: "Multiverse Theory",
    difficulty: "Expert",
    level: 8,
    xpReward: 200,
    estimatedTime: "10 min",
    wordCount: 720,
    description: "Exploring parallel universes and reality",
    completed: false,
    locked: true,
    score: null,
    difficultyColor: "from-orange-500 to-red-500"
  }
];

const mockUserLevel = 7;

export default function ChallengesPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const difficulties = [
    { name: "All", count: mockChallenges.length },
    { name: "Beginner", count: mockChallenges.filter(c => c.difficulty === "Beginner").length },
    { name: "Intermediate", count: mockChallenges.filter(c => c.difficulty === "Intermediate").length },
    { name: "Advanced", count: mockChallenges.filter(c => c.difficulty === "Advanced").length },
    { name: "Expert", count: mockChallenges.filter(c => c.difficulty === "Expert").length }
  ];

  const filteredChallenges = selectedDifficulty && selectedDifficulty !== "All"
    ? mockChallenges.filter(c => c.difficulty === selectedDifficulty)
    : mockChallenges;

  const completedCount = mockChallenges.filter(c => c.completed).length;
  const totalXPEarned = mockChallenges
    .filter(c => c.completed)
    .reduce((sum, c) => sum + c.xpReward, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Story Challenges</h1>
        <p className="text-muted-foreground">
          Test your reading skills with progressively challenging stories
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-foreground">{completedCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Challenges Completed</p>
              <p className="text-xs text-primary mt-1">of {mockChallenges.length} total</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-foreground">{totalXPEarned}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total XP Earned</p>
              <p className="text-xs text-primary mt-1">from challenges</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-foreground">92%</span>
              </div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-xs text-primary mt-1">across completed</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Difficulty Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {difficulties.map((diff) => (
              <Button
                key={diff.name}
                variant={selectedDifficulty === diff.name || (!selectedDifficulty && diff.name === "All") ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(diff.name === "All" ? null : diff.name)}
              >
                {diff.name} ({diff.count})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredChallenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className={`${
              challenge.locked
                ? "opacity-60"
                : "hover:shadow-lg transition-shadow duration-200"
            } relative overflow-hidden`}>
              {/* Difficulty Gradient Bar */}
              <div className={`h-1 bg-gradient-to-r ${challenge.difficultyColor}`} />

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        challenge.difficulty === "Beginner" ? "default" :
                        challenge.difficulty === "Intermediate" ? "secondary" :
                        "outline"
                      }>
                        {challenge.difficulty}
                      </Badge>
                      {challenge.completed && (
                        <Badge variant="outline" className="gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                      {challenge.locked && (
                        <Badge variant="outline" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Level {challenge.level} Required
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{challenge.title}</CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </div>
                </div>

                {/* Challenge Stats */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{challenge.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{challenge.wordCount} words</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>+{challenge.xpReward} XP</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {challenge.completed && challenge.score !== null && (
                  <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Your Score: {challenge.score}%
                      </span>
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                )}

                <Button
                  className="w-full gap-2"
                  disabled={challenge.locked}
                  variant={challenge.completed ? "outline" : "default"}
                >
                  {challenge.locked ? (
                    <>
                      <Lock className="h-4 w-4" />
                      Reach Level {challenge.level} to Unlock
                    </>
                  ) : challenge.completed ? (
                    <>
                      <Zap className="h-4 w-4" />
                      Try Again for Better Score
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Start Challenge
                    </>
                  )}
                </Button>
              </CardContent>

              {/* Locked Overlay */}
              {challenge.locked && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Level {challenge.level} Required
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current Level: {mockUserLevel}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredChallenges.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No challenges in this category
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try selecting a different difficulty level
            </p>
            <Button onClick={() => setSelectedDifficulty(null)}>
              Show All Challenges
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
