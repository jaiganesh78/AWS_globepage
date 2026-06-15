// Geographic Validation Calculation Script
// Run this in browser console to get expected XYZ for all 8 points

const latLngToXYZ = (lat, lng, r = 1.02) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = lng * (Math.PI / 180);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = -r * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
};

const validationPoints = [
  { label: "Null Island", lat: 0, lng: 0 },
  { label: "London", lat: 51.5074, lng: -0.1278 },
  { label: "Frankfurt", lat: 50.1109, lng: 8.6821 },
  { label: "Virginia", lat: 38.8048, lng: -77.0469 },
  { label: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { label: "Singapore", lat: 1.3521, lng: 103.8198 },
  { label: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { label: "Sydney", lat: -33.8688, lng: 151.2093 },
];

console.log("=== EXPECTED XYZ COORDINATES (r=1.02) ===");
validationPoints.forEach(p => {
  const [x, y, z] = latLngToXYZ(p.lat, p.lng, 1.02);
  console.log(`${p.label} (${p.lat}, ${p.lng}): [${x.toFixed(4)}, ${y.toFixed(4)}, ${z.toFixed(4)}]`);
});

console.log("\n=== EXPECTED XYZ COORDINATES (r=1.0) ===");
validationPoints.forEach(p => {
  const [x, y, z] = latLngToXYZ(p.lat, p.lng, 1.0);
  console.log(`${p.label} (${p.lat}, ${p.lng}): [${x.toFixed(4)}, ${y.toFixed(4)}, ${z.toFixed(4)}]`);
});

// Also calculate with globe rotation applied (-80° around Y = -1.3962634 rad)
const rotY = -1.3962634;
const cosY = Math.cos(rotY);
const sinY = Math.sin(rotY);

console.log("\n=== EXPECTED XYZ AFTER GLOBE ROTATION (-80° Y) ===");
validationPoints.forEach(p => {
  const [x, y, z] = latLngToXYZ(p.lat, p.lng, 1.02);
  // Apply rotation around Y axis
  const xr = x * cosY - z * sinY;
  const zr = x * sinY + z * cosY;
  console.log(`${p.label} (${p.lat}, ${p.lng}): [${xr.toFixed(4)}, ${y.toFixed(4)}, ${zr.toFixed(4)}]`);
});

// Key reference points
console.log("\n=== REFERENCE POINTS (r=1.02) ===");
const refs = [
  { label: "North Pole", lat: 90, lng: 0 },
  { label: "South Pole", lat: -90, lng: 0 },
  { label: "Equator, Prime Meridian (0,0)", lat: 0, lng: 0 },
  { label: "Equator, +90°", lat: 0, lng: 90 },
  { label: "Equator, -90°", lat: 0, lng: -90 },
  { label: "Equator, +180°", lat: 0, lng: 180 },
];
refs.forEach(p => {
  const [x, y, z] = latLngToXYZ(p.lat, p.lng, 1.02);
  console.log(`${p.label}: [${x.toFixed(4)}, ${y.toFixed(4)}, ${z.toFixed(4)}]`);
});

// Also calculate what the texture UV mapping would expect
console.log("\n=== TEXTURE UV MAPPING EXPECTATIONS ===");
console.log("Three.js SphereGeometry UV mapping:");
console.log("  u = 0.5 + atan2(z, x) / (2*PI)  [longitude: 0 at +X, +90 at -Z]");
console.log("  v = 0.5 - asin(y/r) / PI          [latitude: 0 at equator, +1 at North Pole]");
console.log("");
console.log("Texture Prime Meridian (u=0) should be at: lng = -180° (or +180°)");
console.log("Texture Equator (v=0.5) should be at: lat = 0°");
console.log("");
console.log("If texture has Prime Meridian at center (u=0.5): lng = 0°");
console.log("If texture has Prime Meridian at left edge (u=0): lng = -180°");
console.log("If texture has Prime Meridian at right edge (u=1): lng = +180°");