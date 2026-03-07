"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PoliceReport {
  id: string
  name: string
  description: string
  details: string
  date: string
  status: "pending" | "resolved"
}

export function PoliceReportPending() {
  const [reports, setReports] = useState<PoliceReport[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [details, setDetails] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const saved = localStorage.getItem("police-reports")
    if (saved) {
      setReports(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("police-reports", JSON.stringify(reports))
  }, [reports])

  const handleAddReport = () => {
    if (!name.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in name and description",
        variant: "destructive",
      })
      return
    }

    const newReport: PoliceReport = {
      id: `report-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      details: details.trim(),
      date: new Date().toISOString().split("T")[0],
      status: "pending",
    }

    setReports([newReport, ...reports])

    setName("")
    setDescription("")
    setDetails("")

    toast({
      title: "Success",
      description: "Police report added successfully",
    })
  }

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter((r) => r.id !== id))
    toast({
      title: "Deleted",
      description: "Police report removed",
    })
  }

  const handleMarkResolved = (id: string) => {
    setReports(
      reports.map((r) => (r.id === id ? { ...r, status: "resolved" as const } : r))
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Report Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Police Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-name">Name / Case Reference *</Label>
            <Input
              id="report-name"
              placeholder="e.g., FIR #2025-001, Case Name, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">Description *</Label>
            <Input
              id="report-description"
              placeholder="Brief description of the case"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-details">Additional Details</Label>
            <Textarea
              id="report-details"
              placeholder="Add any additional information..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleAddReport} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Police Report
          </Button>
        </CardContent>
      </Card>

      {/* Reports List */}
      {reports.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Pending Reports ({reports.filter((r) => r.status === "pending").length})
          </h3>
          {reports.map((report) => (
            <Card key={report.id} className={report.status === "resolved" ? "opacity-60" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{report.name}</h4>
                      <Badge variant={report.status === "pending" ? "destructive" : "secondary"}>
                        {report.status === "pending" ? "Pending" : "Resolved"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{report.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{report.description}</p>
                    {report.details && (
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">{report.details}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {report.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkResolved(report.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        Mark Resolved
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteReport(report.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No police reports pending</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
