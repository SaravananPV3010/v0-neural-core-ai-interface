"use client"

import { useState } from "react"
import { SentientSphere } from "./sentient-sphere"
import { PlasmaField } from "./plasma-field"
import { NeuralNetwork } from "./neural-network"
import { QuantumWave } from "./quantum-wave"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type ElementType = "sphere" | "plasma" | "network" | "wave"

interface ElementConfig {
  id: ElementType
  name: string
  description: string
  component: React.ComponentType
}

const elements: ElementConfig[] = [
  {
    id: "sphere",
    name: "Sentient Sphere",
    description: "Interactive wireframe icosahedron with Perlin noise displacement",
    component: SentientSphere,
  },
  {
    id: "plasma",
    name: "Plasma Field",
    description: "1000 particles responding to mouse movement with wave animation",
    component: PlasmaField,
  },
  {
    id: "network",
    name: "Neural Network",
    description: "Connected nodes forming a dynamic network with force simulation",
    component: NeuralNetwork,
  },
  {
    id: "wave",
    name: "Quantum Wave",
    description: "Animated surface with mouse-influenced wave propagation",
    component: QuantumWave,
  },
]

export function ElementGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeElement = elements[activeIndex]
  const Component = activeElement.component

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % elements.length)
  }

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + elements.length) % elements.length)
  }

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Header with element info */}
      <header className="flex items-center justify-between px-6 md:px-16 lg:px-24 py-4 border-b border-border">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] tracking-[0.2em] text-foreground uppercase">
            {activeElement.name}
          </span>
          <span className="font-mono text-[9px] text-muted-foreground/50 max-w-2xl">
            {activeElement.description}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-muted-foreground/50">
            {activeIndex + 1} / {elements.length}
          </span>
        </div>
      </header>

      {/* Main visualization */}
      <div className="flex-1 overflow-hidden">
        <Component />
      </div>

      {/* Controls footer */}
      <footer className="flex items-center justify-between px-6 md:px-16 lg:px-24 py-4 border-t border-border">
        <button
          onClick={goPrev}
          className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors magnetic-hover"
          aria-label="Previous element"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-mono text-[10px] tracking-wider uppercase hidden sm:inline">
            Prev
          </span>
        </button>

        {/* Element indicators */}
        <div className="flex gap-2">
          {elements.map((el, idx) => (
            <button
              key={el.id}
              onClick={() => setActiveIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === activeIndex
                  ? "bg-foreground w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to ${el.name}`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors magnetic-hover"
          aria-label="Next element"
        >
          <span className="font-mono text-[10px] tracking-wider uppercase hidden sm:inline">
            Next
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  )
}
