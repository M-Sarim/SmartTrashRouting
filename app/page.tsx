"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import {
  createGraph,
  runKruskalsAlgorithm,
  findBinClusters,
  optimizeRouteWithDP,
  generateTruckRoutes,
  predictFillLevels,
} from "@/lib/routing-algorithms"
import { BPlusTree } from "@/lib/b-plus-tree"
import { MainDashboard } from "@/components/main-dashboard"
import { MainLayout } from "@/components/main-layout"
import { TutorialDialog } from "@/components/tutorial-dialog"
import type { Bin, Truck, Route, Edge, OptimizationRecord } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

// Dynamically import the Map component with SSR disabled
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md border border-teal-200 dark:border-teal-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto mb-4"></div>
        <p className="text-teal-700 dark:text-teal-400">Loading map...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  const [bins, setBins] = useState<Bin[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [previousRoutes, setPreviousRoutes] = useState<Route[]>([])
  const [mst, setMst] = useState<Edge[]>([])
  const [binTree, setBinTree] = useState<BPlusTree | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09])
  const [showDemo, setShowDemo] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [isSimulationActive, setIsSimulationActive] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1000) // ms between updates
  const [routeUpdateCount, setRouteUpdateCount] = useState(0)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationRecord[]>([])
  const [predictedFillLevels, setPredictedFillLevels] = useState<{ [key: number]: number }>({})
  const [showTutorial, setShowTutorial] = useState(false)
  const simulationRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Show tutorial on first load
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial")
    if (!hasSeenTutorial) {
      setShowTutorial(true)
      localStorage.setItem("hasSeenTutorial", "true")
    }

    // Initialize B+ Tree for bin storage
    const tree = new BPlusTree(5) // Order 5 B+ Tree
    setBinTree(tree)
  }, [])

  useEffect(() => {
    // Update B+ Tree when bins change
    if (binTree) {
      binTree.clear()
      bins.forEach((bin) => {
        binTree.insert(bin.id, bin)
      })
    }
  }, [bins, binTree])

  // Effect for real-time simulation
  useEffect(() => {
    if (isSimulationActive && bins.length > 0) {
      simulationRef.current = setInterval(() => {
        // Simulate random changes in bin fill levels
        const updatedBins = [...bins]
        const binToUpdate = Math.floor(Math.random() * updatedBins.length)

        // Increase fill level by 5-15%
        const fillIncrease = Math.floor(Math.random() * 10) + 5
        updatedBins[binToUpdate] = {
          ...updatedBins[binToUpdate],
          fillLevel: Math.min(100, updatedBins[binToUpdate].fillLevel + fillIncrease),
        }

        setBins(updatedBins)

        // Update predicted fill levels
        const predictions = predictFillLevels(updatedBins)
        setPredictedFillLevels(predictions)

        // Recalculate routes if a bin becomes high priority (>80%)
        if (updatedBins[binToUpdate].fillLevel > 80) {
          calculateRoutes()
          setRouteUpdateCount((prev) => prev + 1)

          toast({
            title: "High Priority Bin Detected",
            description: `Bin #${updatedBins[binToUpdate].id} has reached ${updatedBins[binToUpdate].fillLevel}% fill level. Routes updated.`,
            variant: "destructive",
          })
        }
      }, simulationSpeed)

      return () => {
        if (simulationRef.current) {
          clearInterval(simulationRef.current)
        }
      }
    }
  }, [isSimulationActive, bins, simulationSpeed])

  const addBin = (bin: Bin) => {
    const newBin = { ...bin, id: bins.length + 1 }
    setBins((prev) => [...prev, newBin])
    setSelectedLocation(null)

    toast({
      title: "Bin Added",
      description: `Bin #${newBin.id} has been added at location [${newBin.location[0].toFixed(4)}, ${newBin.location[1].toFixed(4)}]`,
    })
  }

  const addTruck = (truck: Truck) => {
    const newTruck = { ...truck, id: trucks.length + 1 }
    setTrucks((prev) => [...prev, newTruck])

    toast({
      title: "Truck Added",
      description: `Truck #${newTruck.id} with capacity ${newTruck.capacity}kg has been added`,
    })
  }

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation([lat, lng])

    toast({
      title: "Location Selected",
      description: `Location [${lat.toFixed(4)}, ${lng.toFixed(4)}] selected. Fill in the details to add a bin.`,
    })
  }

  const calculateRoutes = () => {
    if (bins.length === 0 || trucks.length === 0) {
      toast({
        title: "Cannot Calculate Routes",
        description: "Please add bins and trucks first",
        variant: "destructive",
      })
      return
    }

    // Save previous routes for comparison
    setPreviousRoutes(routes)

    // Step 1: Create graph representation
    const graph = createGraph(bins)

    // Step 2: Run Kruskal's algorithm to get MST
    const generatedMst = runKruskalsAlgorithm(graph)
    setMst(generatedMst)

    // Step 3: Find bin clusters using adapted Kadane's algorithm
    const clusters = findBinClusters(bins, generatedMst)

    // Step 4: For each cluster, optimize the sequence using DP
    const optimizedClusters = clusters.map((cluster) => optimizeRouteWithDP(cluster, graph))

    // Step 5: Generate truck routes considering capacity constraints
    const generatedRoutes = generateTruckRoutes(
      optimizedClusters,
      trucks,
      bins.filter((bin) => bin.fillLevel > 80), // High priority bins (nearly full)
    )

    setRoutes(generatedRoutes)

    // Add to optimization history
    const totalDistance = generatedRoutes.reduce((sum, route) => sum + route.totalDistance, 0)
    const totalWaste = generatedRoutes.reduce((sum, route) => sum + route.totalWasteCollected, 0)

    setOptimizationHistory((prev) => [
      ...prev,
      {
        timestamp: new Date(),
        totalDistance,
        totalWaste,
        routeCount: generatedRoutes.length,
        highPriorityBins: bins.filter((bin) => bin.fillLevel > 80).length,
      },
    ])

    toast({
      title: "Routes Calculated",
      description: `Generated ${generatedRoutes.length} optimized routes with total distance of ${totalDistance.toFixed(2)}km`,
    })
  }

  const toggleSimulation = () => {
    setIsSimulationActive(!isSimulationActive)

    toast({
      title: isSimulationActive ? "Simulation Paused" : "Simulation Started",
      description: isSimulationActive
        ? "Real-time bin fill level simulation has been paused"
        : "Real-time bin fill level simulation has started",
    })
  }

  const updateSimulationSpeed = (speed: number) => {
    setSimulationSpeed(speed)
  }

  const loadDemoData = () => {
    // Load demo data for testing
    const demoBins: Bin[] = [
      { id: 1, location: [51.505, -0.09], fillLevel: 85, capacity: 100 },
      { id: 2, location: [51.51, -0.1], fillLevel: 30, capacity: 100 },
      { id: 3, location: [51.515, -0.09], fillLevel: 90, capacity: 100 },
      { id: 4, location: [51.52, -0.1], fillLevel: 40, capacity: 100 },
      { id: 5, location: [51.518, -0.08], fillLevel: 75, capacity: 100 },
      { id: 6, location: [51.51, -0.05], fillLevel: 95, capacity: 100 },
      { id: 7, location: [51.505, -0.06], fillLevel: 20, capacity: 100 },
      { id: 8, location: [51.508, -0.11], fillLevel: 60, capacity: 100 },
      { id: 9, location: [51.512, -0.07], fillLevel: 82, capacity: 100 },
      { id: 10, location: [51.502, -0.08], fillLevel: 45, capacity: 100 },
    ]

    const demoTrucks: Truck[] = [
      { id: 1, capacity: 400, currentLoad: 0 },
      { id: 2, capacity: 300, currentLoad: 0 },
    ]

    setBins(demoBins)
    setTrucks(demoTrucks)
    setMapCenter([51.51, -0.08])
    setShowDemo(true)

    toast({
      title: "Demo Data Loaded",
      description: "Loaded 10 bins and 2 trucks for demonstration",
    })
  }

  const resetData = () => {
    setBins([])
    setTrucks([])
    setRoutes([])
    setPreviousRoutes([])
    setMst([])
    setShowDemo(false)
    setIsSimulationActive(false)
    setOptimizationHistory([])
    setPredictedFillLevels({})
    if (simulationRef.current) {
      clearInterval(simulationRef.current)
    }

    toast({
      title: "Data Reset",
      description: "All bins, trucks, routes, and history have been reset",
    })
  }

  const exportData = () => {
    // Create export data
    const exportData = {
      bins,
      trucks,
      routes,
      optimizationHistory,
    }

    // Convert to JSON
    const jsonData = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // Create download link
    const a = document.createElement("a")
    a.href = url
    a.download = `smart-trash-routing-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "All data has been exported as JSON",
    })
  }

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isSimulationActive={isSimulationActive}
      onShowTutorial={() => setShowTutorial(true)}
    >
      <MainDashboard
        activeTab={activeTab}
        bins={bins}
        trucks={trucks}
        routes={routes}
        previousRoutes={previousRoutes}
        mst={mst}
        optimizationHistory={optimizationHistory}
        predictedFillLevels={predictedFillLevels}
        routeUpdateCount={routeUpdateCount}
        isSimulationActive={isSimulationActive}
        simulationSpeed={simulationSpeed}
        selectedLocation={selectedLocation}
        mapCenter={mapCenter}
        onAddBin={addBin}
        onAddTruck={addTruck}
        onMapClick={handleMapClick}
        onCalculateRoutes={calculateRoutes}
        onToggleSimulation={toggleSimulation}
        onUpdateSimulationSpeed={updateSimulationSpeed}
        onLoadDemoData={loadDemoData}
        onResetData={resetData}
        onExportData={exportData}
        MapComponent={MapComponent}
      />

      <TutorialDialog open={showTutorial} onOpenChange={setShowTutorial} />
    </MainLayout>
  )
}
