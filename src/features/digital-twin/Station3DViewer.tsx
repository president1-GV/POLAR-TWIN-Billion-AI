import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { StationAsset } from '../../types';
import { api } from '../../services/api';
import { 
  VisualMode, 
  CameraPresetId, 
  MeasurementResult, 
  WhatIfScenario, 
  WhatIfScenarioStep 
} from './types';
import { createPolarMaterialLibrary, PolarMaterialLibrary } from './materials/polarMaterials';
import { AntarcticEnvironment } from './environment/AntarcticEnvironment';
import { BharatiStationBuilder } from './builders/BharatiStationBuilder';
import { MaitriStationBuilder } from './builders/MaitriStationBuilder';
import { DependencyFlowOverlay } from './systems/DependencyFlowOverlay';
import { MeasurementTool } from './systems/MeasurementTool';
import { DigitalTwinToolbar } from './components/DigitalTwinToolbar';
import { EquipmentInspector } from './components/EquipmentInspector';
import { WhatIfSimulationModal } from './components/WhatIfSimulationModal';
import { DigitalTwinHUD } from './components/DigitalTwinHUD';
import { TwinAssetLabel } from '../../components/ui/TwinAssetLabel';

interface Props {
  stationId: string;
  onNavigateToSimulation?: (scenarioKey?: string) => void;
}

