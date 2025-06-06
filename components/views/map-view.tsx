"use client";

import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { Bin, Route, Edge } from "@/lib/types";

interface MapViewProps {
  bins: Bin[];
  routes: Route[];
  mst: Edge[];
  mapCenter: [number, number];
  selectedLocation: [number, number] | null;
  onMapClick: (lat: number, lng: number) => void;
  predictedFillLevels: { [key: number]: number };
  MapComponent: React.ComponentType<any>;
}

export function MapView({
  bins,
  routes,
  mst,
  mapCenter,
  selectedLocation,
  onMapClick,
  predictedFillLevels,
  MapComponent,
}: MapViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-full"
    >
      <div className="flex justify-between items-center mb-6 w-full">
        <h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400">
          Map View
        </h1>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100"
          >
            {bins.length} Bins
          </Badge>
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
          >
            {routes.length} Routes
          </Badge>
        </div>
      </div>

      <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md w-full max-w-[100vw]">
        <CardHeader>
          <CardTitle className="text-md font-medium">
            Interactive City Map
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full max-w-[100vw] p-0 sm:p-6">
          <MapComponent
            bins={bins}
            routes={routes}
            mst={mst}
            mapCenter={mapCenter}
            selectedLocation={selectedLocation}
            onMapClick={onMapClick}
            predictedFillLevels={predictedFillLevels}
          />
        </CardContent>
      </Card>

      <motion.div
        className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-md border border-teal-200 dark:border-teal-800 w-full max-w-[100vw]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-lg font-medium mb-2 text-teal-700 dark:text-teal-300">
          Map Legend
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Bin Status</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm">
                  High Priority (&gt;80% fill level)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm">
                  Medium Priority (50-80% fill level)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm">
                  Low Priority (&lt;50% fill level)
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Map Elements</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-gray-400 border-dashed border-t border-gray-400"></div>
                <span className="text-sm">
                  MST Connections (Kruskal's Algorithm)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-1 bg-teal-500"></div>
                <span className="text-sm">Optimized Routes</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                </div>
                <span className="text-sm">Selected Location</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Instructions</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              Click anywhere on the map to select a location for a new bin
            </li>
            <li>Hover over a bin to see its details</li>
            <li>Use the mouse wheel to zoom in/out and drag to pan the map</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
