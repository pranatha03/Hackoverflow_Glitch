import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../store/store'

const Satellite = ({ id, distance, speed, color, label }) => {
    const meshRef = useRef()
    const alerts = useStore(state => state.alerts)

    // Check if this satellite has an alert
    const alert = alerts.find(a => a.id === id)
    const isHighRisk = alert?.risk_level === 'HIGH'
    const isMediumRisk = alert?.risk_level === 'MEDIUM'

    useFrame((state) => {
        if (meshRef.current) {
            const t = state.clock.getElapsedTime() * speed
            meshRef.current.position.x = Math.cos(t) * distance
            meshRef.current.position.z = Math.sin(t) * distance
            meshRef.current.rotation.y += 0.01

            if (isHighRisk) {
                // Jitter
                const jitterAmount = 0.05
                meshRef.current.position.y = (Math.random() - 0.5) * jitterAmount
            } else {
                meshRef.current.position.y = 0
            }
        }
    })

    // Dynamic color
    const statusColor = isHighRisk ? '#ff0000' : (isMediumRisk ? '#ff9900' : color)

    return (
        <group>
            {/* Orbit Path (Visual) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[distance - 0.02, distance + 0.02, 64]} />
                <meshBasicMaterial color="#ffffff" opacity={0.1} transparent side={THREE.DoubleSide} />
            </mesh>

            {/* Satellite Mesh */}
            <mesh ref={meshRef}>
                <boxGeometry args={[0.2, 0.2, 0.4]} />
                <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={isHighRisk ? 2.0 : 0.5} />

                {/* Solar Panels */}
                <mesh position={[0.3, 0, 0]}>
                    <boxGeometry args={[0.4, 0.02, 0.2]} />
                    <meshStandardMaterial color="#2233ff" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[-0.3, 0, 0]}>
                    <boxGeometry args={[0.4, 0.02, 0.2]} />
                    <meshStandardMaterial color="#2233ff" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Label - Only show when relevant */}
                <Html distanceFactor={10} position={[0, 0.5, 0]}>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold border whitespace-nowrap backdrop-blur-md transition-all duration-300
                    ${isHighRisk ? 'bg-red-900/80 border-red-500 text-white shadow-[0_0_10px_#ff0000]' :
                            isMediumRisk ? 'bg-amber-900/80 border-amber-500 text-white' :
                                'bg-black/50 border-white/20 text-gray-300 opacity-50 hover:opacity-100'}
                `}>
                        <div className="flex items-center gap-1">
                            {isHighRisk && <span className="animate-pulse">⚠</span>}
                            {label}
                        </div>
                        {isHighRisk && <div className="text-[8px] font-mono mt-0.5 text-red-200">RISK CRITICAL</div>}
                    </div>
                </Html>
            </mesh>
        </group>
    )
}

export default Satellite
