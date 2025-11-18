"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type TextPasteFormProps = {
  onSuccess: () => void;
};

export function TextPasteForm({ onSuccess }: TextPasteFormProps) {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "text",
          content: text,
          sourceTitle: title || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create knowledge item");
      }

      // Clear form and notify success
      setText("");
      setTitle("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-title">Title (optional)</Label>
        <Input
          id="text-title"
          type="text"
          placeholder="My notes"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="text">Text Content *</Label>
          <span className="text-sm text-muted-foreground">{wordCount} words</span>
        </div>
        <Textarea
          id="text"
          placeholder="Paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          disabled={loading}
          rows={10}
          className="resize-none"
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Extract Knowledge
      </Button>
    </form>
  );
}
