"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

const BEAN_SCALE: [number, number, number] = [1, 1.3, 0.7];
const CREASE_DEPTH = 0.16;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Builds a sphere and carves a lengthwise crease into its front face by
 * displacing vertices inward with a falloff that's deepest at the equator
 * and fades toward the poles (phiStart/phiLength slice the sphere into a
 * bean "half" for the crack halves; jaggedEdge roughs up the cut seam so
 * it reads as torn rather than sliced).
 */
function buildBeanGeometry(
  phiStart: number,
  phiLength: number,
  jaggedEdge: boolean,
) {
  const geo = new THREE.SphereGeometry(1, 48, 48, phiStart, phiLength);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    if (v.z > 0) {
      const centerFalloff = Math.exp(-(v.x * v.x) / (2 * 0.12 * 0.12));
      const poleFalloff = Math.cos((v.y * Math.PI) / 2) ** 2;
      v.z -= CREASE_DEPTH * centerFalloff * poleFalloff;
    }

    if (jaggedEdge && Math.abs(v.x) < 0.03) {
      v.x += (Math.random() - 0.5) * 0.07;
    }

    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function useWholeBeanGeometry() {
  return useMemo(() => buildBeanGeometry(0, Math.PI * 2, false), []);
}

function useHalfBeanGeometry(side: "left" | "right") {
  return useMemo(() => {
    const phiStart = side === "right" ? Math.PI / 2 : -Math.PI / 2;
    return buildBeanGeometry(phiStart, Math.PI, true);
  }, [side]);
}

function WholeBeanMesh() {
  const geometry = useWholeBeanGeometry();
  return (
    <group scale={BEAN_SCALE}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#6b4226" roughness={0.6} metalness={0} />
      </mesh>
      <mesh position={[0, 0, 0.84]}>
        <capsuleGeometry args={[0.08, 1.3, 4, 8]} />
        <meshStandardMaterial color="#2b1810" roughness={0.85} />
      </mesh>
    </group>
  );
}

function HalfBeanMesh({ side }: { side: "left" | "right" }) {
  const geometry = useHalfBeanGeometry(side);
  const capX = side === "right" ? 0.01 : -0.01;
  return (
    <group scale={BEAN_SCALE}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#6b4226" roughness={0.6} metalness={0} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[capX, 0, 0]}>
        <circleGeometry args={[1, 48]} />
        <meshStandardMaterial
          color="#d9b78f"
          roughness={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function WholeBean({
  cracking,
  onTap,
}: {
  cracking: boolean;
  onTap: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const dragState = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    startT: 0,
    moved: 0,
  });

  function onPointerDown(e: ThreeEvent<PointerEvent>) {
    if (cracking) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragState.current = {
      dragging: true,
      lastX: e.clientX,
      lastY: e.clientY,
      startT: performance.now(),
      moved: 0,
    };
  }

  function onPointerMove(e: ThreeEvent<PointerEvent>) {
    const d = dragState.current;
    if (!d.dragging || !groupRef.current) return;
    const dx = e.clientX - d.lastX;
    const dy = e.clientY - d.lastY;
    d.moved += Math.abs(dx) + Math.abs(dy);
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    groupRef.current.rotation.y += dx * 0.01;
    groupRef.current.rotation.x = clamp(
      groupRef.current.rotation.x + dy * 0.01,
      -0.4,
      0.4,
    );
  }

  function onPointerUp(e: ThreeEvent<PointerEvent>) {
    const d = dragState.current;
    d.dragging = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    const elapsed = performance.now() - d.startT;
    if (d.moved < 6 && elapsed < 300) onTap();
  }

  return (
    <group
      ref={groupRef}
      visible={!cracking}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <WholeBeanMesh />
    </group>
  );
}

function CrackingHalves({
  cracking,
  onCrackDone,
}: {
  cracking: boolean;
  onCrackDone: () => void;
}) {
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  const crackT = useRef(0);
  const crackDoneFired = useRef(false);

  useFrame((_, delta) => {
    if (!cracking) {
      crackT.current = 0;
      crackDoneFired.current = false;
      return;
    }
    crackT.current = Math.min(crackT.current + delta / 0.8, 1);
    const t = easeOutCubic(crackT.current);

    const left = leftRef.current;
    const right = rightRef.current;
    if (left && right) {
      left.position.x = -1.1 * t;
      right.position.x = 1.1 * t;
      left.rotation.y = -0.6 * t;
      right.rotation.y = 0.6 * t;
      left.rotation.z = -0.25 * t;
      right.rotation.z = 0.25 * t;

      const fadeStart = 0.65;
      const opacity =
        crackT.current < fadeStart
          ? 1
          : 1 - (crackT.current - fadeStart) / (1 - fadeStart);
      for (const half of [left, right]) {
        half.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            const mat = obj.material as THREE.MeshStandardMaterial;
            mat.transparent = true;
            mat.opacity = opacity;
          }
        });
      }
    }

    if (crackT.current >= 1 && !crackDoneFired.current) {
      crackDoneFired.current = true;
      onCrackDone();
    }
  });

  return (
    <>
      <group ref={leftRef} visible={cracking}>
        <HalfBeanMesh side="left" />
      </group>
      <group ref={rightRef} visible={cracking}>
        <HalfBeanMesh side="right" />
      </group>
    </>
  );
}

export default function BeanCanvas({
  cracking,
  onTap,
  onCrackDone,
}: {
  cracking: boolean;
  onTap: () => void;
  onCrackDone: () => void;
}) {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 4], fov: 40 }}
      className="!touch-none"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      <directionalLight position={[-2, 2, -4]} intensity={0.6} color="#ffe8cc" />
      <WholeBean cracking={cracking} onTap={onTap} />
      <CrackingHalves cracking={cracking} onCrackDone={onCrackDone} />
    </Canvas>
  );
}
