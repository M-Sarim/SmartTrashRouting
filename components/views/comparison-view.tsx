"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Bin, Route, OptimizationRecord } from "@/lib/types";
import {
  History,
  TrendingDown,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";

interface ComparisonViewProps {
  currentRoutes: Route[];
  previousRoutes: Route[];
  optimizationHistory: OptimizationRecord[];
  bins: Bin[];
}

export function ComparisonView({
  currentRoutes,
  previousRoutes,
  optimizationHistory,
  bins,
}: ComparisonViewProps) {
  const historyCanvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the history chart
  useEffect(() => {
    if (!historyCanvasRef.current || optimizationHistory.length < 2) return;

    const canvas = historyCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;

    // Draw axes
    ctx.strokeStyle = "#a1a1aa"; // text-muted-foreground
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Add labels
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Optimization History", canvas.width / 2, 10);

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("Distance (km)", padding - 10, padding + chartHeight / 4);
    ctx.fillText("Waste (kg)", padding - 10, padding + (chartHeight * 3) / 4);

    // Calculate scales
    const maxDistance = Math.max(
      ...optimizationHistory.map((record) => record.totalDistance)
    );
    const maxWaste = Math.max(
      ...optimizationHistory.map((record) => record.totalWaste)
    );

    const distanceScale = chartHeight / 2 / (maxDistance || 1);
    const wasteScale = chartHeight / 2 / (maxWaste || 1);

    const xScale = chartWidth / (optimizationHistory.length - 1 || 1);

    // Draw distance line
    ctx.strokeStyle = "#14b8a6"; // teal-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    optimizationHistory.forEach((record, index) => {
      const x = padding + index * xScale;
      const y =
        padding + chartHeight / 2 - record.totalDistance * distanceScale;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw waste line
    ctx.strokeStyle = "#16a34a"; // green-600
    ctx.lineWidth = 2;
    ctx.beginPath();
    optimizationHistory.forEach((record, index) => {
      const x = padding + index * xScale;
      const y = padding + chartHeight - record.totalWaste * wasteScale;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points for distance
    ctx.fillStyle = "#14b8a6"; // teal-500
    optimizationHistory.forEach((record, index) => {
      const x = padding + index * xScale;
      const y =
        padding + chartHeight / 2 - record.totalDistance * distanceScale;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw points for waste
    ctx.fillStyle = "#16a34a"; // green-600
    optimizationHistory.forEach((record, index) => {
      const x = padding + index * xScale;
      const y = padding + chartHeight - record.totalWaste * wasteScale;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw legend
    ctx.fillStyle = "#14b8a6"; // teal-500
    ctx.fillRect(padding, canvas.height - 20, 15, 15);
    ctx.fillStyle = "#a1a1aa"; // text-muted-foreground
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("Distance", padding + 20, canvas.height - 12);

    ctx.fillStyle = "#16a34a"; // green-600
    ctx.fillRect(padding + 100, canvas.height - 20, 15, 15);
    ctx.fillStyle = "#a1a1aa"; // text-muted-foreground
    ctx.fillText("Waste", padding + 120, canvas.height - 12);

    // Draw x-axis labels (timestamps)
    ctx.fillStyle = "#a1a1aa"; // text-muted-foreground
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // Only show a few labels to avoid overcrowding
    const step = Math.max(1, Math.floor(optimizationHistory.length / 5));
    for (let i = 0; i < optimizationHistory.length; i += step) {
      const x = padding + i * xScale;
      const time = new Date(
        optimizationHistory[i].timestamp
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      ctx.fillText(time, x, canvas.height - padding + 5);
    }
  }, [optimizationHistory]);

  // Calculate comparison metrics
  const calculateComparison = () => {
    if (currentRoutes.length === 0 || previousRoutes.length === 0) {
      return null;
    }

    const currentDistance = currentRoutes.reduce(
      (sum, route) => sum + route.totalDistance,
      0
    );
    const previousDistance = previousRoutes.reduce(
      (sum, route) => sum + route.totalDistance,
      0
    );
    const distanceDiff = currentDistance - previousDistance;
    const distancePercent =
      previousDistance !== 0 ? (distanceDiff / previousDistance) * 100 : 0;

    const currentWaste = currentRoutes.reduce(
      (sum, route) => sum + route.totalWasteCollected,
      0
    );
    const previousWaste = previousRoutes.reduce(
      (sum, route) => sum + route.totalWasteCollected,
      0
    );
    const wasteDiff = currentWaste - previousWaste;
    const wastePercent =
      previousWaste !== 0 ? (wasteDiff / previousWaste) * 100 : 0;

    return {
      distanceDiff,
      distancePercent,
      wasteDiff,
      wastePercent,
      isDistanceBetter: distanceDiff < 0,
      isWasteBetter: wasteDiff > 0,
    };
  };

  const comparison = calculateComparison();

  // Function to export history data as CSV
  const exportHistoryCSV = () => {
    if (optimizationHistory.length === 0) return;

    // Create CSV header
    let csv = "Timestamp,Routes,Distance (km),Waste (kg),High Priority Bins\n";

    // Add history data
    optimizationHistory.forEach((record) => {
      const timestamp = new Date(record.timestamp).toISOString();
      csv += `${timestamp},${record.routeCount},${record.totalDistance.toFixed(
        2
      )},${record.totalWaste.toFixed(2)},${record.highPriorityBins}\n`;
    });

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimization-history-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400">
          History & Comparison
        </h1>
        <Button
          variant="outline"
          onClick={exportHistoryCSV}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export History
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md w-full max-w-[100vw]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-teal-500" />
              Route Optimization History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="chart"
                  className="flex items-center gap-2 data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
                >
                  <BarChart3 className="h-4 w-4" />
                  Chart
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className="flex items-center gap-2 data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
                >
                  <Clock className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="mt-4">
                {optimizationHistory.length >= 2 ? (
                  <div className="h-[400px] w-full">
                    <canvas
                      ref={historyCanvasRef}
                      width={800}
                      height={400}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <p>Not enough optimization history data.</p>
                    <p>Run at least 2 route optimizations to see the chart.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="table" className="mt-4">
                {optimizationHistory.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Time</th>
                          <th className="p-2 text-left">Routes</th>
                          <th className="p-2 text-left">Distance</th>
                          <th className="p-2 text-left">Waste</th>
                          <th className="p-2 text-left">High Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optimizationHistory.map((record, index) => (
                          <motion.tr
                            key={index}
                            className="border-t hover:bg-muted/50 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <td className="p-2 text-sm">
                              {new Date(record.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="p-2 text-sm">{record.routeCount}</td>
                            <td className="p-2 text-sm">
                              {record.totalDistance.toFixed(2)} km
                            </td>
                            <td className="p-2 text-sm">
                              {record.totalWaste.toFixed(2)} kg
                            </td>
                            <td className="p-2 text-sm">
                              {record.highPriorityBins > 0 ? (
                                <Badge variant="destructive">
                                  {record.highPriorityBins}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                >
                                  0
                                </Badge>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <p>No optimization history available.</p>
                    <p>Run route optimizations to see the timeline.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md w-full max-w-[100vw]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-500" />
              Route Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comparison ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Total Distance</p>
                      <p className="text-xs text-muted-foreground">
                        Current vs Previous
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          comparison.isDistanceBetter
                            ? "outline"
                            : "destructive"
                        }
                        className={
                          comparison.isDistanceBetter
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : ""
                        }
                      >
                        {comparison.distanceDiff.toFixed(2)} km
                      </Badge>
                      <div className="flex items-center">
                        {comparison.isDistanceBetter ? (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={`text-xs ${
                            comparison.isDistanceBetter
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {Math.abs(comparison.distancePercent).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Total Waste Collected
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Current vs Previous
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          comparison.isWasteBetter ? "outline" : "destructive"
                        }
                        className={
                          comparison.isWasteBetter
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : ""
                        }
                      >
                        {comparison.wasteDiff.toFixed(2)} kg
                      </Badge>
                      <div className="flex items-center">
                        {comparison.isWasteBetter ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={`text-xs ${
                            comparison.isWasteBetter
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {Math.abs(comparison.wastePercent).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Route Count</p>
                      <p className="text-xs text-muted-foreground">
                        Current vs Previous
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100"
                      >
                        {currentRoutes.length} vs {previousRoutes.length}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Efficiency</p>
                      <p className="text-xs text-muted-foreground">
                        Waste per Distance (kg/km)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                      >
                        {(
                          currentRoutes.reduce(
                            (sum, r) => sum + r.totalWasteCollected,
                            0
                          ) /
                          currentRoutes.reduce(
                            (sum, r) => sum + r.totalDistance,
                            0
                          )
                        ).toFixed(2)}{" "}
                        kg/km
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-md border border-teal-200 dark:border-teal-800">
                    <h3 className="text-sm font-medium mb-2 text-teal-700 dark:text-teal-300">
                      Optimization Summary
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {comparison.isDistanceBetter && comparison.isWasteBetter
                        ? "The current routes are more efficient, with shorter distances and more waste collected."
                        : comparison.isDistanceBetter
                        ? "The current routes have shorter distances but collect less waste."
                        : comparison.isWasteBetter
                        ? "The current routes collect more waste but have longer distances."
                        : "The current routes have longer distances and collect less waste."}
                    </p>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
                        Key Factors:
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                        <li>
                          High priority bins:{" "}
                          {bins.filter((bin) => bin.fillLevel > 80).length}
                        </li>
                        <li>Total bins: {bins.length}</li>
                        <li>Optimization runs: {optimizationHistory.length}</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-md border border-teal-200 dark:border-teal-800">
                    <h3 className="text-sm font-medium mb-2 text-teal-700 dark:text-teal-300">
                      Performance Metrics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">
                          Average Distance per Route:
                        </span>
                        <span className="text-sm font-medium">
                          {currentRoutes.length > 0
                            ? `${(
                                currentRoutes.reduce(
                                  (sum, r) => sum + r.totalDistance,
                                  0
                                ) / currentRoutes.length
                              ).toFixed(2)} km`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          Average Waste per Route:
                        </span>
                        <span className="text-sm font-medium">
                          {currentRoutes.length > 0
                            ? `${(
                                currentRoutes.reduce(
                                  (sum, r) => sum + r.totalWasteCollected,
                                  0
                                ) / currentRoutes.length
                              ).toFixed(2)} kg`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Bins per Route:</span>
                        <span className="text-sm font-medium">
                          {currentRoutes.length > 0
                            ? `${(
                                currentRoutes.reduce(
                                  (sum, r) => sum + r.binSequence.length,
                                  0
                                ) / currentRoutes.length
                              ).toFixed(1)}`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <p>No comparison data available.</p>
                <p>
                  Run at least two route optimizations to see the comparison.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
