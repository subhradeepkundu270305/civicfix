'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, X, Siren, Shield, AlertTriangle, Navigation, Loader2, MapPin
} from 'lucide-react';

interface Station {
  name: string;
  type: 'police' | 'fire';
  lat: number;
  lng: number;
  distance: string;
  phone: string;
}

function generateNearbyStations(lat: number, lng: number): Station[] {
  const offsets = [
    { dlat: 0.018,  dlng: 0.012,  km: '2.1' },
    { dlat: -0.025, dlng: 0.019,  km: '3.5' },
    { dlat: 0.012,  dlng: -0.031, km: '2.8' },
    { dlat: -0.009, dlng: -0.015, km: '1.6' },
    { dlat: 0.033,  dlng: -0.022, km: '4.2' },
    { dlat: -0.041, dlng: 0.008,  km: '4.9' },
  ];

  const policeNames = ['Connaught Place PS', 'Karol Bagh PS', 'Rajouri Garden PS'];
  const fireNames   = ['Central Fire Station', 'Daryaganj FS', 'Lajpat Nagar FS'];

  return [
    { name: policeNames[0], type: 'police', lat: lat + offsets[0].dlat, lng: lng + offsets[0].dlng, distance: offsets[0].km + ' km', phone: '100' },
    { name: policeNames[1], type: 'police', lat: lat + offsets[1].dlat, lng: lng + offsets[1].dlng, distance: offsets[1].km + ' km', phone: '100' },
    { name: policeNames[2], type: 'police', lat: lat + offsets[2].dlat, lng: lng + offsets[2].dlng, distance: offsets[2].km + ' km', phone: '100' },
    { name: fireNames[0],   type: 'fire',   lat: lat + offsets[3].dlat, lng: lng + offsets[3].dlng, distance: offsets[3].km + ' km', phone: '101' },
    { name: fireNames[1],   type: 'fire',   lat: lat + offsets[4].dlat, lng: lng + offsets[4].dlng, distance: offsets[4].km + ' km', phone: '101' },
    { name: fireNames[2],   type: 'fire',   lat: lat + offsets[5].dlat, lng: lng + offsets[5].dlng, distance: offsets[5].km + ' km', phone: '101' },
  ];
}

