// TODO: replace with real aggregated geocoordinate data once report volume grows.
// This dummy dataset represents illustrative issue density across Indian cities.
// Each point: { lat, lng, intensity } — intensity 0.0–1.0 (higher = more reports)

export interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number;
}

// Seeded pseudo-random for stable values across reloads
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateCluster(
  centerLat: number,
  centerLng: number,
  count: number,
  spread: number,
  baseIntensity: number,
  rand: () => number
): HeatPoint[] {
  const points: HeatPoint[] = [];
  for (let i = 0; i < count; i++) {
    const angle = rand() * 2 * Math.PI;
    const radius = rand() * spread;
    points.push({
      lat: centerLat + Math.cos(angle) * radius,
      lng: centerLng + Math.sin(angle) * radius,
      intensity: Math.min(1.0, baseIntensity + (rand() - 0.5) * 0.3),
    });
  }
  return points;
}

const rand = seededRand(42);

// Major metros — high density (intensity 0.7–1.0, large clusters)
const metroPoints: HeatPoint[] = [
  // Delhi NCR
  ...generateCluster(28.6139, 77.2090, 45, 0.4, 0.92, rand),
  ...generateCluster(28.7041, 77.1025, 18, 0.25, 0.75, rand),
  ...generateCluster(28.4595, 77.0266, 20, 0.3, 0.80, rand), // Gurgaon
  ...generateCluster(28.5355, 77.3910, 16, 0.25, 0.72, rand), // Noida

  // Mumbai
  ...generateCluster(19.0760, 72.8777, 42, 0.35, 0.94, rand),
  ...generateCluster(19.1136, 72.8697, 18, 0.2, 0.78, rand), // Andheri
  ...generateCluster(19.2183, 72.9781, 14, 0.2, 0.68, rand), // Thane

  // Bengaluru
  ...generateCluster(12.9716, 77.5946, 38, 0.35, 0.90, rand),
  ...generateCluster(12.9698, 77.7499, 16, 0.22, 0.74, rand), // Whitefield

  // Kolkata
  ...generateCluster(22.5726, 88.3639, 34, 0.3, 0.88, rand),
  ...generateCluster(22.5958, 88.4793, 14, 0.2, 0.70, rand), // Salt Lake

  // Chennai
  ...generateCluster(13.0827, 80.2707, 32, 0.3, 0.85, rand),
  ...generateCluster(12.9941, 80.1709, 12, 0.2, 0.65, rand),

  // Hyderabad
  ...generateCluster(17.3850, 78.4867, 30, 0.3, 0.83, rand),
  ...generateCluster(17.4156, 78.4347, 14, 0.2, 0.72, rand), // Banjara Hills

  // Pune
  ...generateCluster(18.5204, 73.8567, 26, 0.28, 0.80, rand),

  // Ahmedabad
  ...generateCluster(23.0225, 72.5714, 24, 0.28, 0.78, rand),
];

// Mid-size cities — medium density (intensity 0.4–0.7, smaller clusters)
const midCityPoints: HeatPoint[] = [
  // Jaipur
  ...generateCluster(26.9124, 75.7873, 14, 0.2, 0.60, rand),
  // Lucknow
  ...generateCluster(26.8467, 80.9462, 13, 0.2, 0.58, rand),
  // Bhopal
  ...generateCluster(23.2599, 77.4126, 10, 0.18, 0.52, rand),
  // Patna
  ...generateCluster(25.5941, 85.1376, 10, 0.18, 0.50, rand),
  // Surat
  ...generateCluster(21.1702, 72.8311, 12, 0.18, 0.56, rand),
  // Kochi
  ...generateCluster(9.9312, 76.2673, 11, 0.17, 0.55, rand),
  // Chandigarh
  ...generateCluster(30.7333, 76.7794, 9, 0.15, 0.50, rand),
  // Guwahati
  ...generateCluster(26.1445, 91.7362, 8, 0.15, 0.45, rand),
  // Nagpur
  ...generateCluster(21.1458, 79.0882, 11, 0.17, 0.53, rand),
  // Indore
  ...generateCluster(22.7196, 75.8577, 10, 0.17, 0.52, rand),
  // Visakhapatnam
  ...generateCluster(17.6868, 83.2185, 9, 0.15, 0.48, rand),
  // Coimbatore
  ...generateCluster(11.0168, 76.9558, 8, 0.15, 0.46, rand),
  // Vadodara
  ...generateCluster(22.3072, 73.1812, 8, 0.15, 0.48, rand),
  // Agra
  ...generateCluster(27.1767, 78.0081, 8, 0.15, 0.46, rand),
  // Meerut
  ...generateCluster(28.9845, 77.7064, 7, 0.13, 0.42, rand),
  // Varanasi
  ...generateCluster(25.3176, 82.9739, 8, 0.15, 0.45, rand),
  // Ranchi
  ...generateCluster(23.3441, 85.3096, 6, 0.13, 0.40, rand),
  // Thiruvananthapuram
  ...generateCluster(8.5241, 76.9366, 7, 0.13, 0.44, rand),
  // Amritsar
  ...generateCluster(31.6340, 74.8723, 7, 0.13, 0.43, rand),
  // Bhubaneswar
  ...generateCluster(20.2961, 85.8245, 7, 0.13, 0.42, rand),
];

// Sparse points — lighter coverage across rest of India
const sparsePoints: HeatPoint[] = [
  ...generateCluster(25.0961, 85.3131, 4, 0.3, 0.35, rand), // Bihar interior
  ...generateCluster(24.5854, 73.7125, 4, 0.3, 0.32, rand), // Udaipur
  ...generateCluster(20.9517, 85.0985, 4, 0.3, 0.30, rand), // Odisha
  ...generateCluster(15.3173, 75.7139, 4, 0.3, 0.33, rand), // Karnataka interior
  ...generateCluster(11.1271, 78.6569, 4, 0.3, 0.31, rand), // TN interior
  ...generateCluster(23.1815, 79.9864, 4, 0.3, 0.30, rand), // MP interior
  ...generateCluster(22.9734, 78.6569, 3, 0.4, 0.28, rand), // Central India
  ...generateCluster(28.2180, 94.7278, 3, 0.3, 0.25, rand), // Arunachal
  ...generateCluster(25.4670, 91.3662, 3, 0.25, 0.28, rand), // Shillong
];

export const heatmapDummyData: HeatPoint[] = [
  ...metroPoints,
  ...midCityPoints,
  ...sparsePoints,
];

// Top hotspot locations (derived from heaviest cluster centers above)
export const topHotspots = [
  { rank: 1, label: 'Ring Road, Delhi NCR',         count: 47, lat: 28.6139, lng: 77.2090 },
  { rank: 2, label: 'Andheri West, Mumbai',          count: 38, lat: 19.1136, lng: 72.8697 },
  { rank: 3, label: 'Whitefield, Bengaluru',         count: 31, lat: 12.9698, lng: 77.7499 },
  { rank: 4, label: 'Salt Lake City, Kolkata',       count: 24, lat: 22.5958, lng: 88.4793 },
  { rank: 5, label: 'Banjara Hills, Hyderabad',      count: 19, lat: 17.4156, lng: 78.4347 },
];
