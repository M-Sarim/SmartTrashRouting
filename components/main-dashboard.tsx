"use client"

import type React from "react"

import { DashboardView } from "@/components/views/dashboard-view"
import { MapView } from "@/components/views/map-view"
import { RoutesView } from "@/components/views/routes-view"
import { VisualizationView } from "@/components/views/visualization-view"
import { ComparisonView } from "@/components/views/comparison-view"
import { SettingsView } from "@/components/views/settings-view"
import { Toaster } from "@/components/ui/toaster"
import type { Bin, Truck, Route, Edge, OptimizationRecord } from "@/lib/types"

interface MainDashboardProps {
  activeTab: string
  bins: Bin[]
  trucks: Truck[]
  routes: Route[]
  previousRoutes: Route[]
  mst: Edge[]
  optimizationHistory: OptimizationRecord[]
  predictedFillLevels: { [key: number]: number }
  routeUpdateCount: number
  isSimulationActive: boolean
  simulationSpeed: number
  selectedLocation: [number, number] | null
  mapCenter: [number, number]
  onAddBin: (bin: Bin) => void
  onAddTruck: (truck: Truck) => void
  onMapClick: (lat: number, lng: number) => void
  onCalculateRoutes: () => void
  onToggleSimulation: () => void
  onUpdateSimulationSpeed: (speed: number) => void
  onLoadDemoData: () => void
  onResetData: () => void
  onExportData: () => void
  MapComponent: React.ComponentType<any>
}

export function MainDashboard({
  activeTab,
  bins,
  trucks,
  routes,
  previousRoutes,
  mst,
  optimizationHistory,
  predictedFillLevels,
  routeUpdateCount,
  isSimulationActive,
  simulationSpeed,
  selectedLocation,
  mapCenter,
  onAddBin,
  onAddTruck,
  onMapClick,
  onCalculateRoutes,
  onToggleSimulation,
  onUpdateSimulationSpeed,
  onLoadDemoData,
  onResetData,
  onExportData,
  MapComponent,
}: MainDashboardProps) {
  return (
    <>
      {activeTab === "dashboard" && (
        <DashboardView
          bins={bins}
          trucks={trucks}
          routes={routes}
          routeUpdateCount={routeUpdateCount}
          isSimulationActive={isSimulationActive}
          simulationSpeed={simulationSpeed}
          optimizationHistory={optimizationHistory}
          predictedFillLevels={predictedFillLevels}
          selectedLocation={selectedLocation}
          onAddBin={onAddBin}
          onAddTruck={onAddTruck}
          onCalculateRoutes={onCalculateRoutes}
          onToggleSimulation={onToggleSimulation}
          onUpdateSimulationSpeed={onUpdateSimulationSpeed}
          onLoadDemoData={onLoadDemoData}
          onResetData={onResetData}
          onExportData={onExportData}
        />
      )}

      {activeTab === "map" && (
        <MapView
          bins={bins}
          routes={routes}
          mst={mst}
          mapCenter={mapCenter}
          selectedLocation={selectedLocation}
          onMapClick={onMapClick}
          predictedFillLevels={predictedFillLevels}
          MapComponent={MapComponent}
        />
      )}

      {activeTab === "routes" && <RoutesView routes={routes} bins={bins} trucks={trucks} />}

      {activeTab === "visualization" && <VisualizationView bins={bins} routes={routes} mst={mst} />}

      {activeTab === "comparison" && (
        <ComparisonView
          currentRoutes={routes}
          previousRoutes={previousRoutes}
          optimizationHistory={optimizationHistory}
          bins={bins}
        />
      )}

      {activeTab === "settings" && (
        <SettingsView
          isSimulationActive={isSimulationActive}
          simulationSpeed={simulationSpeed}
          onToggleSimulation={onToggleSimulation}
          onUpdateSimulationSpeed={onUpdateSimulationSpeed}
          onLoadDemoData={onLoadDemoData}
          onResetData={onResetData}
          onExportData={onExportData}
        />
      )}

      <Toaster />
    </>
  )
}
