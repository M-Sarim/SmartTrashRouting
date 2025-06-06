"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useTheme } from "next-themes"
import type { Bin, Route, Edge } from "@/lib/types"
import { motion } from "framer-motion"

interface VisualizationViewProps {
  bins: Bin[]
  routes: Route[]
  mst: Edge[]
}

export function VisualizationView({ bins, routes, mst }: VisualizationViewProps) {
  const graphCanvasRef = useRef<HTMLCanvasElement>(null)
  const fillLevelCanvasRef = useRef<HTMLCanvasElement>(null)
  const routeDistributionCanvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Draw the graph visualization
  useEffect(() => {
    if (!graphCanvasRef.current || bins.length === 0 || !mounted) return

    const canvas = graphCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate min/max coordinates to scale the graph
    const minLat = Math.min(...bins.map((bin) => bin.location[0]))
    const maxLat = Math.max(...bins.map((bin) => bin.location[0]))
    const minLng = Math.min(...bins.map((bin) => bin.location[1]))
    const maxLng = Math.max(...bins.map((bin) => bin.location[1]))

    // Add some padding
    const padding = 50
    const scaleX = (canvas.width - 2 * padding) / (maxLng - minLng || 1)
    const scaleY = (canvas.height - 2 * padding) / (maxLat - minLat || 1)

    // Function to convert coordinates to canvas position
    const toCanvasCoords = (lat: number, lng: number) => {
      const x = padding + (lng - minLng) * scaleX
      const y = canvas.height - (padding + (lat - minLat) * scaleY) // Invert Y axis
      return { x, y }
    }

    // Set dark mode colors based on theme
    const isDarkMode = theme === "dark"
    const textColor = isDarkMode ? "#e5e5e5" : "#1f2937"
    const mutedTextColor = isDarkMode ? "#a1a1aa" : "#6b7280"
    const gridColor = isDarkMode ? "#3f3f46" : "#e5e7eb"

    // Draw background
    ctx.fillStyle = isDarkMode ? "#1f1f23" : "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 0.5

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * (canvas.width - 2 * padding)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, canvas.height - padding)
      ctx.stroke()
    }

    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = padding + (i / 10) * (canvas.height - 2 * padding)
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()
    }

    // Draw MST edges
    ctx.strokeStyle = mutedTextColor
    ctx.lineWidth = 1
    ctx.setLineDash([5, 3])
    mst.forEach((edge) => {
      const sourceBin = bins.find((b) => b.id === edge.source)
      const targetBin = bins.find((b) => b.id === edge.target)
      if (sourceBin && targetBin) {
        const sourcePos = toCanvasCoords(sourceBin.location[0], sourceBin.location[1])
        const targetPos = toCanvasCoords(targetBin.location[0], targetBin.location[1])

        ctx.beginPath()
        ctx.moveTo(sourcePos.x, sourcePos.y)
        ctx.lineTo(targetPos.x, targetPos.y)
        ctx.stroke()
      }
    })

    // Draw routes
    ctx.setLineDash([])
    routes.forEach((route, idx) => {
      ctx.strokeStyle = `hsl(${(idx * 137 + 180) % 360}, 70%, 50%)`
      ctx.lineWidth = 3

      const positions = route.binSequence
        .map((binId) => bins.find((b) => b.id === binId))
        .filter((bin): bin is Bin => bin !== undefined)
        .map((bin) => toCanvasCoords(bin.location[0], bin.location[1]))

      if (positions.length > 1) {
        ctx.beginPath()
        ctx.moveTo(positions[0].x, positions[0].y)
        for (let i = 1; i < positions.length; i++) {
          ctx.lineTo(positions[i].x, positions[i].y)
        }
        ctx.stroke()
      }
    })

    // Draw bin nodes with animation-like effect
    bins.forEach((bin) => {
      const pos = toCanvasCoords(bin.location[0], bin.location[1])

      // Draw glow effect for high priority bins
      if (bin.fillLevel > 80) {
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 5, pos.x, pos.y, 15)
        gradient.addColorStop(0, "rgba(239, 68, 68, 0.8)") // red-500 with alpha
        gradient.addColorStop(1, "rgba(239, 68, 68, 0)")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 15, 0, 2 * Math.PI)
        ctx.fill()
      }

      // Draw circle
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 10, 0, 2 * Math.PI)

      // Color based on fill level
      if (bin.fillLevel > 80) {
        ctx.fillStyle = "#ef4444" // Red for high priority
      } else if (bin.fillLevel > 50) {
        ctx.fillStyle = "#f59e0b" // Yellow for medium priority
      } else {
        ctx.fillStyle = "#10b981" // Green for low priority
      }

      ctx.fill()
      ctx.strokeStyle = isDarkMode ? "#e5e5e5" : "#000000"
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw bin ID
      ctx.fillStyle = "#ffffff"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(bin.id.toString(), pos.x, pos.y)
    })

    // Add legend
    ctx.font = "12px Arial"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillStyle = textColor

    // MST legend
    ctx.setLineDash([5, 3])
    ctx.strokeStyle = mutedTextColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(20, 20)
    ctx.lineTo(50, 20)
    ctx.stroke()
    ctx.fillText("MST Connections", 60, 20)

    // Routes legend
    ctx.setLineDash([])
    routes.forEach((route, idx) => {
      if (idx < 3) {
        ctx.strokeStyle = `hsl(${(idx * 137 + 180) % 360}, 70%, 50%)`
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(20, 40 + idx * 20)
        ctx.lineTo(50, 40 + idx * 20)
        ctx.stroke()
        ctx.fillStyle = textColor
        ctx.fillText(`Route ${idx + 1}`, 60, 40 + idx * 20)
      }
    })

    // Bin priority legend
    ctx.beginPath()
    ctx.arc(35, 100, 10, 0, 2 * Math.PI)
    ctx.fillStyle = "#ef4444"
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = textColor
    ctx.fillText("High Priority Bin", 60, 100)

    ctx.beginPath()
    ctx.arc(35, 120, 10, 0, 2 * Math.PI)
    ctx.fillStyle = "#f59e0b"
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = textColor
    ctx.fillText("Medium Priority Bin", 60, 120)

    ctx.beginPath()
    ctx.arc(35, 140, 10, 0, 2 * Math.PI)
    ctx.fillStyle = "#10b981"
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = textColor
    ctx.fillText("Low Priority Bin", 60, 140)
  }, [bins, routes, mst, theme, mounted])

  // Draw the fill level chart
  useEffect(() => {
    if (!fillLevelCanvasRef.current || bins.length === 0 || !mounted) return

    const canvas = fillLevelCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set dark mode colors based on theme
    const isDarkMode = theme === "dark"
    const textColor = isDarkMode ? "#e5e5e5" : "#1f2937"
    const mutedTextColor = isDarkMode ? "#a1a1aa" : "#6b7280"
    const gridColor = isDarkMode ? "#3f3f46" : "#e5e7eb"
    const bgColor = isDarkMode ? "#1f1f23" : "#ffffff"

    // Clear canvas
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Sort bins by ID for consistent display
    const sortedBins = [...bins].sort((a, b) => a.id - b.id)

    // Calculate bar width
    const barWidth = (canvas.width - 60) / sortedBins.length
    const barMaxHeight = canvas.height - 60

    // Draw grid
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 0.5

    for (let i = 0; i <= 100; i += 20) {
      const y = canvas.height - 30 - (i / 100) * barMaxHeight
      ctx.beginPath()
      ctx.moveTo(30, y)
      ctx.lineTo(canvas.width - 20, y)
      ctx.stroke()
    }

    // Draw axes
    ctx.strokeStyle = mutedTextColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(30, 20)
    ctx.lineTo(30, canvas.height - 30)
    ctx.lineTo(canvas.width - 20, canvas.height - 30)
    ctx.stroke()

    // Draw Y-axis labels
    ctx.fillStyle = textColor
    ctx.font = "12px Arial"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    for (let i = 0; i <= 100; i += 20) {
      const y = canvas.height - 30 - (i / 100) * barMaxHeight
      ctx.fillText(i.toString(), 25, y)
    }

    // Draw bars with animation-like effect
    sortedBins.forEach((bin, idx) => {
      const x = 40 + idx * barWidth
      const barHeight = (bin.fillLevel / 100) * barMaxHeight
      const y = canvas.height - 30 - barHeight

      // Color based on fill level
      if (bin.fillLevel > 80) {
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height - 30)
        gradient.addColorStop(0, "#ef4444") // Red
        gradient.addColorStop(1, "#fca5a5") // Lighter red
        ctx.fillStyle = gradient
      } else if (bin.fillLevel > 50) {
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height - 30)
        gradient.addColorStop(0, "#f59e0b") // Yellow
        gradient.addColorStop(1, "#fcd34d") // Lighter yellow
        ctx.fillStyle = gradient
      } else {
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height - 30)
        gradient.addColorStop(0, "#10b981") // Green
        gradient.addColorStop(1, "#6ee7b7") // Lighter green
        ctx.fillStyle = gradient
      }

      ctx.fillRect(x, y, barWidth - 5, barHeight)

      // Add border to bars
      ctx.strokeStyle = isDarkMode ? "#e5e5e5" : "#000000"
      ctx.lineWidth = 0.5
      ctx.strokeRect(x, y, barWidth - 5, barHeight)

      // Draw bin ID
      ctx.fillStyle = textColor
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(bin.id.toString(), x + (barWidth - 5) / 2, canvas.height - 25)

      // Draw fill level on top of bar
      if (barHeight > 20) {
        ctx.fillStyle = "#ffffff"
        ctx.textBaseline = "bottom"
        ctx.fillText(`${bin.fillLevel}%`, x + (barWidth - 5) / 2, y - 2)
      }
    })

    // Draw title
    ctx.fillStyle = textColor
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("Bin Fill Levels (%)", canvas.width / 2, 5)
  }, [bins, theme, mounted])

  // Draw the route distribution chart
  useEffect(() => {
    if (!routeDistributionCanvasRef.current || routes.length === 0 || !mounted) return

    const canvas = routeDistributionCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set dark mode colors based on theme
    const isDarkMode = theme === "dark"
    const textColor = isDarkMode ? "#e5e5e5" : "#1f2937"
    const bgColor = isDarkMode ? "#1f1f23" : "#ffffff"

    // Clear canvas
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Calculate total waste collected
    const totalWaste = routes.reduce((sum, route) => sum + route.totalWasteCollected, 0)

    // Draw pie chart
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 40

    let startAngle = 0
    routes.forEach((route, idx) => {
      const sliceAngle = (route.totalWasteCollected / totalWaste) * 2 * Math.PI

      // Draw slice with gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      const hue = (idx * 137 + 180) % 360
      gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.8)`)
      gradient.addColorStop(1, `hsla(${hue}, 70%, 50%, 0.8)`)

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()

      ctx.fillStyle = gradient
      ctx.fill()

      // Add border
      ctx.strokeStyle = isDarkMode ? "#e5e5e5" : "#000000"
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw label
      const labelAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${Math.round((route.totalWasteCollected / totalWaste) * 100)}%`, labelX, labelY)

      startAngle += sliceAngle
    })

    // Draw legend
    const legendX = 20
    let legendY = canvas.height - 20 - routes.length * 20

    ctx.font = "14px Arial"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"

    routes.forEach((route, idx) => {
      const hue = (idx * 137 + 180) % 360
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`
      ctx.fillRect(legendX, legendY - 8, 16, 16)

      ctx.strokeStyle = isDarkMode ? "#e5e5e5" : "#000000"
      ctx.lineWidth = 0.5
      ctx.strokeRect(legendX, legendY - 8, 16, 16)

      ctx.fillStyle = textColor
      ctx.fillText(`Route ${idx + 1} (Truck #${route.truckId})`, legendX + 25, legendY)

      legendY += 20
    })

    // Draw title
    ctx.fillStyle = textColor
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("Waste Collection Distribution", canvas.width / 2, 10)

    // Draw total waste collected
    ctx.fillStyle = textColor
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`Total: ${totalWaste.toFixed(2)} kg`, canvas.width / 2, 30)
  }, [routes, theme, mounted])

  // Function to export visualization as image
  const exportVisualization = (canvasRef: React.RefObject<HTMLCanvasElement>, filename: string) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const image = canvas.toDataURL("image/png")

    const a = document.createElement("a")
    a.href = image
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (!mounted) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400">System Visualizations</h1>
      </div>

      <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-teal-700 dark:text-teal-400">Data Visualizations</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Export current view:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const activeTab = document
                  .querySelector('[data-state="active"][data-radix-collection-item]')
                  ?.getAttribute("value")
                if (activeTab === "graph") {
                  exportVisualization(graphCanvasRef, "network-graph.png")
                } else if (activeTab === "fillLevels") {
                  exportVisualization(fillLevelCanvasRef, "fill-levels.png")
                } else if (activeTab === "routeDistribution") {
                  exportVisualization(routeDistributionCanvasRef, "route-distribution.png")
                }
              }}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="graph">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="graph"
                className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900 dark:data-[state=active]:bg-teal-900 dark:data-[state=active]:text-teal-100"
              >
                Network Graph
              </TabsTrigger>
              <TabsTrigger
                value="fillLevels"
                className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900 dark:data-[state=active]:bg-teal-900 dark:data-[state=active]:text-teal-100"
              >
                Fill Levels
              </TabsTrigger>
              <TabsTrigger
                value="routeDistribution"
                className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900 dark:data-[state=active]:bg-teal-900 dark:data-[state=active]:text-teal-100"
              >
                Route Distribution
              </TabsTrigger>
            </TabsList>

            <TabsContent value="graph" className="mt-4">
              {bins.length > 0 ? (
                <motion.div
                  className="bg-white dark:bg-gray-900 rounded-md p-4 border border-teal-200 dark:border-teal-900"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-lg font-medium mb-2 text-teal-700 dark:text-teal-400">City Network and Routes</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Visualization of the city network with MST connections and optimized routes
                  </p>
                  <div className="h-[400px] w-full">
                    <canvas ref={graphCanvasRef} width={800} height={400} className="w-full h-full rounded-md" />
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] bg-muted rounded-md">
                  <p className="text-muted-foreground">No data available. Add bins and generate routes first.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="fillLevels" className="mt-4">
              {bins.length > 0 ? (
                <motion.div
                  className="bg-white dark:bg-gray-900 rounded-md p-4 border border-teal-200 dark:border-teal-900"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-lg font-medium mb-2 text-teal-700 dark:text-teal-400">Bin Fill Levels</h3>
                  <p className="text-sm text-muted-foreground mb-4">Current fill levels of all bins in the system</p>
                  <div className="h-[400px] w-full">
                    <canvas ref={fillLevelCanvasRef} width={800} height={400} className="w-full h-full rounded-md" />
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] bg-muted rounded-md">
                  <p className="text-muted-foreground">No data available. Add bins first.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="routeDistribution" className="mt-4">
              {routes.length > 0 ? (
                <motion.div
                  className="bg-white dark:bg-gray-900 rounded-md p-4 border border-teal-200 dark:border-teal-900"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-lg font-medium mb-2 text-teal-700 dark:text-teal-400">
                    Waste Collection Distribution
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Distribution of waste collection across different routes
                  </p>
                  <div className="h-[400px] w-full">
                    <canvas
                      ref={routeDistributionCanvasRef}
                      width={800}
                      height={400}
                      className="w-full h-full rounded-md"
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] bg-muted rounded-md">
                  <p className="text-muted-foreground">No data available. Generate routes first.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <motion.div
        className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-md border border-teal-200 dark:border-teal-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-lg font-medium mb-2 text-teal-700 dark:text-teal-300">Algorithm Documentation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium mb-2">Kruskal's Algorithm</h4>
            <p className="text-sm text-muted-foreground">
              Kruskal's algorithm is used to find the Minimum Spanning Tree (MST) of the city graph. It works by sorting
              all edges by weight and adding them to the MST if they don't create a cycle. This provides a foundational
              network for route planning.
            </p>
            <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-auto">
              <code>
                {`// Pseudocode for Kruskal's Algorithm
1. Sort all edges by weight (distance)
2. Initialize disjoint set for each node
3. For each edge in sorted order:
   a. If including edge doesn't create cycle
      i. Add to MST
      ii. Union the sets of the two nodes
4. Return MST`}
              </code>
            </pre>
          </div>
          <div>
            <h4 className="text-md font-medium mb-2">Kadane's Algorithm (Adapted)</h4>
            <p className="text-sm text-muted-foreground">
              An adaptation of Kadane's algorithm is used to identify high-density clusters of bins. It considers both
              bin proximity and fill levels to group bins that should be visited together.
            </p>
            <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-auto">
              <code>
                {`// Pseudocode for Adapted Kadane's Algorithm
1. Assign weights to bins based on fill level
2. Start from high-priority bins
3. Use BFS to find connected bins in MST
4. Calculate cluster density
5. Return clusters sorted by density`}
              </code>
            </pre>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <h4 className="text-md font-medium mb-2">Dynamic Programming for Sequencing</h4>
            <p className="text-sm text-muted-foreground">
              Dynamic Programming is used to determine the optimal sequence for visiting bins within a cluster. This is
              similar to solving a Traveling Salesman Problem (TSP) for each cluster.
            </p>
            <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-auto">
              <code>
                {`// Pseudocode for DP Sequencing
1. Create distance matrix for bins in cluster
2. Initialize DP table: dp[mask][i] = min distance
   to visit all bins in mask, ending at bin i
3. Fill DP table bottom-up
4. Reconstruct optimal path
5. Return optimized sequence`}
              </code>
            </pre>
          </div>
          <div>
            <h4 className="text-md font-medium mb-2">B+ Tree for Bin Storage</h4>
            <p className="text-sm text-muted-foreground">
              A B+ Tree data structure is used for efficient storage and retrieval of bin information. This allows for
              quick access to bin data by ID and supports range queries.
            </p>
            <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-auto">
              <code>
                {`// B+ Tree Operations
1. Insert: Add a bin to the tree
2. Search: Find a bin by ID
3. GetAll: Retrieve all bins
4. Clear: Reset the tree

// Time Complexity
- Search: O(log n)
- Insert: O(log n)
- GetAll: O(n)`}
              </code>
            </pre>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
