"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Keyboard, BookOpen, HelpCircle, Zap } from "lucide-react";

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  const shortcuts = [
    { key: "1", description: "Switch to Content tab" },
    { key: "2", description: "Switch to Reading tab (when content available)" },
    { key: "3", description: "Switch to Analytics tab" },
    { key: "?", description: "Open this help modal" },
    { key: "Esc", description: "Close modals/exit reading" },
  ];

  const readingModes = [
    {
      name: "Word-by-Word",
      icon: Zap,
      description: "Display one word at a time at your target speed",
      tips: [
        "Great for focus and concentration",
        "Adjust WPM to your comfort level",
        "Use context preview to stay oriented",
      ],
    },
    {
      name: "Chunk Reading",
      icon: BookOpen,
      description: "Read meaningful phrases together",
      tips: [
        "More natural than word-by-word",
        "Adjust chunk size (2-8 words)",
        "Better for comprehension",
      ],
    },
    {
      name: "Paragraph Mode",
      icon: HelpCircle,
      description: "Full paragraphs with auto-advance",
      tips: [
        "Best for longer content",
        "Natural reading flow",
        "Navigate with Previous/Next buttons",
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <HelpCircle className="h-6 w-6" />
            Speed Reader Help
          </DialogTitle>
          <DialogDescription>
            Learn how to get the most out of Speed Reader
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="shortcuts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shortcuts">
              <Keyboard className="h-4 w-4 mr-2" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="modes">
              <BookOpen className="h-4 w-4 mr-2" />
              Reading Modes
            </TabsTrigger>
            <TabsTrigger value="tips">
              <Zap className="h-4 w-4 mr-2" />
              Tips & Tricks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shortcuts" className="space-y-4 mt-4">
            <h3 className="font-semibold text-lg">Keyboard Shortcuts</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <kbd className="px-3 py-1 text-sm font-semibold bg-muted rounded border border-border">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground">
              💡 Tip: Shortcuts won&apos;t work when typing in input fields
            </p>
          </TabsContent>

          <TabsContent value="modes" className="space-y-4 mt-4">
            <h3 className="font-semibold text-lg">Reading Modes</h3>
            {readingModes.map((mode) => (
              <Card key={mode.name}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <mode.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{mode.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {mode.description}
                      </p>
                      <div className="space-y-1">
                        {mode.tips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-sm">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="tips" className="space-y-4 mt-4">
            <h3 className="font-semibold text-lg">Tips for Better Reading</h3>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">🎯 Start Slow</h4>
                  <p className="text-sm text-muted-foreground">
                    Begin with a comfortable WPM (200-250) and gradually increase as you get more comfortable.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">📈 Track Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    Check your Analytics tab regularly to see improvements in reading speed and comprehension.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🧠 Comprehension First</h4>
                  <p className="text-sm text-muted-foreground">
                    Speed is useless without understanding. Take the quizzes seriously and aim for 80%+ scores.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">⏰ Practice Daily</h4>
                  <p className="text-sm text-muted-foreground">
                    Consistency is key. Even 10-15 minutes of daily practice can significantly improve your reading speed.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🎨 Use Dark Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Toggle theme in the header to reduce eye strain during long reading sessions.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">📝 Try Different Modes</h4>
                  <p className="text-sm text-muted-foreground">
                    Experiment with all three reading modes to find what works best for different types of content.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
