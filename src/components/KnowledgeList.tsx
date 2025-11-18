"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { KnowledgeItemCard } from "./KnowledgeItemCard";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginatedKnowledgeItems } from "@/schemas";

type KnowledgeListProps = {
  refresh: number;
};

export function KnowledgeList({ refresh }: KnowledgeListProps) {
  const [data, setData] = useState<PaginatedKnowledgeItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [contentType, setContentType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch knowledge items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });

        if (contentType && contentType !== "all") {
          params.append("contentType", contentType);
        }

        if (debouncedSearch) {
          params.append("search", debouncedSearch);
        }

        const response = await fetch(`/api/admin/knowledge?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch knowledge items");
        }

        const result: PaginatedKnowledgeItems = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [page, contentType, debouncedSearch, refresh]);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search knowledge items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={contentType} onValueChange={setContentType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="url">URLs</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="pdf">PDFs</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!loading && data && data.items.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No knowledge items found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || contentType !== "all"
              ? "Try adjusting your filters"
              : "Start by adding some content above"}
          </p>
        </div>
      )}

      {/* Knowledge Items */}
      {!loading && data && data.items.length > 0 && (
        <>
          <div className="grid gap-4">
            {data.items.map((item) => (
              <KnowledgeItemCard
                key={item.id}
                item={item}
                onDelete={() => {
                  // Refresh the list after deletion
                  setData((prev) =>
                    prev
                      ? {
                          ...prev,
                          items: prev.items.filter((i) => i.id !== item.id),
                          total: prev.total - 1,
                        }
                      : null
                  );
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * data.limit + 1} to{" "}
                {Math.min(page * data.limit, data.total)} of {data.total} items
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
