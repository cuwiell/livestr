'use client';

import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Avatar3DProps {
  url: string;
  isSpeaking: boolean;
}

export function AvatarModel({ url, isSpeaking }: Avatar3DProps) {
  // Load the GLTF model
  const { scene } = useGLTF(url);
  const group = useRef<THREE.Group>(null);
  
  // Find the head mesh that contains the morph targets (blendshapes)
  const headMeshRef = useRef<THREE.SkinnedMesh | null>(null);

  useEffect(() => {
    if (!scene) return;
    
    // Traverse the scene to find the mesh with morph targets
    // Ready Player Me avatars usually have "Wolf3D_Head" or similar
    scene.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isMesh && (child as THREE.SkinnedMesh).morphTargetDictionary) {
        // If it has jawOpen or visemes, save it
        const dict = (child as THREE.SkinnedMesh).morphTargetDictionary;
        if (dict && (dict['jawOpen'] !== undefined || dict['mouthOpen'] !== undefined)) {
          headMeshRef.current = child as THREE.SkinnedMesh;
        }
      }
    });
  }, [scene]);

  // Procedural lip sync using useFrame
  useFrame((state) => {
    if (!headMeshRef.current || !headMeshRef.current.morphTargetInfluences || !headMeshRef.current.morphTargetDictionary) return;

    const dict = headMeshRef.current.morphTargetDictionary;
    const influences = headMeshRef.current.morphTargetInfluences;

    const jawOpenIdx = dict['jawOpen'] !== undefined ? dict['jawOpen'] : dict['mouthOpen'];

    if (jawOpenIdx !== undefined) {
      if (isSpeaking) {
        // Simulate talking with a sine wave based on time + some noise
        const time = state.clock.getElapsedTime();
        const baseFlap = (Math.sin(time * 20) + 1) / 2; // 0 to 1 rapid flapping
        const noise = Math.random() * 0.3; // Add some randomness
        
        // Target value for jaw open
        const targetValue = Math.min(1, Math.max(0, baseFlap * 0.7 + noise));
        
        // Smoothly interpolate towards the target value
        influences[jawOpenIdx] = THREE.MathUtils.lerp(influences[jawOpenIdx], targetValue, 0.5);
      } else {
        // Smoothly close mouth
        influences[jawOpenIdx] = THREE.MathUtils.lerp(influences[jawOpenIdx], 0, 0.2);
      }
    }
  });

  return (
    <group ref={group} position={[0, -1.5, 3]} scale={1.8}>
      <primitive object={scene} />
    </group>
  );
}

// Preload the default model to avoid lag
// useGLTF.preload('https://models.readyplayer.me/64bfa15f0e72c63d7c3934d6.glb');
