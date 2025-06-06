"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface SettingsViewProps {
  isSimulationActive: boolean;
  simulationSpeed: number;
  onToggleSimulation: () => void;
  onUpdateSimulationSpeed: (speed: number) => void;
  onLoadDemoData: () => void;
  onResetData: () => void;
  onExportData: () => void;
}

export function SettingsView({
  isSimulationActive,
  simulationSpeed,
  onToggleSimulation,
  onUpdateSimulationSpeed,
  onLoadDemoData,
  onResetData,
  onExportData,
}: SettingsViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-full"
    >
      <div className="flex justify-between items-center mb-6 w-full">
        <h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400">
          Settings
        </h1>
      </div>

      <Tabs defaultValue="simulation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="simulation"
            className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900 dark:data-[state=active]:bg-teal-900 dark:data-[state=active]:text-teal-100"
          >
            Simulation
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900 dark:data-[state=active]:bg-teal-900 dark:data-[state=active]:text-teal-100"
          >
            Data Management
          </TabsTrigger>
          <TabsTrigger
            value="about"
            className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900 dark:data-[state=active]:bg-teal-900 dark:data-[state=active]:text-teal-100"
          >
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="mt-4">
          <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md w-full max-w-[100vw]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-teal-500" />
                Simulation Settings
              </CardTitle>
              <CardDescription>
                Configure real-time simulation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="simulation-toggle">Simulation Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {isSimulationActive
                      ? "Simulation is running"
                      : "Simulation is paused"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isSimulationActive ? "destructive" : "default"}
                    size="sm"
                    onClick={onToggleSimulation}
                    className={
                      isSimulationActive
                        ? ""
                        : "bg-teal-600 hover:bg-teal-700 transition-colors duration-300"
                    }
                  >
                    {isSimulationActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" /> Start
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between">
                    <Label>Update Speed</Label>
                    <span className="text-sm text-muted-foreground">
                      {(simulationSpeed / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <Slider
                    min={500}
                    max={5000}
                    step={500}
                    value={[simulationSpeed]}
                    onValueChange={(value) => onUpdateSimulationSpeed(value[0])}
                    disabled={!isSimulationActive}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Fast</span>
                    <span>Slow</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md w-full max-w-[100vw]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-teal-500" />
                Data Management
              </CardTitle>
              <CardDescription>
                Load, reset, or export simulation data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={onLoadDemoData}
                  className="bg-teal-600 hover:bg-teal-700 transition-colors duration-300"
                >
                  Load Demo Data
                </Button>
                <Button
                  onClick={onResetData}
                  variant="outline"
                  className="border-teal-200 hover:border-teal-300 dark:border-teal-800 dark:hover:border-teal-700"
                >
                  Reset All Data
                </Button>
                <Button
                  onClick={onExportData}
                  variant="outline"
                  className="border-teal-200 hover:border-teal-300 dark:border-teal-800 dark:hover:border-teal-700"
                >
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-4">
          <Card className="border-teal-200 dark:border-teal-900 transition-all duration-300 hover:shadow-md w-full max-w-[100vw]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-teal-500" />
                About Smart Trash Routing
              </CardTitle>
              <CardDescription>
                Information about this application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Smart Trash Routing is an intelligent waste management
                simulation that optimizes collection routes based on fill levels
                and priorities. This application demonstrates how smart city
                technologies can improve efficiency and reduce environmental
                impact.
              </p>
              <p className="text-sm text-muted-foreground">
                Version 1.0.0 | Created with Next.js, Tailwind CSS, and Framer
                Motion
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
