"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Loader2 } from "lucide-react"
import { db, type University } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface UniversityFormProps {
  onClose: () => void
  onSave: (university: University) => void
  university?: University
}

export default function UniversityForm({ onClose, onSave, university }: UniversityFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: university?.name || "",
    program: university?.program || "",
    degree: university?.degree || ("PhD" as const),
    location: university?.location || "",
    ranking: university?.ranking?.toString() || "",
    application_fee: university?.application_fee?.toString() || "",
    deadline: university?.deadline || "",
    status: university?.status || ("not-started" as const),
    priority: university?.priority || ("medium" as const),
    requirements: university?.requirements || [],
    gre_required: university?.gre_required || false,
    gre_score: university?.gre_score || "",
    sop_length: university?.sop_length?.toString() || "",
    funding_available: university?.funding_available || false,
    funding_types: university?.funding_types || [],
    funding_amount: university?.funding_amount || "",
    acceptance_funding_status: university?.acceptance_funding_status || ("unknown" as const),
    notes: university?.notes || "",
  })

  const [newRequirement, setNewRequirement] = useState("")
  const [newFundingType, setNewFundingType] = useState("")

  const requirementOptions = [
    "Transcripts",
    "Letters of Recommendation",
    "Statement of Purpose",
    "GRE Scores",
    "TOEFL/IELTS",
    "Writing Sample",
    "Research Statement",
    "CV/Resume",
    "Portfolio",
  ]

  const fundingTypeOptions = [
    "Research Assistantship",
    "Teaching Assistantship",
    "Fellowship",
    "Scholarship",
    "Tuition Waiver",
  ]

  const addRequirement = (requirement: string) => {
    if (requirement && !formData.requirements.includes(requirement)) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, requirement],
      }))
    }
    setNewRequirement("")
  }

  const removeRequirement = (requirement: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((req) => req !== requirement),
    }))
  }

  const addFundingType = (type: string) => {
    if (type && !formData.funding_types.includes(type)) {
      setFormData((prev) => ({
        ...prev,
        funding_types: [...prev.funding_types, type],
      }))
    }
    setNewFundingType("")
  }

  const removeFundingType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      funding_types: prev.funding_types.filter((t) => t !== type),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare university data
      const baseData = {
        ...formData,
        ranking: Number.parseInt(formData.ranking) || 0,
        application_fee: Number.parseFloat(formData.application_fee) || 0,
        sop_length: Number.parseInt(formData.sop_length) || 0,
      }

      // Only include acceptance_funding_status if it's accepted (to avoid DB error if column doesn't exist yet)
      const universityData = formData.status === "accepted"
        ? baseData
        : { ...baseData, acceptance_funding_status: undefined }

      let result: University
      if (university) {
        result = await db.updateUniversity(university.id, universityData)
        toast({
          title: "University Updated",
          description: `${result.name} has been updated successfully.`,
        })
      } else {
        result = await db.addUniversity(universityData)
        toast({
          title: "University Added",
          description: `${result.name} has been added successfully.`,
        })
      }

      onSave(result)
      onClose()
    } catch (error) {
      console.error("Error saving university:", error)
      toast({
        title: "Error",
        description: "Failed to save university. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{university ? "Edit University" : "Add University"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">University Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g., Stanford University"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Program *</Label>
                <Input
                  id="program"
                  value={formData.program}
                  onChange={(e) => setFormData((prev) => ({ ...prev, program: e.target.value }))}
                  required
                  placeholder="e.g., Computer Science PhD"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="degree">Degree Type</Label>
                <Select
                  value={formData.degree}
                  onValueChange={(value: "PhD" | "Masters") => setFormData((prev) => ({ ...prev, degree: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="Masters">Masters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Stanford, CA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ranking">Ranking</Label>
                <Input
                  id="ranking"
                  type="number"
                  value={formData.ranking}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ranking: e.target.value }))}
                  placeholder="e.g., 1"
                />
              </div>
            </div>

            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="application_fee">Application Fee ($)</Label>
                <Input
                  id="application_fee"
                  type="number"
                  step="0.01"
                  value={formData.application_fee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, application_fee: e.target.value }))}
                  placeholder="125.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sop_length">SOP Length (pages)</Label>
                <Input
                  id="sop_length"
                  type="number"
                  value={formData.sop_length}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sop_length: e.target.value }))}
                  placeholder="2"
                />
              </div>
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Application Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Acceptance Funding Status - Only show when accepted */}
            {formData.status === "accepted" && (
              <div className="space-y-2">
                <Label htmlFor="acceptance_funding_status">Acceptance Funding Status</Label>
                <Select
                  value={formData.acceptance_funding_status}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, acceptance_funding_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="with-funding">Accepted with Funding</SelectItem>
                    <SelectItem value="without-funding">Accepted without Funding</SelectItem>
                    <SelectItem value="pending">Funding Decision Pending</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Specify whether you were accepted with or without funding
                </p>
              </div>
            )}

            {/* GRE Requirements */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gre_required"
                  checked={formData.gre_required}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, gre_required: !!checked }))}
                />
                <Label htmlFor="gre_required">GRE Required</Label>
              </div>

              {formData.gre_required && (
                <div className="space-y-2">
                  <Label htmlFor="gre_score">GRE Score Requirement</Label>
                  <Input
                    id="gre_score"
                    value={formData.gre_score}
                    onChange={(e) => setFormData((prev) => ({ ...prev, gre_score: e.target.value }))}
                    placeholder="e.g., 320+, 160V/160Q"
                  />
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <Label>Application Requirements</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {req}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeRequirement(req)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Select value={newRequirement} onValueChange={setNewRequirement}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    {requirementOptions
                      .filter((opt) => !formData.requirements.includes(opt))
                      .map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={() => addRequirement(newRequirement)} disabled={!newRequirement}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Funding */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="funding_available"
                  checked={formData.funding_available}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, funding_available: !!checked }))}
                />
                <Label htmlFor="funding_available">Funding Available</Label>
              </div>

              {formData.funding_available && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="funding_amount">Funding Amount</Label>
                    <Input
                      id="funding_amount"
                      value={formData.funding_amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, funding_amount: e.target.value }))}
                      placeholder="e.g., $55,000/year"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Funding Types</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.funding_types.map((type, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {type}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFundingType(type)} />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select value={newFundingType} onValueChange={setNewFundingType}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select funding type" />
                        </SelectTrigger>
                        <SelectContent>
                          {fundingTypeOptions
                            .filter((opt) => !formData.funding_types.includes(opt))
                            .map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={() => addFundingType(newFundingType)} disabled={!newFundingType}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes about this application..."
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-primary-500 hover:bg-primary-600">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {university ? "Update University" : "Add University"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
