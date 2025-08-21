"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Plus, Package, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react"

interface OrderProduct {
  id: string
  name: string
  quantity: number
  rate: number
  total: number
  notes?: string
}

interface PendingOrder {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  products: OrderProduct[]
  totalAmount: number
  advance: number
  remaining: number
  status: "pending" | "in-progress" | "ready" | "completed" | "cancelled"
  orderDate: string
  expectedDate?: string
  notes?: string
}

export default function PendingOrders() {
  const [orders, setOrders] = useState<PendingOrder[]>([])
  const [isAddingOrder, setIsAddingOrder] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PendingOrder | null>(null)
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerPhone: "",
    expectedDate: "",
    notes: "",
    advance: 0,
  })
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([])
  const [newProduct, setNewProduct] = useState({
    name: "",
    quantity: 1,
    rate: 0,
    notes: "",
  })

  // Load orders from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem("studio-pending-orders")
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
  }, [])

  // Save orders to localStorage
  useEffect(() => {
    localStorage.setItem("studio-pending-orders", JSON.stringify(orders))
  }, [orders])

  const addProductToOrder = () => {
    if (!newProduct.name || newProduct.rate <= 0) return

    const product: OrderProduct = {
      id: `prod-${Date.now()}`,
      name: newProduct.name,
      quantity: newProduct.quantity,
      rate: newProduct.rate,
      total: newProduct.quantity * newProduct.rate,
      notes: newProduct.notes || undefined,
    }

    setOrderProducts([...orderProducts, product])
    setNewProduct({ name: "", quantity: 1, rate: 0, notes: "" })
  }

  const removeProduct = (productId: string) => {
    setOrderProducts(orderProducts.filter((p) => p.id !== productId))
  }

  const createOrder = () => {
    if (!newOrder.customerName || !newOrder.customerPhone || orderProducts.length === 0) return

    const totalAmount = orderProducts.reduce((sum, p) => sum + p.total, 0)
    const order: PendingOrder = {
      id: `order-${Date.now()}`,
      orderNumber: `ORD-${String(orders.length + 1).padStart(4, "0")}`,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      products: orderProducts,
      totalAmount,
      advance: newOrder.advance,
      remaining: totalAmount - newOrder.advance,
      status: "pending",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDate: newOrder.expectedDate || undefined,
      notes: newOrder.notes || undefined,
    }

    setOrders([order, ...orders])
    resetForm()
    setIsAddingOrder(false)
  }

  const updateOrderStatus = (orderId: string, status: PendingOrder["status"]) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status } : order)))
  }

  const deleteOrder = (orderId: string) => {
    setOrders(orders.filter((order) => order.id !== orderId))
  }

  const resetForm = () => {
    setNewOrder({ customerName: "", customerPhone: "", expectedDate: "", notes: "", advance: 0 })
    setOrderProducts([])
    setNewProduct({ name: "", quantity: 1, rate: 0, notes: "" })
    setEditingOrder(null)
  }

  const getStatusColor = (status: PendingOrder["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "ready":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: PendingOrder["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "in-progress":
        return <Package className="w-4 h-4" />
      case "ready":
        return <CheckCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const totalOrderValue = orderProducts.reduce((sum, p) => sum + p.total, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif">Pending Orders</h2>
          <p className="text-muted-foreground">Manage customer orders and track progress</p>
        </div>
        <Dialog open={isAddingOrder} onOpenChange={setIsAddingOrder}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddingOrder(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>Add customer details and products for the new order</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={newOrder.customerPhone}
                    onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedDate">Expected Completion</Label>
                  <Input
                    id="expectedDate"
                    type="date"
                    value={newOrder.expectedDate}
                    onChange={(e) => setNewOrder({ ...newOrder, expectedDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="advance">Advance Payment (NPR)</Label>
                  <Input
                    id="advance"
                    type="number"
                    value={newOrder.advance}
                    onChange={(e) => setNewOrder({ ...newOrder, advance: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="orderNotes">Order Notes</Label>
                <Textarea
                  id="orderNotes"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  placeholder="Any special instructions or notes"
                />
              </div>

              <Separator />

              {/* Add Products */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Add Products</h3>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label htmlFor="productName">Product/Service</Label>
                    <Input
                      id="productName"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="e.g., Photo Prints"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate">Rate (NPR)</Label>
                    <Input
                      id="rate"
                      type="number"
                      value={newProduct.rate}
                      onChange={(e) => setNewProduct({ ...newProduct, rate: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addProductToOrder} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="productNotes">Product Notes</Label>
                  <Input
                    id="productNotes"
                    value={newProduct.notes}
                    onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                    placeholder="Size, color, special requirements"
                  />
                </div>
              </div>

              {/* Products List */}
              {orderProducts.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {orderProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {product.quantity} × NPR {product.rate} = NPR {product.total}
                            </span>
                          </div>
                          {product.notes && <p className="text-sm text-muted-foreground mt-1">{product.notes}</p>}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeProduct(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total: NPR {totalOrderValue.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">
                        Remaining: NPR {(totalOrderValue - newOrder.advance).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={createOrder}
                  disabled={!newOrder.customerName || !newOrder.customerPhone || orderProducts.length === 0}
                >
                  Create Order
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsAddingOrder(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pending orders</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first order to start tracking customer requests
              </p>
              <Button onClick={() => setIsAddingOrder(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {order.orderNumber}
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        {order.status.replace("-", " ").toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {order.customerName} • {order.customerPhone}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order.id, value as PendingOrder["status"])}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" onClick={() => deleteOrder(order.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Order Date:</span>
                      <span className="ml-2">{order.orderDate}</span>
                    </div>
                    {order.expectedDate && (
                      <div>
                        <span className="text-muted-foreground">Expected:</span>
                        <span className="ml-2">{order.expectedDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Products */}
                  <div>
                    <h4 className="font-medium mb-2">Items ({order.products.length})</h4>
                    <div className="space-y-2">
                      {order.products.map((product) => (
                        <div key={product.id} className="flex justify-between items-start p-2 bg-muted/50 rounded">
                          <div>
                            <span className="font-medium">{product.name}</span>
                            {product.notes && <p className="text-sm text-muted-foreground">{product.notes}</p>}
                          </div>
                          <span className="text-sm">
                            {product.quantity} × NPR {product.rate} = NPR {product.total.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-semibold">NPR {order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Advance Paid:</span>
                      <span>NPR {order.advance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className={order.remaining > 0 ? "text-orange-600" : "text-green-600"}>
                        NPR {order.remaining.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="border-t pt-4">
                      <span className="text-sm text-muted-foreground">Notes:</span>
                      <p className="text-sm mt-1">{order.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
