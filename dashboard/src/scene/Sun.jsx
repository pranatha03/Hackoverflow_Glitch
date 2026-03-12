import React, { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'
import useStore from '../store/store'

const Sun = () => {
    const meshRef = useRef()
    const glowRef = useRef()
    const radiation = useStore(state => state.telemetry.radiation_flux)
    const catastrophic = useStore(state => state.catastrophicMode)

    // Load Texture
    const [colorMap] = useLoader(TextureLoader, ['/textures/sun.jpg'])

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.001
        }

        // Pulse glow based on radiation
        if (glowRef.current) {
            const baseScale = 1.2
            // Radiation 100-300 range usually
            const pulse = (radiation - 100) / 400
            const scale = baseScale + pulse + Math.sin(state.clock.getElapsedTime() * 2) * 0.02
            glowRef.current.scale.set(scale, scale, scale)

            // Catastrophic color shift
            if (catastrophic) {
                glowRef.current.material.color.set('#ff0000')
            } else {
                glowRef.current.material.color.set('#ffaa00')
            }
        }
    })

    return (
        <group>
            {/* Core Sun */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[20, 64, 64]} />
                <meshBasicMaterial
                    map={colorMap}
                    color={catastrophic ? "#ffbdcc" : "#ffffff"}
                />
            </mesh>

            {/* Atmosphere/Glow */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[20, 64, 64]} />
                <meshBasicMaterial
                    color="#ffaa00"
                    transparent
                    opacity={0.3}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <pointLight intensity={2} decay={0} distance={2000} color={catastrophic ? "#ff0000" : "#ffaa00"} />
        </group>
    )
}

export default Sun
