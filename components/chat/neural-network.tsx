"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Line, Sphere, Edges } from "@react-three/drei"
import { MathUtils, Vector3 } from "three"

interface Node {
  id: number
  position: [number, number, number]
  originalPosition: [number, number, number]
  velocity: [number, number, number]
}

function NeuralNetworkViz() {
  const groupRef = useRef(null)
  const { pointer } = useThree()
  const [nodes, setNodes] = useState<Node[]>([])
  const nodesRef = useRef<Array<{ current: any }>>([])

  // Initialize nodes in a sphere arrangement
  useEffect(() => {
    const nodeCount = 50
    const newNodes: Node[] = []
    
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount)
      const theta = Math.sqrt(nodeCount * Math.PI) * phi
      const radius = 3

      const x = radius * Math.cos(theta) * Math.sin(phi)
      const y = radius * Math.sin(theta) * Math.sin(phi)
      const z = radius * Math.cos(phi)

      newNodes.push({
        id: i,
        position: [x, y, z],
        originalPosition: [x, y, z],
        velocity: [0, 0, 0],
      })
    }

    setNodes(newNodes)
  }, [])

  // Create connections for nearby nodes
  const connections = useMemo(() => {
    const conns: [number, number][] = []
    const connectionDistance = 2.5

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].position[0] - nodes[j].position[0]
        const dy = nodes[i].position[1] - nodes[j].position[1]
        const dz = nodes[i].position[2] - nodes[j].position[2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist < connectionDistance) {
          conns.push([i, j])
        }
      }
    }
    return conns
  }, [nodes])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Update node positions with forces
    nodes.forEach((node, idx) => {
      // Attraction to original position
      const dx = node.originalPosition[0] - node.position[0]
      const dy = node.originalPosition[1] - node.position[1]
      const dz = node.originalPosition[2] - node.position[2]

      node.velocity[0] += dx * 0.02
      node.velocity[1] += dy * 0.02
      node.velocity[2] += dz * 0.02

      // Mouse attraction
      const mdx = pointer.x * 2 - node.position[0]
      const mdy = pointer.y * 2 - node.position[1]
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy)

      if (mdist < 3) {
        const force = (1 - mdist / 3) * 0.1
        node.velocity[0] += (mdx / mdist) * force
        node.velocity[1] += (mdy / mdist) * force
      }

      // Damping
      node.velocity[0] *= 0.85
      node.velocity[1] *= 0.85
      node.velocity[2] *= 0.85

      // Update position
      node.position[0] += node.velocity[0]
      node.position[1] += node.velocity[1]
      node.position[2] += node.velocity[2]
    })
  })

  if (nodes.length === 0) return null

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      {connections.map((conn, idx) => (
        <Line
          key={`line-${idx}`}
          points={[nodes[conn[0]].position, nodes[conn[1]].position]}
          color="#8b5cf6"
          lineWidth={0.5}
          transparent
          opacity={0.3}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node) => (
        <Sphere
          key={`node-${node.id}`}
          position={node.position}
          args={[0.15, 16, 16]}
        >
          <meshStandardMaterial
            emissive="#a78bfa"
            emissiveIntensity={0.5}
            color="#7c3aed"
            wireframe={false}
          />
        </Sphere>
      ))}
    </group>
  )
}

export function NeuralNetwork() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-64 h-64 border border-purple-500/30 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      className="w-full h-full"
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
      }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <NeuralNetworkViz />
    </Canvas>
  )
}
