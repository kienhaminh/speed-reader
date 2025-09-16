"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ReadingContent,
  CreateReadingContentRequest,
  GenerateContentRequest,
} from "@/models/readingContent";
import { Loader2 } from "lucide-react";

interface ContentInputProps {
  onContentCreated: (content: ReadingContent) => void;
}

export function ContentInput({ onContentCreated }: ContentInputProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] =
    useState<ReadingContent | null>(null);

  // Paste/Upload form state
  const [pasteData, setPasteData] = useState<CreateReadingContentRequest>({
    language: "en",
    source: "paste",
    text: "",
    title: "",
  });

  // AI generation form state
  const [aiData, setAiData] = useState<GenerateContentRequest>({
    language: "en",
    topic: "",
    targetWords: 300,
  });

  const handleCreateContent = async () => {
    if (!pasteData.text.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pasteData,
          title: pasteData.title || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create content");
      }

      const content = await response.json();
      onContentCreated(content);
    } catch (error) {
      console.error("Failed to create content:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create content"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!aiData.topic.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate content");
      }

      const content = await response.json();
      setGeneratedContent(content);
    } catch (error) {
      console.error("Failed to generate content:", error);
      alert(
        error instanceof Error ? error.message : "Failed to generate content"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseGeneratedContent = () => {
    if (generatedContent) {
      onContentCreated(generatedContent);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Tabs defaultValue="paste" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste">Paste/Upload Text</TabsTrigger>
          <TabsTrigger value="ai" data-testid="ai-generation-tab">
            AI Generation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Reading Content</CardTitle>
              <CardDescription>
                Paste your text or upload a document to start reading
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={pasteData.language}
                    onValueChange={(value: "en" | "vi") =>
                      setPasteData((prev) => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger data-testid="language-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="vi">Vietnamese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={pasteData.source}
                    onValueChange={(value: "paste" | "upload") =>
                      setPasteData((prev) => ({ ...prev, source: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paste" data-testid="source-paste">
                        Paste Text
                      </SelectItem>
                      <SelectItem value="upload">Upload File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your content"
                  value={pasteData.title}
                  onChange={(e) =>
                    setPasteData((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">Text Content</Label>
                <Textarea
                  id="text"
                  placeholder="Paste your text here..."
                  className="min-h-[200px]"
                  value={pasteData.text}
                  onChange={(e) =>
                    setPasteData((prev) => ({ ...prev, text: e.target.value }))
                  }
                  data-testid="content-input"
                />
              </div>

              <Button
                onClick={handleCreateContent}
                disabled={!pasteData.text.trim() || isCreating}
                className="w-full"
                data-testid="create-content-btn"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Content...
                  </>
                ) : (
                  "Create Content"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Content Generation</CardTitle>
              <CardDescription>
                Generate reading content using AI based on your topic
                preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-language">Language</Label>
                  <Select
                    value={aiData.language}
                    onValueChange={(value: "en" | "vi") =>
                      setAiData((prev) => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger data-testid="ai-language-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="vi">Vietnamese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-words">Target Words</Label>
                  <Input
                    id="target-words"
                    type="number"
                    min="100"
                    max="2000"
                    value={aiData.targetWords}
                    onChange={(e) =>
                      setAiData((prev) => ({
                        ...prev,
                        targetWords: parseInt(e.target.value) || 300,
                      }))
                    }
                    data-testid="ai-target-words-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., renewable energy, artificial intelligence, cooking"
                  value={aiData.topic}
                  onChange={(e) =>
                    setAiData((prev) => ({ ...prev, topic: e.target.value }))
                  }
                  data-testid="ai-topic-input"
                />
              </div>

              <Button
                onClick={handleGenerateContent}
                disabled={!aiData.topic.trim() || isGenerating}
                className="w-full"
                data-testid="generate-content-btn"
              >
                {isGenerating ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      data-testid="loading-spinner"
                    />
                    <span data-testid="generation-status">Generating...</span>
                  </>
                ) : (
                  "Generate Content"
                )}
              </Button>

              {generatedContent && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle data-testid="generated-title">
                      {generatedContent.title}
                    </CardTitle>
                    <CardDescription>
                      <span data-testid="generated-word-count">
                        {generatedContent.wordCount} words
                      </span>
                      {" • "}
                      <span data-testid="content-source">
                        {generatedContent.source}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="max-h-[200px] overflow-y-auto">
                        <p
                          className="text-sm text-gray-700 dark:text-gray-300"
                          data-testid="generated-content"
                        >
                          {generatedContent.text}
                        </p>
                      </div>
                      <Button
                        onClick={handleUseGeneratedContent}
                        className="w-full"
                        data-testid="use-generated-content-btn"
                      >
                        Use This Content
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {(isCreating || isGenerating) && !generatedContent && (
        <div className="text-center py-4" data-testid="content-created">
          <p className="text-sm text-gray-600">
            {isGenerating ? "Generating content..." : "Creating content..."}
          </p>
        </div>
      )}
    </div>
  );
}
