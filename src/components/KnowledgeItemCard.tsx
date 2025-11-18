"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash, Loader2 } from "lucide-react";
import type { KnowledgeItem } from "@/schemas";

type KnowledgeItemCardProps = {
  item: KnowledgeItem;
  onDelete: () => void;
};

export function KnowledgeItemCard({ item, onDelete }: KnowledgeItemCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/knowledge/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete knowledge item");
      }

      onDelete();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge>{item.contentType}</Badge>
              {item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View source
                </a>
              )}
            </div>
            <CardTitle className="text-lg">
              {item.sourceTitle || "Untitled"}
            </CardTitle>
            <CardDescription>
              {formatDate(item.createdAt)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {showConfirm ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Confirm
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirm(true)}
                aria-label="Delete knowledge item"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {item.summary && (
          <p className="text-sm text-muted-foreground">{item.summary}</p>
        )}

        {item.keywords && item.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.keywords.map((keyword, idx) => (
              <Badge key={idx} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        )}

        {item.metadata && (
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {item.metadata.wordCount && (
              <>
                <dt className="font-medium text-muted-foreground">Word Count:</dt>
                <dd>{item.metadata.wordCount}</dd>
              </>
            )}
            {item.metadata.pageCount && (
              <>
                <dt className="font-medium text-muted-foreground">Pages:</dt>
                <dd>{item.metadata.pageCount}</dd>
              </>
            )}
            {item.metadata.fileSize && (
              <>
                <dt className="font-medium text-muted-foreground">File Size:</dt>
                <dd>{Math.round(item.metadata.fileSize / 1024)} KB</dd>
              </>
            )}
            {item.metadata.language && (
              <>
                <dt className="font-medium text-muted-foreground">Language:</dt>
                <dd className="uppercase">{item.metadata.language}</dd>
              </>
            )}
          </dl>
        )}

        {item.extractedText && item.extractedText.length > 200 && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
              View extracted text
            </summary>
            <p className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
              {item.extractedText}
            </p>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
