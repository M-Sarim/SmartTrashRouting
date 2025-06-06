"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  MapPin,
  Truck,
  BarChart3,
  History,
  Settings,
  HelpCircle,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSimulationActive: boolean;
  onShowTutorial: () => void;
}

export function MainLayout({
  children,
  activeTab,
  setActiveTab,
  isSimulationActive,
  onShowTutorial,
}: MainLayoutProps) {
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <motion.div
              className="flex items-center gap-2 px-4 py-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-600 text-white">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Smart Trash</h1>
                <p className="text-xs text-muted-foreground">Routing System</p>
              </div>
            </motion.div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "dashboard"}
                  onClick={() => setActiveTab("dashboard")}
                  tooltip="Dashboard"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                  {isSimulationActive && (
                    <Badge
                      variant="outline"
                      className="ml-auto animate-pulse bg-green-100 text-green-800"
                    >
                      Live
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "map"}
                  onClick={() => setActiveTab("map")}
                  tooltip="Map View"
                >
                  <MapPin className="h-5 w-5" />
                  <span>Map View</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "routes"}
                  onClick={() => setActiveTab("routes")}
                  tooltip="Routes"
                >
                  <Truck className="h-5 w-5" />
                  <span>Routes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "visualization"}
                  onClick={() => setActiveTab("visualization")}
                  tooltip="Visualizations"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Visualizations</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "comparison"}
                  onClick={() => setActiveTab("comparison")}
                  tooltip="History"
                >
                  <History className="h-5 w-5" />
                  <span>History</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "settings"}
                  onClick={() => setActiveTab("settings")}
                  tooltip="Settings"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={onShowTutorial}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Tutorial</span>
              </Button>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  © 2025 Smart Trash
                </span>
                <ThemeToggle />
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-background">
          <div className="w-full p-4 transition-colors duration-300">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
