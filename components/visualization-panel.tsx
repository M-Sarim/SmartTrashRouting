"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart, LineChart } from "@/components/ui/chart"
import { BarChart3, Download, Share2 } from "lucide-react"
import type { Route, OptimizationRecord } from "@/lib/types"

interface VisualizationPanelProps {
  routes: Route[]
  optimizationHistory: OptimizationRecord[]
}

export default function VisualizationPanel({ routes, optimizationHistory }: VisualizationPanelProps) {
  const [activeTab, setActiveTab] = useState("efficiency")

  // Prepare efficiency data
  const efficiencyData = {
    labels: routes.map((route) => `Truck ${route.truckId}`),
    datasets: [
      {
        label: "Efficiency (kg/km)",
        data: routes.map((route) => route.totalWasteCollected / route.totalDistance),
        backgroundColor: "rgba(20, 184, 166, 0.7)",
        borderColor: "rgb(20, 184, 166)",
        borderWidth: 1,
      },
    ],
  }

  // Prepare distance data
  const distanceData = {
    labels: routes.map((route) => `Truck ${route.truckId}`),
    datasets: [
      {
        label: "Distance (km)",
        data: routes.map((route) => route.totalDistance),
        backgroundColor: "rgba(20, 184, 166, 0.7)",
        borderColor: "rgb(20, 184, 166)",
        borderWidth: 1,
      },
    ],
  }

  // Prepare waste data
  const wasteData = {
    labels: routes.map((route) => `Truck ${route.truckId}`),
    datasets: [
      {
        label: "Waste Collected (kg)",
        data: routes.map((route) => route.totalWasteCollected),
        backgroundColor: "rgba(20, 184, 166, 0.7)",
        borderColor: "rgb(20, 184, 166)",
        borderWidth: 1,
      },
    ],
  }

  // Prepare optimization history data
  const historyLabels = optimizationHistory.map((record, index) => `Run ${index + 1}`)
  const historyData = {
    labels: historyLabels,
    datasets: [
      {
        label: "Total Distance (km)",
        data: optimizationHistory.map((record) => record.totalDistance),
        borderColor: "rgb(20, 184, 166)",
        backgroundColor: "rgba(20, 184, 166, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  }

  // Export chart as image
  const exportChart = () => {
    const canvas = document.querySelector(`#${activeTab}-chart canvas`) as HTMLCanvasElement
    if (canvas) {
      const link = document.createElement("a")
      link.download = `${activeTab}-chart.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
  }

  return (
    <Card className="card-gradient card-hover border-primary/20">
      <CardHeader className="bg-muted/50 dark:bg-muted/20 rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Route Visualization
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 button-hover"
              onClick={exportChart}
              disabled={routes.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 button-hover"
              disabled={routes.length === 0}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {routes.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <p>No routes generated yet. Calculate routes to view visualizations.</p>
          </div>
        ) : (
          <Tabs defaultValue="efficiency" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="efficiency" className="text-sm">
                Efficiency
              </TabsTrigger>
              <TabsTrigger value="distance" className="text-sm">
                Distance
              </TabsTrigger>
              <TabsTrigger value="waste" className="text-sm">
                Waste
              </TabsTrigger>
              <TabsTrigger value="history" className="text-sm">
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="efficiency" id="efficiency-chart">
              <div className="h-[300px]">
                <BarChart
                  data={efficiencyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "kg/km",
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
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="distance" id="distance-chart">
              <div className="h-[300px]">
                <BarChart
                  data={distanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "km",
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
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="waste" id="waste-chart">
              <div className="h-[300px]">
                <BarChart
                  data={wasteData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "kg",
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
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="history" id="history-chart">
              <div className="h-[300px]">
                {optimizationHistory.length > 0 ? (
                  <LineChart
                    data={historyData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "km",
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
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No optimization history available yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
