import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { StationAsset } from '../../types';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { 
  X, 
  Activity, 
  Zap, 
  Flame, 
  AlertTriangle, 
  Cpu, 
  Maximize2, 
  Layers, 
  RotateCcw,
  ShieldCheck 
} from 'lucide-react';

interface Props {
  stationId: string;
}

export const Station3DViewer: React.FC<Props> = ({ stationId }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [assets, setAssets] = useState<StationAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<StationAsset | null>(null);
  const [consequences, setConsequences] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, [stationId]);

  const loadAssets = async () => {
    try {
      const data = await api.getStationAssets(stationId);
      setAssets(data);
      if (data.length > 0 && !selectedAsset) {
        setSelectedAsset(data[0]);
      }
    } catch (e) {
      console.error('Failed to load assets for 3D viewer:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAsset) {
      api.getAssetConsequences(selectedAsset.id)
        .then(setConsequences)
        .catch(console.error);
    }
  }, [selectedAsset]);

  // Three.js scene setup
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060B14);
    scene.fog = new THREE.FogExp2(0x060B14, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 24, 38);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xddeeff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(25, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const polarBlueLight = new THREE.PointLight(0x00E5FF, 1.5, 60);
    polarBlueLight.position.set(-10, 8, -5);
    scene.add(polarBlueLight);

    // Ground plane: Antarctic Ice and Permafrost
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0A1428,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const grid = new THREE.GridHelper(120, 24, 0x1E3A5F, 0x0E223D);
    grid.position.y = 0.02;
    scene.add(grid);

    // Interactive Meshes map
    const assetMeshes: Map<string, THREE.Mesh> = new Map();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Color mapper based on state
    const getColorForStatus = (status: string) => {
      switch (status) {
        case 'NORMAL': return 0x10B981; // Green
        case 'WATCH': return 0x38BDF8; // Cyan
        case 'WARNING': return 0xF59E0B; // Amber
        case 'CRITICAL': return 0xEF4444; // Red
        case 'FAILED': return 0x7F1D1D; // Dark Red
        default: return 0x64748B; // Grey
      }
    };

    // Construct Station Geometric Architecture
    // 1. Main Habitat Block (Raised on Stilts - Bharati style)
    const stiltMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    for (let x = -8; x <= 8; x += 8) {
      for (let z = -4; z <= 4; z += 4) {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.5), stiltMat);
        stilt.position.set(x, 1.25, z);
        scene.add(stilt);
      }
    }

    const mainBody = new THREE.Mesh(
      new THREE.BoxGeometry(20, 4, 12),
      new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.6, roughness: 0.4 })
    );
    mainBody.position.set(0, 4.5, 0);
    mainBody.castShadow = true;
    scene.add(mainBody);

    // 2. Solar Panels on roof
    const solarMesh = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: getColorForStatus('NORMAL'), roughness: 0.2, metalness: 0.9 })
    );
    solarMesh.position.set(0, 6.6, 0);
    solarMesh.userData = { assetId: 'bh_solar_01' };
    scene.add(solarMesh);
    assetMeshes.set('bh_solar_01', solarMesh);

    // 3. Genset Module Bay 1 (Primary Gen 01)
    const gen01Mesh = new THREE.Mesh(
      new THREE.BoxGeometry(4, 3, 5),
      new THREE.MeshStandardMaterial({ color: getColorForStatus(assets.find(a => a.id === 'bh_gen_01')?.status || 'NORMAL'), metalness: 0.5, roughness: 0.5 })
    );
    gen01Mesh.position.set(-10, 2, -5);
    gen01Mesh.userData = { assetId: 'bh_gen_01' };
    scene.add(gen01Mesh);
    assetMeshes.set('bh_gen_01', gen01Mesh);

    // 4. Genset Module Bay 2 (Aux Gen 02)
    const gen02Mesh = new THREE.Mesh(
      new THREE.BoxGeometry(4, 3, 5),
      new THREE.MeshStandardMaterial({ color: getColorForStatus(assets.find(a => a.id === 'bh_gen_02')?.status || 'NORMAL'), metalness: 0.5, roughness: 0.5 })
    );
    gen02Mesh.position.set(-7, 2, -5);
    gen02Mesh.userData = { assetId: 'bh_gen_02' };
    scene.add(gen02Mesh);
    assetMeshes.set('bh_gen_02', gen02Mesh);

    // 5. Fuel Tanks
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, metalness: 0.7, roughness: 0.3 });
    const tank1 = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 6, 24), tankMat);
    tank1.rotation.z = Math.PI / 2;
    tank1.position.set(18, 2, -12);
    tank1.userData = { assetId: 'bh_fuel_tank_01' };
    scene.add(tank1);
    assetMeshes.set('bh_fuel_tank_01', tank1);

    const tank2 = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 6, 24), tankMat);
    tank2.rotation.z = Math.PI / 2;
    tank2.position.set(22, 2, -12);
    tank2.userData = { assetId: 'bh_fuel_tank_02' };
    scene.add(tank2);
    assetMeshes.set('bh_fuel_tank_02', tank2);

    // 6. Satellite Radome & Tower
    const radomeTower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.2, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 })
    );
    radomeTower.position.set(12, 4, 10);
    scene.add(radomeTower);

    const radomeSphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.3 })
    );
    radomeSphere.position.set(12, 9, 10);
    radomeSphere.userData = { assetId: 'bh_comms_01' };
    scene.add(radomeSphere);
    assetMeshes.set('bh_comms_01', radomeSphere);

    // 7. Water Treatment Module
    const waterMesh = new THREE.Mesh(
      new THREE.BoxGeometry(5, 3, 5),
      new THREE.MeshStandardMaterial({ color: 0x0EA5E9, metalness: 0.4 })
    );
    waterMesh.position.set(5, 1.5, -4);
    waterMesh.userData = { assetId: 'bh_water_01' };
    scene.add(waterMesh);
    assetMeshes.set('bh_water_01', waterMesh);

    // 8. Helipad
    const helipad = new THREE.Mesh(
      new THREE.CylinderGeometry(6, 6, 0.3, 32),
      new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.8 })
    );
    helipad.position.set(-20, 0.15, 15);
    scene.add(helipad);

    // Animation & Controls Loop
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      // Orbit around center
      camera.position.x = camera.position.x * Math.cos(deltaX * 0.005) - camera.position.z * Math.sin(deltaX * 0.005);
      camera.position.z = camera.position.x * Math.sin(deltaX * 0.005) + camera.position.z * Math.cos(deltaX * 0.005);
      camera.position.y = Math.max(8, Math.min(60, camera.position.y - deltaY * 0.08));
      camera.lookAt(0, 3, 0);

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => { isDragging = false; };

    const handleClick = (e: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(assetMeshes.values()));

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const aId = clickedMesh.userData?.assetId;
        if (aId) {
          const match = assets.find(a => a.id === aId);
          if (match) setSelectedAsset(match);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('click', handleClick);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getElapsedTime();

      // Pulsing effect for critical or warning meshes
      assets.forEach(a => {
        const mesh = assetMeshes.get(a.id);
        if (mesh && (a.status === 'CRITICAL' || a.status === 'WARNING')) {
          const factor = (Math.sin(delta * 4) + 1) * 0.5;
          (mesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(
            a.status === 'CRITICAL' ? 0xff0000 : 0xffaa00
          );
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = factor * 0.6;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [assets]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-polar-950 overflow-hidden flex">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 space-y-2 pointer-events-none">
        <div className="bg-polar-900/90 border border-polar-750 p-3 rounded-lg backdrop-blur-md pointer-events-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-polar-cyan font-bold">
            <Layers className="w-4 h-4 text-polar-cyan" />
            <span>3D PHYSICAL DIGITAL TWIN — {stationId === 'station_bharati' ? 'BHARATI' : 'MAITRI'}</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Click any modular unit or equipment bay to inspect live physics telemetry and downstream cascading dependency propagation.
          </p>
          <div className="flex items-center gap-3 mt-2 text-[10px] font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> NORMAL</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> WARNING</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> CRITICAL</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" /> OFFLINE</span>
          </div>
        </div>
      </div>

      {/* Right Asset Inspection Drawer */}
      {selectedAsset && (
        <div className="absolute top-4 right-4 bottom-4 w-96 bg-polar-900/95 border border-polar-750/90 rounded-xl backdrop-blur-md shadow-2xl flex flex-col z-20 overflow-hidden">
          <div className="p-4 border-b border-polar-750 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  selectedAsset.status === 'NORMAL' ? 'bg-emerald-400' :
                  selectedAsset.status === 'WARNING' ? 'bg-amber-400 animate-pulse' :
                  selectedAsset.status === 'CRITICAL' ? 'bg-red-500 animate-ping' : 'bg-slate-400'
                }`} />
                <span className="text-xs font-mono font-bold text-white uppercase">{selectedAsset.code}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">{selectedAsset.name}</h3>
            </div>
            <button
              onClick={() => setSelectedAsset(null)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-polar-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {/* Status & Health Header */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-polar-950 p-2.5 rounded border border-polar-800">
                <span className="text-[10px] font-mono text-slate-500">OPERATIONAL STATUS</span>
                <div className="text-sm font-mono font-bold text-white mt-1">{selectedAsset.status}</div>
              </div>
              <div className="bg-polar-950 p-2.5 rounded border border-polar-800">
                <span className="text-[10px] font-mono text-slate-500">HEALTH SCORE</span>
                <div className={`text-sm font-mono font-bold mt-1 ${
                  selectedAsset.health_score > 80 ? 'text-emerald-400' :
                  selectedAsset.health_score > 50 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {selectedAsset.health_score}%
                </div>
              </div>
            </div>

            {/* Live Physical Telemetry Readings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-polar-cyan font-semibold">
                <span>PHYSICAL TELEMETRY STREAM</span>
                <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
              </div>
              <div className="bg-polar-950 p-3 rounded-lg border border-polar-800 space-y-2 text-xs font-mono">
                {Object.entries(selectedAsset.current_state || {}).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-polar-850 pb-1 last:border-0 last:pb-0">
                    <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span>
                    <span className="font-semibold text-white">
                      {typeof v === 'number' ? v.toFixed(2) : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Downstream Cascade Consequences */}
            {consequences && (
              <div className="space-y-2 pt-2 border-t border-polar-800">
                <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DOWNSTREAM IMPACT ("WHAT IF IT FAILS?")</span>
                </div>
                <div className="bg-polar-950/90 p-3 rounded-lg border border-polar-800 space-y-2 text-xs font-mono">
                  {consequences.power_deficit_kw > 0 && (
                    <div className="flex items-center justify-between text-red-400">
                      <span>Power Deficit:</span>
                      <strong className="font-mono">-{consequences.power_deficit_kw} kW</strong>
                    </div>
                  )}
                  {consequences.thermal_decay_to_5c_hours && (
                    <div className="flex items-center justify-between text-amber-400">
                      <span>Freeze Line (+5°C) Window:</span>
                      <strong>{consequences.thermal_decay_to_5c_hours} hours</strong>
                    </div>
                  )}
                  {consequences.affected_assets_count > 0 && (
                    <div className="text-[11px] text-slate-400 pt-1">
                      Cascades to <strong>{consequences.affected_assets_count}</strong> dependent systems (HVAC, Water RO, Comms).
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Provenance */}
          <div className="p-3 bg-polar-950 border-t border-polar-800 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500">Source: Physics Differential</span>
            <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
          </div>
        </div>
      )}
    </div>
  );
};
