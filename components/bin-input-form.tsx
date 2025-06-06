"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { MapPin, Plus } from "lucide-react"
import type { Bin } from "@/lib/types"

interface BinInputFormProps {
  onAddBin: (bin: Omit<Bin, "id">) => void
  selectedLocation: [number, number] | null
}

export default function BinInputForm({ onAddBin, selectedLocation }: BinInputFormProps) {
  const [latitude, setLatitude] = useState(selectedLocation ? selectedLocation[0].toString() : "")
  const [longitude, setLongitude] = useState(selectedLocation ? selectedLocation[1].toString() : "")
  const [fillLevel, setFillLevel] = useState(50)
  const [capacity, setCapacity] = useState("100")

  // Update form when selected location changes
  useState(() => {
    if (selectedLocation) {
      setLatitude(selectedLocation[0].toString())
      setLongitude(selectedLocation[1].toString())
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)
    const cap = Number.parseInt(capacity)

    if (isNaN(lat) || isNaN(lng) || isNaN(cap)) {
      alert("Please enter valid numbers for all fields")
      return
    }

    onAddBin({
      location: [lat, lng],
      fillLevel,
      capacity: cap,
    })

    // Reset form
    setLatitude("")
    setLongitude("")
    setFillLevel(50)
    setCapacity("100")
  }

  // Determine fill level color
  const getFillLevelColor = () => {
    if (fillLevel > 80) return "text-destructive"
    if (fillLevel > 50) return "text-warning"
    return "text-success"
  }

  return (
    <Card className="card-gradient card-hover border-primary/20">
      <CardHeader className="bg-muted/50 dark:bg-muted/20 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Add New Bin
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                placeholder="e.g. 51.505"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="input-focus"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                placeholder="e.g. -0.09"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="input-focus"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="fillLevel">Fill Level ({fillLevel}%)</Label>
              <span className={`text-sm font-medium ${getFillLevelColor()}`}>
                {fillLevel > 80 ? "High Priority" : fillLevel > 50 ? "Medium Priority" : "Low Priority"}
              </span>
            </div>
            <Slider
              id="fillLevel"
              min={0}
              max={100}
              step={1}
              value={[fillLevel]}
              onValueChange={(value) => setFillLevel(value[0])}
              className={`${fillLevel > 80 ? "bg-destructive/20" : fillLevel > 50 ? "bg-warning/20" : "bg-success/20"}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity (kg)</Label>
            <Input
              id="capacity"
              placeholder="e.g. 100"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="input-focus"
              required
            />
          </div>

          <Button type="submit" className="w-full button-hover">
            <Plus className="h-4 w-4 mr-2" />
            Add Bin
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
