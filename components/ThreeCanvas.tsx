import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ParticleConfig } from '../types';
import { generateParticleTexture } from '../utils/textureGenerator';

interface ThreeCanvasProps extends ParticleConfig {
  onCanvasClick: () => void;
}

const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ 
  color, 
  shape, 
  isExpanded, 
  rotationSpeed,
  onCanvasClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs to hold Three.js instances so we can update them without re-creating the scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);
  const frameIdRef = useRef<number>(0);
  const groupRef = useRef<THREE.Group | null>(null);

  // Animation state refs for smooth transitions
  const currentExpansionRef = useRef<number>(1);
  const targetExpansionRef = useRef<number>(1);

  // Interaction refs
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const isClickRef = useRef(true);

  // Initialize Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.002);
    sceneRef.current = scene;

    // 2. Setup Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 50;
    cameraRef.current = camera;

    // 3. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance' 
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Create Particles
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    // Initial sphere distribution
    const radius = 14;
    for (let i = 0; i < particleCount; i++) {
      // Uniform random point in sphere
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = Math.cbrt(Math.random()) * radius; // cbrt for uniform volume distribution

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Material
    const textureCanvas = generateParticleTexture(shape, color);
    const texture = new THREE.CanvasTexture(textureCanvas);
    
    const material = new THREE.PointsMaterial({
      color: 0xffffff, // We tint via texture or keep white to allow texture colors
      size: 1.5,
      map: texture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    materialRef.current = material;

    // Group to hold points (for easier rotation)
    const group = new THREE.Group();
    const points = new THREE.Points(geometry, material);
    group.add(points);
    scene.add(group);
    
    pointsRef.current = points;
    groupRef.current = group;

    // 5. Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      // Smooth expansion (Fast start, slow end)
      const lerpSpeed = 0.03;
      currentExpansionRef.current = THREE.MathUtils.lerp(
        currentExpansionRef.current,
        targetExpansionRef.current,
        lerpSpeed
      );

      // Apply expansion scaling to the Points mesh
      if (pointsRef.current) {
        pointsRef.current.scale.setScalar(currentExpansionRef.current);
      }

      // Auto-rotation (idle)
      if (groupRef.current && !isDraggingRef.current) {
        groupRef.current.rotation.y += rotationSpeed * 0.005;
        // Add slight vertical wobble for more organic feel
        groupRef.current.rotation.x += Math.sin(Date.now() * 0.0005) * 0.0005;
      }

      // Pulse effect (breathing) when contracted and mostly settled
      // This prevents the pulse from fighting the lerp during large transitions
      if (!isExpanded && pointsRef.current && Math.abs(currentExpansionRef.current - 1) < 0.05) {
         const time = Date.now() * 0.001;
         const pulse = 1 + Math.sin(time * 1.5) * 0.02;
         pointsRef.current.scale.setScalar(currentExpansionRef.current * pulse);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      // Dispose resources
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Update Material when Color or Shape changes
  useEffect(() => {
    if (materialRef.current) {
      const canvas = generateParticleTexture(shape, color);
      const texture = new THREE.CanvasTexture(canvas);
      // Important to update map and needsUpdate
      const oldMap = materialRef.current.map;
      materialRef.current.map = texture;
      materialRef.current.needsUpdate = true;
      
      // Dispose old texture to prevent memory leak
      if (oldMap) oldMap.dispose();
    }
  }, [color, shape]);

  // Update Expansion Target
  useEffect(() => {
    // 1.0 is original
    // 6.0 allows particles to fill the screen (Camera Z=50, Radius 14 * 6 = 84)
    targetExpansionRef.current = isExpanded ? 6.0 : 1.0;
  }, [isExpanded]);

  // --- Mouse Interaction Handlers ---

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    isClickRef.current = true; // Assume click initially
    previousMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = e.clientX - previousMouseRef.current.x;
    const deltaY = e.clientY - previousMouseRef.current.y;

    // If moved significantly (increased threshold to 5px), treat as drag, not click
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      isClickRef.current = false;
    }

    // Rotate the group based on mouse movement
    if (groupRef.current) {
        const rotateSpeed = 0.005;
        groupRef.current.rotation.y += deltaX * rotateSpeed;
        groupRef.current.rotation.x += deltaY * rotateSpeed;
    }

    previousMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    if (isClickRef.current) {
      onCanvasClick();
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full cursor-pointer z-0"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => isDraggingRef.current = false}
      title="Drag to rotate, Click to disperse"
    />
  );
};

export default ThreeCanvas;