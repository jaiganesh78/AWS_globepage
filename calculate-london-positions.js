/**
 * Spherical-to-Cartesian coordinate calculation and rotation alignment utility.
 */
const latLngToXYZ = (lat, lng, r = 1.02) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = lng * (Math.PI / 180);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = -r * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
};

const uvToXYZ = (u, v, r = 1.0) => {
  const phi = (1 - v) * Math.PI;
  const theta = u * 2 * Math.PI;
  const x = -r * Math.cos(theta) * Math.sin(phi);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(theta) * Math.sin(phi);
  return [x, y, z];
};

// 1. London marker position
const LondonLat = 51.5074;
const LondonLng = -0.1278;
const P_marker = latLngToXYZ(LondonLat, LondonLng, 1.0);
console.log("London Marker local position (r = 1.0):", P_marker);

// 2. UK landmass position on world-map.png
// From verify-london.js, UK center is at x = 1017 on London row y = 219 (out of 1024)
const u_uk = 1017 / 2048;
const v_uk = (1024 - 219) / 1024; // Three.js V goes from bottom to top
console.log(`UK Texture UV: u = ${u_uk.toFixed(4)}, v = ${v_uk.toFixed(4)}`);

const P_landmass_raw = uvToXYZ(u_uk, v_uk, 1.0);
console.log("UK Landmass position at zero rotation:", P_landmass_raw);

// Let's compute angle between P_marker and P_landmass_raw
const dot = P_marker[0]*P_landmass_raw[0] + P_marker[1]*P_landmass_raw[1] + P_marker[2]*P_landmass_raw[2];
const angle = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);
console.log(`Angle between marker and landmass at [0,0,0] rotation: ${angle.toFixed(2)}°`);

// 3. UK landmass position with sphere rotated by -9.3 degrees around Y
const rotY = -9.3 * Math.PI / 180;
const cosR = Math.cos(rotY);
const sinR = Math.sin(rotY);
const P_landmass_rotated = [
  P_landmass_raw[0] * cosR + P_landmass_raw[2] * sinR,
  P_landmass_raw[1],
  -P_landmass_raw[0] * sinR + P_landmass_raw[2] * cosR
];
console.log("UK Landmass position at -9.3° rotation:", P_landmass_rotated);

const dot_rot = P_marker[0]*P_landmass_rotated[0] + P_marker[1]*P_landmass_rotated[1] + P_marker[2]*P_landmass_rotated[2];
const angle_rot = Math.acos(Math.max(-1, Math.min(1, dot_rot))) * (180 / Math.PI);
console.log(`Angle between marker and landmass at -9.3° rotation: ${angle_rot.toFixed(2)}°`);
