"use client";

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { AWSRegionData } from '@/lib/api';

interface RegionMarkersProps {
  regions: AWSRegionData[];
  onSelect: (item: AWSRegionData) => void;
  onHover: (id: string | null) => void;
  selectedId?: string | null;
}

function latLngToXYZ(lat: number, lng: number, r: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(r * Math.sin(phi) * Math.cos(theta));
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

export default function RegionMarkers({ regions, onSelect, onHover, selectedId }: RegionMarkersProps) {
  const hasSelection = !!selectedId;
  return (
    <group>
      {regions.map((item) => (
        <Dot
          key={item.id}
          item={item}
          position={latLngToXYZ(item.lat, item.lng, 1.02)}
          labelPosition={latLngToXYZ(item.lat, item.lng, 1.15)}
          onSelect={onSelect}
          onHover={onHover}
          isSelected={selectedId === item.id}
          isDimmed={hasSelection && selectedId !== item.id}
        />
      ))}
    </group>
  );
}

function Dot({
  item, position, labelPosition,
  onSelect, onHover, isSelected, isDimmed,
}: {
  item: AWSRegionData;
  position: [number, number, number];
  labelPosition: [number, number, number];
  onSelect: (item: AWSRegionData) => void;
  onHover: (id: string | null) => void;
  isSelected: boolean;
  isDimmed: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const color = isSelected ? '#FF9900' : (hovered ? '#FF7F00' : '#E65100');
  const opacity = isDimmed ? 0.35 : 1.0;
  const radius = isSelected ? 0.022 : (hovered ? 0.018 : 0.015);

  return (
    <group>
      {/* Invisible hitbox for easy clicking */}
      <mesh
        position={position}
        renderOrder={4}
        onClick={(e) => { e.stopPropagation(); onSelect(item); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(item.id); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); onHover(null); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[0.065, 10, 10]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Static dot — depth-tested against the globe so back-face dots are hidden */}
      <mesh position={position} raycast={() => null as any} renderOrder={3}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent={isDimmed}
          opacity={opacity}
        />
      </mesh>

      {/* Hover label */}
      {hovered && !isSelected && (
        <Html position={labelPosition} pointerEvents="none" center>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ fontSize: '10px' }}
            className="px-3 py-1.5 bg-white/95 backdrop-blur-md text-[#1A1C1E] rounded-xl shadow-[0_10px_30px_rgba(0,115,187,0.15)] border border-slate-100 whitespace-nowrap flex items-center gap-2"
          >
            <span className="text-base">{item.flag}</span>
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
              <span className="text-base">{item.flag}</span>
              <span className="font-extrabold">{item.name}</span>
            </motion.div>
          </Html>
        )}
      </AnimatePresence>
    </group>
  );
}
