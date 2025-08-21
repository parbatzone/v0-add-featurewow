"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, FileText, TrendingUp, Users, Plus, Search, Send, ShoppingCart, Package } from "lucide-react"
import { QuickBillForm } from "@/components/quick-bill-form"
import { DetailedBillForm } from "@/components/detailed-bill-form"
import { InvoiceHistory } from "@/components/invoice-history"
import { DashboardStats } from "@/components/dashboard-stats"
import { CustomerManagement } from "@/components/customer-management"
import LabManagement from "@/components/lab-management"
import ShoppingList from "@/components/shopping-list"
import PendingOrders from "@/components/pending-orders"

interface Invoice {
  id: string
  type: "quick" | "detailed"
  customerPhone?: string
  customerName?: string
  items: Array<{
    name: string
    quantity: number
    rate: number
    total: number
  }>
  subtotal: number
  advance: number
  remaining: number
  date: string
  status: "paid" | "pending"
}

export default function PhotoStudioBilling() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<
    Array<{
      phone: string
      name: string
      totalBills: number
      totalAmount: number
      lastVisit: string
    }>
  >([])

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem("studio-invoices")
    const savedCustomers = localStorage.getItem("studio-customers")

    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices))
    }
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers))
    }
  }, [])

  // Save data to localStorage whenever invoices change
  useEffect(() => {
    localStorage.setItem("studio-invoices", JSON.stringify(invoices))
  }, [invoices])

  useEffect(() => {
    localStorage.setItem("studio-customers", JSON.stringify(customers))
  }, [customers])

  const addInvoice = (invoice: Omit<Invoice, "id" | "date">) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: `INV-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    }

    setInvoices((prev) => [newInvoice, ...prev])

    // Update customer data
    if (invoice.customerPhone) {
      setCustomers((prev) => {
        const existingCustomer = prev.find((c) => c.phone === invoice.customerPhone)
        if (existingCustomer) {
          return prev.map((c) =>
            c.phone === invoice.customerPhone
              ? {
                  ...c,
                  totalBills: c.totalBills + 1,
                  totalAmount: c.totalAmount + invoice.subtotal,
                  lastVisit: new Date().toISOString().split("T")[0],
                }
              : c,
          )
        } else {
          return [
            ...prev,
            {
              phone: invoice.customerPhone!,
              name: invoice.customerName || "Unknown",
              totalBills: 1,
              totalAmount: invoice.subtotal,
              lastVisit: new Date().toISOString().split("T")[0],
            },
          ]
        }
      })
    }
  }

  const todaysSales = invoices
    .filter((inv) => inv.date === new Date().toISOString().split("T")[0])
    .reduce((sum, inv) => sum + inv.subtotal, 0)

  const pendingAmount = invoices.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + inv.remaining, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Camera className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-serif text-foreground">PhotoStudio Pro</h1>
                <p className="text-sm text-muted-foreground">Professional Billing Software</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Today: NPR {todaysSales.toLocaleString()}
              </Badge>
              {pendingAmount > 0 && <Badge variant="destructive">Pending: NPR {pendingAmount.toLocaleString()}</Badge>}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 lg:w-fit lg:grid-cols-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="quick-bill" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Quick Bill
            </TabsTrigger>
            <TabsTrigger value="detailed-bill" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Detailed Bill
            </TabsTrigger>
            <TabsTrigger value="pending-orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="lab" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Lab
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Shopping
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats invoices={invoices} customers={customers} />
          </TabsContent>

          <TabsContent value="quick-bill">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Quick Entry Mode
                </CardTitle>
                <CardDescription>Fast billing for simple transactions - just enter price and advance</CardDescription>
              </CardHeader>
              <CardContent>
                <QuickBillForm onSubmit={addInvoice} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed-bill">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Detailed Entry Mode
                </CardTitle>
                <CardDescription>
                  Complete invoicing with multiple products, quantities, and customer details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DetailedBillForm onSubmit={addInvoice} customers={customers} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending-orders">
            <PendingOrders />
          </TabsContent>

          <TabsContent value="history">
            <InvoiceHistory invoices={invoices} setInvoices={setInvoices} />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerManagement customers={customers} invoices={invoices} />
          </TabsContent>

          <TabsContent value="lab">
            <LabManagement />
          </TabsContent>

          <TabsContent value="shopping">
            <ShoppingList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
