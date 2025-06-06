"use client"

import { useEffect } from "react"

import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import BinInputForm from "@/components/bin-input-form"
import TruckInputForm from "@/components/truck-input-form"
import SimulationPanel from "@/components/simulation-panel"
import {
  Trash2,
  Truck,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Clock,
  MapPin,
  Download,
  RotateCw,
} from "lucide-react"
import { motion } from "framer-motion"
import type { Bin, Truck as TruckType, Route, OptimizationRecord } from "@/lib/types"

interface DashboardViewProps {
  bins: Bin[]
  trucks: TruckType[]
  routes: Route[]
  routeUpdateCount: number
  isSimulationActive: boolean
  simulationSpeed: number
  optimizationHistory: OptimizationRecord[]
  predictedFillLevels: { [key: number]: number }
  selectedLocation: [number, number] | null
  onAddBin: (bin: Bin) => void
  onAddTruck: (truck: TruckType) => void
  onCalculateRoutes: () => void
  onToggleSimulation: () => void
  onUpdateSimulationSpeed: (speed: number) => void
  onLoadDemoData: () => void
  onResetData: () => void
  onExportData: () => void
}

export function DashboardView({
  bins,
  trucks,
  routes,
  routeUpdateCount,
  isSimulationActive,
  simulationSpeed,
  optimizationHistory,
  predictedFillLevels,
  selectedLocation,
  onAddBin,
  onAddTruck,
  onCalculateRoutes,
  onToggleSimulation,
  onUpdateSimulationSpeed,
  onLoadDemoData,
  onResetData,
  onExportData,
}: DashboardViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Calculate stats
  const totalDistance = routes.reduce((sum, route) => sum + route.totalDistance, 0)
  const totalWaste = routes.reduce((sum, route) => sum + route.totalWasteCollected, 0)
  const highPriorityBins = bins.filter((bin) => bin.fillLevel > 80).length
  const mediumPriorityBins = bins.filter((bin) => bin.fillLevel > 50 && bin.fillLevel <= 80).length
  const lowPriorityBins = bins.filter((bin) => bin.fillLevel <= 50).length

  // Calculate predicted high priority bins
  const predictedHighPriorityCount = Object.values(predictedFillLevels).filter((level) => level > 80).length

  // Calculate efficiency if we have routes
  const efficiency = totalDistance > 0 ? totalWaste / totalDistance : 0

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
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <div className="flex justify-between items-center mb-6">
        <motion.h1
          className="text-3xl font-bold text-teal-600 dark:text-teal-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          System Dashboard
        </motion.h1>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{currentTime.toLocaleTimeString()}</span>
          {isSimulationActive && (
            <Badge
              variant="outline"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 animate-pulse"
            >
              Simulation Active
            </Badge>
          )}
        </div>
      </div>

      <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-teal-500" />
                Total Bins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bins.length}</div>
              <div className="mt-2 flex gap-2">
                {highPriorityBins > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {highPriorityBins} High
                  </Badge>
                )}
                {mediumPriorityBins > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs"
                  >
                    {mediumPriorityBins} Medium
                  </Badge>
                )}
                {lowPriorityBins > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs"
                  >
                    {lowPriorityBins} Low
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4 text-teal-500" />
                Trucks & Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trucks.length} / {routes.length}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {routes.length > 0
                  ? `${(routes.length / trucks.length).toFixed(1)} routes per truck`
                  : "No routes generated"}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-teal-500" />
                Collection Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWaste > 0 ? `${totalWaste.toFixed(1)} kg` : "N/A"}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {totalDistance > 0 ? `${totalDistance.toFixed(1)} km total distance` : "No routes"}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-teal-500" />
                Route Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routeUpdateCount}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {optimizationHistory.length > 0
                  ? `Last update: ${new Date(optimizationHistory[optimizationHistory.length - 1].timestamp).toLocaleTimeString()}`
                  : "No updates yet"}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <motion.div className="md:col-span-2" variants={itemVariants}>
          <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-md font-medium flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">High Priority Bins</span>
                    <span className="text-sm font-medium">
                      {highPriorityBins} of {bins.length}
                    </span>
                  </div>
                  <Progress
                    value={bins.length > 0 ? (highPriorityBins / bins.length) * 100 : 0}
                    className="h-2"
                    indicatorClassName="bg-red-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Truck Utilization</span>
                    <span className="text-sm font-medium">
                      {routes.length > 0
                        ? `${((totalWaste / trucks.reduce((sum, t) => sum + t.capacity, 0)) * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                  <Progress
                    value={
                      trucks.reduce((sum, t) => sum + t.capacity, 0) > 0
                        ? (totalWaste / trucks.reduce((sum, t) => sum + t.capacity, 0)) * 100
                        : 0
                    }
                    className="h-2"
                    indicatorClassName="bg-teal-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">System Efficiency</span>
                    <span className="text-sm font-medium">
                      {efficiency > 0 ? `${efficiency.toFixed(2)} kg/km` : "N/A"}
                    </span>
                  </div>
                  <Progress
                    value={efficiency > 0 ? Math.min((efficiency / 2) * 100, 100) : 0}
                    className="h-2"
                    indicatorClassName="bg-green-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <Button
                  onClick={onCalculateRoutes}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 transition-colors"
                >
                  <RefreshCw className="h-5 w-5" />
                  Calculate Optimal Routes
                </Button>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={onLoadDemoData}
                    variant="outline"
                    className="transition-all duration-300 hover:bg-teal-100 dark:hover:bg-teal-900"
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    Load Demo
                  </Button>
                  <Button
                    onClick={onExportData}
                    variant="outline"
                    className="transition-all duration-300 hover:bg-teal-100 dark:hover:bg-teal-900"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button
                    onClick={onResetData}
                    variant="outline"
                    className="transition-all duration-300 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="bin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bin" className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900">
                <Trash2 className="h-4 w-4 mr-2" />
                Add Bin
              </TabsTrigger>
              <TabsTrigger value="truck" className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900">
                <Truck className="h-4 w-4 mr-2" />
                Add Truck
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bin">
              <Card>
                <CardHeader>
                  <CardTitle className="text-md font-medium flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-teal-500" />
                    Add New Bin
                  </CardTitle>
                  <CardDescription>
                    {selectedLocation ? "Location selected from map" : "Add a new bin to the system"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedLocation && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className="bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800 mb-4">
                        <AlertDescription className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-teal-500" />
                          Location selected from map
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                  <BinInputForm onAddBin={onAddBin} selectedLocation={selectedLocation} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="truck">
              <Card>
                <CardHeader>
                  <CardTitle className="text-md font-medium flex items-center gap-2">
                    <Truck className="h-5 w-5 text-teal-500" />
                    Add New Truck
                  </CardTitle>
                  <CardDescription>Add a new truck to the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <TruckInputForm onAddTruck={onAddTruck} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-4">
            <SimulationPanel
              isActive={isSimulationActive}
              speed={simulationSpeed}
              onToggle={onToggleSimulation}
              onSpeedChange={onUpdateSimulationSpeed}
            />
          </div>
        </motion.div>
      </div>

      <motion.div className="mt-6" variants={itemVariants}>
        <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-md font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-500" />
              Predictions & Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Predicted High Priority Bins</p>
                    <p className="text-xs text-muted-foreground">Within next 24 hours</p>
                  </div>
                  <Badge
                    variant={predictedHighPriorityCount > highPriorityBins ? "destructive" : "outline"}
                    className={
                      predictedHighPriorityCount > highPriorityBins
                        ? "animate-pulse"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    }
                  >
                    {predictedHighPriorityCount}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Optimization Runs</p>
                    <p className="text-xs text-muted-foreground">Total route calculations</p>
                  </div>
                  <Badge variant="outline" className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100">
                    {optimizationHistory.length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Average Route Length</p>
                    <p className="text-xs text-muted-foreground">Per truck</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {routes.length > 0
                      ? `${(routes.reduce((sum, r) => sum + r.totalDistance, 0) / routes.length).toFixed(1)} km`
                      : "N/A"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">System Status</p>
                  </div>
                  <Badge
                    variant={highPriorityBins > 0 ? "destructive" : "outline"}
                    className={
                      highPriorityBins === 0 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : ""
                    }
                  >
                    {highPriorityBins === 0 ? "Optimal" : "Needs Attention"}
                  </Badge>
                </div>

                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-md border border-teal-200 dark:border-teal-800">
                  <h3 className="text-sm font-medium mb-2 text-teal-700 dark:text-teal-300">Algorithm Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    The system uses Kruskal's algorithm for MST, Kadane's adaptation for clustering, Dynamic Programming
                    for sequencing, and B+ Tree for data storage. High priority bins are prioritized in route planning.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
