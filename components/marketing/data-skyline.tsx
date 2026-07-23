"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface SkylinePoint {
  symbol: string;
  changePct: number;
  volume: number;
}

const COLS = 18;
const ROWS = 10;
const SPACING = 0.62;

/**
 * The hero visual is not decorative: each bar's height and color is driven by a real token's
 * live 24h price change (gainers rise in the signal color, losers sink in loss-red), so the
 * "skyline" is a literal render of the market pulled from the same feed the product runs on.
 */
function Bars({ points, reducedMotion }: { points: SkylinePoint[]; reducedMotion: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArray = useMemo(() => new Float32Array(COLS * ROWS * 3), []);

  const grid = useMemo(() => {
    const cells: { x: number; z: number; height: number; color: THREE.Color }[] = [];
    for (let x = 0; x < COLS; x++) {
      for (let z = 0; z < ROWS; z++) {
        const idx = (x * ROWS + z) % Math.max(points.length, 1);
        const p = points[idx];
        const change = p ? p.changePct : 0;
        const magnitude = Math.min(Math.abs(change) / 40, 1);
        const height = 0.25 + magnitude * 3.2;
        const color = new THREE.Color(change >= 0 ? "#a6e22e" : "#e2483d").lerp(
          new THREE.Color("#1a1f1c"),
          1 - (0.35 + magnitude * 0.65),
        );
        cells.push({ x: x - COLS / 2, z: z - ROWS / 2, height, color });
      }
    }
    return cells;
  }, [points]);

  useEffect(() => {
    if (!meshRef.current) return;
    grid.forEach((cell, i) => {
      dummy.position.set(cell.x * SPACING, cell.height / 2 - 1.2, cell.z * SPACING);
      dummy.scale.set(0.34, cell.height, 0.34);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      cell.color.toArray(colorArray, i * 3);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.geometry.setAttribute(
      "color",
      new THREE.InstancedBufferAttribute(colorArray, 3),
    );
  }, [grid, dummy, colorArray]);

  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t * 0.06) * 0.18 + 0.4;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COLS * ROWS]} frustumCulled>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial vertexColors roughness={0.4} metalness={0.15} />
    </instancedMesh>
  );
}

export function DataSkyline({ points }: { points: SkylinePoint[] }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Read the current value once on mount, then subscribe for changes — matchMedia isn't
    // available during SSR, so this can't be computed as initial render/state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (reducedMotion) {
    return (
      <div
        ref={wrapRef}
        aria-hidden
        className="h-full w-full bg-[radial-gradient(circle_at_50%_30%,color-mix(in_oklch,var(--signal)_18%,transparent),transparent_60%)]"
      />
    );
  }

  return (
    <div ref={wrapRef} className="h-full w-full">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [6, 3.4, 7], fov: 42 }}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 6, 5]} intensity={1.1} />
        <fog attach="fog" args={["#0c0f0d", 8, 18]} />
        <Bars points={points} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
