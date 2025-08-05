"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SettingsIcon, User, Bell, Shield, Download, Upload, Trash2, Mail, Calendar, Moon, Sun } from "lucide-react"

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    deadlines: true,
    professorReplies: true,
    documentReminders: true,
    weeklyDigest: false,
  })

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary-500" />
            <span>Profile Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="Alex" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Johnson" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="alex.johnson@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="university">Current University</Label>
            <Input id="university" defaultValue="State University" />
          </div>
          <Button className="bg-primary-500 hover:bg-primary-600">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary-500" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Deadline Reminders</div>
              <div className="text-xs text-gray-500">Get notified about upcoming deadlines</div>
            </div>
            <Switch
              checked={notifications.deadlines}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, deadlines: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Professor Replies</div>
              <div className="text-xs text-gray-500">Notifications when professors respond</div>
            </div>
            <Switch
              checked={notifications.professorReplies}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, professorReplies: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Document Reminders</div>
              <div className="text-xs text-gray-500">Reminders to complete documents</div>
            </div>
            <Switch
              checked={notifications.documentReminders}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, documentReminders: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Weekly Digest</div>
              <div className="text-xs text-gray-500">Weekly summary of your progress</div>
            </div>
            <Switch
              checked={notifications.weeklyDigest}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyDigest: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {darkMode ? <Moon className="h-5 w-5 text-primary-500" /> : <Sun className="h-5 w-5 text-primary-500" />}
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Dark Mode</div>
              <div className="text-xs text-gray-500">Switch between light and dark themes</div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary-500" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Upload className="h-4 w-4" />
              <span>Import Data</span>
            </Button>
          </div>
          <div className="border-t pt-4">
            <Button variant="destructive" className="flex items-center space-x-2">
              <Trash2 className="h-4 w-4" />
              <span>Delete All Data</span>
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary-500" />
            <span>Integrations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium">Email Integration</div>
                <div className="text-sm text-gray-500">Connect your email for automatic tracking</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium">Calendar Sync</div>
                <div className="text-sm text-gray-500">Sync deadlines with your calendar</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5 text-primary-500" />
            <span>About</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Version</span>
            <span>2.1.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Last Updated</span>
            <span>December 2024</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Data Storage</span>
            <span>Local Device</span>
          </div>
          <div className="pt-4 space-y-2">
            <Button variant="outline" className="w-full bg-transparent">
              Privacy Policy
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Terms of Service
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
