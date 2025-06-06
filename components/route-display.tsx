"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Bin, Truck, Route } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TruckIcon, Trash2, AlertTriangle, BarChart3 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

interface RouteDisplayProps {
  routes: Route[]
  bins: Bin[]
  trucks: Truck[]
}

export default function RouteDisplay({ routes, bins, trucks }: RouteDisplayProps) {
  if (routes.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No routes generated yet. Add bins and trucks, then calculate routes.</p>
      </div>
    )
  }

  // Calculate total distance and waste collected for all routes
  const totalDistance = routes.reduce((sum, route) => sum + route.totalDistance, 0)
  const totalWasteCollected = routes.reduce((sum, route) => sum + route.totalWasteCollected, 0)

  // Count high priority bins
  const highPriorityBins = bins.filter((bin) => bin.fillLevel > 80).length
  const highPriorityBinsInRoutes = routes.reduce((count, route) => {
    return (
      count +
      route.binSequence.filter((binId) => {
        const bin = bins.find((b) => b.id === binId)
        return bin && bin.fillLevel > 80
      }).length
    )
  }, 0)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <Card className="card-gradient card-hover border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TruckIcon className="h-5 w-5 text-primary" />
                Total Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{routes.length}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="card-gradient card-hover border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                Total Distance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalDistance.toFixed(2)} km</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="card-gradient card-hover border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Total Waste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalWasteCollected.toFixed(2)} kg</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card
            className={
              highPriorityBins > 0
                ? "bg-gradient-to-br from-white to-destructive/10 dark:from-gray-900 dark:to-destructive/20 border-destructive/30 card-hover"
                : "card-gradient card-hover border-primary/20"
            }
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {highPriorityBins > 0 && <AlertTriangle className="h-5 w-5 text-destructive" />}
                High Priority Bins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {highPriorityBinsInRoutes}/{highPriorityBins}
              </p>
              {highPriorityBins > 0 && (
                <Progress
                  value={(highPriorityBinsInRoutes / highPriorityBins) * 100}
                  className="h-2 mt-2 bg-destructive/20"
                  indicatorClassName="bg-destructive progress-animate"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="space-y-6">
        {routes.map((route, index) => {
          const truck = trucks.find((t) => t.id === route.truckId)
          const highPriorityCount = route.binSequence.filter((binId) => {
            const bin = bins.find((b) => b.id === binId)
            return bin && bin.fillLevel > 80
          }).length

          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                className={`card-hover transition-all duration-300 ${
                  highPriorityCount > 0
                    ? "border-l-4 border-l-destructive bg-gradient-to-br from-white to-destructive/5 dark:from-gray-900 dark:to-destructive/10"
                    : "border-primary/20 card-gradient"
                }`}
              >
                <CardHeader className="bg-muted/50 dark:bg-muted/20 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <TruckIcon className="h-5 w-5 text-primary" />
                      Truck #{route.truckId} Route
                      {highPriorityCount > 0 && (
                        <Badge variant="destructive" className="ml-2 animate-pulse">
                          {highPriorityCount} High Priority
                        </Badge>
                      )}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary-foreground dark:bg-primary/20 dark:text-primary-foreground border-primary/30"
                    >
                      {route.binSequence.length} bins
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-secondary/50 dark:bg-secondary/30">
                      <p className="text-sm text-muted-foreground">Distance</p>
                      <p className="text-xl font-medium">{route.totalDistance.toFixed(2)} km</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 dark:bg-secondary/30">
                      <p className="text-sm text-muted-foreground">Waste Collected</p>
                      <p className="text-xl font-medium">{route.totalWasteCollected.toFixed(2)} kg</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 dark:bg-secondary/30">
                      <p className="text-sm text-muted-foreground">Truck Capacity</p>
                      <p className="text-xl font-medium">
                        {truck ? `${route.totalWasteCollected.toFixed(2)}/${truck.capacity} kg` : "N/A"}
                      </p>
                      {truck && (
                        <Progress
                          value={(route.totalWasteCollected / truck.capacity) * 100}
                          className="h-2 mt-2 bg-primary/20"
                          indicatorClassName="bg-primary progress-animate"
                        />
                      )}
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 dark:bg-secondary/30">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" /> Efficiency
                      </p>
                      <p className="text-xl font-medium">
                        {(route.totalWasteCollected / route.totalDistance).toFixed(2)} kg/km
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Route Sequence:</h4>
                    <div className="flex flex-wrap items-center gap-1">
                      {route.binSequence.map((binId, idx) => {
                        const bin = bins.find((b) => b.id === binId)
                        const fillLevelClass =
                          bin && bin.fillLevel > 80
                            ? "bg-destructive/20 text-destructive-foreground dark:bg-destructive/30"
                            : bin && bin.fillLevel > 50
                              ? "bg-warning/20 text-warning-foreground dark:bg-warning/30"
                              : "bg-success/20 text-success-foreground dark:bg-success/30"

                        return (
                          <motion.div
                            key={idx}
                            className="flex items-center"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            {idx > 0 && <ArrowRight className="h-4 w-4 mx-1 text-muted-foreground" />}
                            <div
                              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${fillLevelClass} transition-colors duration-300 shadow-sm`}
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Bin #{binId}</span>
                              {bin && <span>({bin.fillLevel}%)</span>}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
