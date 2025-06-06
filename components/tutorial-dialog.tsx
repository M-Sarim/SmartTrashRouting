"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Truck,
  BarChart3,
  History,
  Settings,
  RefreshCw,
  Trash2,
  ArrowRight,
  Play,
  Download,
} from "lucide-react"
import { motion } from "framer-motion"

interface TutorialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TutorialDialog({ open, onOpenChange }: TutorialDialogProps) {
  const [currentTab, setCurrentTab] = useState("welcome")

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2">
            <Trash2 className="h-6 w-6" />
            Smart Trash Routing Tutorial
          </DialogTitle>
          <DialogDescription>
            Welcome to the Smart Trash Routing System! This tutorial will guide you through the main features.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mt-4">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="welcome" className="text-xs">
              Welcome
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="text-xs">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="map" className="text-xs">
              Map
            </TabsTrigger>
            <TabsTrigger value="algorithms" className="text-xs">
              Algorithms
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs">
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="welcome" className="mt-4 space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                </div>
              </div>

              <h3 className="text-lg font-medium text-center mb-2">Welcome to Smart Trash Routing</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                An intelligent system for optimizing waste collection routes in urban environments
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-teal-500" />
                    Bin Management
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Add and monitor trash bins across the city with real-time fill level tracking
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-teal-500" />
                    Route Optimization
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Generate efficient collection routes using advanced algorithms
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-teal-500" />
                    Data Visualization
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    View interactive charts and maps to analyze system performance
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Play className="h-4 w-4 text-teal-500" />
                    Real-time Simulation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Simulate bin fill levels and test route optimization strategies
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-4 space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h3 className="text-lg font-medium mb-2">Dashboard Overview</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The dashboard provides a comprehensive view of your waste collection system.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="mt-1">
                    <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                      <Trash2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Adding Bins</h4>
                    <p className="text-sm text-muted-foreground">
                      Add bins by selecting a location on the map and filling in the bin details. You can set the
                      initial fill level and capacity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="mt-1">
                    <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Adding Trucks</h4>
                    <p className="text-sm text-muted-foreground">
                      Add collection trucks by specifying their capacity. The system will assign routes based on truck
                      availability and capacity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="mt-1">
                    <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Calculating Routes</h4>
                    <p className="text-sm text-muted-foreground">
                      Click "Calculate Optimal Routes" to generate efficient collection routes based on bin locations,
                      fill levels, and truck capacities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="mt-1">
                    <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                      <Play className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Simulation</h4>
                    <p className="text-sm text-muted-foreground">
                      Start the simulation to see how bin fill levels change over time. The system will automatically
                      recalculate routes when bins reach high priority levels.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="map" className="mt-4 space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h3 className="text-lg font-medium mb-2">Interactive Map</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The map view provides a spatial representation of bins, routes, and the minimum spanning tree.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-teal-500" />
                    Bin Markers
                  </h4>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-red-500"></div>
                      <span className="text-sm">High Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Medium Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span className="text-sm">Low Priority</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <ArrowRight className="h-4 w-4 text-teal-500" />
                    Routes and Connections
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">The map displays:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Solid colored lines: Optimized truck routes</li>
                    <li>Dashed gray lines: Minimum Spanning Tree connections</li>
                    <li>Selected location: Where you clicked to add a new bin</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-teal-500" />
                    Adding Bins via Map
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Click anywhere on the map to select a location for a new bin. Then fill in the bin details in the
                    form that appears.
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="algorithms" className="mt-4 space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h3 className="text-lg font-medium mb-2">Optimization Algorithms</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The system uses several advanced algorithms to optimize waste collection routes.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Kruskal's Algorithm</h4>
                  <p className="text-sm text-muted-foreground">
                    Used to find the Minimum Spanning Tree (MST) of the city graph. This provides a foundational network
                    for route planning by connecting all bins with minimal total distance.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Kadane's Algorithm (Adapted)</h4>
                  <p className="text-sm text-muted-foreground">
                    An adaptation of Kadane's algorithm identifies high-density clusters of bins. It considers both bin
                    proximity and fill levels to group bins that should be visited together.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Dynamic Programming for Sequencing</h4>
                  <p className="text-sm text-muted-foreground">
                    Determines the optimal sequence for visiting bins within a cluster. This is similar to solving a
                    Traveling Salesman Problem (TSP) for each cluster.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">B+ Tree for Data Storage</h4>
                  <p className="text-sm text-muted-foreground">
                    A B+ Tree data structure is used for efficient storage and retrieval of bin information. This allows
                    for quick access to bin data by ID and supports range queries.
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="export" className="mt-4 space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h3 className="text-lg font-medium mb-2">Data Export Features</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The system allows you to export data for further analysis or reporting.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="mt-1">
                    <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                      <Download className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Export Routes</h4>
                    <p className="text-sm text-muted-foreground">
                      Export route data as CSV files for integration with other systems or for record-keeping. This
                      includes truck assignments, bin sequences, distances, and waste amounts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="mt-1">
                    <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                      <History className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Export History</h4>
                    <p className="text-sm text-muted-foreground">
                      Export optimization history as CSV files to analyze trends over time. This includes timestamps,
                      route counts, distances, waste amounts, and high priority bin counts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="mt-1">
                    <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Export Visualizations</h4>
                    <p className="text-sm text-muted-foreground">
                      Save visualization charts as PNG images for reports or presentations. This includes the network
                      graph, fill level chart, and route distribution chart.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="mt-1">
                    <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                      <Settings className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Export All Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Export the complete system state as a JSON file, including all bins, trucks, routes, and
                      optimization history. This can be used for backup or system transfer.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const tabs = ["welcome", "dashboard", "map", "algorithms", "export"]
                const currentIndex = tabs.indexOf(currentTab)
                if (currentIndex > 0) {
                  setCurrentTab(tabs[currentIndex - 1])
                }
              }}
              disabled={currentTab === "welcome"}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                const tabs = ["welcome", "dashboard", "map", "algorithms", "export"]
                const currentIndex = tabs.indexOf(currentTab)
                if (currentIndex < tabs.length - 1) {
                  setCurrentTab(tabs[currentIndex + 1])
                } else {
                  handleClose()
                }
              }}
            >
              {currentTab === "export" ? "Finish" : "Next"}
            </Button>
          </div>
          <Button variant="ghost" onClick={handleClose}>
            Skip Tutorial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
