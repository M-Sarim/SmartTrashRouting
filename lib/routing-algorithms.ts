// Implementation of routing algorithms for the Smart Trash Truck Routing System

import { type Bin, type Truck, type Route, type Edge, type Graph, type Cluster, DisjointSet } from "./types"

// Calculate distance between two points using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return distance
}

// Create a graph representation of the city
export function createGraph(bins: Bin[]): Graph {
  const nodes = bins.map((bin) => bin.id)
  const edges: Edge[] = []

  // Create edges between all pairs of bins
  for (let i = 0; i < bins.length; i++) {
    for (let j = i + 1; j < bins.length; j++) {
      const bin1 = bins[i]
      const bin2 = bins[j]

      const distance = calculateDistance(bin1.location[0], bin1.location[1], bin2.location[0], bin2.location[1])

      edges.push({
        source: bin1.id,
        target: bin2.id,
        weight: distance,
      })
    }
  }

  return { nodes, edges }
}

// Implement Kruskal's algorithm to find Minimum Spanning Tree
export function runKruskalsAlgorithm(graph: Graph): Edge[] {
  // Sort edges by weight (distance)
  const sortedEdges = [...graph.edges].sort((a, b) => a.weight - b.weight)

  // Initialize disjoint set
  const disjointSet = new DisjointSet()
  graph.nodes.forEach((node) => disjointSet.makeSet(node))

  // Result MST
  const mst: Edge[] = []

  // Process edges in ascending order of weight
  for (const edge of sortedEdges) {
    const sourceRoot = disjointSet.find(edge.source)
    const targetRoot = disjointSet.find(edge.target)

    // If including this edge doesn't create a cycle
    if (sourceRoot !== targetRoot) {
      mst.push(edge)
      disjointSet.union(sourceRoot, targetRoot)

      // MST has n-1 edges where n is the number of nodes
      if (mst.length === graph.nodes.length - 1) {
        break
      }
    }
  }

  return mst
}

// Implement adapted Kadane's algorithm to find bin clusters
export function findBinClusters(bins: Bin[], mst: Edge[]): Cluster[] {
  // Create adjacency list from MST
  const adjacencyList = new Map<number, number[]>()
  bins.forEach((bin) => adjacencyList.set(bin.id, []))

  mst.forEach((edge) => {
    if (!adjacencyList.has(edge.source)) adjacencyList.set(edge.source, [])
    if (!adjacencyList.has(edge.target)) adjacencyList.set(edge.target, [])

    adjacencyList.get(edge.source)!.push(edge.target)
    adjacencyList.get(edge.target)!.push(edge.source)
  })

  // Assign weights to bins based on fill level and connections
  const binWeights = new Map<number, number>()
  bins.forEach((bin) => {
    // Higher fill level = higher weight
    const fillLevelWeight = bin.fillLevel / 100

    // More connections = higher weight (density)
    const connectionsWeight = adjacencyList.get(bin.id)?.length || 0

    // Combined weight
    binWeights.set(bin.id, fillLevelWeight * 2 + connectionsWeight)
  })

  // Adapted Kadane's algorithm to find clusters
  const clusters: Cluster[] = []
  const visited = new Set<number>()

  // Start from high-priority bins (nearly full)
  const sortedBins = [...bins].sort((a, b) => b.fillLevel - a.fillLevel)

  for (const startBin of sortedBins) {
    if (visited.has(startBin.id)) continue

    const clusterBins: number[] = []
    let clusterDensity = 0

    // BFS to find connected bins
    const queue: number[] = [startBin.id]
    visited.add(startBin.id)

    while (queue.length > 0) {
      const currentBinId = queue.shift()!
      clusterBins.push(currentBinId)
      clusterDensity += binWeights.get(currentBinId) || 0

      // Add neighbors to queue
      const neighbors = adjacencyList.get(currentBinId) || []
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId)
          queue.push(neighborId)
        }
      }
    }

    // Only add clusters with at least 2 bins
    if (clusterBins.length >= 2) {
      clusters.push({
        bins: clusterBins,
        density: clusterDensity / clusterBins.length,
      })
    } else {
      // Add single bins as their own clusters
      clusters.push({
        bins: clusterBins,
        density: clusterDensity,
      })
    }
  }

  // Sort clusters by density (highest first)
  return clusters.sort((a, b) => b.density - a.density)
}

