"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TruckIcon, Trash2, ArrowUpDown, TrendingDown, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import type { Route } from "@/lib/types"

interface RouteComparisonProps {
  currentRoutes: Route[]
  previousRoutes: Route[]
}

export default function RouteComparison({ currentRoutes, previousRoutes }: RouteComparisonProps) {
  if (currentRoutes.length === 0 || previousRoutes.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No comparison data available yet. Generate routes multiple times to see comparisons.</p>
      </div>
    )
  }

  // Calculate metrics
  const currentTotalDistance = currentRoutes.reduce((sum, route) => sum + route.totalDistance, 0)
  const previousTotalDistance = previousRoutes.reduce((sum, route) => sum + route.totalDistance, 0)

  const currentTotalWaste = currentRoutes.reduce((sum, route) => sum + route.totalWasteCollected, 0)
  const previousTotalWaste = previousRoutes.reduce((sum, route) => sum + route.totalWasteCollected, 0)

  const distanceDifference = currentTotalDistance - previousTotalDistance
  const distancePercentChange = previousTotalDistance !== 0 ? (distanceDifference / previousTotalDistance) * 100 : 0

  const wasteDifference = currentTotalWaste - previousTotalWaste
  const wastePercentChange = previousTotalWaste !== 0 ? (wasteDifference / previousTotalWaste) * 100 : 0

  const currentEfficiency = currentTotalDistance !== 0 ? currentTotalWaste / currentTotalDistance : 0
  const previousEfficiency = previousTotalDistance !== 0 ? previousTotalWaste / previousTotalDistance : 0
  const efficiencyDifference = currentEfficiency - previousEfficiency
  const efficiencyPercentChange = previousEfficiency !== 0 ? (efficiencyDifference / previousEfficiency) * 100 : 0

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
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <Card className="card-gradient card-hover border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-primary" />
                Distance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">Previous</p>
                  <p className="text-lg font-medium">{previousTotalDistance.toFixed(2)} km</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-lg font-medium">{currentTotalDistance.toFixed(2)} km</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                {distanceDifference < 0 ? (
                  <>
                    <Badge className="bg-success/20 text-success-foreground border-success/30">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {Math.abs(distancePercentChange).toFixed(1)}% Shorter
                    </Badge>
                    <p className="text-sm text-success">{Math.abs(distanceDifference).toFixed(2)} km less</p>
                  </>
                ) : distanceDifference > 0 ? (
                  <>
                    <Badge className="bg-destructive/20 text-destructive-foreground border-destructive/30">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {distancePercentChange.toFixed(1)}% Longer
                    </Badge>
                    <p className="text-sm text-destructive">{distanceDifference.toFixed(2)} km more</p>
                  </>
                ) : (
                  <Badge variant="outline">No Change</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="card-gradient card-hover border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Waste Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">Previous</p>
                  <p className="text-lg font-medium">{previousTotalWaste.toFixed(2)} kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-lg font-medium">{currentTotalWaste.toFixed(2)} kg</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                {wasteDifference > 0 ? (
                  <>
                    <Badge className="bg-success/20 text-success-foreground border-success/30">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {wastePercentChange.toFixed(1)}% More
                    </Badge>
                    <p className="text-sm text-success">{wasteDifference.toFixed(2)} kg more collected</p>
                  </>
                ) : wasteDifference < 0 ? (
                  <>
                    <Badge className="bg-destructive/20 text-destructive-foreground border-destructive/30">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {Math.abs(wastePercentChange).toFixed(1)}% Less
                    </Badge>
                    <p className="text-sm text-destructive">{Math.abs(wasteDifference).toFixed(2)} kg less collected</p>
                  </>
                ) : (
                  <Badge variant="outline">No Change</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="card-gradient card-hover border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TruckIcon className="h-5 w-5 text-primary" />
                Efficiency Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">Previous</p>
                  <p className="text-lg font-medium">{previousEfficiency.toFixed(2)} kg/km</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-lg font-medium">{currentEfficiency.toFixed(2)} kg/km</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                {efficiencyDifference > 0 ? (
                  <>
                    <Badge className="bg-success/20 text-success-foreground border-success/30">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {efficiencyPercentChange.toFixed(1)}% More Efficient
                    </Badge>
                    <p className="text-sm text-success">{efficiencyDifference.toFixed(2)} kg/km better</p>
                  </>
                ) : efficiencyDifference < 0 ? (
                  <>
                    <Badge className="bg-destructive/20 text-destructive-foreground border-destructive/30">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {Math.abs(efficiencyPercentChange).toFixed(1)}% Less Efficient
                    </Badge>
                    <p className="text-sm text-destructive">{Math.abs(efficiencyDifference).toFixed(2)} kg/km worse</p>
                  </>
                ) : (
                  <Badge variant="outline">No Change</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
