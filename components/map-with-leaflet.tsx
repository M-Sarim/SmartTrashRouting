"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.fullscreen/Control.FullScreen.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-minimap/dist/Control.MiniMap.min.css";
import "@/styles/map-animations.css";
import L, { Icon, DivIcon, Map as LeafletMap, LatLngBounds } from "leaflet";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { Bin, Route, Edge } from "@/lib/types";

// Import Leaflet plugins - these will be loaded dynamically on the client side
// to avoid SSR issues with Next.js

// Map click handler component
function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Map initialization handler component
function MapInitializer({
  onMapInit,
  setIsAnimating,
  setMapError,
}: {
  onMapInit: (map: LeafletMap) => void;
  setIsAnimating: (isAnimating: boolean) => void;
  setMapError: (error: string | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    try {
      if (map) {
        // Initialize the map
        onMapInit(map);

        // Add smooth animation when the map view changes
        const handleZoomStart = () => setIsAnimating(true);
        const handleZoomEnd = () => setIsAnimating(false);
        const handleMoveStart = () => setIsAnimating(true);
        const handleMoveEnd = () => setIsAnimating(false);

        map.on("zoomstart", handleZoomStart);
        map.on("zoomend", handleZoomEnd);
        map.on("movestart", handleMoveStart);
        map.on("moveend", handleMoveEnd);

        // Enable smooth animations
        map.options.zoomAnimation = true;
        map.options.markerZoomAnimation = true;
        map.options.fadeAnimation = true;

        // Handle map errors
        map.on("error", (e) => {
          console.error("Map error:", e);
          setMapError(`Map error: ${e.error?.message || "Unknown error"}`);
        });

        return () => {
          if (map) {
            map.off("zoomstart", handleZoomStart);
            map.off("zoomend", handleZoomEnd);
            map.off("movestart", handleMoveStart);
            map.off("moveend", handleMoveEnd);
            map.off("error");
          }
        };
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(
        `Error initializing map: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }, [map, onMapInit, setIsAnimating, setMapError]);

  return null;
}

// Custom component to add fullscreen control
function FullscreenControl() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let fullscreenControl: any = null;

    // Safely load the fullscreen control
    if (typeof window !== "undefined") {
      import("leaflet.fullscreen")
        .then((L) => {
          // @ts-ignore - Type definitions for the fullscreen control are not available
          fullscreenControl = new L.Control.Fullscreen({
            position: "topleft",
            title: {
              false: "View Fullscreen",
              true: "Exit Fullscreen",
            },
          });

          fullscreenControl.addTo(map);
        })
        .catch((error) => {
          console.warn("Error loading fullscreen control:", error);
        });
    }

    return () => {
      if (fullscreenControl && map) {
        map.removeControl(fullscreenControl);
      }
    };
  }, [map]);

  return null;
}

// Custom component to add search control
function SearchControl() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let geocoder: any = null;

    // Safely load the geocoder control
    if (typeof window !== "undefined") {
      import("leaflet-control-geocoder")
        .then((L) => {
          // @ts-ignore - Type definitions for the geocoder control are not available
          geocoder = L.Control.geocoder({
            defaultMarkGeocode: false,
            position: "topleft",
            placeholder: "Search for a location...",
            errorMessage: "Nothing found.",
            showResultIcons: true,
          }).on("markgeocode", function (e) {
            const { center, bbox } = e.geocode;
            map.fitBounds(bbox);

            // Add a temporary marker at the searched location
            const marker = L.marker(center).addTo(map);
            setTimeout(() => map.removeLayer(marker), 5000); // Remove marker after 5 seconds
          });

          geocoder.addTo(map);
        })
        .catch((error) => {
          console.warn("Error loading geocoder control:", error);
        });
    }

    return () => {
      if (geocoder && map) {
        map.removeControl(geocoder);
      }
    };
  }, [map]);

  return null;
}

// Custom component to add mini map
function MiniMapControl() {
  const map = useMap();
  const { theme } = useTheme();

  useEffect(() => {
    if (!map) return;

    let miniMap: any = null;

    // Safely load the mini map control
    if (typeof window !== "undefined") {
      // Choose tile layer based on theme
      const tileUrl =
        theme === "dark"
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      import("leaflet-minimap")
        .then((L) => {
          // Create a tile layer for the mini map
          const tileLayer = new L.TileLayer(tileUrl);

          // @ts-ignore - Type definitions for the mini map control are not available
          miniMap = new L.Control.MiniMap(tileLayer, {
            toggleDisplay: true,
            minimized: false,
            position: "bottomright",
            width: 150,
            height: 150,
            zoomLevelOffset: -5,
          });

          miniMap.addTo(map);
        })
        .catch((error) => {
          console.warn("Error loading mini map control:", error);
        });
    }

    return () => {
      if (miniMap && map) {
        map.removeControl(miniMap);
      }
    };
  }, [map, theme]);

  return null;
}

// Custom component for map legend
function MapLegend() {
  const { theme } = useTheme();

  return (
    <div
      className={`absolute z-[1000] bottom-5 left-5 p-3 rounded-md shadow-md ${
        theme === "dark" ? "bg-background/90" : "bg-background/90"
      } border border-border max-w-[250px]`}
    >
      <h3 className="font-semibold text-sm mb-2">Map Legend</h3>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-destructive"></div>
          <span>High Priority Bin (&gt;80% full)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-warning"></div>
          <span>Medium Priority Bin (50-80% full)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-success"></div>
          <span>Low Priority Bin (&lt;50% full)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-slate-500 border-dashed border-slate-400"></div>
          <span>MST Connections</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-primary"></div>
          <span>Optimized Routes</span>
        </div>
      </div>
    </div>
  );
}

interface MapComponentProps {
  bins: Bin[];
  routes: Route[];
  mst: Edge[];
  mapCenter: [number, number];
  selectedLocation: [number, number] | null;
  onMapClick: (lat: number, lng: number) => void;
  predictedFillLevels: { [key: number]: number };
}

export default function MapWithLeaflet({
  bins,
  routes,
  mst,
  mapCenter,
  selectedLocation,
  onMapClick,
  predictedFillLevels,
}: MapComponentProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Memoize bins to prevent unnecessary re-renders
  const memoizedBins = useMemo(
    () => bins,
    [
      // Use a more efficient way to check for changes
      bins.length,
      // Check a few key properties to detect changes
      bins.map((bin) => bin.id).join(","),
      bins.map((bin) => bin.fillLevel).join(","),
    ]
  );

  // Memoize routes to prevent unnecessary re-renders
  const memoizedRoutes = useMemo(
    () => routes,
    [
      routes.length,
      // Check key properties
      routes.map((route) => route.id).join(","),
      routes.map((route) => route.binSequence.join(",")).join("|"),
    ]
  );

  // Memoize MST to prevent unnecessary re-renders
  const memoizedMST = useMemo(
    () => mst,
    [
      mst.length,
      // Check key properties
      mst.map((edge) => `${edge.source}-${edge.target}`).join(","),
    ]
  );

  // Fix for Leaflet icon in Next.js
  const selectedLocationIcon = new Icon({
    iconUrl: "/selected-location-marker.svg",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });

  // Custom bin icons based on fill level
  const highPriorityIcon = new Icon({
    iconUrl: "/high-priority-marker.svg",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });

  const mediumPriorityIcon = new Icon({
    iconUrl: "/medium-priority-marker.svg",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });

  const lowPriorityIcon = new Icon({
    iconUrl: "/low-priority-marker.svg",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });

  // Function to get the appropriate icon based on bin fill level
  const getBinIcon = (fillLevel: number) => {
    if (fillLevel > 80) return highPriorityIcon;
    if (fillLevel > 50) return mediumPriorityIcon;
    return lowPriorityIcon;
  };

  // Function to handle map initialization
  const handleMapInit = useCallback((map: LeafletMap) => {
    mapRef.current = map;
    setIsMapLoaded(true);
  }, []);

  // Function to fit all bins in the map view
  const fitAllBinsInView = useCallback(() => {
    if (!mapRef.current || memoizedBins.length === 0) return;

    try {
      // Create bounds from all bin locations
      const bounds = memoizedBins.reduce((bounds, bin) => {
        return bounds.extend(bin.location);
      }, new LatLngBounds(memoizedBins[0].location, memoizedBins[0].location));

      // Fit the map to the bounds with some padding
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    } catch (error) {
      console.error("Error fitting bins in view:", error);
    }
  }, [memoizedBins]);

  // Avoid hydration mismatch and load Leaflet plugins on client-side only
  useEffect(() => {
    setMounted(true);

    // Dynamically import Leaflet plugins on the client side
    if (typeof window !== "undefined") {
      // Use a more robust approach to load plugins
      Promise.all([
        import("leaflet.fullscreen"),
        import("leaflet-control-geocoder"),
        import("leaflet-minimap"),
      ]).catch((error) => {
        console.error("Error loading Leaflet plugins:", error);
        setMapError(
          "Failed to load map plugins. Some features may not work correctly."
        );
      });
    }
  }, []);

  // Auto-fit bins in view when they change and map is loaded
  useEffect(() => {
    if (isMapLoaded && memoizedBins.length > 0) {
      // Add a small delay to ensure the map is fully loaded
      const timer = setTimeout(() => {
        fitAllBinsInView();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isMapLoaded, memoizedBins, fitAllBinsInView]);

  if (!mounted) return null;

  // Choose tile layer based on theme
  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution =
    theme === "dark"
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="relative w-full">
      <div className="h-[700px] w-full max-w-[100vw] rounded-md overflow-hidden border border-primary/20 shadow-lg relative">
        {/* Map controls overlay */}
        {isMapLoaded && memoizedBins.length > 0 && (
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <button
              className="p-2 bg-background/90 hover:bg-background rounded-md shadow-md border border-border flex items-center justify-center transition-colors"
              onClick={fitAllBinsInView}
              title="Fit all bins in view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M15 3h6v6"></path>
                <path d="M9 21H3v-6"></path>
                <path d="M21 3l-7 7"></path>
                <path d="M3 21l7-7"></path>
              </svg>
            </button>
          </div>
        )}

        {!isMapLoaded && mounted && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-50">
            <div className="flex flex-col items-center gap-3 max-w-md p-4 text-center">
              <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-destructive"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <p className="text-destructive font-semibold">Map Error</p>
              <p className="text-sm text-muted-foreground">{mapError}</p>
              <button
                className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        )}
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          className={isAnimating ? "leaflet-map-animated" : ""}
        >
          {/* Map initializer component to handle map setup */}
          <MapInitializer
            onMapInit={handleMapInit}
            setIsAnimating={setIsAnimating}
            setMapError={setMapError}
          />

          <TileLayer url={tileUrl} attribution={attribution} />

          {/* Add map controls */}
          <ZoomControl position="topleft" />
          <FullscreenControl />
          <SearchControl />
          <MiniMapControl />

          <MapClickHandler onMapClick={onMapClick} />

          {/* Add map legend */}
          <MapLegend />

          {/* Show bins with appropriate icons and animations */}
          {memoizedBins.map((bin) => (
            <Marker
              key={bin.id}
              position={bin.location}
              icon={getBinIcon(bin.fillLevel)}
              // Add animation class for new bins
              className="bin-marker-animation"
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-primary dark:text-primary">
                    Bin #{bin.id}
                  </h3>
                  <div
                    className={`mt-2 p-2 rounded-md ${
                      bin.fillLevel > 80
                        ? "bg-destructive/20 text-destructive-foreground"
                        : bin.fillLevel > 50
                        ? "bg-warning/20 text-warning-foreground"
                        : "bg-success/20 text-success-foreground"
                    }`}
                  >
                    <p className="font-semibold">
                      Fill Level: {bin.fillLevel}%
                    </p>
                  </div>
                  <p className="mt-2">Capacity: {bin.capacity} kg</p>
                  <p>
                    Priority:{" "}
                    {bin.fillLevel > 80
                      ? "High"
                      : bin.fillLevel > 50
                      ? "Medium"
                      : "Low"}
                  </p>

                  {predictedFillLevels[bin.id] && (
                    <div className="mt-3 p-2 bg-primary/10 rounded-md">
                      <p className="text-primary dark:text-primary font-semibold">
                        Predicted: {predictedFillLevels[bin.id].toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Show MST edges */}
          {memoizedMST.map((edge, idx) => {
            const sourceBin = memoizedBins.find((b) => b.id === edge.source);
            const targetBin = memoizedBins.find((b) => b.id === edge.target);
            if (sourceBin && targetBin) {
              return (
                <Polyline
                  key={`mst-${idx}`}
                  positions={[sourceBin.location, targetBin.location]}
                  color={theme === "dark" ? "#64748b" : "#94a3b8"}
                  weight={2}
                  dashArray="5,10"
                  opacity={0.7}
                  className="mst-line-animation"
                />
              );
            }
            return null;
          })}

          {/* Show routes */}
          {memoizedRoutes.map((route, idx) => {
            const positions = route.binSequence
              .map((binId) => {
                const bin = memoizedBins.find((b) => b.id === binId);
                return bin ? bin.location : [0, 0];
              })
              .filter((pos) => pos[0] !== 0 || pos[1] !== 0);

            // Generate a color based on the primary color with slight variations
            const hue = 173 + ((idx * 20) % 40) - 20; // Vary around the primary hue (173)
            const saturation = 70 + ((idx * 10) % 20); // Vary saturation
            const lightness = 45 + ((idx * 5) % 20); // Vary lightness

            return (
              <Polyline
                key={`route-${idx}`}
                positions={positions}
                color={`hsl(${hue}, ${saturation}%, ${lightness}%)`}
                weight={4}
                opacity={0.8}
                className="route-path-animation"
              />
            );
          })}

          {/* Show selected location */}
          {selectedLocation && (
            <Marker
              position={selectedLocation}
              icon={selectedLocationIcon}
              className="selected-location-animation"
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-primary dark:text-primary">
                    Selected Location
                  </h3>
                  <p>Latitude: {selectedLocation[0].toFixed(6)}</p>
                  <p>Longitude: {selectedLocation[1].toFixed(6)}</p>
                  <p className="text-sm text-muted-foreground mt-2 bg-secondary/50 p-2 rounded-md">
                    Fill in the form to add a bin here
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Map instructions */}
      <div className="mt-4 p-4 bg-muted rounded-md text-sm">
        <h3 className="font-semibold mb-2">Map Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold mb-2 text-muted-foreground">
              Map Navigation
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Click anywhere on the map to select a location for a new bin
              </li>
              <li>
                Use the mouse wheel to zoom in/out and drag to pan the map
              </li>
              <li>
                Click the expand button in the top-right to fit all bins in view
              </li>
              <li>Use the fullscreen button to maximize the map</li>
              <li>Use the search box to find specific locations</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold mb-2 text-muted-foreground">
              Map Elements
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Red markers indicate high priority bins (&gt;80% fill level)
              </li>
              <li>
                Yellow markers indicate medium priority bins (50-80% fill level)
              </li>
              <li>
                Green markers indicate low priority bins (&lt;50% fill level)
              </li>
              <li>
                Gray dashed lines represent the Minimum Spanning Tree (MST)
                connections
              </li>
              <li>
                Colored solid lines represent optimized routes for each truck
              </li>
              <li>
                The mini-map in the bottom-right provides context for your
                current view
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
