"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  BookOpen,
  Bell,
  Shield,
  Save,
  Palette
} from "lucide-react";
import { motion } from "framer-motion";

// Mock user data
const mockUserProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "JD",
  joinedDate: "January 2024"
};

const mockReadingPrefs = {
  defaultMode: "word",
  defaultWPM: 300,
  defaultChunkSize: 4,
  autoStart: true,
  showTimer: true
};

export default function SettingsPage() {
  const [profile, setProfile] = useState(mockUserProfile);
  const [readingPrefs, setReadingPrefs] = useState(mockReadingPrefs);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="reading" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Reading</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details and how others see you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-chart-2 text-white text-2xl font-bold">
                    {profile.avatar}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG or GIF. Max size 2MB
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Member Since */}
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <p className="text-sm text-muted-foreground">
                    {profile.joinedDate}
                  </p>
                </div>

                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>

                {saved && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-green-600 dark:text-green-400"
                  >
                    ✓ Settings saved successfully!
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Reading Preferences Tab */}
        <TabsContent value="reading">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Reading Preferences</CardTitle>
                <CardDescription>
                  Customize your default reading settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Reading Mode */}
                <div className="space-y-2">
                  <Label htmlFor="default-mode">Default Reading Mode</Label>
                  <Select
                    value={readingPrefs.defaultMode}
                    onValueChange={(value) => setReadingPrefs({ ...readingPrefs, defaultMode: value })}
                  >
                    <SelectTrigger id="default-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="word">Word-by-Word</SelectItem>
                      <SelectItem value="chunk">Chunk Reading</SelectItem>
                      <SelectItem value="paragraph">Paragraph Highlighting</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The reading mode that will be selected by default
                  </p>
                </div>

                {/* Default WPM */}
                <div className="space-y-2">
                  <Label htmlFor="default-wpm">Default Reading Speed (WPM)</Label>
                  <Input
                    id="default-wpm"
                    type="number"
                    min="100"
                    max="1000"
                    step="50"
                    value={readingPrefs.defaultWPM}
                    onChange={(e) => setReadingPrefs({ ...readingPrefs, defaultWPM: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your preferred words per minute (100-1000)
                  </p>
                </div>

                {/* Default Chunk Size */}
                <div className="space-y-2">
                  <Label htmlFor="chunk-size">Default Chunk Size</Label>
                  <Select
                    value={readingPrefs.defaultChunkSize.toString()}
                    onValueChange={(value) => setReadingPrefs({ ...readingPrefs, defaultChunkSize: parseInt(value) })}
                  >
                    <SelectTrigger id="chunk-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 words</SelectItem>
                      <SelectItem value="3">3 words</SelectItem>
                      <SelectItem value="4">4 words</SelectItem>
                      <SelectItem value="5">5 words</SelectItem>
                      <SelectItem value="6">6 words</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Number of words per chunk in chunk mode
                  </p>
                </div>

                {/* Toggle Options */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-start Reading</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically start reading when content is loaded
                      </p>
                    </div>
                    <Button
                      variant={readingPrefs.autoStart ? "default" : "outline"}
                      size="sm"
                      onClick={() => setReadingPrefs({ ...readingPrefs, autoStart: !readingPrefs.autoStart })}
                    >
                      {readingPrefs.autoStart ? "On" : "Off"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Timer</Label>
                      <p className="text-xs text-muted-foreground">
                        Display elapsed time during reading sessions
                      </p>
                    </div>
                    <Button
                      variant={readingPrefs.showTimer ? "default" : "outline"}
                      size="sm"
                      onClick={() => setReadingPrefs({ ...readingPrefs, showTimer: !readingPrefs.showTimer })}
                    >
                      {readingPrefs.showTimer ? "On" : "Off"}
                    </Button>
                  </div>
                </div>

                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>

                {saved && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-green-600 dark:text-green-400"
                  >
                    ✓ Preferences saved successfully!
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what updates you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <Label>Daily Progress Reminders</Label>
                    <p className="text-xs text-muted-foreground">
                      Get reminded to complete your daily reading goals
                    </p>
                  </div>
                  <Button variant="outline" size="sm">On</Button>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <Label>Achievement Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Celebrate when you earn new badges and reach milestones
                    </p>
                  </div>
                  <Button variant="outline" size="sm">On</Button>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <Label>Weekly Summary</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive a weekly email with your reading statistics
                    </p>
                  </div>
                  <Button variant="default" size="sm">On</Button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label>New Features & Updates</Label>
                    <p className="text-xs text-muted-foreground">
                      Stay informed about new features and improvements
                    </p>
                  </div>
                  <Button variant="default" size="sm">On</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Password & Security</CardTitle>
                <CardDescription>
                  Manage your password and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>

                <Button className="gap-2">
                  <Shield className="h-4 w-4" />
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50 bg-destructive/5">
                  <div>
                    <Label className="text-foreground">Delete Account</Label>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">Delete</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
