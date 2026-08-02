'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';

interface IssueMapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  editable?: boolean;
}

export default function IssueMap({ latitude, longitude, onLocationChange }: IssueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [initialized, setInitialized] = useState(false);

  const DEFAULT_LAT = 28.6139;
  const DEFAULT_LNG = 77.209;

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || initialized) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const startLat = latitude || DEFAULT_LAT;
      const startLng = longitude || DEFAULT_LNG;

      const map = L.map(mapRef.current!).setView([startLat, startLng], 14);
      leafletMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([startLat, startLng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        const address = await reverseGeocode(pos.lat, pos.lng);
        onLocationChange(pos.lat, pos.lng, address);
      });

      map.on('click', async (e: unknown) => {
        const event = e as { latlng: { lat: number; lng: number } };
        marker.setLatLng([event.latlng.lat, event.latlng.lng]);
        const address = await reverseGeocode(event.latlng.lat, event.latlng.lng);
        onLocationChange(event.latlng.lat, event.latlng.lng, address);
      });

      setInitialized(true);
    };

    initMap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker position when props change
  useEffect(() => {
    if (!initialized || !markerRef.current || !latitude || !longitude) return;
    const L_marker = markerRef.current as { setLatLng: (pos: [number, number]) => void };
    const L_map = leafletMapRef.current as { setView: (pos: [number, number], zoom: number) => void };
    L_marker.setLatLng([latitude, longitude]);
    L_map.setView([latitude, longitude], 15);
  }, [latitude, longitude, initialized]);

  const handleGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const address = await reverseGeocode(lat, lng);
        onLocationChange(lat, lng, address);
        setGpsLoading(false);
      },
      (err) => {
        setGpsError('Could not get your location. Please pin manually.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      {/* GPS Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <MapPin className="inline w-3.5 h-3.5 mr-1" />
          Click on the map or drag the pin to set location
        </p>
        <button
          type="button"
          onClick={handleGps}
          disabled={gpsLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm disabled:opacity-60"
        >
          {gpsLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          {gpsLoading ? 'Locating…' : 'Use My Location'}
        </button>
      </div>

      {gpsError && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{gpsError}</p>
      )}

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full h-64 rounded-xl border border-slate-200 overflow-hidden shadow-sm"
        style={{ zIndex: 0 }}
      />

      {latitude && longitude && (
        <p className="text-xs text-slate-500 text-right">
          📍 {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </p>
      )}
    </div>
  );
}
