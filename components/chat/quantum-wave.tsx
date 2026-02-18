"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import type { Mesh, ShaderMaterial } from "three"

function WaveMesh() {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const { pointer } = useThree()
  const segmentWidth = 128
  const segmentHeight = 64

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: [0, 0] },
    }),
    [],
  )

  const vertexShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    varying vec2 vUv;
    varying float vWave;
    
    float wave(float x, float y, float time) {
      return sin(x * 3.0 + time) * cos(y * 2.0 + time * 0.7) * 0.5 +
             sin(x * 1.5 - time * 0.5) * cos(y * 3.0 - time) * 0.3;
    }
    
    void main() {
      vUv = uv;
      
      vec3 pos = position;
      
      // Mouse-influenced wave
      float mouseDist = distance(
        vec2(pos.x, pos.y),
        uMouse * 4.0
      );
      float mouseInfluence = exp(-mouseDist * 0.5) * 2.0;
      
      // Combined wave effect
      float waveHeight = wave(pos.x, pos.y, uTime) + 
                         sin(mouseDist - uTime) * mouseInfluence;
      
      pos.z = waveHeight;
      vWave = waveHeight;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `

  const fragmentShader = `
    varying vec2 vUv;
    varying float vWave;
    
    void main() {
      vec3 baseColor = vec3(0.1, 0.3, 0.8);
      vec3 accent = vec3(0.4, 0.2, 0.9);
      
      float wave = vWave * 0.5 + 0.5;
      vec3 color = mix(baseColor, accent, wave);
      
      // Grid pattern
      float grid = mod(vUv.x * 20.0, 1.0);
      grid = min(grid, 1.0 - grid);
      grid = smoothstep(0.0, 0.02, grid);
      
      color = mix(color, color * 1.2, grid * 0.3);
      
      float alpha = 0.7 + vWave * 0.3;
      gl_FragColor = vec4(color, alpha);
    }
  `

  // Create plane geometry
  const geometry = useMemo(() => {
    const positions: number[] = []
    const indices: number[] = []
    const uvs: number[] = []

    for (let y = 0; y <= segmentHeight; y++) {
      for (let x = 0; x <= segmentWidth; x++) {
        positions.push(
          (x / segmentWidth - 0.5) * 8,
          (y / segmentHeight - 0.5) * 5,
          0,
        )
        uvs.push(x / segmentWidth, y / segmentHeight)
      }
    }

    for (let y = 0; y < segmentHeight; y++) {
      for (let x = 0; x < segmentWidth; x++) {
        const a = y * (segmentWidth + 1) + x
        const b = a + segmentWidth + 1

        indices.push(a, b, a + 1)
        indices.push(b, b + 1, a + 1)
      }
    }

    return { positions, indices, uvs }
  }, [])

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta
      materialRef.current.uniforms.uMouse.value = [pointer.x, pointer.y]
    }

    if (meshRef.current) {
      meshRef.current.rotation.x = -0.3
      meshRef.current.rotation.z += delta * 0.05
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-0.3, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={geometry.positions.length / 3}
          array={new Float32Array(geometry.positions)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-uv"
          count={geometry.uvs.length / 2}
          array={new Float32Array(geometry.uvs)}
          itemSize={2}
        />
        <bufferAttribute
          attach="index"
          count={geometry.indices.length}
          array={new Uint32Array(geometry.indices)}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={2}
      />
    </mesh>
  )
}

export function QuantumWave() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-64 h-32 border border-blue-500/30 animate-pulse" />
      </div>
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      className="w-full h-full"
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
      }}
    >
      <ambientLight intensity={0.5} />
      <WaveMesh />
    </Canvas>
  )
}
