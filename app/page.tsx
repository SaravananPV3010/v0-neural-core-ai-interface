"use client"

import { PlasmaField } from "@/components/chat/plasma-field"

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <PlasmaField />
      
      {/* Info overlay */}
      <div className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2">
            Plasma Field
          </h1>
          <p className="text-cyan-300/70 font-mono text-sm">Move your cursor to influence the particles</p>
        </div>
      </div>
    </div>
  )
}
