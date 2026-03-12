import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../store/store'

const _targetPos = new THREE.Vector3()
const _prevTargetPos = new THREE.Vector3()
const _cameraOffset = new THREE.Vector3()

const CameraController = () => {
    const { camera } = useThree()
    const focusTarget = useStore(state => state.focusTarget)
    const controlsRef = useRef()

    const flyingRef = useRef(false)
    const trackingRef = useRef(false)

    useEffect(() => {
        if (focusTarget) {
            flyingRef.current = true
            trackingRef.current = true
            // Snapshot current target position for delta tracking
            if (focusTarget.getWorldPosition) {
                focusTarget.getWorldPosition(_prevTargetPos)
            }
        } else {
            trackingRef.current = false
        }
    }, [focusTarget])

    useFrame(() => {
        if (!controlsRef.current) return

        if (focusTarget && trackingRef.current) {
            // Get the planet's CURRENT world position
            if (focusTarget.getWorldPosition) {
                focusTarget.getWorldPosition(_targetPos)
            } else if (focusTarget.isVector3) {
                _targetPos.copy(focusTarget)
            } else {
                _targetPos.set(0, 0, 0)
            }

            if (flyingRef.current) {
                // Fly-in phase: smoothly move both target and camera
                controlsRef.current.target.lerp(_targetPos, 0.12)

                const dist = camera.position.distanceTo(_targetPos)
                if (dist > 30) {
                    const offset = new THREE.Vector3(15, 8, 20)
                    const desiredPos = _targetPos.clone().add(offset)
                    camera.position.lerp(desiredPos, 0.07)
                } else {
                    flyingRef.current = false
                    _prevTargetPos.copy(_targetPos)
                }
            } else {
                // Tracking phase: move camera + orbit pivot by exact delta
                // so the planet stays perfectly centred with zero drift
                const dx = _targetPos.x - _prevTargetPos.x
                const dy = _targetPos.y - _prevTargetPos.y
                const dz = _targetPos.z - _prevTargetPos.z

                controlsRef.current.target.x += dx
                controlsRef.current.target.y += dy
                controlsRef.current.target.z += dz

                camera.position.x += dx
                camera.position.y += dy
                camera.position.z += dz

                _prevTargetPos.copy(_targetPos)
            }

            controlsRef.current.update()
        }
    })

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            zoomSpeed={1.2}
            panSpeed={0.8}
            rotateSpeed={0.5}
            minDistance={0.5}
            maxDistance={5000}
            enableDamping
            dampingFactor={0.08}
            makeDefault
        />
    )
}

export default CameraController