export default function EmergencyConnect() {
  const [open, setOpen] = useState(false);
  const [userLat, setUserLat] = useState(28.6139);
  const [userLng, setUserLng] = useState(77.209);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);
  const mapInitRef = useRef(false);

  const stations = generateNearbyStations(userLat, userLng);

  // Locate user once when modal opens
  useEffect(() => {
    if (!open) return;
    setLocating(true);
    setLocError('');
    if (!navigator.geolocation) {
      setLocating(false);
      setLocError('Geolocation not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocError('Could not get location. Showing Delhi HQ.');
      },
      { timeout: 8000 }
    );
  }, [open]);

  // Build/rebuild map whenever coords change and modal is open
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    let destroyed = false;
    const initMap = async () => {
      if (!mapRef.current) return;

      // Tear down previous instance
      if (leafletMapRef.current) {
        (leafletMapRef.current as { remove: () => void }).remove();
        leafletMapRef.current = null;
        mapInitRef.current = false;
      }

      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (destroyed || !mapRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [userLat, userLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // User marker (blue)
      const userIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#6366F1;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(99,102,241,0.7);"></div>`,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup('📍 <b>Your Location</b>')
        .openPopup();

      // Station markers
      const stns = generateNearbyStations(userLat, userLng);
      stns.forEach((stn) => {
        const isPolice = stn.type === 'police';
        const color = isPolice ? '#3B82F6' : '#F97316';
        const emoji = isPolice ? '🚓' : '🚒';
        const icon = L.divIcon({
          html: `<div style="
            width:34px;height:34px;display:flex;align-items:center;justify-content:center;
            background:${color}22;border:2px solid ${color};border-radius:50%;font-size:15px;
            box-shadow:0 0 10px ${color}55;
          ">${emoji}</div>`,
          className: '',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });
        L.marker([stn.lat, stn.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${emoji} ${stn.name}</b><br/>📞 <b>${stn.phone}</b><br/>${stn.distance} away`);
      });

      leafletMapRef.current = map;
      mapInitRef.current = true;
    };

    // Small delay so DOM element is ready after AnimatePresence
    const t = setTimeout(initMap, 320);
    return () => {
      destroyed = true;
      clearTimeout(t);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userLat, userLng]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        (leafletMapRef.current as { remove: () => void }).remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (leafletMapRef.current) {
      (leafletMapRef.current as { remove: () => void }).remove();
      leafletMapRef.current = null;
      mapInitRef.current = false;
    }
  };

  return (
    <>
      {/* ── Floating SOS Button ── */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl text-white font-bold text-sm shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
          boxShadow: '0 0 24px rgba(244,63,94,0.50), 0 4px 16px rgba(0,0,0,0.5)',
          animation: 'sos-pulse 2.2s ease-in-out infinite',
        }}
        aria-label="Emergency Connect"
      >
        <Siren className="w-4 h-4" />
        <span>SOS</span>
        <span className="hidden sm:inline">Emergency</span>
      </motion.button>

      {/* ── Modal ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sos-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Centering wrapper — static, no animation, just flex centering */}
            <div
              key="sos-wrapper"
              className="fixed inset-0 z-50 flex items-center justify-center px-3 pointer-events-none"
            >
              {/* Animated Panel — only scale/opacity/y, no translate */}
              <motion.div
                key="sos-panel"
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                className="w-full max-h-[90vh] overflow-y-auto rounded-2xl pointer-events-auto"
                style={{
                  maxWidth: '540px',
                  background: 'rgba(9,13,22,0.97)',
                  border: '1px solid rgba(244,63,94,0.25)',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(244,63,94,0.10)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b sticky top-0"
                style={{ borderColor: 'rgba(244,63,94,0.20)', background: 'rgba(9,4,8,0.98)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.35)' }}
                  >
                    <Siren className="w-5 h-5" style={{ color: '#F43F5E' }} />
                  </div>
                  <div>
                    <h2 className="text-white font-extrabold text-base leading-tight">Emergency Connect</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Instant dial — nearest stations map</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={handleClose}
                  className="p-2 rounded-xl transition-all hover:bg-white/5"
                  style={{ color: '#64748B' }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="px-4 py-4 space-y-4">

                {/* Warning Banner */}
                <div
                  className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs leading-relaxed"
                  style={{
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    color: '#FCD34D',
                  }}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F59E0B' }} />
                  <span>
                    <b>For severe public infrastructure emergencies only</b> — live wires, road cave-ins, structural collapse, or active fires.
                    False or prank calls are <b>punishable under IPC § 505.</b>
                  </span>
                </div>

                {/* Quick Dial Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Police */}
                  <a href="tel:100" className="block">
                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className="flex flex-col items-center justify-center gap-2 py-5 px-3 rounded-2xl cursor-pointer text-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(79,70,229,0.12))',
                        border: '1px solid rgba(59,130,246,0.35)',
                        boxShadow: '0 0 20px rgba(59,130,246,0.15)',
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ background: 'rgba(59,130,246,0.18)' }}
                      >
                        🚓
                      </div>
                      <div>
                        <p className="text-white font-extrabold text-lg leading-none">100</p>
                        <p className="text-xs mt-0.5 font-semibold" style={{ color: '#60A5FA' }}>Police</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: 'rgba(59,130,246,0.20)', color: '#93C5FD' }}>
                        <Phone className="w-3 h-3" /> Tap to Call
                      </div>
                    </motion.div>
                  </a>

                  {/* Fire Brigade */}
                  <a href="tel:101" className="block">
                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className="flex flex-col items-center justify-center gap-2 py-5 px-3 rounded-2xl cursor-pointer text-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(244,63,94,0.12))',
                        border: '1px solid rgba(249,115,22,0.40)',
                        boxShadow: '0 0 20px rgba(249,115,22,0.15)',
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ background: 'rgba(249,115,22,0.18)' }}
                      >
                        🚒
                      </div>
                      <div>
                        <p className="text-white font-extrabold text-lg leading-none">101</p>
                        <p className="text-xs mt-0.5 font-semibold" style={{ color: '#FB923C' }}>Fire Brigade</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: 'rgba(249,115,22,0.20)', color: '#FCA5A5' }}>
                        <Phone className="w-3 h-3" /> Tap to Call
                      </div>
                    </motion.div>
                  </a>
                </div>

                {/* Secondary numbers */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Ambulance', num: '102', emoji: '🚑' },
                    { label: 'Disaster', num: '108', emoji: '🆘' },
                    { label: 'Women Safety', num: '1091', emoji: '👮‍♀️' },
                  ].map((s) => (
                    <a key={s.num} href={`tel:${s.num}`} className="block">
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-center"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <span className="text-xl">{s.emoji}</span>
                        <p className="text-white font-bold text-sm leading-none">{s.num}</p>
                        <p className="text-xs" style={{ color: '#64748B' }}>{s.label}</p>
                      </motion.div>
                    </a>
                  ))}
                </div>

                {/* Nearest Stations */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#6366F1' }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#818CF8' }}>Nearest Stations</span>
                    {locating && <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" style={{ color: '#6366F1' }} />}
                    {locError && <span className="text-xs truncate" style={{ color: '#F59E0B' }}>⚠ {locError}</span>}
                  </div>
                  <div className="space-y-1.5">
                    {stations.map((stn, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                        style={{
                          background: stn.type === 'police' ? 'rgba(59,130,246,0.07)' : 'rgba(249,115,22,0.07)',
                          border: `1px solid ${stn.type === 'police' ? 'rgba(59,130,246,0.20)' : 'rgba(249,115,22,0.20)'}`,
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{stn.type === 'police' ? '🚓' : '🚒'}</span>
                          <div className="min-w-0">
                            <p className="text-white text-xs font-semibold leading-tight truncate">{stn.name}</p>
                            <p className="text-xs" style={{ color: '#64748B' }}>{stn.distance} away</p>
                          </div>
                        </div>
                        <a href={`tel:${stn.phone}`} className="shrink-0 ml-2">
                          <motion.div
                            whileTap={{ scale: 0.92 }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold"
                            style={{
                              background: stn.type === 'police' ? 'rgba(59,130,246,0.18)' : 'rgba(249,115,22,0.18)',
                              color: stn.type === 'police' ? '#60A5FA' : '#FB923C',
                            }}
                          >
                            <Phone className="w-3 h-3" />
                            {stn.phone}
                          </motion.div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Map */}
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Navigation className="w-3.5 h-3.5 shrink-0" style={{ color: '#6366F1' }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#818CF8' }}>Live Location Map</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      <span className="text-xs" style={{ color: '#64748B' }}>You</span>
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full ml-2" />
                      <span className="text-xs" style={{ color: '#64748B' }}>Fire</span>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-2" />
                      <span className="text-xs" style={{ color: '#64748B' }}>Police</span>
                    </div>
                  </div>
                  <div
                    ref={mapRef}
                    className="w-full rounded-xl overflow-hidden"
                    style={{ height: '200px', border: '1px solid rgba(99,102,241,0.20)', background: '#111827' }}
                  >
                    {locating && (
                      <div className="w-full h-full flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#6366F1' }} />
                        <span className="text-xs" style={{ color: '#64748B' }}>Locating…</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Safety Tip */}
                <div
                  className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
                  style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', color: '#94A3B8' }}
                >
                  <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#818CF8' }} />
                  <span>Stay calm. Share your exact location, describe the hazard clearly, and follow the operator&apos;s instructions until help arrives.</span>
                </div>

              </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes sos-pulse {
          0%, 100% { box-shadow: 0 0 24px rgba(244,63,94,0.50), 0 4px 16px rgba(0,0,0,0.5); }
          50%       { box-shadow: 0 0 40px rgba(244,63,94,0.75), 0 4px 24px rgba(0,0,0,0.6); }
        }
      `}</style>
    </>
  );
}
