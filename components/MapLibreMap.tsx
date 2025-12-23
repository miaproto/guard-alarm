
import React, { useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, ScaleControl, FullscreenControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface MapMarker {
  id: string;
  coordinates: { lat: number; lng: number };
  element: React.ReactNode;
  onClick?: () => void;
}

interface MapLibreMapProps {
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  interactive?: boolean;
  onLoad?: () => void;
}

// Default center: Yerevan, Armenia
const DEFAULT_CENTER = { lat: 40.1792, lng: 44.4991 };
const DEFAULT_ZOOM = 12;

const MapLibreMap = ({ 
  markers = [], 
  center = DEFAULT_CENTER, 
  zoom = DEFAULT_ZOOM, 
  height = '100%',
  interactive = true,
  onLoad
}: MapLibreMapProps) => {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    // Fit bounds when markers change
    if (markers.length > 0 && mapRef.current) {
      const bounds = markers.reduce((acc, marker) => {
        return {
          minLat: Math.min(acc.minLat, marker.coordinates.lat),
          maxLat: Math.max(acc.maxLat, marker.coordinates.lat),
          minLng: Math.min(acc.minLng, marker.coordinates.lng),
          maxLng: Math.max(acc.maxLng, marker.coordinates.lng)
        };
      }, {
        minLat: markers[0].coordinates.lat,
        maxLat: markers[0].coordinates.lat,
        minLng: markers[0].coordinates.lng,
        maxLng: markers[0].coordinates.lng
      });

      // Only fit if we have meaningful bounds
      if (markers.length > 1) {
        mapRef.current.fitBounds(
          [[bounds.minLng, bounds.minLat], [bounds.maxLng, bounds.maxLat]],
          { padding: 100, duration: 1000 }
        );
      }
    }
  }, [markers]);

  return (
    <div style={{ height, width: '100%' }}>
      <Map
        ref={mapRef}
        mapLib={import('maplibre-gl')}
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: zoom
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        interactive={interactive}
        onLoad={onLoad}
      >
        {/* Controls */}
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-right" />
        <FullscreenControl position="top-right" />

        {/* Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            longitude={marker.coordinates.lng}
            latitude={marker.coordinates.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              marker.onClick?.();
            }}
          >
            {marker.element}
          </Marker>
        ))}
      </Map>
    </div>
  );
};

export default MapLibreMap;

