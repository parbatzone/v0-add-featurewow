"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, FileText, TrendingUp, Users, Plus, Search, Send, ShoppingCart, Package, Zap } from "lucide-react"
import { QuickBillForm } from "@/components/quick-bill-form"
import { DetailedBillForm } from "@/components/detailed-bill-form"
import { InvoiceHistory } from "@/components/invoice-history"
import { DashboardStats } from "@/components/dashboard-stats"
import { CustomerManagement } from "@/components/customer-management"
import LabManagement from "@/components/lab-management"
import ShoppingList from "@/components/shopping-list"
import PendingOrders from "@/components/pending-orders"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { ElectronicsQuickBillForm } from "@/components/electronics-quick-bill-form"
import { ElectronicsDetailedBillForm } from "@/components/electronics-detailed-bill-form"
import { ElectronicsInvoiceHistory } from "@/components/electronics-invoice-history"
import { ElectronicsDashboardStats } from "@/components/electronics-dashboard-stats"
import { ElectronicsCustomerManagement } from "@/components/electronics-customer-management"
import { ElectronicsAnalyticsDashboard } from "@/components/electronics-analytics-dashboard"

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
  const [selectedShop, setSelectedShop] = useState<"photo" | "electronics">("photo")

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

  const [electronicsInvoices, setElectronicsInvoices] = useState<Invoice[]>([])
  const [electronicsCustomers, setElectronicsCustomers] = useState<
    Array<{
      phone: string
      name: string
      totalBills: number
      totalAmount: number
      lastVisit: string
    }>
  >([])

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

  useEffect(() => {
    const savedInvoices = localStorage.getItem("electronics-invoices")
    const savedCustomers = localStorage.getItem("electronics-customers")

    if (savedInvoices) {
      setElectronicsInvoices(JSON.parse(savedInvoices))
    }
    if (savedCustomers) {
      setElectronicsCustomers(JSON.parse(savedCustomers))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("studio-invoices", JSON.stringify(invoices))
  }, [invoices])

  useEffect(() => {
    localStorage.setItem("studio-customers", JSON.stringify(customers))
  }, [customers])

  useEffect(() => {
    localStorage.setItem("electronics-invoices", JSON.stringify(electronicsInvoices))
  }, [electronicsInvoices])

  useEffect(() => {
    localStorage.setItem("electronics-customers", JSON.stringify(electronicsCustomers))
  }, [electronicsCustomers])

  const addInvoice = (invoice: Omit<Invoice, "id" | "date">) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: `INV-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    }

    setInvoices((prev) => [newInvoice, ...prev])

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

  const addElectronicsInvoice = (invoice: Omit<Invoice, "id" | "date">) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: `ELEC-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    }

    setElectronicsInvoices((prev) => [newInvoice, ...prev])

    if (invoice.customerPhone) {
      setElectronicsCustomers((prev) => {
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

  const electronicsTodaysSales = electronicsInvoices
    .filter((inv) => inv.date === new Date().toISOString().split("T")[0])
    .reduce((sum, inv) => sum + inv.subtotal, 0)

  const electronicsPendingAmount = electronicsInvoices
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.remaining, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Shop Selector */}
              <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg">
                <button
                  onClick={() => {
                    setSelectedShop("photo")
                    setActiveTab("dashboard")
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    selectedShop === "photo" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span className="font-medium">Photo Studio</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedShop("electronics")
                    setActiveTab("dashboard")
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    selectedShop === "electronics" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">Electronics</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                  {selectedShop === "photo" ? (
                    <Camera className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <Zap className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {selectedShop === "photo" ? "Pixel Production" : "Pratima Electronics"}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {selectedShop === "photo" ? "Professional Billing Software" : "Electronics Billing System"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-medium">
                Today: NPR {(selectedShop === "photo" ? todaysSales : electronicsTodaysSales).toLocaleString()}
              </Badge>
              {(selectedShop === "photo" ? pendingAmount : electronicsPendingAmount) > 0 && (
                <Badge variant="destructive">
                  Pending: NPR {(selectedShop === "photo" ? pendingAmount : electronicsPendingAmount).toLocaleString()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {selectedShop === "photo" ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8 lg:w-fit lg:grid-cols-8 bg-muted p-1">
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
              <AnalyticsDashboard invoices={invoices} />
            </TabsContent>

            <TabsContent value="quick-bill">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
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
                    <FileText className="w-5 h-5 text-primary" />
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
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5 bg-muted p-1">
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
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Customers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <ElectronicsDashboardStats invoices={electronicsInvoices} customers={electronicsCustomers} />
              <ElectronicsAnalyticsDashboard invoices={electronicsInvoices} />
            </TabsContent>

            <TabsContent value="quick-bill">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Quick Entry Mode
                  </CardTitle>
                  <CardDescription>Fast billing for simple transactions - just enter price and advance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ElectronicsQuickBillForm onSubmit={addElectronicsInvoice} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detailed-bill">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Detailed Entry Mode
                  </CardTitle>
                  <CardDescription>
                    Complete invoicing with multiple products, quantities, and customer details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ElectronicsDetailedBillForm onSubmit={addElectronicsInvoice} customers={electronicsCustomers} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <ElectronicsInvoiceHistory invoices={electronicsInvoices} setInvoices={setElectronicsInvoices} />
            </TabsContent>

            <TabsContent value="customers">
              <ElectronicsCustomerManagement customers={electronicsCustomers} invoices={electronicsInvoices} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
