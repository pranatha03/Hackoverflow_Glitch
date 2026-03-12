import React, { useRef, useMemo, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const AsteroidBelt = ({ count = 2000 }) => {
    const meshRef = useRef()

    // Generate asteroids
    const dummy = useMemo(() => new THREE.Object3D(), [])
    const asteroids = useMemo(() => {
        const temp = []
        // Belt between Mars (180) and Jupiter (400)
        // Center around 290, width 80
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2
            const dist = 260 + Math.random() * 80
            const x = Math.cos(angle) * dist
            const z = Math.sin(angle) * dist
            const y = (Math.random() - 0.5) * 10 // Spread in height

            const scale = 0.2 + Math.random() * 0.8

            temp.push({ position: [x, y, z], rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0], scale })
        }
        return temp
    }, [count])

    useFrame(({ clock }) => {
        if (!meshRef.current) return

        // Slowly rotate the entire belt
        meshRef.current.rotation.y = clock.getElapsedTime() * 0.02

        // We could rotate individual asteroids but that's expensive for instanced mesh without custom shader
        // For now, static layout rotating as a group is fine
    })

    useLayoutEffect(() => {
        if (!meshRef.current) return

        asteroids.forEach((data, i) => {
            dummy.position.set(...data.position)
            dummy.rotation.set(...data.rotation)
            dummy.scale.setScalar(data.scale)
            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    }, [asteroids])

    return (
        <instancedMesh ref={meshRef} args={[null, null, count]}>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
                color="#666666"
                roughness={0.9}
                metalness={0.1}
            />
        </instancedMesh>
    )
}

export default AsteroidBelt
