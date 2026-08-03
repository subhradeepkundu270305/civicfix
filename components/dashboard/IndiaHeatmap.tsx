'use client';

import { useEffect, useRef, useState } from 'react';
import { heatmapDummyData } from '@/data/heatmapDummyData';

export default function IndiaHeatmap() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef     = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [tapActive, setTapActive] = useState(false);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const heatLayerRef   = useRef<import('leaflet').Layer | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current || mapInstanceRef.current) return;

    let map: import('leaflet').Map;
    let ro: ResizeObserver | null = null;
    let cleanup = () => {};

    (async () => {
      const L = (await import('leaflet')).default;
      // CRITICAL: Import Leaflet CSS so the map container expands to full width/height & tiles align correctly
      await import('leaflet/dist/leaflet.css');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — leaflet.heat has no @types package; side-effect import registers L.heatLayer
      await import('leaflet.heat');

      // Fix default icon paths for Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      map = L.map(mapRef.current!, {
        center:          [22.9734, 78.6569],
        zoom:            4,
        zoomControl:     false,   // added manually at bottom-right
        scrollWheelZoom: true,
        maxBounds:       L.latLngBounds(L.latLng(6, 60), L.latLng(40, 102)),
        minZoom:         3,
        maxZoom:         12,
      });

      // Zoom control at bottom-right — avoids overlap with header on small screens
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://carto.com/">CARTO</a>',
        subdomains:  'abcd',
        maxZoom:     19,
      }).addTo(map);

      mapInstanceRef.current = map;

      const points = heatmapDummyData.map(
        (p) => [p.lat, p.lng, p.intensity] as [number, number, number]
      );

      const makeHeatLayer = (zoom: number) => {
        if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);
        const isZoomedIn = zoom >= 6;
        const layer = L.heatLayer(points, {
          radius: isZoomedIn ? 20 : 35, blur: isZoomedIn ? 18 : 28,
          maxZoom: 12, max: 1.0, minOpacity: 0.3,
          gradient: {
            0.0: '#0c1445', 0.3: '#1e3a8a', 0.5: '#4338CA',
            0.7: '#6366F1', 0.85: '#A78BFA', 1.0: '#F9A8D4',
          },
        });
        layer.addTo(map);
        heatLayerRef.current = layer;
      };

      makeHeatLayer(map.getZoom());
      map.on('zoomend', () => makeHeatLayer(map.getZoom()));

      // ── Resize handling to ensure map fills container properly ───────────
      const invalidate = () => {
        try {
          if (map) {
            map.invalidateSize({ animate: false });
          }
        } catch { /* ignore */ }
      };

      // Invalidate immediately and after timeouts to allow flex/grid to settle
      invalidate();
      setTimeout(invalidate, 100);
      setTimeout(invalidate, 400);

      window.addEventListener('resize',            invalidate, { passive: true });
      window.addEventListener('orientationchange', invalidate, { passive: true });

      if (typeof ResizeObserver !== 'undefined' && wrapperRef.current) {
        ro = new ResizeObserver(invalidate);
        ro.observe(wrapperRef.current);
      }

      cleanup = () => {
        window.removeEventListener('resize',            invalidate);
        window.removeEventListener('orientationchange', invalidate);
        ro?.disconnect();
        map.remove();
        mapInstanceRef.current = null;
        heatLayerRef.current   = null;
      };
    })();

    return () => cleanup();
  }, [mounted]);

  return (
    <div
      ref={wrapperRef}
      className="w-full max-w-full overflow-hidden rounded-[18px] border border-[rgba(148,163,184,0.12)] bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-4 border-b border-[rgba(148,163,184,0.08)]">
        <div>
          <h3 className="font-bold text-slate-200 text-sm">Issue Density — India</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Illustrative data · zoom to explore regions
          </p>
        </div>
        {/* Gradient legend */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-500">Low</span>
          <div className="w-20 sm:w-24 h-3 rounded-full"
               style={{ background: 'linear-gradient(to right, #1e3a8a, #6366F1, #A78BFA, #F9A8D4)' }} />
          <span className="text-[10px] text-slate-500">High</span>
        </div>
      </div>

      {/* Map + tap-to-activate overlay */}
      <div className="relative w-full max-w-full">
        {/* Responsive height: h-[300px] mobile -> h-[420px] md -> h-[480px] lg */}
        <div
          ref={mapRef}
          className="w-full max-w-full h-[300px] md:h-[420px] lg:h-[480px] relative z-0"
        />

        {/* Tap-to-activate overlay — mobile only, prevents map from trapping page scroll */}
        {!tapActive && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-[rgba(9,13,22,0.6)] cursor-pointer select-none sm:hidden z-10"
            onClick={() => setTapActive(true)}
            aria-label="Tap to interact with map"
          >
            <div className="flex flex-col items-center gap-2.5 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-[rgba(99,102,241,0.2)] border border-[rgba(99,102,241,0.4)] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 20.25l.75-3m0 0L12 9.75m-2.25 7.5L12 9.75m0 0l2.25 7.5M12 9.75V3" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-300">Tap to explore map</p>
              <p className="text-[10px] text-slate-500">Scroll past to continue</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
