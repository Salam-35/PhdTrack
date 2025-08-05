"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, PiggyBank, CreditCard, Award, Plus, Calculator, Target, AlertCircle } from "lucide-react"

export default function Finances() {
  const [activeTab, setActiveTab] = useState("overview")

  const expenses = [
    { category: "Application Fees", amount: 1250, budget: 1500, color: "bg-blue-500" },
    { category: "Test Fees", amount: 420, budget: 500, color: "bg-green-500" },
    { category: "Document Preparation", amount: 300, budget: 400, color: "bg-purple-500" },
    { category: "Travel & Interviews", amount: 800, budget: 1200, color: "bg-orange-500" },
  ]

  const applications = [
    { university: "Stanford", fee: 125, paid: true, deadline: "2024-12-15" },
    { university: "MIT", fee: 75, paid: true, deadline: "2024-12-01" },
    { university: "Berkeley", fee: 120, paid: false, deadline: "2024-12-10" },
    { university: "Harvard", fee: 105, paid: false, deadline: "2024-12-20" },
  ]

  const fundingOpportunities = [
    {
      name: "NSF Graduate Research Fellowship",
      amount: "$37,000/year",
      deadline: "2024-10-15",
      status: "applied",
      type: "Fellowship",
    },
    {
      name: "Stanford Knight-Hennessy Scholars",
      amount: "Full funding",
      deadline: "2024-10-10",
      status: "eligible",
      type: "Scholarship",
    },
    {
      name: "MIT Research Assistantship",
      amount: "$60,000/year",
      deadline: "N/A",
      status: "available",
      type: "Assistantship",
    },
  ]

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalBudget = expenses.reduce((sum, exp) => sum + exp.budget, 0)
  const remainingBudget = totalBudget - totalSpent

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Tracker</h2>
          <p className="text-gray-600">Manage application costs and funding</p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining Budget</p>
                <p className="text-2xl font-bold">${remainingBudget.toLocaleString()}</p>
              </div>
              <PiggyBank className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary-500" />
            <span>Budget Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {expenses.map((expense, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{expense.category}</span>
                <span className="text-sm text-gray-600">
                  ${expense.amount} / ${expense.budget}
                </span>
              </div>
              <Progress value={(expense.amount / expense.budget) * 100} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{Math.round((expense.amount / expense.budget) * 100)}% used</span>
                <span>${expense.budget - expense.amount} remaining</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Application Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-primary-500" />
            <span>Application Fees</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {applications.map((app, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{app.university}</div>
                  <div className="text-sm text-gray-500">Due: {new Date(app.deadline).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${app.fee}</div>
                  <Badge variant={app.paid ? "default" : "destructive"}>{app.paid ? "Paid" : "Pending"}</Badge>
                </div>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between font-bold">
                <span>Total Application Fees:</span>
                <span>${applications.reduce((sum, app) => sum + app.fee, 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Paid:</span>
                <span>${applications.filter((app) => app.paid).reduce((sum, app) => sum + app.fee, 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Outstanding:</span>
                <span>${applications.filter((app) => !app.paid).reduce((sum, app) => sum + app.fee, 0)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funding Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary-500" />
            <span>Funding Opportunities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fundingOpportunities.map((funding, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{funding.name}</h3>
                    <p className="text-sm text-gray-600">{funding.type}</p>
                  </div>
                  <Badge
                    variant={
                      funding.status === "applied" ? "default" : funding.status === "eligible" ? "secondary" : "outline"
                    }
                  >
                    {funding.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Amount: </span>
                    <span className="text-green-600 font-bold">{funding.amount}</span>
                  </div>
                  <div>
                    <span className="font-medium">Deadline: </span>
                    <span>{funding.deadline}</span>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  {funding.status === "eligible" && (
                    <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                      Apply Now
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-primary-500" />
            <span>Financial Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Fee Waivers Available</p>
                <p className="text-sm text-blue-700">
                  Many universities offer application fee waivers for students with financial need.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Early Application Benefits</p>
                <p className="text-sm text-green-700">
                  Applying early often increases your chances of receiving funding and assistantships.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <PiggyBank className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Budget for Interviews</p>
                <p className="text-sm text-yellow-700">
                  Set aside funds for potential interview travel costs, even for virtual interviews.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
