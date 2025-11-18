"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, X } from "lucide-react";

type FilePasteFormProps = {
  onSuccess: () => void;
};

export function FilePasteForm({ onSuccess }: FilePasteFormProps) {
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (uploadedFile: File) => {
    if (uploadedFile.type !== "application/pdf") {
      setError("Please select a PDF file");
      return;
    }

    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFile(e.target?.result as string);
      setFileName(uploadedFile.name);
      setTitle(uploadedFile.name.replace(/\.[^/.]+$/, ""));
      setError(null);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileChange(droppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "pdf",
          content: file,
          sourceTitle: title || fileName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create knowledge item");
      }

      // Clear form and notify success
      setFile(null);
      setFileName("");
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
        <Label htmlFor="file-title">Title (optional)</Label>
        <Input
          id="file-title"
          type="text"
          placeholder="My document"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label>PDF File *</Label>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          {file ? (
            <div className="flex items-center justify-center gap-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-muted-foreground">
                  Ready to extract knowledge
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setFile(null);
                  setFileName("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <label
                  htmlFor="pdf-file"
                  className="cursor-pointer text-primary hover:underline"
                >
                  Click to upload
                </label>{" "}
                or drag and drop
              </div>
              <p className="text-xs text-muted-foreground">
                PDF files up to 10MB
              </p>
            </div>
          )}
          <input
            id="pdf-file"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const uploadedFile = e.target.files?.[0];
              if (uploadedFile) handleFileChange(uploadedFile);
            }}
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading || !file} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Extract Knowledge
      </Button>
    </form>
  );
}
