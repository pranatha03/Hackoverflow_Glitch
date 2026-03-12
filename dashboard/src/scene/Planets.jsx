import React, { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../store/store'

// Scaled distances/sizes for visualization
// Sun Radius = 20 (Reference)
// Distances are "Cinematically Scaled" (not 1:1 but ordered and spaced)
const PLANET_DATA = [
    { name: "Mercury", distance: 60, radius: 0.8, speed: 4.7, texture: "/textures/mercury.jpg", moons: [] },
    { name: "Venus", distance: 90, radius: 1.2, speed: 3.5, texture: "/textures/venus.jpg", moons: [] },
    // Earth handled in Earth.jsx (has its own Moon component there)
    {
        name: "Mars", distance: 180, radius: 0.9, speed: 2.4, texture: "/textures/mars.jpg",
        moons: [
            { name: "Phobos", dist: 1.5, radius: 0.10, speed: 2.0, color: "#9b8678" },
            { name: "Deimos", dist: 2.5, radius: 0.07, speed: 1.1, color: "#8a7a70" }
        ]
    },
    {
        name: "Jupiter", distance: 400, radius: 8.0, speed: 1.3, texture: "/textures/jupiter.jpg",
        moons: [
            // Galilean moons — the 4 big ones, very distinct
            { name: "Io", dist: 11, radius: 0.50, speed: 2.4, color: "#e8d56b" },
            { name: "Europa", dist: 14, radius: 0.43, speed: 1.9, color: "#d9c9b4" },
            { name: "Ganymede", dist: 18, radius: 0.65, speed: 1.4, color: "#b0a090" },
            { name: "Callisto", dist: 24, radius: 0.58, speed: 0.9, color: "#6e6456" },
            // Inner small moons
            { name: "Amalthea", dist: 8, radius: 0.18, speed: 3.5, color: "#8b4513" },
            { name: "Himalia", dist: 32, radius: 0.12, speed: 0.5, color: "#a09080" }
        ]
    },
    {
        name: "Saturn", distance: 700, radius: 7.0, speed: 0.9, texture: "/textures/saturn.jpg",
        ring: "/textures/saturn_ring.png",
        moons: [
            { name: "Titan", dist: 22, radius: 0.72, speed: 0.6, color: "#d4a843" },
            { name: "Rhea", dist: 16, radius: 0.30, speed: 0.9, color: "#c8c0b8" },
            { name: "Dione", dist: 13, radius: 0.27, speed: 1.2, color: "#d0cac0" },
            { name: "Tethys", dist: 11, radius: 0.25, speed: 1.5, color: "#d8d4cc" },
            { name: "Enceladus", dist: 9, radius: 0.18, speed: 1.9, color: "#f0f0f4" },
            { name: "Mimas", dist: 7.5, radius: 0.12, speed: 2.5, color: "#c8c8c8" },
            { name: "Iapetus", dist: 32, radius: 0.26, speed: 0.3, color: "#8c7060" }
        ]
    },
    {
        name: "Uranus", distance: 1200, radius: 4.0, speed: 0.6, texture: "/textures/uranus.jpg",
        moons: [
            { name: "Titania", dist: 10, radius: 0.28, speed: 0.7, color: "#b8b4ac" },
            { name: "Oberon", dist: 13, radius: 0.26, speed: 0.5, color: "#a8a098" },
            { name: "Umbriel", dist: 8, radius: 0.22, speed: 0.9, color: "#706860" },
            { name: "Ariel", dist: 6, radius: 0.20, speed: 1.2, color: "#c0b8b0" },
            { name: "Miranda", dist: 4.5, radius: 0.12, speed: 1.8, color: "#a0a0a0" }
        ]
    },
    {
        name: "Neptune", distance: 1800, radius: 3.8, speed: 0.5, texture: "/textures/neptune.jpg",
        moons: [
            { name: "Triton", dist: 10, radius: 0.35, speed: -0.8, color: "#bac4cc" }, // retrograde orbit (negative speed)
            { name: "Proteus", dist: 6.5, radius: 0.14, speed: 1.3, color: "#909090" },
            { name: "Nereid", dist: 18, radius: 0.10, speed: 0.2, color: "#b0a890" }
        ]
    }
]

// ── Moon ────────────────────────────────────────────────────────────────────
const Moon = ({ moon }) => {
    const meshRef = useRef()

    useFrame(({ clock }) => {
        if (!meshRef.current) return
        const t = clock.getElapsedTime() * 0.4 * moon.speed
        meshRef.current.position.x = Math.cos(t) * moon.dist
        meshRef.current.position.z = Math.sin(t) * moon.dist
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[moon.radius, 16, 16]} />
            <meshStandardMaterial color={moon.color} roughness={0.9} />
        </mesh>
    )
}

// ── Planet ──────────────────────────────────────────────────────────────────
const Planet = ({ planet }) => {
    const groupRef = useRef()
    const setFocus = useStore(state => state.setFocus)

    const [colorMap] = useLoader(TextureLoader, [planet.texture])

    // Separate ring texture loading (only for Saturn)
    const ringTextures = useLoader(
        TextureLoader,
        planet.ring ? [planet.ring] : ['/textures/mercury.jpg'] // dummy fallback
    )
    const ringMap = planet.ring ? ringTextures[0] : null

    useFrame(({ clock }) => {
        if (!groupRef.current) return
        const t = clock.getElapsedTime() * 0.05 * planet.speed
        groupRef.current.position.x = Math.cos(t) * planet.distance
        groupRef.current.position.z = Math.sin(t) * planet.distance
        groupRef.current.rotation.y += 0.001
    })

    const handleClick = (e) => {
        e.stopPropagation()
        setFocus(groupRef.current)
    }

    return (
        <group ref={groupRef}>
            {/* Planet sphere */}
            <mesh onClick={handleClick}>
                <sphereGeometry args={[planet.radius, 64, 64]} />
                <meshStandardMaterial map={colorMap} roughness={0.8} metalness={0.1} />
            </mesh>

            {/* Invisible larger hitbox so small planets are still easy to click */}
            <mesh onClick={handleClick} visible={false}>
                <sphereGeometry args={[Math.max(planet.radius * 3, 5), 8, 8]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Label */}
            <Text
                position={[0, planet.radius * 1.5 + 1.2, 0]}
                fontSize={Math.max(0.8, planet.radius * 0.35)}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#000000"
            >
                {planet.name}
            </Text>

            {/* Saturn rings */}
            {planet.ring && ringMap && (
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[planet.radius * 1.4, planet.radius * 2.4, 128]} />
                    <meshStandardMaterial
                        map={ringMap}
                        opacity={0.85}
                        transparent
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Moons */}
            {planet.moons.map(moon => (
                <Moon key={moon.name} moon={moon} />
            ))}
        </group>
    )
}

// ── Orbit path ring ─────────────────────────────────────────────────────────
const OrbitPath = ({ radius }) => (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.3, radius + 0.3, 180]} />
        <meshBasicMaterial color="#334466" transparent opacity={0.25} side={THREE.DoubleSide} />
    </mesh>
)

// ── Planets scene root ───────────────────────────────────────────────────────
const Planets = () => (
    <group>
        {/* Orbit rings */}
        {PLANET_DATA.map(p => (
            <OrbitPath key={`orbit-${p.name}`} radius={p.distance} />
        ))}
        <OrbitPath radius={130} /> {/* Earth */}

        {/* Planet objects */}
        {PLANET_DATA.map(p => (
            <Planet key={p.name} planet={p} />
        ))}
    </group>
)

export default Planets
export { PLANET_DATA }
