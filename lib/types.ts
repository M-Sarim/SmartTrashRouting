// Type definitions for the Smart Trash Truck Routing System

// Represents a trash bin in the city
export interface Bin {
  id: number
  location: [number, number] // [latitude, longitude]
  fillLevel: number // 0-100%
  capacity: number // in kg
}

// Represents a trash collection truck
export interface Truck {
  id: number
  capacity: number // in kg
  currentLoad: number // in kg
}

// Represents an edge in the graph (road between bins)
export interface Edge {
  source: number // bin id
  target: number // bin id
  weight: number // distance or travel time
}

// Represents a cluster of bins
export interface Cluster {
  bins: number[] // bin ids
  density: number // measure of cluster density
}

// Represents a route for a truck
export interface Route {
  truckId: number
  binSequence: number[] // sequence of bin ids to visit
  totalDistance: number // total distance in km
  totalWasteCollected: number // total waste collected in kg
}

// Represents a record of route optimization
export interface OptimizationRecord {
  timestamp: Date
  totalDistance: number
  totalWaste: number
  routeCount: number
  highPriorityBins: number
}

// Graph representation of the city
export interface Graph {
  nodes: number[] // bin ids
  edges: Edge[]
}

// Disjoint Set data structure for Kruskal's algorithm
export class DisjointSet {
  private parent: Map<number, number>
  private rank: Map<number, number>

  constructor() {
    this.parent = new Map()
    this.rank = new Map()
  }

  makeSet(x: number): void {
    this.parent.set(x, x)
    this.rank.set(x, 0)
  }

  find(x: number): number {
    if (this.parent.get(x) !== x) {
      this.parent.set(x, this.find(this.parent.get(x)!))
    }
    return this.parent.get(x)!
  }

  union(x: number, y: number): void {
    const rootX = this.find(x)
    const rootY = this.find(y)

    if (rootX === rootY) return

    if (this.rank.get(rootX)! < this.rank.get(rootY)!) {
      this.parent.set(rootX, rootY)
    } else if (this.rank.get(rootX)! > this.rank.get(rootY)!) {
      this.parent.set(rootY, rootX)
    } else {
      this.parent.set(rootY, rootX)
      this.rank.set(rootX, this.rank.get(rootX)! + 1)
    }
  }
}
