"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Truck, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { Truck as TruckType } from "@/lib/types"

interface TruckInputFormProps {
  onAddTruck: (truck: Omit<TruckType, "id">) => void
}

export default function TruckInputForm({ onAddTruck }: TruckInputFormProps) {
  const [capacity, setCapacity] = useState("")
  const [currentLoad, setCurrentLoad] = useState("0")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const cap = Number.parseInt(capacity)
    const load = Number.parseInt(currentLoad)

    if (isNaN(cap) || isNaN(load)) {
      alert("Please enter valid numbers for all fields")
      return
    }

    if (load > cap) {
      alert("Current load cannot exceed capacity")
      return
    }

    onAddTruck({
      capacity: cap,
      currentLoad: load,
    })

    // Reset form
    setCapacity("")
    setCurrentLoad("0")
  }

  // Calculate load percentage for progress bar
  const loadPercentage = capacity && currentLoad ? (Number.parseInt(currentLoad) / Number.parseInt(capacity)) * 100 : 0

  return (
    <Card className="card-gradient card-hover border-primary/20">
      <CardHeader className="bg-muted/50 dark:bg-muted/20 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Add New Truck
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity (kg)</Label>
            <Input
              id="capacity"
              placeholder="e.g. 1000"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="input-focus"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentLoad">Current Load (kg)</Label>
            <Input
              id="currentLoad"
              placeholder="e.g. 0"
              value={currentLoad}
              onChange={(e) => setCurrentLoad(e.target.value)}
              className="input-focus"
              required
            />

            {capacity && currentLoad && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Load: {currentLoad} kg</span>
                  <span>Capacity: {capacity} kg</span>
                </div>
                <Progress
                  value={loadPercentage}
                  className="h-2 bg-primary/20"
                  indicatorClassName={`progress-animate ${
                    loadPercentage > 80 ? "bg-destructive" : loadPercentage > 50 ? "bg-warning" : "bg-primary"
                  }`}
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full button-hover">
            <Plus className="h-4 w-4 mr-2" />
            Add Truck
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
