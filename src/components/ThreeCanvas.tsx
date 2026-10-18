"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeCanvasProps {
  laserActive: boolean;
  activeTarget: string;
}

export default function ThreeCanvas({ laserActive, activeTarget }: ThreeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 18, 38);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    // Performance optimization: clamp to max 1.5 pixel ratio to prevent GPU thermal throttling on judge laptops
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    // 1. Starfield Particles
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 200;
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x64748b, size: 0.35 });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // 2. Earth Mesh & Atmosphere
    const earthGroup = new THREE.Group();
    earthGroup.position.set(-10, 0, 0);
    scene.add(earthGroup);

    const earthGeo = new THREE.SphereGeometry(6, 48, 48);
    const earthMat = new THREE.MeshBasicMaterial({
      color: 0x0f2b48,
      wireframe: true,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    const glowGeo = new THREE.SphereGeometry(6.3, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    earthGroup.add(glowMesh);

    const virginiaMarkerGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const virginiaMarkerMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const virginiaMarker = new THREE.Mesh(virginiaMarkerGeo, virginiaMarkerMat);
    virginiaMarker.position.set(3.8, 3.2, 3.5);
    earthGroup.add(virginiaMarker);

    // 3. Moon Mesh & South Pole Shackleton Crater Marker
    const moonGroup = new THREE.Group();
    moonGroup.position.set(16, 6, -8);
    scene.add(moonGroup);

    const moonGeo = new THREE.SphereGeometry(2.5, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0x475569,
      wireframe: true,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonMesh);

    const moonMarkerGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const moonMarkerMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const moonMarker = new THREE.Mesh(moonMarkerGeo, moonMarkerMat);
    moonMarker.position.set(0, -2.4, 0.4);
    moonGroup.add(moonMarker);

    // 4. Optical Laser Telemetry Bezier Curve
    const laserCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-6.2, 3.2, 3.5),
      new THREE.Vector3(3, 14, -2),
      new THREE.Vector3(16, 3.6, -7.6)
    );
    const laserPoints = laserCurve.getPoints(50);
    const laserGeo = new THREE.BufferGeometry().setFromPoints(laserPoints);
    const laserMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      linewidth: 3,
      transparent: true,
      opacity: 0.0,
    });
    const laserLine = new THREE.Line(laserGeo, laserMat);
    scene.add(laserLine);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      earthGroup.rotation.y = elapsed * 0.08;
      moonGroup.rotation.y = elapsed * 0.04;
      stars.rotation.y = elapsed * 0.005;

      if (laserActive) {
        laserMat.opacity = 0.5 + Math.sin(elapsed * 12) * 0.45;
        laserMat.color.setHex(0x00f0ff);
      } else {
        laserMat.opacity = THREE.MathUtils.lerp(laserMat.opacity, 0.0, 0.08);
      }

      camera.lookAt(2, 2, 0);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Exhaustive WebGL Memory Leak Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);

      // Dispose Geometries
      starsGeo.dispose();
      earthGeo.dispose();
      glowGeo.dispose();
      virginiaMarkerGeo.dispose();
      moonGeo.dispose();
      moonMarkerGeo.dispose();
      laserGeo.dispose();

      // Dispose Materials
      starsMat.dispose();
      earthMat.dispose();
      glowMat.dispose();
      virginiaMarkerMat.dispose();
      moonMat.dispose();
      moonMarkerMat.dispose();
      laserMat.dispose();

      // Clear Scene & Dispose Renderer
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();

      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [laserActive]);

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-lg overflow-hidden border border-cyber-700 bg-cyber-950">
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      <div className="absolute top-3 left-3 p-3 bg-cyber-900/80 border border-cyber-700 rounded-md text-xs space-y-1 backdrop-blur-md pointer-events-none">
        <div className="flex items-center gap-2 text-lunar-cyan font-bold">
          <span className="w-2 h-2 rounded-full bg-lunar-cyan animate-ping" />
          CISLUNAR ORBITAL ROUTER [3D TELEMETRY]
        </div>
        <div className="text-gray-400">
          Uplink Target: <span className="text-white font-mono">{activeTarget}</span>
        </div>
        <div className="text-gray-400">
          Earth Node: <span className="text-red-400">Virginia (us-east-1) [PUE: 1.48]</span>
        </div>
        <div className="text-gray-400">
          Lunar Node: <span className="text-emerald-400">Shackleton Rim [PUE: 0.00 / 20K Cryo]</span>
        </div>
        <div className="text-gray-400">
          Laser Link Status:{" "}
          <span className={laserActive ? "text-lunar-cyan font-bold animate-pulse" : "text-gray-500"}>
            {laserActive ? "TRANSMITTING @ 1.28 Gbps [OPTICAL]" : "STANDBY (CARBON < THRESHOLD)"}
          </span>
        </div>
      </div>
    </div>
  );
}
