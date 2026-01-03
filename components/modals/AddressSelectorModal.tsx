
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';
import { Coordinates } from '../../types';
import MapLibreMap from '../MapLibreMap';

const AddressSelectorModal = ({ 
    isOpen, 
    onClose, 
    onSelect,
    initialCoords,
    initialAddress,
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSelect: (coords: Coordinates, address: string) => void;
    initialCoords?: Coordinates;
    initialAddress?: string;
  }) => {
    if (!isOpen) return null;

    const [selectedCoords, setSelectedCoords] = useState<Coordinates | null>(initialCoords ?? null);
    const [selectedAddress, setSelectedAddress] = useState<string>(initialAddress ?? '');
    const [isResolving, setIsResolving] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
      setSelectedCoords(initialCoords ?? null);
      setSelectedAddress(initialAddress ?? '');
    }, [initialCoords?.lat, initialCoords?.lng, initialAddress, isOpen]);

    const resolveAddress = useCallback(async (coords: Coordinates) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsResolving(true);
      try {
        const params = new URLSearchParams({
          format: 'jsonv2',
          lat: String(coords.lat),
          lon: String(coords.lng),
          zoom: '18',
          addressdetails: '1',
          'accept-language': 'hy',
        });

        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });
        if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`);
        const data = (await res.json()) as { display_name?: string };
        return data.display_name?.trim() || '';
      } catch {
        return '';
      } finally {
        setIsResolving(false);
      }
    }, []);

    const handleMapClick = useCallback(
      async (coords: Coordinates) => {
        setSelectedCoords(coords);
        const label = await resolveAddress(coords);
        setSelectedAddress(label || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
      },
      [resolveAddress],
    );

    const markers = useMemo(() => {
      if (!selectedCoords) return [];
      return [
        {
          id: 'selected',
          coordinates: selectedCoords,
          element: (
            <div className="relative">
              <div className="absolute -inset-5 bg-blue-500/15 rounded-full"></div>
              <div className="relative z-10 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>
          ),
        },
      ];
    }, [selectedCoords]);
  
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-3xl h-[70vh] rounded-2xl border border-gray-200 flex flex-col shadow-2xl overflow-hidden relative">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
             <h3 className="text-lg font-bold text-gray-900">Նշեք հասցեն քարտեզի վրա</h3>
             <button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button>
          </div>
          <div className="flex-1 bg-gray-100 relative">
            <MapLibreMap
              markers={markers}
              center={selectedCoords ?? { lat: 40.1792, lng: 44.4991 }}
              zoom={selectedCoords ? 16 : 12}
              height="100%"
              autoFitBounds={false}
              onMapClick={handleMapClick}
            />

            {!selectedCoords ? (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="bg-white/80 border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                  Սեղմեք քարտեզին՝ հասցեն ընտրելու համար
                </div>
              </div>
            ) : null}

            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-xl p-3 shadow-lg flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500 font-medium mb-1">Ընտրված հասցե</div>
                  <div className="text-sm text-gray-900 font-semibold leading-snug break-words">
                    {selectedAddress || `${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 font-mono">
                    {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
                  </div>
                </div>

                {isResolving ? (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Loader2 className="w-4 h-4 animate-spin" /> որոնում...
                  </div>
                ) : null}

                <div className="shrink-0 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedCoords) return;
                      onSelect(selectedCoords, selectedAddress || `${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`);
                      onClose();
                    }}
                    disabled={!selectedCoords}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ընտրել
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCoords(null);
                      setSelectedAddress('');
                    }}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
                  >
                    Մաքրել
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default AddressSelectorModal;
