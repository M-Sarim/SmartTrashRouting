"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, PieChart } from "@/components/ui/chart"
import { Truck, Trash2, BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import type { Bin, Truck as TruckType, Route, OptimizationRecord } from "@/lib/types"

interface DashboardStatsProps {
  bins: Bin[]
  trucks: TruckType[]
  routes: Route[]
  optimizationHistory: OptimizationRecord[]
}

export default function DashboardStats({ bins, trucks, routes, optimizationHistory }: DashboardStatsProps) {
  // Calculate statistics
  const totalBins = bins.length
  const totalTrucks = trucks.length
  const totalRoutes = routes.length

  const highPriorityBins = bins.filter((bin) => bin.fillLevel > 80).length
  const mediumPriorityBins = bins.filter((bin) => bin.fillLevel > 50 && bin.fillLevel <= 80).length
  const lowPriorityBins = bins.filter((bin) => bin.fillLevel <= 50).length

  const totalDistance = routes.reduce((sum, route) => sum + route.totalDistance, 0)
  const totalWaste = routes.reduce((sum, route) => sum + route.totalWasteCollected, 0)

  const averageDistance = totalRoutes > 0 ? totalDistance / totalRoutes : 0
  const averageWaste = totalRoutes > 0 ? totalWaste / totalRoutes : 0

  // Prepare chart data
  const fillLevelData = {
    labels: ["High Priority", "Medium Priority", "Low Priority"],
    datasets: [
      {
        label: "Bin Count",
        data: [highPriorityBins, mediumPriorityBins, lowPriorityBins],
        backgroundColor: ["rgba(239, 68, 68, 0.7)", "rgba(245, 158, 11, 0.7)", "rgba(16, 185, 129, 0.7)"],
        borderColor: ["rgb(239, 68, 68)", "rgb(245, 158, 11)", "rgb(16, 185, 129)"],
        borderWidth: 1,
      },
    ],
  }

  // Prepare optimization history data
  const historyLabels = optimizationHistory.map((record, index) => `Run ${index + 1}`)
  const historyDistances = optimizationHistory.map((record) => record.totalDistance)
  const historyWaste = optimizationHistory.map((record) => record.totalWaste)

  const optimizationData = {
    labels: historyLabels,
    datasets: [
      {
        label: "Total Distance (km)",
        data: historyDistances,
        borderColor: "hsl(var(--primary))",
        backgroundColor: "rgba(20, 184, 166, 0.1)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Total Waste (kg)",
        data: historyWaste,
        borderColor: "hsl(var(--warning))",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  }

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
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <Card className="card-gradient card-hover border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Total Bins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalBins}</p>
              {highPriorityBins > 0 && (
                <Badge variant="destructive" className="mt-2">
                  {highPriorityBins} High Priority
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="card-gradient card-hover border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Total Trucks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalTrucks}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {totalRoutes > 0 ? `${totalRoutes} Active Routes` : "No Active Routes"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="card-gradient card-hover border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Total Distance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalDistance.toFixed(2)} km</p>
              <p className="text-sm text-muted-foreground mt-2">Avg: {averageDistance.toFixed(2)} km per route</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="card-gradient card-hover border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Total Waste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalWaste.toFixed(2)} kg</p>
              <p className="text-sm text-muted-foreground mt-2">Avg: {averageWaste.toFixed(2)} kg per route</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="bins" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="bins" className="text-sm">
              Bin Distribution
            </TabsTrigger>
            <TabsTrigger value="optimization" className="text-sm">
              Optimization History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bins" className="mt-0">
            <Card className="card-gradient border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-primary" />
                  Bin Priority Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 h-[300px]">
                  <PieChart
                    data={fillLevelData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                        },
                        tooltip: {
                          backgroundColor: "hsl(var(--card))",
                          titleColor: "hsl(var(--card-foreground))",
                          bodyColor: "hsl(var(--card-foreground))",
                          borderColor: "hsl(var(--border))",
                          borderWidth: 1,
                          padding: 12,
                          boxPadding: 6,
                          usePointStyle: true,
                          callbacks: {
                            label: (context) => {
                              const value = context.raw as number
                              const total = (context.chart.data.datasets[0].data as number[]).reduce(
                                (sum, val) => sum + (val as number),
                                0,
                              )
                              const percentage = ((value / total) * 100).toFixed(1)
                              return `${context.label}: ${value} bins (${percentage}%)`
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>

                <div className="w-full md:w-1/2 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <span className="font-medium">High Priority</span>
                    </div>
                    <Badge variant="destructive">{highPriorityBins} bins</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-warning" />
                      <span className="font-medium">Medium Priority</span>
                    </div>
                    <Badge variant="outline" className="bg-warning/20 text-warning-foreground border-warning/30">
                      {mediumPriorityBins} bins
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="font-medium">Low Priority</span>
                    </div>
                    <Badge variant="outline" className="bg-success/20 text-success-foreground border-success/30">
                      {lowPriorityBins} bins
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="mt-0">
            <Card className="card-gradient border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Optimization History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {optimizationHistory.length > 0 ? (
                    <LineChart
                      data={optimizationData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: "hsl(var(--border))",
                            },
                          },
                          x: {
                            grid: {
                              display: false,
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          tooltip: {
                            backgroundColor: "hsl(var(--card))",
                            titleColor: "hsl(var(--card-foreground))",
                            bodyColor: "hsl(var(--card-foreground))",
                            borderColor: "hsl(var(--border))",
                            borderWidth: 1,
                          },
                        },
                        interaction: {
                          mode: "index",
                          intersect: false,
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No optimization history available yet.</p>
                    </div>
                  )}
                </div>

                {optimizationHistory.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Latest Run</p>
                      <p className="text-lg font-medium">
                        {new Date(optimizationHistory[optimizationHistory.length - 1].timestamp).toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Best Distance</p>
                      <p className="text-lg font-medium">{Math.min(...historyDistances).toFixed(2)} km</p>
                    </div>

                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Runs</p>
                      <p className="text-lg font-medium">{optimizationHistory.length}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
