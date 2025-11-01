"use client";

import { useState, useEffect, useCallback } from "react";
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
import { BarChart3, TrendingUp, Clock, Target, Download } from "lucide-react";
import { AnalyticsSummary } from "@/models/studyLog";

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
    modeFilter === "all" ? summary.sessionsCount : summary.sessionsCount; // This would be filtered in real implementation

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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" data-testid="sessions-count">
                  {summary.sessionsCount}
                </p>
                <p className="text-sm text-gray-600">Total Sessions</p>
                {modeFilter !== "all" && (
                  <p
                    className="text-xs text-gray-500"
                    data-testid="filtered-sessions-count"
                  >
                    {filteredSessionsCount} filtered
                  </p>
                )}
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" data-testid="total-time">
                  {formatTime(summary.totalTimeMs)}
                </p>
                <p className="text-sm text-gray-600">Reading Time</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" data-testid="average-score">
                  {summary.averageScorePercent}%
                </p>
                <p className="text-sm text-gray-600">Avg Comprehension</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {modes.length > 0
                    ? Math.round(
                        Object.values(summary.averageWpmByMode).reduce(
                          (a, b) => a + b,
                          0
                        ) / modes.length
                      )
                    : 0}
                </p>
                <p className="text-sm text-gray-600">Overall Avg WPM</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
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
                      className="text-sm text-gray-600"
                      data-testid={`${mode}-mode-avg-wpm`}
                    >
                      {summary.averageWpmByMode[mode]} WPM
                    </div>
                  </div>
                  <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
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

      {/* Charts Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="wpm-trend-chart">
          <CardHeader>
            <CardTitle>WPM Trend</CardTitle>
            <CardDescription>
              Reading speed progression over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500">Chart visualization would be here</p>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="score-trend-chart">
          <CardHeader>
            <CardTitle>Comprehension Score Trend</CardTitle>
            <CardDescription>Quiz performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500">Chart visualization would be here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="mode-comparison-chart">
        <CardHeader>
          <CardTitle>Mode Comparison</CardTitle>
          <CardDescription>
            Performance comparison across different reading modes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500">Comparison chart would be here</p>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Download your reading analytics data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" data-testid="export-csv-btn">
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button variant="outline" data-testid="export-json-btn">
              <Download className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {summary.sessionsCount === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
              <p className="text-gray-600 mb-4">
                Complete some reading sessions to see your analytics here.
              </p>
              <Button variant="outline">Start Reading</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
