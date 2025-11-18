"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, FileText, Image, File } from "lucide-react";
import { UrlPasteForm } from "./UrlPasteForm";
import { TextPasteForm } from "./TextPasteForm";
import { ImagePasteForm } from "./ImagePasteForm";
import { FilePasteForm } from "./FilePasteForm";

type PasteInterfaceProps = {
  onSuccess: () => void;
};

export function PasteInterface({ onSuccess }: PasteInterfaceProps) {
  const [activeTab, setActiveTab] = useState("url");
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSuccess = () => {
    setSuccessMessage(true);
    onSuccess();
    setTimeout(() => setSuccessMessage(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Knowledge</CardTitle>
        <CardDescription>
          Paste content from various sources to extract and store knowledge
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <div className="mb-4 rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
            Knowledge item created successfully!
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">URL</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Image</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <File className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="url">
              <UrlPasteForm onSuccess={handleSuccess} />
            </TabsContent>

            <TabsContent value="text">
              <TextPasteForm onSuccess={handleSuccess} />
            </TabsContent>

            <TabsContent value="image">
              <ImagePasteForm onSuccess={handleSuccess} />
            </TabsContent>

            <TabsContent value="file">
              <FilePasteForm onSuccess={handleSuccess} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
