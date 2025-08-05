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
import { X } from "lucide-react"

interface UniversityFormProps {
  onClose: () => void
  onSave: (university: any) => void
}

export default function UniversityForm({ onClose, onSave }: UniversityFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    program: "",
    applicationFee: "",
    greRequired: false,
    greScore: "",
    sopLength: "",
    deadline: "",
    status: "not-started",
    requirements: [] as string[],
    notes: "",
  })

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

  const handleRequirementChange = (requirement: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, requirement],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        requirements: prev.requirements.filter((req) => req !== requirement),
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      applicationFee: Number.parseFloat(formData.applicationFee) || 0,
      sopLength: Number.parseFloat(formData.sopLength) || 0,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add University</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">University Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  value={formData.program}
                  onChange={(e) => setFormData((prev) => ({ ...prev, program: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicationFee">Application Fee ($)</Label>
                <Input
                  id="applicationFee"
                  type="number"
                  value={formData.applicationFee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, applicationFee: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sopLength">SOP Length (pages)</Label>
                <Input
                  id="sopLength"
                  type="number"
                  value={formData.sopLength}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sopLength: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="greRequired"
                checked={formData.greRequired}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, greRequired: !!checked }))}
              />
              <Label htmlFor="greRequired">GRE Required</Label>
            </div>

            {formData.greRequired && (
              <div className="space-y-2">
                <Label htmlFor="greScore">GRE Score Requirement</Label>
                <Input
                  id="greScore"
                  value={formData.greScore}
                  onChange={(e) => setFormData((prev) => ({ ...prev, greScore: e.target.value }))}
                  placeholder="e.g., 320+, 160V/160Q"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Requirements</Label>
              <div className="grid grid-cols-2 gap-2">
                {requirementOptions.map((requirement) => (
                  <div key={requirement} className="flex items-center space-x-2">
                    <Checkbox
                      id={requirement}
                      checked={formData.requirements.includes(requirement)}
                      onCheckedChange={(checked) => handleRequirementChange(requirement, !!checked)}
                    />
                    <Label htmlFor={requirement} className="text-sm">
                      {requirement}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes about this application..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save University</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
