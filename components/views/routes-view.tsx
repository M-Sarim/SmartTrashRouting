"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { ArrowRight, Truck, Trash2, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import type { Bin, Truck as TruckType, Route } from "@/lib/types"

interface RoutesViewProps {
  routes: Route[]
  bins: Bin[]
  trucks: TruckType[]
}

export function RoutesView({ routes, bins, trucks }: RoutesViewProps) {
  // Function to export routes as CSV
  const exportRoutesCSV = () => {
    if (routes.length === 0) return

    // Create CSV header
    let csv = "Route ID,Truck ID,Bin Sequence,Total Distance (km),Total Waste (kg),Efficiency (kg/km)\n"

    // Add route data
    routes.forEach((route, index) => {
      const routeId = index + 1
      const binSequence = route.binSequence.join("-")
      const efficiency = (route.totalWasteCollected / route.totalDistance).toFixed(2)

      csv += `${routeId},${route.truckId},"${binSequence}",${route.totalDistance.toFixed(2)},${route.totalWasteCollected.toFixed(2)},${efficiency}\n`
    })

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `routes-export-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-center p-8 text-muted-foreground">
          <Truck className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-2">No Routes Generated</h2>
          <p>Add bins and trucks, then calculate routes to see them here.</p>
        </div>
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400">Route Planning</h1>
        <Button variant="outline" onClick={exportRoutesCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Routes
        </Button>
      </div>

      <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-teal-500" />
                Total Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{routes.length}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-teal-500" />
                Total Distance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalDistance.toFixed(2)} km</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-teal-500" />
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
                ? "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 transition-all duration-300 hover:shadow-md"
                : "border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md"
            }
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {highPriorityBins > 0 && <AlertTriangle className="h-5 w-5 text-red-500" />}
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
                  className="h-2 mt-2"
                  indicatorClassName="bg-red-500"
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
                className={`transition-all duration-300 hover:shadow-lg ${highPriorityCount > 0 ? "border-l-4 border-l-red-500" : "border-teal-200 dark:border-teal-900"}`}
              >
                <CardHeader className="bg-muted">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-teal-500" />
                      Truck #{route.truckId} Route
                      {highPriorityCount > 0 && (
                        <Badge variant="destructive" className="ml-2 animate-pulse">
                          {highPriorityCount} High Priority
                        </Badge>
                      )}
                    </CardTitle>
                    <Badge variant="outline" className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100">
                      {route.binSequence.length} bins
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Distance</p>
                      <p className="text-xl font-medium">{route.totalDistance.toFixed(2)} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Waste Collected</p>
                      <p className="text-xl font-medium">{route.totalWasteCollected.toFixed(2)} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Truck Capacity</p>
                      <p className="text-xl font-medium">
                        {truck ? `${route.totalWasteCollected.toFixed(2)}/${truck.capacity} kg` : "N/A"}
                      </p>
                      {truck && (
                        <Progress
                          value={(route.totalWasteCollected / truck.capacity) * 100}
                          className="h-2 mt-2"
                          indicatorClassName="bg-teal-500"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Efficiency</p>
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
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                            : bin && bin.fillLevel > 50
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"

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
                              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${fillLevelClass} transition-colors duration-300`}
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