export const Station3DViewer: React.FC<Props> = ({ stationId, onNavigateToSimulation }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [assets, setAssets] = useState<StationAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<StationAsset | null>(null);
  const [consequences, setConsequences] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Visual Modes & Controls State
  const [visualMode, setVisualMode] = useState<VisualMode>('REALISTIC');
  const [gridVisible, setGridVisible] = useState(true);
  const [snowVisible, setSnowVisible] = useState(true);
  const [flowVisible, setFlowVisible] = useState(true);
  const [humanScaleVisible, setHumanScaleVisible] = useState(false);
  const [measuringActive, setMeasuringActive] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<MeasurementResult | null>(null);

  // What-If Simulation State
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<WhatIfScenario | null>(null);
  const [activeStep, setActiveStep] = useState<WhatIfScenarioStep | null>(null);

  // Hover Tooltip State
  const [hoveredAsset, setHoveredAsset] = useState<{ asset: StationAsset; screenX: number; screenY: number } | null>(null);

  // References for Three.js instances to allow smooth tweening and dynamic updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const environmentRef = useRef<AntarcticEnvironment | null>(null);
  const bharatiBuilderRef = useRef<BharatiStationBuilder | null>(null);
  const maitriBuilderRef = useRef<MaitriStationBuilder | null>(null);
  const flowOverlayRef = useRef<DependencyFlowOverlay | null>(null);
  const measureToolRef = useRef<MeasurementTool | null>(null);
  const materialsRef = useRef<PolarMaterialLibrary | null>(null);

  // Camera transition tween state
  const cameraTransitionRef = useRef<{
    startPos: THREE.Vector3;
    targetPos: THREE.Vector3;
    startLook: THREE.Vector3;
    targetLook: THREE.Vector3;
    progress: number;
    duration: number;
    active: boolean;
  }>({
    startPos: new THREE.Vector3(),
    targetPos: new THREE.Vector3(),
    startLook: new THREE.Vector3(),
    targetLook: new THREE.Vector3(),
    progress: 0,
    duration: 0.8,
    active: false,
  });

  // Load Station Assets from Supabase / API
  useEffect(() => {
    loadAssets();
  }, [stationId]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await api.getStationAssets(stationId);
      setAssets(data);
      if (data.length > 0) {
        setSelectedAsset(data[0]);
      }
    } catch (e) {
      console.error('Failed to load assets for 3D viewer:', e);
    } finally {
      setLoading(false);
    }
  };

  // Load Consequences when selected asset changes
  useEffect(() => {
    if (selectedAsset) {
      api.getAssetConsequences(selectedAsset.id)
        .then(setConsequences)
        .catch(console.error);
    } else {
      setConsequences(null);
    }
  }, [selectedAsset]);

  // Smooth Camera Fly-To function
  const flyCameraTo = useCallback((targetPos: THREE.Vector3, targetLook: THREE.Vector3, duration: number = 0.8) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const t = cameraTransitionRef.current;
    t.startPos.copy(cameraRef.current.position);
    t.targetPos.copy(targetPos);
    t.startLook.copy(controlsRef.current.target);
    t.targetLook.copy(targetLook);
    t.progress = 0;
    t.duration = duration;
    t.active = true;
  }, []);

  // Camera Presets dictionary
  const getCameraPresets = useCallback((): Record<CameraPresetId, { pos: THREE.Vector3; look: THREE.Vector3 }> => {
    const isBharati = stationId === 'station_bharati';
    if (isBharati) {
      return {
        OVERVIEW: { pos: new THREE.Vector3(38, 28, 42), look: new THREE.Vector3(0, 3, 0) },
        MAIN_BUILDING: { pos: new THREE.Vector3(0, 12, 24), look: new THREE.Vector3(0, 5, 0) },
        ENERGY: { pos: new THREE.Vector3(-26, 12, 12), look: new THREE.Vector3(-18, 2, -4) },
        WATER: { pos: new THREE.Vector3(18, 8, 4), look: new THREE.Vector3(10, 2, -8) },
        COMMS: { pos: new THREE.Vector3(24, 16, 18), look: new THREE.Vector3(16, 8, 8) },
        FUEL: { pos: new THREE.Vector3(32, 12, -4), look: new THREE.Vector3(22, 2, -14) },
        LOGISTICS: { pos: new THREE.Vector3(-26, 10, 28), look: new THREE.Vector3(-14, 2, 14) },
        SCIENCE: { pos: new THREE.Vector3(14, 12, 16), look: new THREE.Vector3(8, 5, 4) },
        RESET: { pos: new THREE.Vector3(38, 28, 42), look: new THREE.Vector3(0, 3, 0) },
      };
    } else {
      return {
        OVERVIEW: { pos: new THREE.Vector3(36, 26, 38), look: new THREE.Vector3(0, 2, 0) },
        MAIN_BUILDING: { pos: new THREE.Vector3(0, 10, 20), look: new THREE.Vector3(0, 3, 0) },
        ENERGY: { pos: new THREE.Vector3(-24, 10, 6), look: new THREE.Vector3(-16, 2, -8) },
        WATER: { pos: new THREE.Vector3(26, 8, 18), look: new THREE.Vector3(18, 2, 8) },
        COMMS: { pos: new THREE.Vector3(18, 12, 6), look: new THREE.Vector3(12, 6, -6) },
        FUEL: { pos: new THREE.Vector3(-24, 8, 18), look: new THREE.Vector3(-18, 2, 10) },
        LOGISTICS: { pos: new THREE.Vector3(18, 8, 24), look: new THREE.Vector3(10, 2, 16) },
        SCIENCE: { pos: new THREE.Vector3(-18, 8, -8), look: new THREE.Vector3(-14, 2, -16) },
        RESET: { pos: new THREE.Vector3(36, 26, 38), look: new THREE.Vector3(0, 2, 0) },
      };
    }
  }, [stationId]);

  // Handle Preset Selection
  const handleCameraPreset = useCallback((presetId: CameraPresetId) => {
    const presets = getCameraPresets();
    const target = presets[presetId] || presets.OVERVIEW;
    flyCameraTo(target.pos, target.look, 0.8);
  }, [getCameraPresets, flyCameraTo]);

  // Handle Focus On Asset
  const handleFocusAsset = useCallback((assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    setSelectedAsset(asset);

    const c = asset.coordinates_3d;
    const targetLook = new THREE.Vector3(c.x, c.y + 1.5, c.z);
    // Camera position offset slightly elevated and facing the asset
    const targetPos = new THREE.Vector3(c.x + 8, c.y + 6, c.z + 10);
    flyCameraTo(targetPos, targetLook, 0.7);
  }, [assets, flyCameraTo]);

  // Apply What-If Failure Scenario to 3D Scene
  const handleApplyScenario = useCallback((scenario: WhatIfScenario, step: WhatIfScenarioStep) => {
    setActiveScenario(scenario);
    setActiveStep(step);

    // Update assets locally to reflect simulated status
    setAssets(prev => prev.map(a => {
      if (step.affectedAssetIds.includes(a.id)) {
        return {
          ...a,
          status: a.id === scenario.triggerAssetId ? 'CRITICAL' : 'WARNING',
          health_score: a.id === scenario.triggerAssetId ? 25 : Math.max(45, a.health_score - 30),
        };
      }
      return a;
    }));

    // Focus camera on the trigger asset
    handleFocusAsset(scenario.triggerAssetId);
  }, [handleFocusAsset]);

  // Reset What-If Simulation
  const handleResetScenario = useCallback(() => {
    setActiveScenario(null);
    setActiveStep(null);
    loadAssets();
  }, [stationId]);

  // Three.js Master Scene Setup & Animation Loop
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const isBharati = stationId === 'station_bharati';
    const initialPos = isBharati ? new THREE.Vector3(38, 28, 42) : new THREE.Vector3(36, 26, 38);
    camera.position.copy(initialPos);
    camera.lookAt(0, 3, 0);
    cameraRef.current = camera;

    // 2. High-Fidelity Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // 3. Smooth Damped Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 140;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Prevent camera clipping through ground
    controls.target.set(0, 3, 0);
    controlsRef.current = controls;

    // 4. PBR Materials & Antarctic Environment
    const materials = createPolarMaterialLibrary();
    materialsRef.current = materials;

    const environment = new AntarcticEnvironment(scene, materials, stationId);
    environment.setGridVisible(gridVisible);
    environment.setSnowVisible(snowVisible);
    environment.setHumanScaleVisible(humanScaleVisible);
    environmentRef.current = environment;

    // 5. Station Builder (Bharati or Maitri)
    let interactiveMap: Map<string, THREE.Object3D>;
    if (isBharati) {
      const bharati = new BharatiStationBuilder(materials, assets);
      scene.add(bharati.group);
      bharatiBuilderRef.current = bharati;
      interactiveMap = bharati.interactiveMap;
    } else {
      const maitri = new MaitriStationBuilder(materials, assets);
      scene.add(maitri.group);
      maitriBuilderRef.current = maitri;
      interactiveMap = maitri.interactiveMap;
    }

    // 6. Dependency Flow Overlay
    const flowOverlay = new DependencyFlowOverlay(scene, stationId);
    flowOverlay.setVisible(flowVisible);
    flowOverlayRef.current = flowOverlay;

    // 7. Measurement Tool
    const measureTool = new MeasurementTool(scene);
    measureTool.onMeasurementChange = setMeasurementResult;
    measureToolRef.current = measureTool;

    // 8. Raycasting for Hover & Click Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveObjects = Array.from(interactiveMap.values());
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        let foundAssetId: string | null = null;
        while (hitObj && hitObj !== scene) {
          if (hitObj.userData?.assetId) {
            foundAssetId = hitObj.userData.assetId;
            break;
          }
          hitObj = hitObj.parent;
        }

        if (foundAssetId) {
          const match = assets.find(a => a.id === foundAssetId);
          if (match) {
            mountRef.current.style.cursor = 'pointer';
            setHoveredAsset({
              asset: match,
              screenX: e.clientX,
              screenY: e.clientY,
            });
            return;
          }
        }
      }

      mountRef.current.style.cursor = measuringActive ? 'crosshair' : 'grab';
      setHoveredAsset(null);
    };

    const handleClick = (e: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // If measuring tool is active, record 3D point
      if (measuringActive && measureToolRef.current) {
        const allIntersects = raycaster.intersectObjects(scene.children, true);
        if (allIntersects.length > 0) {
          measureToolRef.current.handlePointClick(allIntersects[0].point);
          return;
        }
      }

      // Standard Equipment Selection
      const interactiveObjects = Array.from(interactiveMap.values());
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        let foundAssetId: string | null = null;
        while (hitObj && hitObj !== scene) {
          if (hitObj.userData?.assetId) {
            foundAssetId = hitObj.userData.assetId;
            break;
          }
          hitObj = hitObj.parent;
        }

        if (foundAssetId) {
          const match = assets.find(a => a.id === foundAssetId);
          if (match) {
            setSelectedAsset(match);
          }
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointermove', handlePointerMove);
    dom.addEventListener('click', handleClick);

    // 9. Animation & Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Camera Fly-To Lerp
      const t = cameraTransitionRef.current;
      if (t.active) {
        t.progress += delta / t.duration;
        if (t.progress >= 1.0) {
          t.progress = 1.0;
          t.active = false;
        }
        // Cubic easeInOut
        const p = t.progress;
        const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        camera.position.lerpVectors(t.startPos, t.targetPos, ease);
        controls.target.lerpVectors(t.startLook, t.targetLook, ease);
      }

      controls.update();

      // Update environment (snowfall)
      environment.updateAnimation(delta);

      // Update Maitri wind rotors if active
      if (maitriBuilderRef.current) {
        maitriBuilderRef.current.updateAnimation(delta);
      }

      // Update dependency flow lines
      if (flowOverlayRef.current) {
        const failedIds = activeStep ? activeStep.affectedAssetIds : [];
        flowOverlayRef.current.updateAnimation(delta, failedIds);
      }

      renderer.render(scene, camera);
    };
    animate();

    // 10. Responsive Resizing
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
      cancelAnimationFrame(animId);
      dom.removeEventListener('pointermove', handlePointerMove);
      dom.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);

      environment.dispose();
      flowOverlay.dispose();
      measureTool.dispose();
      if (bharatiBuilderRef.current) bharatiBuilderRef.current.dispose();
      if (maitriBuilderRef.current) maitriBuilderRef.current.dispose();

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [stationId, assets]);

  // Synchronize Visual Modes across Materials
  useEffect(() => {
    if (!materialsRef.current || !sceneRef.current) return;
    const mats = materialsRef.current;

    sceneRef.current.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        if (visualMode === 'ENGINEERING') {
          obj.material = mats.wireframeEngineering;
        } else if (visualMode === 'THERMAL') {
          // False-color temperature map based on object role
          const aId = obj.userData?.assetId;
          if (aId?.includes('gen') || aId?.includes('boiler')) obj.material = mats.thermalHot;
          else if (aId?.includes('hvac')) obj.material = mats.thermalWarm;
          else if (aId?.includes('water') || aId?.includes('fuel')) obj.material = mats.thermalCold;
          else obj.material = mats.thermalNormal;
        }
      }
    });

    if (visualMode === 'REALISTIC') {
      // Restore standard materials via beacon update
      if (bharatiBuilderRef.current) bharatiBuilderRef.current.updateBeacons();
      if (maitriBuilderRef.current) maitriBuilderRef.current.updateBeacons();
    }
  }, [visualMode]);

  // Synchronize Grid Visibility
  useEffect(() => {
    if (environmentRef.current) environmentRef.current.setGridVisible(gridVisible);
  }, [gridVisible]);

  // Synchronize Snowfall Visibility
  useEffect(() => {
    if (environmentRef.current) environmentRef.current.setSnowVisible(snowVisible);
  }, [snowVisible]);

  // Synchronize Dependency Flow Lines Visibility
  useEffect(() => {
    if (flowOverlayRef.current) flowOverlayRef.current.setVisible(flowVisible);
  }, [flowVisible]);

  // Synchronize Human Scale Avatar Visibility
  useEffect(() => {
    if (environmentRef.current) environmentRef.current.setHumanScaleVisible(humanScaleVisible);
  }, [humanScaleVisible]);

  // Toggle Measurement Tool
  const handleToggleMeasuring = () => {
    setMeasuringActive(prev => {
      const next = !prev;
      if (!next && measureToolRef.current) {
        measureToolRef.current.reset();
      }
      return next;
    });
  };

  const handleClearMeasurement = () => {
    if (measureToolRef.current) measureToolRef.current.reset();
  };

  const handleResetCamera = () => {
    handleCameraPreset('RESET');
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-[#050A12] overflow-hidden flex font-mono select-none">
      {/* 3D WebGL Canvas Mount */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none" 
      />

      {/* Top Left HUD Station Telemetry Overlay */}
      <DigitalTwinHUD
        stationId={stationId}
        visualMode={visualMode}
        measurementResult={measurementResult}
        measuringActive={measuringActive}
        onClearMeasurement={handleClearMeasurement}
        activeSimulationTitle={activeScenario?.title}
        activeSimulationTimeLabel={activeStep?.timeLabel}
        onResetSimulation={handleResetScenario}
        healthScore={stationId === 'station_bharati' ? 96.5 : 94.2}
        generationKw={stationId === 'station_bharati' ? 185.0 : 160.0}
      />

      {/* Floating Bottom Control Toolbar */}
      <DigitalTwinToolbar
        visualMode={visualMode}
        onVisualModeChange={setVisualMode}
        onCameraPreset={handleCameraPreset}
        gridVisible={gridVisible}
        onToggleGrid={() => setGridVisible(!gridVisible)}
        snowVisible={snowVisible}
        onToggleSnow={() => setSnowVisible(!snowVisible)}
        flowVisible={flowVisible}
        onToggleFlow={() => setFlowVisible(!flowVisible)}
        humanScaleVisible={humanScaleVisible}
        onToggleHumanScale={() => setHumanScaleVisible(!humanScaleVisible)}
        measuringActive={measuringActive}
        onToggleMeasuring={handleToggleMeasuring}
        onOpenWhatIf={() => setIsWhatIfOpen(true)}
        onResetCamera={handleResetCamera}
      />

      {/* Right-Side Industrial Equipment Inspector */}
      {selectedAsset && (
        <EquipmentInspector
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onFocusCamera={handleFocusAsset}
          onSelectRelatedAsset={handleFocusAsset}
          onTriggerSimulation={() => setIsWhatIfOpen(true)}
          consequences={consequences}
        />
      )}

      {/* 3D HUD Asset Marker Overlay */}
      {hoveredAsset && !selectedAsset && (
        <TwinAssetLabel
          name={hoveredAsset.asset.name}
          code={hoveredAsset.asset.code}
          status={hoveredAsset.asset.status}
          health={hoveredAsset.asset.health_score}
          screenX={hoveredAsset.screenX}
          screenY={hoveredAsset.screenY}
          subsystem={hoveredAsset.asset.criticality}
          onSelect={() => setSelectedAsset(hoveredAsset.asset)}
        />
      )}

      {/* What-If Physical Failure Simulation Modal */}
      <WhatIfSimulationModal
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        stationId={stationId}
        onApplyScenario={handleApplyScenario}
        onResetScenario={handleResetScenario}
        activeScenarioId={activeScenario?.id}
      />
    </div>
  );
};
