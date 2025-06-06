"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Play, Pause, Clock, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface SimulationPanelProps {
  isActive: boolean
  speed: number
  routeUpdateCount: number
  onToggle: () => void
  onSpeedChange: (speed: number) => void
  onReset: () => void
}

export default function SimulationPanel({
  isActive,
  speed,
  routeUpdateCount,
  onToggle,
  onSpeedChange,
  onReset,
}: SimulationPanelProps) {
  return (
    <Card className="card-gradient card-hover border-primary/20">
      <CardHeader className="bg-muted/50 dark:bg-muted/20 rounded-t-lg pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Live Simulation
          </CardTitle>
          {routeUpdateCount > 0 && (
            <Badge variant="outline" className="bg-primary/10 text-primary-foreground border-primary/30">
              {routeUpdateCount} Updates
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              onClick={onToggle}
              variant={isActive ? "destructive" : "default"}
              className="flex items-center gap-2 button-hover"
            >
              {isActive ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Start</span>
                </>
              )}
            </Button>

            <Button
              onClick={onReset}
              variant="outline"
              className="flex items-center gap-2 button-hover"
              disabled={isActive}
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          </div>

          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="speed" className="text-xs">
                Update Frequency
              </Label>
              <span className="text-xs font-medium">{speed}ms</span>
            </div>
            <Slider
              id="speed"
              min={100}
              max={2000}
              step={100}
              value={[speed]}
              onValueChange={(value) => onSpeedChange(value[0])}
              disabled={!isActive}
              className="bg-primary/20"
            />
          </div>
        </div>

        {isActive && (
          <motion.div
            className="mt-4 p-3 bg-primary/10 rounded-lg text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Simulation is running. Bin fill levels are being updated randomly.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
