"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, TrendingUp, Clock, Target, Download, BookOpen } from "lucide-react";
import { AnalyticsSummary } from "@/models/studyLog";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function Analytics() {
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalTimeMs: 0,
    averageWpmByMode: {},
    averageScorePercent: 0,
    sessionsCount: 0,
  });
  const [timeFilter, setTimeFilter] = useState<
    "today" | "week" | "month" | "all"
  >("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for charts (in real app, this would come from API)
  const wpmTrendData = [
    { date: "Mon", wpm: 250, score: 75 },
    { date: "Tue", wpm: 280, score: 80 },
    { date: "Wed", wpm: 300, score: 85 },
    { date: "Thu", wpm: 320, score: 82 },
    { date: "Fri", wpm: 350, score: 90 },
    { date: "Sat", wpm: 380, score: 88 },
    { date: "Sun", wpm: 400, score: 92 },
  ];

  const modeComparisonData = [
    { mode: "Word", wpm: 350, sessions: 12 },
    { mode: "Chunk", wpm: 420, sessions: 8 },
    { mode: "Paragraph", wpm: 280, sessions: 15 },
  ];

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (timeFilter !== "all") {
        params.append("period", timeFilter);
      }
      if (modeFilter !== "all") {
        params.append("mode", modeFilter);
      }

      const response = await fetch(
        `/api/analytics/summary?${params.toString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter, modeFilter]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportData = async () => {
    try {
      // This would typically trigger a CSV download
      alert("Export functionality would be implemented here");
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const modes = Object.keys(summary.averageWpmByMode);
  const filteredSessionsCount =
    modeFilter === "all" ? summary.sessionsCount : summary.sessionsCount;

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <LoadingState variant="card" count={1} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LoadingState variant="card" count={4} />
        </div>
        <LoadingState variant="chart" count={1} />
      </div>
    );
  }

  // Show empty state
  if (summary.sessionsCount === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <EmptyState
          icon={BookOpen}
          title="No reading sessions yet"
          description="Complete your first reading session to see detailed analytics and track your progress over time."
          action={{
            label: "Start Reading",
            onClick: () => window.history.back(),
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Reading Analytics
          </CardTitle>
          <CardDescription>
            Track your reading progress and performance over time
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="time-filter" className="text-sm font-medium">
                Time Period:
              </label>
              <Select
                value={timeFilter}
                onValueChange={(value: "today" | "week" | "month" | "all") => setTimeFilter(value)}
              >
                <SelectTrigger
                  className="w-32"
                  data-testid="time-filter-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="mode-filter" className="text-sm font-medium">
                Reading Mode:
              </label>
              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger
                  className="w-32"
                  data-testid="mode-filter-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="word">Word</SelectItem>
                  <SelectItem value="chunk">Chunk</SelectItem>
                  <SelectItem value="paragraph">Paragraph</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={handleExportData}
              data-testid="export-data-btn"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground" data-testid="sessions-count">
                    {summary.sessionsCount}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Total Sessions</p>
                  {modeFilter !== "all" && (
                    <p
                      className="text-xs text-muted-foreground mt-1"
                      data-testid="filtered-sessions-count"
                    >
                      {filteredSessionsCount} filtered
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground" data-testid="total-time">
                    {formatTime(summary.totalTimeMs)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Reading Time</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground" data-testid="average-score">
                    {summary.averageScorePercent}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Avg Comprehension</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {modes.length > 0
                      ? Math.round(
                          Object.values(summary.averageWpmByMode).reduce(
                            (a, b) => a + b,
                            0
                          ) / modes.length
                        )
                      : 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Overall Avg WPM</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reading Mode Performance */}
      {modes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance by Reading Mode</CardTitle>
            <CardDescription>
              Average words per minute for each reading mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modes.map((mode) => (
                <div key={mode} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="capitalize font-medium">{mode} Mode</div>
                    <div
                      className="text-sm text-muted-foreground"
                      data-testid={`${mode}-mode-avg-wpm`}
                    >
                      {summary.averageWpmByMode[mode]} WPM
                    </div>
                  </div>
                  <div className="w-48 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${
                          (summary.averageWpmByMode[mode] / 500) * 100
                        }%`, // Assuming 500 WPM as max
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card data-testid="wpm-trend-chart">
            <CardHeader>
              <CardTitle>WPM Trend</CardTitle>
              <CardDescription>
                Reading speed progression over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={wpmTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="wpm"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card data-testid="score-trend-chart">
            <CardHeader>
              <CardTitle>Comprehension Score Trend</CardTitle>
              <CardDescription>Quiz performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={wpmTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card data-testid="mode-comparison-chart">
          <CardHeader>
            <CardTitle>Mode Comparison</CardTitle>
            <CardDescription>
              Performance comparison across different reading modes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modeComparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mode" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar dataKey="wpm" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="sessions" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>
              Download your reading analytics data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" data-testid="export-csv-btn" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </Button>
              <Button variant="outline" data-testid="export-json-btn" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export as JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
