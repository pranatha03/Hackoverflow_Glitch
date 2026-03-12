import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'
import useStore from '../store/store'
import { Text } from '@react-three/drei'

const EARTH_RADIUS = 1.5
const SAT_SCALE = 1.57          // slightly outside Earth surface
const SAT_SIZE = 0.045          // slightly larger, bright dot size
const PULSE_MAX = 0.22          // max pulse ring radius

const Earth = () => {
    const earthGroup = useRef()
    const earthMesh = useRef()
    const cloudsRef = useRef()

    // Two instanced meshes: green (nominal) and red (at-risk)
    const greenMesh = useRef()
    const redMesh = useRef()
    const pulseMesh = useRef()   // transparent expanding ring for at-risk sats

    const orbitalBodies = useStore(state => state.orbital_bodies)
    const alerts = useStore(state => state.alerts)
    const setFocus = useStore(state => state.setFocus)

    const dummy = useMemo(() => new THREE.Object3D(), [])

    // Build a set of at-risk satellite IDs for O(1) lookup
    const atRiskIds = useMemo(() => {
        const s = new Set()
        alerts.forEach(a => {
            if (a.risk_level === 'HIGH' || a.risk_level === 'MEDIUM') s.add(a.id)
        })
        return s
    }, [alerts])

    // Split orbital bodies into two groups
    const { nominalSats, alertSats } = useMemo(() => {
        const nominal = [], atRisk = []
        orbitalBodies.forEach(sat => {
            if (atRiskIds.has(sat.id)) atRisk.push(sat)
            else nominal.push(sat)
        })
        return { nominalSats: nominal, alertSats: atRisk }
    }, [orbitalBodies, atRiskIds])

    // Load Textures
    const [colorMap, cloudsMap] = useLoader(TextureLoader, [
        '/textures/earth_day.jpg',
        '/textures/earth_clouds.jpg'
    ])

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime()

        // Earth orbit around Sun
        const orbit = t * 0.05 * 2.9
        const earthDist = 130
        if (earthGroup.current) {
            earthGroup.current.position.x = Math.cos(orbit) * earthDist
            earthGroup.current.position.z = Math.sin(orbit) * earthDist
        }

        if (earthMesh.current) earthMesh.current.rotation.y += 0.001
        if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0012

        // ── Update nominal (green) satellites ────────────────────────────────
        if (greenMesh.current && nominalSats.length > 0) {
            nominalSats.forEach((sat, i) => {
                dummy.position.set(
                    sat.pos[0] * SAT_SCALE,
                    sat.pos[1] * SAT_SCALE,
                    sat.pos[2] * SAT_SCALE
                )
                dummy.scale.setScalar(1)
                dummy.updateMatrix()
                greenMesh.current.setMatrixAt(i, dummy.matrix)
            })
            greenMesh.current.instanceMatrix.needsUpdate = true
        }

        // ── Update at-risk (red) satellites ──────────────────────────────────
        if (redMesh.current && alertSats.length > 0) {
            alertSats.forEach((sat, i) => {
                dummy.position.set(
                    sat.pos[0] * SAT_SCALE,
                    sat.pos[1] * SAT_SCALE,
                    sat.pos[2] * SAT_SCALE
                )
                dummy.scale.setScalar(1)
                dummy.updateMatrix()
                redMesh.current.setMatrixAt(i, dummy.matrix)
            })
            redMesh.current.instanceMatrix.needsUpdate = true
        }

        // ── Pulse rings around at-risk satellites ────────────────────────────
        if (pulseMesh.current && alertSats.length > 0) {
            const pulseFraction = (Math.sin(t * 3) * 0.5 + 0.5)  // 0→1 oscillation
            const scale = 1 + pulseFraction * 4
            const opacity = 1 - pulseFraction

            // Reuse the material opacity for all pulse rings
            if (pulseMesh.current.material) {
                pulseMesh.current.material.opacity = opacity * 0.7
            }

            alertSats.forEach((sat, i) => {
                dummy.position.set(
                    sat.pos[0] * SAT_SCALE,
                    sat.pos[1] * SAT_SCALE,
                    sat.pos[2] * SAT_SCALE
                )
                dummy.scale.setScalar(scale)
                dummy.updateMatrix()
                pulseMesh.current.setMatrixAt(i, dummy.matrix)
            })
            pulseMesh.current.instanceMatrix.needsUpdate = true
        }
    })

    const handleClick = (e) => {
        e.stopPropagation()
        setFocus(earthGroup.current)
    }

    return (
        <group ref={earthGroup}>
            {/* Earth sphere */}
            <mesh ref={earthMesh}>
                <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
                <meshStandardMaterial map={colorMap} roughness={0.6} metalness={0.1} />
            </mesh>

            {/* Clouds */}
            <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]}>
                <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
                <meshStandardMaterial
                    map={cloudsMap} transparent opacity={0.8}
                    blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false}
                />
            </mesh>

            {/* Atmosphere glow */}
            <mesh scale={[1.1, 1.1, 1.1]}>
                <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
                <meshBasicMaterial color="#4455ff" transparent opacity={0.1} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
            </mesh>

            {/* ── GREEN satellite dots (nominal) ───────────────────────────── */}
            {nominalSats.length > 0 && (
                <instancedMesh ref={greenMesh} args={[null, null, nominalSats.length]} frustumCulled={false}>
                    <sphereGeometry args={[SAT_SIZE, 5, 5]} />
                    <meshBasicMaterial color="#00ff88" toneMapped={false} />
                </instancedMesh>
            )}

            {/* ── RED satellite dots (at-risk) ─────────────────────────────── */}
            {alertSats.length > 0 && (
                <>
                    <instancedMesh ref={redMesh} args={[null, null, alertSats.length]} frustumCulled={false}>
                        <sphereGeometry args={[SAT_SIZE * 1.6, 6, 6]} />
                        <meshBasicMaterial color="#ff2244" toneMapped={false} />
                    </instancedMesh>

                    {/* Pulse rings */}
                    <instancedMesh ref={pulseMesh} args={[null, null, alertSats.length]} frustumCulled={false}>
                        <sphereGeometry args={[SAT_SIZE * 1.4, 6, 6]} />
                        <meshBasicMaterial color="#ff2244" toneMapped={false} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
                    </instancedMesh>
                </>
            )}

            {/* Invisible click hitbox */}
            <mesh onClick={handleClick} visible={false}>
                <sphereGeometry args={[EARTH_RADIUS * 8.0, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            <Text
                position={[0, 1.5, 0]} fontSize={0.5} color="cyan"
                anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#000000"
            >
                EARTH
            </Text>

            <Moon />
        </group>
    )
}

const Moon = () => {
    const moonRef = useRef()
    const [moonMap] = useLoader(TextureLoader, ['/textures/moon.jpg'])

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime() * 0.5
        moonRef.current.position.x = Math.cos(t) * 10
        moonRef.current.position.z = Math.sin(t) * 10
        moonRef.current.rotation.y += 0.005
    })

    return (
        <mesh ref={moonRef}>
            <sphereGeometry args={[1.5 * 0.27, 32, 32]} />
            <meshStandardMaterial map={moonMap} />
        </mesh>
    )
}

export default Earth
