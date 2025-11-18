"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PasteInterface } from "@/components/PasteInterface";
import { KnowledgeList } from "@/components/KnowledgeList";

export default function AdminPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    // Increment refresh key to trigger KnowledgeList to refetch
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AppShell>
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Admin Portal
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your knowledge base by extracting information from various sources
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Paste Interface */}
          <div>
            <PasteInterface onSuccess={handleSuccess} />
          </div>

          {/* Right Column: Knowledge List (on larger screens) */}
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <h2 className="mb-4 text-xl font-semibold">Knowledge Items</h2>
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                <KnowledgeList refresh={refreshKey} />
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Knowledge List (on smaller screens) */}
        <div className="mt-8 lg:hidden">
          <h2 className="mb-4 text-xl font-semibold">Knowledge Items</h2>
          <KnowledgeList refresh={refreshKey} />
        </div>
      </div>
    </AppShell>
  );
}
