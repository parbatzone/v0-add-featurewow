"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, AlertCircle, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PoliceReport {
  id: string
  name: string
  phoneNumber: string
  email: string
  password: string
  status: "accepted" | "rejected" | "done"
  date: string
}

export function PoliceReportPending() {
  const [reports, setReports] = useState<PoliceReport[]>([])
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const saved = localStorage.getItem("police-reports-pending")
    if (saved) {
      setReports(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("police-reports-pending", JSON.stringify(reports))
  }, [reports])

  const handleAddReport = () => {
    if (!name.trim() || !phoneNumber.trim() || !email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newReport: PoliceReport = {
      id: `report-${Date.now()}`,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      password: password.trim(),
      status: "accepted",
      date: new Date().toISOString().split("T")[0],
    }

    setReports([newReport, ...reports])
    setName("")
    setPhoneNumber("")
    setEmail("")
    setPassword("")

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

  const handleStatusChange = (id: string, newStatus: "accepted" | "rejected" | "done") => {
    const report = reports.find((r) => r.id === id)
    if (report && newStatus === "done") {
      sendWhatsAppNotification(report)
    }
    setReports(reports.map((r) => (r.id === id ? { ...r, status: newStatus } : r)))
  }

  const sendWhatsAppNotification = (report: PoliceReport) => {
    const message = `🎉 Your police report is ready!\n\nName: ${report.name}\nDate: ${report.date}\n\nThank you for using Exarse Billing Software!`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/977${report.phoneNumber.replace(/^0/, "")}?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
    
    toast({
      title: "WhatsApp Opened",
      description: "Police report notification ready to send",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "done":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Report Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Police Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="report-name">Name *</Label>
              <Input
                id="report-name"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-phone">Phone Number *</Label>
              <Input
                id="report-phone"
                placeholder="98XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-email">Email *</Label>
              <Input
                id="report-email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-password">Password *</Label>
              <Input
                id="report-password"
                type="text"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
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
            <AlertCircle className="w-5 h-5" />
            Police Reports ({reports.length})
          </h3>
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{report.name}</h4>
                      <span className="text-xs text-muted-foreground">{report.date}</span>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Phone:</span> {report.phoneNumber}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span> {report.email}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Password:</span> {report.password}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="mt-2">
                          <Select value={report.status} onValueChange={(value) => 
                            handleStatusChange(report.id, value as "accepted" | "rejected" | "done")
                          }>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {report.status === "done" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendWhatsAppNotification(report)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Send WhatsApp
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
            <p className="text-muted-foreground">No police reports added yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
