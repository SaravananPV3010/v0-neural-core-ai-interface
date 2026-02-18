"use client"

import { useState } from "react"
import { NeuralCore } from "@/components/chat/neural-core"
import { ElementGallery } from "@/components/chat/element-gallery"
import { Palette } from "lucide-react"

export default function Home() {
  const [showGallery, setShowGallery] = useState(false)

  return (
    <div className="relative">
      {/* Gallery toggle button */}
      {!showGallery && (
        <button
          onClick={() => setShowGallery(true)}
          className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground transition-colors magnetic-hover"
          aria-label="Open element gallery"
        >
          <Palette className="w-4 h-4" />
          <span className="font-mono text-[10px] tracking-wider uppercase hidden sm:inline">
            Gallery
          </span>
        </button>
      )}

      {showGallery ? (
        <div className="relative">
          <ElementGallery />
          <button
            onClick={() => setShowGallery(false)}
            className="fixed top-6 left-6 z-50 px-4 py-2 rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground transition-colors font-mono text-[10px] tracking-wider uppercase"
            aria-label="Close gallery"
          >
            ← Back to Chat
          </button>
        </div>
      ) : (
        <NeuralCore />
      )}
    </div>
  )
}
