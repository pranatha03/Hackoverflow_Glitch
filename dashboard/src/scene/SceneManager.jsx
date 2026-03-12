import React from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import useStore from '../store/store'
import Sun from './Sun'
import Satellite from './Satellite'
import Planets from './Planets'
import Earth from './Earth'
import AsteroidBelt from './AsteroidBelt'
import CameraController from './CameraController'

// Inner component to handle camera/scene logic that requires context
const SceneContent = () => {
    const catastrophicMode = useStore(state => state.catastrophicMode)
    const setFocus = useStore(state => state.setFocus)

    // Very subtle shake ONLY during catastrophic mode — delta-scaled so it doesn't drift
    useFrame((state, delta) => {
        if (catastrophicMode) {
            const shake = 0.08
            const cam = state.camera
            cam.position.x += (Math.random() - 0.5) * shake * delta * 60
            cam.position.y += (Math.random() - 0.5) * shake * delta * 60
            cam.position.z += (Math.random() - 0.5) * shake * delta * 60
        }
    })


    const handleBackgroundClick = () => {
        setFocus(null) // Reset focus to Sun/Center
    }

    return (
        <group onPointerMissed={handleBackgroundClick}>
            <color attach="background" args={['#000000']} />

            {/* Lighting */}
            <ambientLight intensity={0.1} color="#ffffff" />
            <pointLight position={[0, 0, 0]} intensity={2} color="#ffaa00" decay={0} distance={1000} /> {/* Sun is bright everywhere */}

            {/* Objects */}
            <Sun />
            <Planets />
            <Earth />
            <AsteroidBelt />

            {/* Hero Satellites (Deep Space Monitors - Orbiting Sun) */}
            {/* Sun Radius is 20, so these must be > 20 */}
            <Satellite id="SAT-1" distance={28} speed={0.5} color="#00f0ff" label="Aurora" />
            <Satellite id="SAT-2" distance={35} speed={0.3} color="#ff003c" label="Helios" />
            <Satellite id="SAT-3" distance={42} speed={0.2} color="#ffbd00" label="DeepSight" />

            {/* Background */}
            <Stars radius={2000} depth={100} count={10000} factor={4} saturation={0.5} fade speed={0.5} />

            {/* Post Processing */}
            <EffectComposer>
                <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={catastrophicMode ? 2.5 : 1.5} />
                <Noise opacity={0.05} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>

            <CameraController />
        </group>
    )
}

const SceneManager = () => {
    return (
        <Canvas>
            <PerspectiveCamera makeDefault position={[0, 40, 150]} fov={60} far={5000} />
            <SceneContent />
        </Canvas>
    )
}

export default SceneManager
