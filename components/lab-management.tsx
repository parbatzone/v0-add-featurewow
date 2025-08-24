"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Send, Package, Calendar, User, Camera, Trash2 } from "lucide-react"

interface LabOrder {
  id: string
  customerName: string
  customerPhone: string
  orderDate: string
  dueDate: string
  photoType: string
  quantity: number
  notes: string
  status: "pending" | "sent" | "received" | "delivered"
  labName: string
  totalAmount: number
}

export default function LabManagement() {
  const [labOrders, setLabOrders] = useState<LabOrder[]>([])
  const [isAddingOrder, setIsAddingOrder] = useState(false)
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerPhone: "",
    dueDate: "",
    photoType: "",
    quantity: 1,
    notes: "",
    labName: "",
    totalAmount: 0,
  })

  useEffect(() => {
    const saved = localStorage.getItem("labOrders")
    if (saved) {
      setLabOrders(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("labOrders", JSON.stringify(labOrders))
  }, [labOrders])

  const addLabOrder = () => {
    const order: LabOrder = {
      id: Date.now().toString(),
      ...newOrder,
      orderDate: new Date().toISOString().split("T")[0],
      status: "pending",
    }
    setLabOrders([order, ...labOrders])
    setNewOrder({
      customerName: "",
      customerPhone: "",
      dueDate: "",
      photoType: "",
      quantity: 1,
      notes: "",
      labName: "",
      totalAmount: 0,
    })
    setIsAddingOrder(false)
  }

  const updateOrderStatus = (id: string, status: LabOrder["status"]) => {
    setLabOrders((orders) => orders.map((order) => (order.id === id ? { ...order, status } : order)))
  }

  const deleteOrder = (id: string) => {
    setLabOrders((orders) => orders.filter((order) => order.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "received":
        return "bg-green-100 text-green-800"
      case "delivered":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filterOrdersByStatus = (status: string) => {
    if (status === "all") return labOrders
    return labOrders.filter((order) => order.status === status)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-emerald-800">Lab Management</h2>
          <p className="text-emerald-600">Track photos sent to lab and manage orders</p>
        </div>
        <Dialog open={isAddingOrder} onOpenChange={setIsAddingOrder}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Send className="w-4 h-4 mr-2" />
              New Lab Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Lab Order</DialogTitle>
              <DialogDescription>Create a new order to send photos to lab</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={newOrder.customerPhone}
                    onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="photoType">Photo Type</Label>
                  <Select onValueChange={(value) => setNewOrder({ ...newOrder, photoType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport Photos</SelectItem>
                      <SelectItem value="portrait">Portrait Prints</SelectItem>
                      <SelectItem value="wedding">Wedding Photos</SelectItem>
                      <SelectItem value="event">Event Photos</SelectItem>
                      <SelectItem value="family">Family Photos</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="labName">Lab Name</Label>
                  <Input
                    id="labName"
                    value={newOrder.labName}
                    onChange={(e) => setNewOrder({ ...newOrder, labName: e.target.value })}
                    placeholder="e.g., Digital Lab, Photo Express"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newOrder.dueDate}
                    onChange={(e) => setNewOrder({ ...newOrder, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="totalAmount">Total Amount (NPR)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  min="0"
                  value={newOrder.totalAmount}
                  onChange={(e) => setNewOrder({ ...newOrder, totalAmount: Number.parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  placeholder="Special instructions, sizes, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addLabOrder} className="bg-emerald-600 hover:bg-emerald-700">
                Add Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="sent">Sent to Lab</TabsTrigger>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>

        {["all", "pending", "sent", "received", "delivered"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filterOrdersByStatus(status).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Camera className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No orders found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filterOrdersByStatus(status).map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{order.customerName}</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {order.customerPhone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Due: {order.dueDate}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteOrder(order.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Photo Type</p>
                          <p className="text-sm">{order.photoType}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Quantity</p>
                          <p className="text-sm">{order.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Lab</p>
                          <p className="text-sm">{order.labName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Amount</p>
                          <p className="text-sm font-semibold">NPR {order.totalAmount}</p>
                        </div>
                      </div>
                      {order.notes && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600">Notes</p>
                          <p className="text-sm text-gray-700">{order.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "sent")}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Mark as Sent
                          </Button>
                        )}
                        {order.status === "sent" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "received")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Package className="w-4 h-4 mr-1" />
                            Mark as Received
                          </Button>
                        )}
                        {order.status === "received" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "delivered")}
                            className="bg-gray-600 hover:bg-gray-700"
                          >
                            Mark as Delivered
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
