'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

function Bee() {
  const beeRef = useRef<THREE.Group>(null)
  const leftWingRef = useRef<THREE.Mesh>(null)
  const rightWingRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!beeRef.current) return

    const time = state.clock.getElapsedTime()
    beeRef.current.position.y = Math.sin(time * 2) * 0.1
    beeRef.current.rotation.y = Math.sin(time * 0.5) * 0.1

    if (leftWingRef.current && rightWingRef.current) {
      const wingFlap = Math.sin(time * 20) * 0.3
      leftWingRef.current.rotation.y = -Math.PI / 4 + wingFlap
      rightWingRef.current.rotation.y = Math.PI / 4 - wingFlap
    }
  })

  const yellowColor = '#FFD700'
  const blackColor = '#1a1a1a'
  const wingColor = '#E0F4FF'
  const eyeColor = '#000000'

  return (
    <group ref={beeRef} position={[0, 0, 0]}>
      <mesh position={[0, 0.5, 0.6]} castShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color={blackColor} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[-0.2, 0.55, 0.75]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={eyeColor} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0.2, 0.55, 0.75]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={eyeColor} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[-0.25, 0.6, 0.85]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.25, 0.6, 0.85]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
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
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={blackColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.15, -0.35]} castShadow>
        <sphereGeometry args={[0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI]} />
        <meshStandardMaterial color={yellowColor} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.1, -0.6]} castShadow>
        <sphereGeometry args={[0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI]} />
        <meshStandardMaterial color={blackColor} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.05, -0.8]} castShadow>
        <sphereGeometry args={[0.28, 32, 32, 0, Math.PI * 2, 0, Math.PI]} />
        <meshStandardMaterial color={yellowColor} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, -1.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.08, 0.25, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.3} />
      </mesh>
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
      {['front', 'middle', 'back'].map((type, idx) => {
        const positions = [
          [0.3, 0.2, 0.3],
          [0.35, 0.15, -0.1],
          [0.35, 0.1, -0.4],
        ]
        const rotations = [0.5, 0.7, 0.8]
        const heights = [0.3, 0.35, 0.35]
        return (
          <React.Fragment key={type}>
            <group position={[-positions[idx][0], positions[idx][1], positions[idx][2]]}>
              <mesh position={[0, -0.15 - idx * 0.05, 0]} rotation={[0, 0, rotations[idx]]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, heights[idx], 8]} />
                <meshStandardMaterial color={blackColor} />
              </mesh>
              <mesh
                position={[0, -0.3 - idx * 0.1, 0.1 + idx * 0.05]}
                rotation={[0.5 + idx * 0.1, 0, rotations[idx]]}
                castShadow
              >
                <cylinderGeometry args={[0.025, 0.025, 0.25 + idx * 0.025, 8]} />
                <meshStandardMaterial color={blackColor} />
              </mesh>
            </group>
            <group position={[positions[idx][0], positions[idx][1], positions[idx][2]]}>
              <mesh position={[0, -0.15 - idx * 0.05, 0]} rotation={[0, 0, -rotations[idx]]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, heights[idx], 8]} />
                <meshStandardMaterial color={blackColor} />
              </mesh>
              <mesh
                position={[0, -0.3 - idx * 0.1, 0.1 + idx * 0.05]}
                rotation={[0.5 + idx * 0.1, 0, -rotations[idx]]}
                castShadow
              >
                <cylinderGeometry args={[0.025, 0.025, 0.25 + idx * 0.025, 8]} />
                <meshStandardMaterial color={blackColor} />
              </mesh>
            </group>
          </React.Fragment>
        )
      })}
    </group>
  )
}

export function BeeCharacter({ className = '' }: { className?: string }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas shadows style={{ width: '100%', height: '100%' }}>
        <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />
        <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={0.5} castShadow />
        <Bee />
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
  )
}