// Implement Dynamic Programming for optimal bin visit sequence
export function optimizeRouteWithDP(cluster: Cluster, graph: Graph): number[] {
  const binIds = cluster.bins

  if (binIds.length <= 2) {
    return binIds // No optimization needed for 1 or 2 bins
  }

  // Create distance matrix
  const n = binIds.length
  const dist: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0))

  // Fill distance matrix
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        dist[i][j] = 0
      } else {
        // Find edge weight between these bins
        const edge = graph.edges.find(
          (e) =>
            (e.source === binIds[i] && e.target === binIds[j]) || (e.source === binIds[j] && e.target === binIds[i]),
        )

        dist[i][j] = edge ? edge.weight : Number.POSITIVE_INFINITY
      }
    }
  }

  // DP state: dp[mask][i] = min distance to visit all bins in mask, ending at bin i
  const dp: number[][] = Array(1 << n)
    .fill(0)
    .map(() => Array(n).fill(Number.POSITIVE_INFINITY))
  const next: number[][] = Array(1 << n)
    .fill(0)
    .map(() => Array(n).fill(-1))

  // Base case: start at any bin
  for (let i = 0; i < n; i++) {
    dp[1 << i][i] = 0
  }

  // Fill DP table
  for (let mask = 1; mask < 1 << n; mask++) {
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) === 0) continue // Skip if bin i is not in mask

      const prevMask = mask & ~(1 << i) // Remove bin i from mask
      if (prevMask === 0) continue // Skip if bin i is the only one in mask

      for (let j = 0; j < n; j++) {
        if ((prevMask & (1 << j)) === 0) continue // Skip if bin j is not in prevMask

        if (dp[prevMask][j] + dist[j][i] < dp[mask][i]) {
          dp[mask][i] = dp[prevMask][j] + dist[j][i]
          next[mask][i] = j
        }
      }
    }
  }

  // Find optimal ending bin
  const endMask = (1 << n) - 1 // All bins visited
  let endBin = 0
  for (let i = 1; i < n; i++) {
    if (dp[endMask][i] < dp[endMask][endBin]) {
      endBin = i
    }
  }

  // Reconstruct path
  const path: number[] = []
  let currentMask = endMask
  let currentBin = endBin

  while (path.length < n) {
    path.unshift(binIds[currentBin])
    const nextBin = next[currentMask][currentBin]
    if (nextBin === -1) break

    currentMask = currentMask & ~(1 << currentBin)
    currentBin = nextBin
  }

  return path
}

// Generate truck routes considering capacity constraints and priorities
export function generateTruckRoutes(optimizedClusters: number[][], trucks: Truck[], highPriorityBins: Bin[]): Route[] {
  // Flatten all clusters into a single array of bin IDs
  let allBins = optimizedClusters.flat()

  // Ensure high priority bins are at the beginning
  const highPriorityBinIds = highPriorityBins.map((bin) => bin.id)

  // Remove high priority bins from the main array to avoid duplicates
  allBins = allBins.filter((binId) => !highPriorityBinIds.includes(binId))

  // Add high priority bins at the beginning
  allBins = [...highPriorityBinIds, ...allBins]

  // Generate routes for each truck
  const routes: Route[] = []
  let currentBinIndex = 0

  for (let i = 0; i < trucks.length && currentBinIndex < allBins.length; i++) {
    const truck = trucks[i]
    const route: Route = {
      truckId: truck.id,
      binSequence: [],
      totalDistance: 0,
      totalWasteCollected: 0,
    }

    let remainingCapacity = truck.capacity - truck.currentLoad

    // Assign bins to this truck until capacity is reached or no more bins
    while (currentBinIndex < allBins.length && remainingCapacity > 0) {
      const binId = allBins[currentBinIndex]

      // Simulate waste collection (assume 1% fill level = 1kg of waste)
      // In a real system, this would use actual bin data
      const wasteAmount = 1 // Simplified for demo

      if (wasteAmount <= remainingCapacity) {
        route.binSequence.push(binId)
        route.totalWasteCollected += wasteAmount
        remainingCapacity -= wasteAmount
        currentBinIndex++
      } else {
        // This bin would exceed capacity, move to next truck
        break
      }
    }

    // Calculate total distance for this route
    if (route.binSequence.length > 0) {
      // Simplified distance calculation for demo
      route.totalDistance = route.binSequence.length * 0.5 // Assume 0.5km between bins on average
      routes.push(route)
    }
  }

  return routes
}

// Predict bin fill levels for the next 24 hours
export function predictFillLevels(bins: Bin[]): { [key: number]: number } {
  const predictions: { [key: number]: number } = {}

  bins.forEach((bin) => {
    // Simple prediction model: increase by 15-25% based on current fill level
    const growthRate = 0.15 + (bin.fillLevel / 100) * 0.1
    const predictedLevel = Math.min(100, bin.fillLevel + bin.fillLevel * growthRate)
    predictions[bin.id] = predictedLevel
  })

  return predictions
}
