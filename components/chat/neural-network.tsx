"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Vector3, BufferGeometry, LineBasicMaterial, Line as ThreeLine } from "three"
import type { Group, Mesh } from "three"

interface Node {
  id: number
  position: Vector3
  originalPosition: Vector3
  velocity: Vector3
}

function NeuralNetworkViz() {
  const groupRef = useRef<Group>(null)
  const { pointer } = useThree()
  const [nodes, setNodes] = useState<Node[]>([])
  const linesRef = useRef<ThreeLine[]>([])

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
        position: new Vector3(x, y, z),
        originalPosition: new Vector3(x, y, z),
        velocity: new Vector3(),
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
        const dist = nodes[i].position.distanceTo(nodes[j].position)

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
      const diff = node.originalPosition.clone().sub(node.position)
      node.velocity.addScaledVector(diff, 0.02)

      // Mouse attraction
      const mousePos = new Vector3(pointer.x * 3, pointer.y * 3, 0)
      const toMouse = mousePos.clone().sub(node.position)
      const mdist = toMouse.length()

      if (mdist < 3 && mdist > 0.1) {
        const force = (1 - mdist / 3) * 0.1
        node.velocity.addScaledVector(toMouse.normalize(), force)
      }

      // Damping
      node.velocity.multiplyScalar(0.85)

      // Update position
      node.position.add(node.velocity)

      // Update mesh position
      const mesh = groupRef.current?.children[idx] as Mesh
      if (mesh) {
        mesh.position.copy(node.position)
      }
    })

    // Update connection lines
    const nodeCount = nodes.length
    linesRef.current.forEach((line, idx) => {
      const positions = (line.geometry as BufferGeometry).attributes.position.array as Float32Array
      if (idx < connections.length) {
        const [i, j] = connections[idx]
        if (i < nodes.length && j < nodes.length) {
          positions[0] = nodes[i].position.x
          positions[1] = nodes[i].position.y
          positions[2] = nodes[i].position.z
          positions[3] = nodes[j].position.x
          positions[4] = nodes[j].position.y
          positions[5] = nodes[j].position.z
          ;(line.geometry as BufferGeometry).attributes.position.needsUpdate = true
        }
      }
    })
  })

  if (nodes.length === 0) return null

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {nodes.map((node) => (
        <mesh key={`node-${node.id}`} position={node.position}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            emissive="#a78bfa"
            emissiveIntensity={0.5}
            color="#7c3aed"
          />
        </mesh>
      ))}

      {/* Connection lines - created as three Line objects */}
      {useMemo(() => {
        return connections.map((conn, idx) => {
          const geometry = new BufferGeometry()
          geometry.setAttribute(
            "position",
            new Float32Array([
              nodes[conn[0]]?.position.x || 0,
              nodes[conn[0]]?.position.y || 0,
              nodes[conn[0]]?.position.z || 0,
              nodes[conn[1]]?.position.x || 0,
              nodes[conn[1]]?.position.y || 0,
              nodes[conn[1]]?.position.z || 0,
            ]),
          )
          const material = new LineBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.3,
          })
          const line = new ThreeLine(geometry, material)
          linesRef.current[idx] = line
          return <primitive key={`line-${idx}`} object={line} />
        })
      }, [connections, nodes])}
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
