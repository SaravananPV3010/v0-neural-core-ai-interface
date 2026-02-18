"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { MathUtils, Vector3 } from "three"
import type { Points, ShaderMaterial } from "three"

function PlasmaParticles() {
  const pointsRef = useRef<Points>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const { pointer, viewport } = useThree()
  const particleCount = 1000

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return pos
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: [0, 0] },
    }),
    [],
  )

  const vertexShader = `
    attribute float aSize;
    uniform float uTime;
    uniform vec2 uMouse;
    varying float vDistance;
    
    void main() {
      vec3 pos = position;
      
      // Wave motion
      pos.x += sin(uTime * 0.3 + pos.y * 0.05) * 0.2;
      pos.y += cos(uTime * 0.2 + pos.x * 0.05) * 0.2;
      pos.z += sin(uTime * 0.25 + pos.z * 0.05) * 0.2;
      
      // Distance from mouse
      float distToMouse = distance(
        vec2(pos.x, pos.y), 
        uMouse * 4.0
      );
      float pull = exp(-distToMouse * 0.3);
      pos.x += uMouse.x * 2.0 * pull;
      pos.y += uMouse.y * 2.0 * pull;
      
      vDistance = distToMouse;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = 2.0 + pull * 3.0;
    }
  `

  const fragmentShader = `
    varying float vDistance;
    
    void main() {
      float alpha = exp(-vDistance * 0.2) * 0.8;
      gl_FragColor = vec4(
        0.2 + vDistance * 0.1,
        0.4 + sin(vDistance) * 0.2,
        0.9,
        alpha
      );
    }
  `

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta
      materialRef.current.uniforms.uMouse.value = [pointer.x, pointer.y]
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  )
}

export function PlasmaField() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-64 h-64 rounded-full border border-violet-500/30 animate-pulse" />
      </div>
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      className="w-full h-full"
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
      }}
    >
      <PlasmaParticles />
    </Canvas>
  )
}
