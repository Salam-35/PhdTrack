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
import { X, Plus, Loader2, ChevronDown, ChevronUp } from "lucide-react"
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
  const [showRequirements, setShowRequirements] = useState(false)

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
    "RA",
    "TA",
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-gray-800">
            {university ? "Edit University" : "Add University"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="bg-blue-50/40 rounded-lg p-2 border border-blue-200/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="name" className="text-xs font-medium text-blue-900">University Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="h-8 mt-0.5 text-sm border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Stanford University"
                  />
                </div>
                <div>
                  <Label htmlFor="program" className="text-xs font-medium text-blue-900">Program *</Label>
                  <Input
                    id="program"
                    value={formData.program}
                    onChange={(e) => setFormData((prev) => ({ ...prev, program: e.target.value }))}
                    required
                    className="h-8 mt-0.5 text-sm border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Computer Science PhD"
                  />
                </div>
                <div>
                  <Label htmlFor="degree" className="text-xs font-medium text-blue-900">Degree Type</Label>
                  <Select value={formData.degree} onValueChange={(value: "PhD" | "Masters") => setFormData((prev) => ({ ...prev, degree: value }))}>
                    <SelectTrigger className="h-8 mt-0.5 text-sm border-blue-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Masters">Masters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-green-50/40 rounded-lg p-2 border border-green-200/50">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <div>
                  <Label htmlFor="location" className="text-xs font-medium text-green-900">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="h-8 mt-0.5 text-sm border-green-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <Label htmlFor="ranking" className="text-xs font-medium text-green-900">Ranking</Label>
                  <Input
                    id="ranking"
                    type="number"
                    value={formData.ranking}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ranking: e.target.value }))}
                    className="h-8 mt-0.5 text-sm border-green-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="application_fee" className="text-xs font-medium text-green-900">Fee ($)</Label>
                  <Input
                    id="application_fee"
                    type="number"
                    step="0.01"
                    value={formData.application_fee}
                    onChange={(e) => setFormData((prev) => ({ ...prev, application_fee: e.target.value }))}
                    className="h-8 mt-0.5 text-sm border-green-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="125"
                  />
                </div>
                <div>
                  <Label htmlFor="deadline" className="text-xs font-medium text-green-900">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                    required
                    className="h-8 mt-0.5 text-sm border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="text-xs font-medium text-green-900">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}>
                    <SelectTrigger className="h-8 mt-0.5 text-sm border-green-200 focus:border-green-500">
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
                <div>
                  <Label htmlFor="priority" className="text-xs font-medium text-green-900">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData((prev) => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="h-8 mt-0.5 text-sm border-green-200 focus:border-green-500">
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
            </div>

            <div className="bg-purple-50/30 rounded-lg p-3 border border-purple-200/40">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="gre_required"
                    checked={formData.gre_required}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, gre_required: !!checked }))}
                  />
                  <Label htmlFor="gre_required" className="text-sm font-medium text-purple-900">GRE Required</Label>
                  {formData.gre_required && (
                    <Input
                      id="gre_score"
                      value={formData.gre_score}
                      onChange={(e) => setFormData((prev) => ({ ...prev, gre_score: e.target.value }))}
                      placeholder="Score (e.g., 320+)"
                      className="h-9 w-32 text-sm border-purple-200 focus:border-purple-500 focus:ring-purple-500 ml-2"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="sop_length" className="text-sm font-medium text-purple-900">SOP Length:</Label>
                  <Input
                    id="sop_length"
                    type="number"
                    value={formData.sop_length}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sop_length: e.target.value }))}
                    placeholder="Pages"
                    className="h-9 w-20 text-sm border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="funding_available"
                    checked={formData.funding_available}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, funding_available: !!checked }))}
                  />
                  <Label htmlFor="funding_available" className="text-sm font-medium text-purple-900">Funding</Label>
                  {formData.funding_available && (
                    <>
                      <Input
                        id="funding_amount"
                        value={formData.funding_amount}
                        onChange={(e) => setFormData((prev) => ({ ...prev, funding_amount: e.target.value }))}
                        placeholder="$55k/year"
                        className="h-9 w-28 text-sm border-purple-200 focus:border-purple-500 focus:ring-purple-500 ml-2"
                      />
                      <Select value={newFundingType} onValueChange={setNewFundingType}>
                        <SelectTrigger className="h-9 w-32 text-sm border-purple-200 focus:border-purple-500">
                          <SelectValue placeholder="Add type" />
                        </SelectTrigger>
                        <SelectContent>
                          {fundingTypeOptions.filter((opt) => !formData.funding_types.includes(opt)).map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        className="h-9 px-3 bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => addFundingType(newFundingType)}
                        disabled={!newFundingType}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {formData.funding_available && formData.funding_types.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-purple-200/50">
                  {formData.funding_types.map((type, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                      {type}
                      <X className="h-3 w-3 ml-1 cursor-pointer hover:text-purple-600" onClick={() => removeFundingType(type)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {formData.status === "accepted" && (
              <div className="bg-yellow-50/40 rounded-lg p-2 border border-yellow-200/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="acceptance_funding_status" className="text-xs font-medium text-yellow-900">Acceptance Funding Status</Label>
                    <Select value={formData.acceptance_funding_status} onValueChange={(value: any) => setFormData((prev) => ({ ...prev, acceptance_funding_status: value }))}>
                      <SelectTrigger className="h-8 mt-0.5 text-sm border-yellow-200 focus:border-yellow-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="with-funding">With Funding</SelectItem>
                        <SelectItem value="without-funding">Without Funding</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div
              className="bg-indigo-50/40 rounded-lg p-2 border border-indigo-200/50 cursor-pointer hover:bg-indigo-100/40 transition-colors"
              onClick={() => setShowRequirements(!showRequirements)}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium text-indigo-900 cursor-pointer">Application Requirements</Label>
                    {formData.requirements.length > 0 && (
                      <Badge variant="outline" className="text-xs h-5 bg-indigo-100 text-indigo-800 border-indigo-300">
                        {formData.requirements.length}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-indigo-700">
                    {showRequirements ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </div>
                </div>

                {showRequirements && (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap gap-1">
                      {formData.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs h-6 bg-indigo-100 text-indigo-800">
                          {req}
                          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeRequirement(req)} />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select value={newRequirement} onValueChange={setNewRequirement}>
                        <SelectTrigger className="h-8 text-sm border-indigo-200 focus:border-indigo-500">
                          <SelectValue placeholder="Add requirement" />
                        </SelectTrigger>
                        <SelectContent>
                          {requirementOptions.filter((opt) => !formData.requirements.includes(opt)).map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 px-2 bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => addRequirement(newRequirement)}
                        disabled={!newRequirement}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50/40 rounded-lg p-2 border border-gray-200/50">
              <div>
                <Label htmlFor="notes" className="text-xs font-medium text-gray-900">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information about this application..."
                  rows={2}
                  className="mt-0.5 text-sm resize-none border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} size="sm">
                {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                {university ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
