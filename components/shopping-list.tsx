"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { ShoppingCart, Plus, Trash2, Package, AlertCircle, CheckCircle2, Printer } from "lucide-react"
import { generateShoppingListPDF } from "@/lib/shopping-list-pdf-generator"

interface ShoppingItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  estimatedPrice: number
  priority: "low" | "medium" | "high"
  notes: string
  purchased: boolean
  dateAdded: string
  datePurchased?: string
}

export default function ShoppingList() {
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([])
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: 1,
    unit: "pieces",
    estimatedPrice: 0,
    priority: "medium" as const,
    notes: "",
  })

  useEffect(() => {
    const saved = localStorage.getItem("shoppingItems")
    if (saved) {
      setShoppingItems(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("shoppingItems", JSON.stringify(shoppingItems))
  }, [shoppingItems])

  const addShoppingItem = () => {
    const item: ShoppingItem = {
      id: Date.now().toString(),
      ...newItem,
      purchased: false,
      dateAdded: new Date().toISOString().split("T")[0],
    }
    setShoppingItems([...shoppingItems, item])
    setNewItem({
      name: "",
      category: "",
      quantity: 1,
      unit: "pieces",
      estimatedPrice: 0,
      priority: "medium",
      notes: "",
    })
    setIsAddingItem(false)
  }

  const togglePurchased = (id: string) => {
    setShoppingItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              purchased: !item.purchased,
              datePurchased: !item.purchased ? new Date().toISOString().split("T")[0] : undefined,
            }
          : item,
      ),
    )
  }

  const deleteItem = (id: string) => {
    setShoppingItems((items) => items.filter((item) => item.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "equipment":
        return "📷"
      case "supplies":
        return "📦"
      case "software":
        return "💻"
      case "maintenance":
        return "🔧"
      case "office":
        return "🏢"
      default:
        return "📋"
    }
  }

  const pendingItems = shoppingItems.filter((item) => !item.purchased)
  const purchasedItems = shoppingItems.filter((item) => item.purchased)
  const totalEstimatedCost = pendingItems.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-emerald-800">Shopping List</h2>
          <p className="text-emerald-600">Manage inventory and supplies for your studio</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => generateShoppingListPDF(shoppingItems)}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={shoppingItems.length === 0}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print List
          </Button>
          <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogDescription>Add a new item to your shopping list</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g., Camera Battery, Photo Paper"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="office">Office Supplies</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      onValueChange={(value: "low" | "medium" | "high") => setNewItem({ ...newItem, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                        <SelectItem value="packs">Packs</SelectItem>
                        <SelectItem value="rolls">Rolls</SelectItem>
                        <SelectItem value="bottles">Bottles</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="meters">Meters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimatedPrice">Price (NPR)</Label>
                    <Input
                      id="estimatedPrice"
                      type="number"
                      min="0"
                      value={newItem.estimatedPrice}
                      onChange={(e) => setNewItem({ ...newItem, estimatedPrice: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    placeholder="Brand preferences, specifications, etc."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addShoppingItem} className="bg-emerald-600 hover:bg-emerald-700">
                  Add Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <ShoppingCart className="h-8 w-8 text-emerald-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Items</p>
              <p className="text-2xl font-bold">{pendingItems.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Purchased Items</p>
              <p className="text-2xl font-bold">{purchasedItems.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Estimated Cost</p>
              <p className="text-2xl font-bold">NPR {totalEstimatedCost.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Pending Items ({pendingItems.length})
          </CardTitle>
          <CardDescription>Items you need to buy</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingItems.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">All items purchased! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Checkbox checked={item.purchased} onCheckedChange={() => togglePurchased(item.id)} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getCategoryIcon(item.category)}</span>
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>
                        {item.quantity} {item.unit}
                      </span>
                      <span>NPR {item.estimatedPrice} each</span>
                      <span className="font-medium">
                        Total: NPR {(item.quantity * item.estimatedPrice).toLocaleString()}
                      </span>
                    </div>
                    {item.notes && <p className="text-sm text-gray-500 mt-1">{item.notes}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchased Items */}
      {purchasedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Purchased Items ({purchasedItems.length})
            </CardTitle>
            <CardDescription>Recently purchased items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchasedItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{getCategoryIcon(item.category)}</span>
                      <span className="font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm text-gray-500">
                        {item.quantity} {item.unit} - NPR {(item.quantity * item.estimatedPrice).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Purchased on {item.datePurchased}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePurchased(item.id)}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    Undo
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
