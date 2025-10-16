"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/components/UserProvider"
import { db } from "@/lib/supabase"
import { sanitizeDeadlines, getDeadlineInfo } from "@/lib/university-deadlines"
import { useSearchParams, useRouter } from "next/navigation"
import {
  SettingsIcon,
  User,
  Bell,
  Download,
  Upload,
  Trash2,
  Mail,
  Calendar,
  Camera,
  Plus,
  X,
  Save,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, loading: userLoading, updateProfile, uploadAvatar, deleteAvatar,addResearchInterest, removeResearchInterest, refreshProfile } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [newInterest, setNewInterest] = useState("")
  const defaultTimezone = "Asia/Dhaka"
  const supportedTimezones = useMemo(() => {
    const fallback = [
      "Asia/Dhaka",
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Berlin",
      "Asia/Kolkata",
      "Asia/Tokyo",
      "Australia/Sydney",
    ]
    try {
      if (typeof Intl !== "undefined" && typeof (Intl as any).supportedValuesOf === "function") {
        return (Intl as any).supportedValuesOf("timeZone") as string[]
      }
    } catch {
      // Ignore; fallback used below
    }
    return fallback
  }, [])

  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    phone: profile?.phone || "",
    current_university: profile?.current_university || "",
    degree_seeking: profile?.degree_seeking || "",
    field_of_study: profile?.field_of_study || "",
    graduation_year: profile?.graduation_year || "",
    gpa: profile?.gpa || "",
    bio: profile?.bio || "",
    linkedin_url: profile?.linkedin_url || "",
    website_url: profile?.website_url || "",
    location: profile?.location || "",
    timezone: profile?.timezone || defaultTimezone,
  })
  
  const [notifications, setNotifications] = useState({
    deadlines: profile?.notification_preferences.deadlines ?? true,
    professor_replies: profile?.notification_preferences.professor_replies ?? true,
    document_reminders: profile?.notification_preferences.document_reminders ?? true,
    weekly_digest: profile?.notification_preferences.weekly_digest ?? false,
    email_notifications: profile?.notification_preferences.email_notifications ?? true,
    push_notifications: profile?.notification_preferences.push_notifications ?? true,
  })

  const [researchInterests, setResearchInterests] = useState(profile?.research_interests || [])
  const timezoneOptions = useMemo(() => {
    if (!formData.timezone) return supportedTimezones
    if (supportedTimezones.includes(formData.timezone)) return supportedTimezones
    return [formData.timezone, ...supportedTimezones]
  }, [supportedTimezones, formData.timezone])
  const [gmailStatusLoading, setGmailStatusLoading] = useState(true)
  const [gmailActionLoading, setGmailActionLoading] = useState(false)
  const [gmailDisconnecting, setGmailDisconnecting] = useState(false)
  const [gmailStatus, setGmailStatus] = useState<{ connected: boolean; gmailAddress?: string | null; updatedAt?: string | null }>({ connected: false })

  const fetchGmailStatus = async () => {
    setGmailStatusLoading(true)
    try {
      const response = await fetch('/api/integrations/gmail/status', {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to load Gmail status')
      }
      const data = await response.json()
      setGmailStatus({
        connected: Boolean(data.connected),
        gmailAddress: data.gmailAddress || null,
        updatedAt: data.updatedAt || null,
      })
    } catch (error) {
      console.error(error)
      setGmailStatus({ connected: false })
    } finally {
      setGmailStatusLoading(false)
    }
  }

  useEffect(() => {
    fetchGmailStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const result = searchParams?.get('gmail')
    if (!result) return

    if (result === 'connected') {
      toast.success("Gmail account connected")
      fetchGmailStatus()
    } else if (result === 'error') {
      const message = searchParams?.get('message')
      toast.error(message ? `Gmail integration failed: ${decodeURIComponent(message)}` : 'Gmail integration failed')
    }

    router.replace('/settings')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleConnectGmail = async () => {
    setGmailActionLoading(true)
    try {
      const response = await fetch('/api/integrations/gmail/auth-url', {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to start Gmail authentication')
      }
      const data = await response.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        throw new Error('Invalid Gmail auth response')
      }
    } catch (error) {
      console.error(error)
      toast.error('Unable to start Gmail integration. Please try again.')
    } finally {
      setGmailActionLoading(false)
    }
  }

  const handleDisconnectGmail = async () => {
    setGmailDisconnecting(true)
    try {
      const response = await fetch('/api/integrations/gmail/disconnect', {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to disconnect Gmail integration')
      }
      toast.success('Gmail integration removed')
      fetchGmailStatus()
    } catch (error) {
      console.error(error)
      toast.error('Unable to disconnect Gmail integration. Please try again.')
    } finally {
      setGmailDisconnecting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (!profile) return
    setFormData({
      display_name: profile.display_name || "",
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      phone: profile.phone || "",
      current_university: profile.current_university || "",
      degree_seeking: profile.degree_seeking || "",
      field_of_study: profile.field_of_study || "",
      graduation_year: profile.graduation_year || "",
      gpa: profile.gpa || "",
      bio: profile.bio || "",
      linkedin_url: profile.linkedin_url || "",
      website_url: profile.website_url || "",
      location: profile.location || "",
      timezone: profile.timezone || defaultTimezone,
    })
    setNotifications({
      deadlines: profile.notification_preferences?.deadlines ?? true,
      professor_replies: profile.notification_preferences?.professor_replies ?? true,
      document_reminders: profile.notification_preferences?.document_reminders ?? true,
      weekly_digest: profile.notification_preferences?.weekly_digest ?? false,
      email_notifications: profile.notification_preferences?.email_notifications ?? true,
      push_notifications: profile.notification_preferences?.push_notifications ?? true,
    })
    setResearchInterests(profile.research_interests || [])
  }, [profile, defaultTimezone])

  const handleSaveProfile = async () => {
    if (!profile) return
    
    setLoading(true)
    try {
      console.log("🧪 Starting update")
      await Promise.race([
        updateProfile({
          ...formData,
          timezone: formData.timezone || defaultTimezone,
          degree_seeking: formData.degree_seeking === "PhD" || formData.degree_seeking === "Masters"
            ? formData.degree_seeking
            : undefined,
          research_interests: researchInterests,
          notification_preferences: {
            deadlines: Boolean(notifications.deadlines),
            professor_replies: Boolean(notifications.professor_replies),
            document_reminders: Boolean(notifications.document_reminders),
            weekly_digest: Boolean(notifications.weekly_digest),
            email_notifications: Boolean(notifications.email_notifications),
            push_notifications: Boolean(notifications.push_notifications),
          },
          graduation_year: formData.graduation_year ? Number(formData.graduation_year) : undefined,
          gpa: formData.gpa ? Number(formData.gpa) : undefined,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("⏱ Timeout after 10s")), 10000))
      ])
      console.log("✅ Update finished")
      await refreshProfile()
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
      console.error("🚨 Error updating profile:", error)
    } finally {
      setLoading(false)
    }

  }


  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    setLoading(true)
    try {
      await uploadAvatar(file) // this should already be available via `useUser()`
      await refreshProfile()
      toast.success("Avatar updated!")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error("Failed to upload avatar.")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarDelete = async () => {
    if (!profile?.avatar_url) return
    try {
      setLoading(true)
      await deleteAvatar(profile.avatar_url)
      toast.success("Profile photo deleted")
      await refreshProfile()
    } catch (error) {
      console.error("Error deleting avatar:", error)
      toast.error("Failed to delete avatar")
    } finally {
      setLoading(false)
    }
    
}
// const addResearchInterest = () => {
//       if (newInterest.trim() && !researchInterests.includes(newInterest.trim())) {
//         setResearchInterests([...researchInterests, newInterest.trim()])
//         setNewInterest("")
//       }
//   }
  // const removeResearchInterest = (interest: string) => {
  //   setResearchInterests(researchInterests.filter(i => i !== interest))
  // }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addResearchInterest()
    }
  }

  const handleExportData = async () => {
    if (!user?.id) {
      toast.error("Unable to export data without an authenticated user.")
      return
    }

    setExporting(true)
    try {
      const [universitiesData, professorsData] = await Promise.all([
        db.getUniversities(user.id),
        db.getProfessors(user.id),
      ])

      const formatDate = (value: string) => {
        const parsed = new Date(value)
        return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
      }

      // Use browser-ready build to avoid Node polyfills issues
      const XLSXModule = await import("xlsx/dist/xlsx.full.min.js")
      const XLSX = XLSXModule.default || XLSXModule
      const workbook = XLSX.utils.book_new()

      const formattedUniversities = (universitiesData || []).map((uni) => ({
        Name: uni.name,
        Program: uni.program,
        Degree: uni.degree,
        Location: uni.location,
        Ranking: uni.ranking,
        "Application Fee": uni.application_fee,
        "Next Deadline": (() => {
          const deadlines = sanitizeDeadlines(uni.deadlines, uni.deadline ?? undefined)
          const info = getDeadlineInfo(deadlines)
          return info.current ? formatDate(info.current.deadline) : ""
        })(),
        "All Deadlines": (() => {
          const deadlines = sanitizeDeadlines(uni.deadlines, uni.deadline ?? undefined)
          return deadlines.map((d) => `${d.term}: ${formatDate(d.deadline)}`).join("; ")
        })(),
        Status: uni.status,
        Requirements: (uni.requirements || []).join(", "),
        "GRE Required": uni.gre_required ? "Yes" : "No",
        "GRE Score": uni.gre_score || "",
        "SOP Length": uni.sop_length,
        "Funding Available": uni.funding_available ? "Yes" : "No",
        "Funding Types": (uni.funding_types || []).join(", "),
        "Funding Amount": uni.funding_amount || "",
        "Acceptance Funding Status": uni.acceptance_funding_status || "",
        Notes: uni.notes || "",
      }))

      const formattedProfessors = (professorsData || []).map((prof) => ({
        Name: prof.name,
        Title: prof.title,
        University: prof.university,
        Department: prof.department,
        Email: prof.email,
        "Contact Date": prof.mailing_date
          ? new Date(prof.mailing_date).toLocaleString()
          : prof.last_contact
            ? new Date(prof.last_contact).toLocaleString()
            : "",
        Status: (() => {
          switch (prof.contact_status) {
            case "replied":
              return "Replied"
            case "rejected":
              return "Rejected"
            case "meeting-scheduled":
              return "Meeting Scheduled"
            case "contacted":
              return "Contacted"
            case "not-contacted":
              return "Not Contacted"
            default:
              return prof.contact_status || ""
          }
        })(),
        "Response Time": prof.response_time || "",
      }))

      const universityHeaders = [
        "Name",
        "Program",
        "Degree",
        "Location",
        "Ranking",
        "Application Fee",
        "Next Deadline",
        "All Deadlines",
        "Status",
        "Requirements",
        "GRE Required",
        "GRE Score",
        "SOP Length",
        "Funding Available",
        "Funding Types",
        "Funding Amount",
        "Acceptance Funding Status",
        "Notes",
      ]
      const professorHeaders = [
        "Name",
        "Title",
        "University",
        "Department",
        "Email",
        "Contact Date",
        "Status",
        "Response Time",
      ]

      const universitySheet = XLSX.utils.json_to_sheet(formattedUniversities, {
        header: universityHeaders,
        skipHeader: false,
      })
      if (!formattedUniversities.length) {
        XLSX.utils.sheet_add_aoa(universitySheet, [["No university records found"]], { origin: "A2" })
      }

      const professorSheet = XLSX.utils.json_to_sheet(formattedProfessors, {
        header: professorHeaders,
        skipHeader: false,
      })
      if (!formattedProfessors.length) {
        XLSX.utils.sheet_add_aoa(professorSheet, [["No professor records found"]], { origin: "A2" })
      }

      XLSX.utils.book_append_sheet(workbook, universitySheet, "University Applications")
      XLSX.utils.book_append_sheet(workbook, professorSheet, "Professors")

      const workbookArray = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      const blob = new Blob([workbookArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)
      const downloadLink = document.createElement("a")
      const timestamp = new Date().toISOString().split("T")[0]
      downloadLink.href = url
      downloadLink.download = `phdtrack-data-${timestamp}.xlsx`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(url)

      toast.success("Your data export is ready!")
    } catch (error) {
      console.error("Error exporting data:", error)
      toast.error("Failed to export data. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  if (!profile) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-primary-500" />
            <span>Profile Picture</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url} alt="Profile picture" />
            <AvatarFallback className="text-lg">
              {(profile.first_name?.[0] || "") + (profile.last_name?.[0] || "")}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="bg-primary-500 hover:bg-primary-600"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload New Photo
              </Button>
              {profile.avatar_url && (
                <Button 
                  variant="destructive"
                  onClick={handleAvatarDelete}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Delete
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500">JPG, PNG up to 5MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>


      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary-500" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input 
                id="display_name" 
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input 
                id="first_name" 
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input 
                id="last_name" 
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="timezone">Preferred Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => handleInputChange('timezone', value)}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {timezoneOptions.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Used for showing your reference time alongside professor availability.</p>
            </div>
          </div>
          {/*
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>
          */}
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5 text-primary-500" />
            <span>Academic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_university">Current University</Label>
              <Input 
                id="current_university" 
                value={formData.current_university}
                onChange={(e) => handleInputChange('current_university', e.target.value)}
                placeholder="University Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree_seeking">Degree Seeking</Label>
              <Select 
                value={formData.degree_seeking} 
                onValueChange={(value) => handleInputChange('degree_seeking', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select degree type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masters">Masters</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="field_of_study">Field of Study</Label>
              <Input 
                id="field_of_study" 
                value={formData.field_of_study}
                onChange={(e) => handleInputChange('field_of_study', e.target.value)}
                placeholder="e.g., Computer Science, Biology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduation_year">Expected Graduation Year</Label>
              <Input 
                id="graduation_year" 
                type="number"
                value={formData.graduation_year}
                onChange={(e) => handleInputChange('graduation_year', e.target.value)}
                placeholder="2025"
                min="2024"
                max="2030"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpa">GPA</Label>
              <Input 
                id="gpa" 
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.gpa}
                onChange={(e) => handleInputChange('gpa', e.target.value)}
                placeholder="3.75"
              />
            </div>
          </div>
          
          {/* Research Interests */}
          <div className="space-y-2">
            <Label>Research Interests</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {researchInterests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {interest}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-100"
                    onClick={() => removeResearchInterest(interest)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add research interest..."
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addResearchInterest}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Links
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary-500" />
            <span>Links & Social</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input 
                id="linkedin_url" 
                value={formData.linkedin_url}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">Personal Website</Label>
              <Input 
                id="website_url" 
                value={formData.website_url}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      */}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveProfile}
          disabled={loading}
          className="bg-primary-500 hover:bg-primary-600"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>

      </div>

      {/*
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <span>Your Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 bg-white hover:bg-green-50 hover:border-green-400 transition-all duration-200"
              >
                <Upload className="h-4 w-4" />
                <span>Import Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        */}

      {/* Notification Settings
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
              checked={notifications.professor_replies}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, professor_replies: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Document Reminders</div>
              <div className="text-xs text-gray-500">Reminders to complete documents</div>
            </div>
            <Switch
              checked={notifications.document_reminders}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, document_reminders: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Weekly Digest</div>
              <div className="text-xs text-gray-500">Weekly summary of your progress</div>
            </div>
            <Switch
              checked={notifications.weekly_digest}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weekly_digest: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Email Notifications</div>
              <div className="text-xs text-gray-500">Receive notifications via email</div>
            </div>
            <Switch
              checked={notifications.email_notifications}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email_notifications: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Push Notifications</div>
              <div className="text-xs text-gray-500">Browser push notifications</div>
            </div>
            <Switch
              checked={notifications.push_notifications}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push_notifications: checked }))}
            />
          </div>
        </CardContent>
      </Card>
      */}

      {/* Gmail Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-red-500" />
            <span>Gmail Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Connect a Gmail account to automatically track outreach, send follow-ups, and keep your professor correspondence organised. You can connect any Gmail account, even if it’s different from the one you use to sign in.
          </p>

          {gmailStatusLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking integration status…
            </div>
          ) : gmailStatus.connected ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">Connected Gmail Account</p>
                  <p className="text-green-700">{gmailStatus.gmailAddress}</p>
                  {gmailStatus.updatedAt && (
                    <p className="text-xs text-green-700/80 mt-1">
                      Linked {new Date(gmailStatus.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="border-green-300 bg-white text-green-700">
                  Connected
                </Badge>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <p className="font-medium">No Gmail account connected</p>
              <p className="text-xs text-gray-500 mt-1">
                Connect to unlock automatic email tracking and follow-up reminders.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {gmailStatus.connected ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleDisconnectGmail}
                disabled={gmailDisconnecting}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {gmailDisconnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Disconnecting…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Disconnect Gmail
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleConnectGmail}
                disabled={gmailActionLoading}
                className="bg-red-500 hover:bg-red-600"
              >
                {gmailActionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Connect Gmail
                  </>
                )}
              </Button>
            )}

            {gmailStatus.connected && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleConnectGmail}
                disabled={gmailActionLoading}
                className="text-sm text-gray-600 hover:text-primary-600"
              >
                Reconnect different account
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
  <CardContent className="space-y-10 pt-6">
    <div className="flex justify-center">
      <Button
        type="button"
        onClick={handleExportData}
        disabled={exporting}
        className="flex items-center gap-3 rounded-xl border border-primary-100 bg-gradient-to-r from-primary-50 via-white to-primary-50 px-8 py-5 text-sm font-semibold text-primary-700 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
      >
        {exporting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Download className="h-5 w-5" />
        )}
        <span>{exporting ? "Preparing export..." : "Export Your Data"}</span>
      </Button>
    </div>
    {/* Data Management
    <div className="border-t pt-4">
      <Button variant="destructive" className="flex items-center space-x-2">
        <Trash2 className="h-4 w-4" />
        <span>Delete All Data</span>
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        This action cannot be undone. All your data will be permanently deleted.
      </p>
    </div>
    */}
  </CardContent>
</Card>


      {/* Integration Settings
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
       */}
      {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5 text-purple-600" />
              <span>About</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Version</span>
              <span className="font-semibold">2.1.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-semibold">October 2025</span>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Developer</h3>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src="/salam.png"
                    alt="Abdus Salam"
                    className="h-12 w-12 rounded-full object-cover border-2 border-purple-300 shadow-sm"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Abdus Salam</p>
                    <p className="text-xs text-gray-700">Software Engineer | Researcher</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-white hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium"
                  onClick={() => window.open('https://salam35.netlify.app', '_blank')}
                >
                  <span className="mr-2">🌐</span>
                  Visit Portfolio
                </Button>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                variant="outline"
                className="w-full bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm"
              >
                Privacy Policy
              </Button>
              <Button
                variant="outline"
                className="w-full bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm"
              >
                Terms of Service
              </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
