"use client";

import React, { useState, useRef } from 'react';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { AWSRegionData } from '@/lib/api';
import FlagImage from '../Layout/FlagImage';
import { latLngToXYZ } from '@/utils/coordinates';
import { useFrame } from '@react-three/fiber';

interface RegionMarkersProps {
  regions: AWSRegionData[];
  onSelect: (item: AWSRegionData) => void;
  selectedId?: string | null;
}

function DebugMarker({ label, position, color, coords }: { label: string; position: [number, number, number]; color: string; coords?: string }) {
  return (
    <group>
      <mesh position={position}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Html position={position} center pointerEvents="none">
        <div style={{
          background: color,
          color: '#000000',
          padding: '4px 8px',
          borderRadius: '4px',
          fontWeight: '900',
          fontSize: '12px',
          border: '1px solid black',
          whiteSpace: 'nowrap',
          zIndex: 9999
        }}>
          {label}{coords ? ` (${coords})` : ''}
        </div>
      </Html>
    </group>
  );
}

export default function RegionMarkers({ regions, onSelect, selectedId }: RegionMarkersProps) {
  const hasSelection = !!selectedId;
  const r = 1.02;

  // Geographic validation markers (all 8 test locations from the rewrite spec)
  const validationPoints: { label: string; lat: number; lng: number; color: string }[] = [
    { label: "Null Island", lat: 0, lng: 0, color: "#FF00FF" },
    { label: "London", lat: 51.5074, lng: -0.1278, color: "#FF0066" },
    { label: "Frankfurt", lat: 50.1109, lng: 8.6821, color: "#FF6600" },
    { label: "Mumbai", lat: 19.076, lng: 72.8777, color: "#FFCC00" },
    { label: "Singapore", lat: 1.3521, lng: 103.8198, color: "#00FF66" },
    { label: "Tokyo", lat: 35.6762, lng: 139.6503, color: "#00CCFF" },
    { label: "Sydney", lat: -33.8688, lng: 151.2093, color: "#0066FF" },
    { label: "Virginia", lat: 38.8048, lng: -77.0469, color: "#CC00FF" },
  ];

  return (
    <group>
      {/* Axis Debug Markers */}
      <DebugMarker label="+X" position={[r, 0, 0]} color="#FF0000" />
      <DebugMarker label="-X" position={[-r, 0, 0]} color="#00FF00" />
      <DebugMarker label="+Z" position={[0, 0, r]} color="#0088FF" />
      <DebugMarker label="-Z" position={[0, 0, -r]} color="#FFFF00" />

      {/* Geographic Validation Markers (all 8 test locations) */}
      {validationPoints.map((vp) => (
        <DebugMarker
          key={vp.label}
          label={vp.label}
          position={latLngToXYZ(vp.lat, vp.lng, 1.02)}
          color={vp.color}
          coords={`${vp.lat.toFixed(4)},${vp.lng.toFixed(4)}`}
        />
      ))}

      {regions.map((item) => (
        <Dot
          key={item.id}
          item={item}
          position={latLngToXYZ(item.lat, item.lng, 1.02)}
          labelPosition={latLngToXYZ(item.lat, item.lng, 1.15)}
          onSelect={onSelect}
          isSelected={selectedId === item.id}
          isDimmed={hasSelection && selectedId !== item.id}
        />
      ))}
    </group>
  );
}

function Dot({
  item, position, labelPosition,
  onSelect, isSelected, isDimmed,
}: {
  item: AWSRegionData;
  position: [number, number, number];
  labelPosition: [number, number, number];
  onSelect: (item: AWSRegionData) => void;
  isSelected: boolean;
  isDimmed: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const haloRef = useRef<THREE.Mesh>(null);
  const selectedWireframeRef = useRef<THREE.Mesh>(null);

  // AWS Premium Theme Colors (Neon Electric Blue / Cyan theme)
  const coreColor = isSelected 
    ? '#0073BB' // Selected Electric Blue
    : (hovered ? '#00F0FF' : '#00E5FF'); // Hover Bright Cyan / Idle Cyan

  const haloColor = isSelected 
    ? '#00E5FF' 
    : (hovered ? '#00E5FF' : '#0073BB');

  const opacity = isDimmed ? 0.35 : 1.0;
  const coreRadius = isSelected 
    ? 0.024 
    : (hovered ? 0.020 : 0.016);

  const haloOpacity = isDimmed 
    ? 0.1 
    : (isSelected ? 0.35 : (hovered ? 0.3 : 0.15));

  // Single animation loop for performance: slow, low-frequency breathing glow
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (haloRef.current) {
      // Restrict scale oscillation to under 3% to prevent excessive pulsing
      const scale = 1.0 + Math.sin(elapsed * 1.5) * 0.025;
      haloRef.current.scale.set(scale, scale, scale);
    }
    if (selectedWireframeRef.current) {
      // Rotate holographic wireframe orb
      selectedWireframeRef.current.rotation.y = elapsed * 0.5;
      selectedWireframeRef.current.rotation.x = elapsed * 0.2;
    }
  });

  return (
    <group>
      {/* Invisible click target/hitbox */}
      <mesh
        position={position}
        renderOrder={4}
        onClick={(e) => { e.stopPropagation(); onSelect(item); }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!isSelected) {
            setHovered(true);
          }
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          if (!isSelected) {
            setHovered(false);
          }
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.065, 10, 10]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Solid Inner Core Dot */}
      <mesh position={position} raycast={() => null as any} renderOrder={3}>
        <sphereGeometry args={[coreRadius, 16, 16]} />
        <meshBasicMaterial
          color={coreColor}
          transparent={isDimmed}
          opacity={opacity}
        />
      </mesh>

      {/* Soft Breathing 3D Glow Halo */}
      <mesh 
        ref={haloRef}
        position={position} 
        raycast={() => null as any} 
        renderOrder={2}
      >
        <sphereGeometry args={[coreRadius * 2.5, 16, 16]} />
        <meshBasicMaterial
          color={haloColor}
          transparent={true}
          opacity={haloOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Selected holographic wireframe orb */}
      {isSelected && (
        <mesh 
          ref={selectedWireframeRef}
          position={position} 
          raycast={() => null as any} 
          renderOrder={1}
        >
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.25}
            wireframe={true}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Hover label */}
      {hovered && !isSelected && (
        <Html position={labelPosition} pointerEvents="none" center>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ fontSize: '10px' }}
            className="px-3 py-1.5 bg-white/95 backdrop-blur-md text-[#1A1C1E] rounded-xl shadow-[0_10px_30px_rgba(0,115,187,0.15)] border border-slate-100 whitespace-nowrap flex items-center gap-2"
          >
            <FlagImage flag={item.flagUrl || item.flag} name={item.name} className="w-5 h-3.5 object-contain" />
            <span className="font-black tracking-tight text-slate-800 uppercase">{item.name}</span>
          </motion.div>
        </Html>
      )}

      {/* Selected label */}
      <AnimatePresence>
        {isSelected && (
          <Html position={labelPosition} pointerEvents="none" center>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 5 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: '10px' }}
              className="px-3 py-1.5 bg-[#0073BB] text-white rounded-xl shadow-[0_10px_30px_rgba(0,163,255,0.3)] border border-[#00A3FF]/30 whitespace-nowrap font-black uppercase tracking-wider flex items-center gap-2"
            >
              <FlagImage flag={item.flagUrl || item.flag} name={item.name} className="w-5 h-3.5 object-contain" />
              <span className="font-extrabold">{item.name}</span>
            </motion.div>
          </Html>
        )}
      </AnimatePresence>
    </group>
  );
}
