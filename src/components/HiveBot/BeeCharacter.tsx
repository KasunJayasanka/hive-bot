'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * BeeCharacter Component
 *
 * A realistic 3D bee character built with React Three Fiber.
 * Features:
 * - Realistic bee anatomy (head, thorax, abdomen, wings, legs, antennae)
 * - Animated wings
 * - Hovering motion
 * - Interactive camera controls
 */

interface BeeCharacterProps {
  className?: string;
}

function Bee() {
  const beeRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  // Animation state
  useFrame((state) => {
    if (!beeRef.current) return;

    const time = state.clock.getElapsedTime();

    // Gentle hovering motion
    beeRef.current.position.y = Math.sin(time * 2) * 0.1;
    beeRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;

    // Wing flapping animation
    if (leftWingRef.current && rightWingRef.current) {
      const wingFlap = Math.sin(time * 20) * 0.3;
      leftWingRef.current.rotation.y = -Math.PI / 4 + wingFlap;
      rightWingRef.current.rotation.y = Math.PI / 4 - wingFlap;
    }
  });

  // Color scheme for the bee
  const yellowColor = '#FFD700';
  const blackColor = '#1a1a1a';
  const wingColor = '#E0F4FF';
  const eyeColor = '#000000';

  return (
    <group ref={beeRef} position={[0, 0, 0]}>
      {/* Head */}
      <mesh position={[0, 0.5, 0.6]} castShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color={blackColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Eyes (compound eyes) */}
      <mesh position={[-0.2, 0.55, 0.75]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={eyeColor} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0.2, 0.55, 0.75]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={eyeColor} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Eye highlights */}
      <mesh position={[-0.25, 0.6, 0.85]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.25, 0.6, 0.85]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Antennae */}
      <group position={[-0.15, 0.75, 0.6]}>
        <mesh position={[0, 0.15, 0]} rotation={[0.3, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
        <mesh position={[0, 0.35, 0.05]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
      </group>
      <group position={[0.15, 0.75, 0.6]}>
        <mesh position={[0, 0.15, 0]} rotation={[0.3, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
        <mesh position={[0, 0.35, 0.05]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
      </group>

      {/* Thorax (middle section with fuzzy texture) */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={blackColor} roughness={0.9} />
      </mesh>

      {/* Abdomen (striped yellow and black) */}
      {/* Yellow stripe */}
      <mesh position={[0, 0.15, -0.35]} castShadow>
        <sphereGeometry args={[0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI]} />
        <meshStandardMaterial color={yellowColor} roughness={0.6} />
      </mesh>

      {/* Black stripe */}
      <mesh position={[0, 0.1, -0.6]} castShadow>
        <sphereGeometry args={[0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI]} />
        <meshStandardMaterial color={blackColor} roughness={0.6} />
      </mesh>

      {/* Yellow stripe */}
      <mesh position={[0, 0.05, -0.8]} castShadow>
        <sphereGeometry args={[0.28, 32, 32, 0, Math.PI * 2, 0, Math.PI]} />
        <meshStandardMaterial color={yellowColor} roughness={0.6} />
      </mesh>

      {/* Stinger */}
      <mesh position={[0, 0, -1.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.08, 0.25, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.3} />
      </mesh>

      {/* Wings (translucent) */}
      {/* Left wing */}
      <mesh
        ref={leftWingRef}
        position={[-0.35, 0.4, -0.1]}
        rotation={[0.2, -Math.PI / 4, 0.1]}
        castShadow
      >
        <boxGeometry args={[0.8, 0.02, 0.5]} />
        <meshPhysicalMaterial
          color={wingColor}
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
        />
      </mesh>

      {/* Right wing */}
      <mesh
        ref={rightWingRef}
        position={[0.35, 0.4, -0.1]}
        rotation={[0.2, Math.PI / 4, -0.1]}
        castShadow
      >
        <boxGeometry args={[0.8, 0.02, 0.5]} />
        <meshPhysicalMaterial
          color={wingColor}
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
        />
      </mesh>

      {/* Legs (6 legs - 3 on each side) */}
      {/* Front legs */}
      <group position={[-0.3, 0.2, 0.3]}>
        <mesh position={[0, -0.15, 0]} rotation={[0, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
        <mesh position={[0, -0.35, 0.1]} rotation={[0.5, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.25, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
      </group>
      <group position={[0.3, 0.2, 0.3]}>
        <mesh position={[0, -0.15, 0]} rotation={[0, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
        <mesh position={[0, -0.35, 0.1]} rotation={[0.5, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.25, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
      </group>

      {/* Middle legs */}
      <group position={[-0.35, 0.15, -0.1]}>
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0.7]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
        <mesh position={[0, -0.4, 0.15]} rotation={[0.6, 0, 0.7]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
      </group>
      <group position={[0.35, 0.15, -0.1]}>
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, -0.7]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
        <mesh position={[0, -0.4, 0.15]} rotation={[0.6, 0, -0.7]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
      </group>

      {/* Back legs */}
      <group position={[-0.35, 0.1, -0.4]}>
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0.8]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
        <mesh position={[0, -0.4, 0.2]} rotation={[0.7, 0, 0.8]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
      </group>
      <group position={[0.35, 0.1, -0.4]}>
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, -0.8]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
        <mesh position={[0, -0.4, 0.2]} rotation={[0.7, 0, -0.8]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
          <meshStandardMaterial color={blackColor} />
        </mesh>
      </group>
    </group>
  );
}

export default function BeeCharacter({ className = '' }: BeeCharacterProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <Canvas
        shadows
        onCreated={() => setIsLoading(false)}
        style={{
          width: '100%',
          height: '100%',
          minWidth: '100%',
          minHeight: '100%',
        }}
      >
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />

        {/* Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />
        <spotLight
          position={[0, 5, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />

        {/* Bee Model */}
        <Bee />

        {/* Controls - subtle orbit controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
