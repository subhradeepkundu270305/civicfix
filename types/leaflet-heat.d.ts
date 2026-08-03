// Minimal type declaration for leaflet.heat
// @types/leaflet.heat does not exist on DefinitelyTyped.
// This suppresses the implicit-any error and augments L.heatLayer.
declare module 'leaflet.heat' {
  // importing this module registers L.heatLayer as a side effect
}

import * as L from 'leaflet';

declare module 'leaflet' {
  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: {
      minOpacity?: number;
      maxZoom?: number;
      max?: number;
      radius?: number;
      blur?: number;
      gradient?: Record<number, string>;
    }
  ): L.Layer;
}
