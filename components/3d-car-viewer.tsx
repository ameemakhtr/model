"use client"

import { Suspense, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PresentationControls, Stage, useGLTF } from "@react-three/drei"
import { PostProcessing } from "./post-processing"

function Model() {
  try {
    const gltf = useGLTF("/pony_cartoon.glb")
    console.log("GLB loaded successfully:", gltf)
    return <primitive object={gltf.scene} scale={1.5} />
  } catch (error) {
    console.error("Error loading GLB:", error)
    return null
  }
}

useGLTF.preload("/pony_cartoon.glb")

function CarViewer() {
  const [mounted, setMounted] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-screen w-screen bg-white flex items-center justify-center">Loading...</div>

  return (
    <div className="h-screen w-screen">
      <Canvas shadows dpr={[1, 2]} className="h-full w-full">
        <color attach="background" args={["#0f0f0f"]} />
        <Suspense fallback={null}>
          <Stage environment="city" adjustCamera={0.6} intensity={0.3} preset="rembrandt">
            <PresentationControls
              global
              rotation={[0, -Math.PI / 4, 0]}
              polar={[-Math.PI / 4, Math.PI / 4]}
              azimuth={[-Math.PI / 4, Math.PI / 4]}
              config={{ mass: 2, tension: 500 }}
              snap={{ mass: 4, tension: 1500 }}
            >
              <Model />
            </PresentationControls>
          </Stage>
        </Suspense>
        <OrbitControls autoRotate={autoRotate} autoRotateSpeed={1.5} enableZoom={true} enablePan={true} />
        <PostProcessing gridSize={4} pixelSizeRatio={1} grayscaleOnly={true} />
      </Canvas>
    </div>
  )
}

export default CarViewer
