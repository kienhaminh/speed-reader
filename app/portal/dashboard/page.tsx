"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  BookOpen,
  Target,
  Zap,
  Trophy,
  Clock,
  Award,
  Star,
  Flame
} from "lucide-react";
import { motion } from "framer-motion";

// Mock data
const mockUser = {
  name: "John Doe",
  level: 7,
  currentXP: 1850,
  xpToNextLevel: 2472,
  totalSessions: 124,
  averageWPM: 385,
  bestWPM: 512,
  comprehensionRate: 87,
  streak: 12,
  totalXP: 1850
};

const mockRecentActivity = [
  {
    id: 1,
    type: "session",
    title: "Completed Reading Session",
    description: "Technology article - 420 WPM",
    xp: 15,
    timestamp: "2 hours ago"
  },
  {
    id: 2,
    type: "challenge",
    title: "Completed Advanced Challenge",
    description: "Perfect comprehension score!",
    xp: 150,
    timestamp: "5 hours ago"
  },
  {
    id: 3,
    type: "quiz",
    title: "Quiz Completed",
    description: "5/5 correct answers",
    xp: 25,
    timestamp: "1 day ago"
  },
  {
    id: 4,
    type: "streak",
    title: "12 Day Streak!",
    description: "Keep it up!",
    xp: 5,
    timestamp: "1 day ago"
  }
];

const mockStats = [
  {
    label: "Total Sessions",
    value: "124",
    icon: BookOpen,
    change: "+8 this week",
    color: "from-blue-500 to-cyan-500"
  },
  {
    label: "Average WPM",
    value: "385",
    icon: Zap,
    change: "+45 from last month",
    color: "from-purple-500 to-pink-500"
  },
  {
    label: "Comprehension",
    value: "87%",
    icon: Target,
    change: "+5% from last month",
    color: "from-green-500 to-emerald-500"
  },
  {
    label: "Day Streak",
    value: "12",
    icon: Flame,
    change: "Personal best!",
    color: "from-orange-500 to-red-500"
  }
];

export default function DashboardPage() {
  const xpProgress = (mockUser.currentXP / mockUser.xpToNextLevel) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {mockUser.name}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your reading progress overview
        </p>
      </div>

      {/* XP and Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-chart-2">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Level {mockUser.level}</h2>
                  <p className="text-sm text-muted-foreground">
                    {mockUser.currentXP.toLocaleString()} / {mockUser.xpToNextLevel.toLocaleString()} XP
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Next Level</p>
                <p className="text-lg font-bold text-foreground">
                  {(mockUser.xpToNextLevel - mockUser.currentXP).toLocaleString()} XP
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full"
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {xpProgress.toFixed(1)}% to Level {mockUser.level + 1}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-xs text-primary font-medium">{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest reading sessions and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      {activity.type === "session" && <BookOpen className="h-5 w-5 text-primary" />}
                      {activity.type === "challenge" && <Trophy className="h-5 w-5 text-primary" />}
                      {activity.type === "quiz" && <Target className="h-5 w-5 text-primary" />}
                      {activity.type === "streak" && <Flame className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">{activity.title}</h4>
                        <span className="text-sm font-medium text-primary">+{activity.xp} XP</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Jump back into training</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" size="lg" variant="default">
                <BookOpen className="h-5 w-5 mr-2" />
                Start Reading Session
              </Button>
              <Button className="w-full justify-start" size="lg" variant="outline">
                <Trophy className="h-5 w-5 mr-2" />
                Take a Challenge
              </Button>
              <Button className="w-full justify-start" size="lg" variant="outline">
                <TrendingUp className="h-5 w-5 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Achievements Preview */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Speed Demon", color: "from-yellow-500 to-orange-500" },
                  { name: "Streak Master", color: "from-red-500 to-pink-500" },
                  { name: "Quiz Master", color: "from-blue-500 to-purple-500" }
                ].map((badge) => (
                  <div
                    key={badge.name}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    title={badge.name}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center`}>
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-xs text-center text-muted-foreground truncate w-full">
                      {badge.name}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
