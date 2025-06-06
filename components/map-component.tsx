"use client"
import dynamic from "next/dynamic"
import type { Bin, Route, Edge } from "@/lib/types"

// Dynamically import Leaflet components with SSR disabled
const MapWithNoSSR = dynamic(() => import("./map-with-leaflet").then((mod) => mod.default), { ssr: false })

interface MapComponentProps {
  bins: Bin[]
  routes: Route[]
  mst: Edge[]
  mapCenter: [number, number]
  selectedLocation: [number, number] | null
  onMapClick: (lat: number, lng: number) => void
  predictedFillLevels: { [key: string]: number }
}

export default function MapComponent(props: MapComponentProps) {
  return <MapWithNoSSR {...props} />
}
