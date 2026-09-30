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
  WhatIfScenarioStep,
  LightingViewMode
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
import { GeolocationValidationModal } from './components/GeolocationValidationModal';
import { CausalChainModal } from './components/CausalChainModal';
import { DigitalTwinHUD } from './components/DigitalTwinHUD';
import { DependencyFlowLegend } from './components/DependencyFlowLegend';
import { TelemetryModeHUD } from './components/TelemetryModeHUD';
import { TwinAssetLabel } from '../../components/ui/TwinAssetLabel';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  stationId: string;
  onSelectStation?: (stationId: string) => void;
  onNavigateToSimulation?: (scenarioKey?: string) => void;
}

function resolveInteractiveAsset(assetId: string, stationId: string, currentAssets: StationAsset[]): StationAsset {
  const existing = currentAssets.find(a => a.id === assetId);
  if (existing) return existing;

  const isBharati = stationId === 'station_bharati';

  if (assetId === 'bh_mission_emblem' || assetId === 'maitri_mission_crest') {
    return {
      id: assetId,
      station_id: stationId,
      asset_type_id: 'type_insignia',
      name: isBharati ? 'Bharati Polar Mission Insignia & Crest' : 'Maitri Polar Mission Insignia & Crest',
      code: isBharati ? 'BH-CREST-01' : 'MA-CREST-01',
      status: 'NORMAL',
      health_score: 100,
      criticality: 'HIGH',
      location_desc: isBharati ? 'Central Aerodynamic Envelope Facade' : 'Main Living Block Primary Gantry Entrance',
      coordinates_3d: isBharati ? { x: 0, y: 9.1, z: 12.14 } : { x: 0, y: 3.6, z: 5.12 },
      current_state: {
        programme: 'Indian Antarctic Programme',
        authority: 'National Centre for Polar and Ocean Research (NCPOR)',
        ministry: 'Ministry of Earth Sciences (MoES), Govt. of India',
        coordinates: isBharati ? '69° 24.41′ S, 76° 11.72′ E (Larsemann Hills)' : '70° 45′ 58″ S, 11° 44′ 09″ E (Schirmacher Oasis)',
        elevation: isBharati ? '35m Above Sea Level' : '50m Above Sea Level',
        architectural_system: isBharati ? 'Aerodynamic 3-Tier Vacuum Envelope (bof / IMS)' : 'Steel-Stilt Modular Moraine Complex',
        operational_status: 'Fully Operational Mission Crest',
      },
      source_type: 'REAL_PUBLIC',
    };
  }

  if (assetId === 'bh_mission_monolith' || assetId === 'maitri_mission_monolith') {
    return {
      id: assetId,
      station_id: stationId,
      asset_type_id: 'type_monolith',
      name: isBharati ? 'Bharati Mission Control Gateway Monolith' : 'Maitri Mission Control Gateway Monolith',
      code: isBharati ? 'BH-MONO-01' : 'MA-MONO-01',
      status: 'NORMAL',
      health_score: 99.5,
      criticality: 'CRITICAL',
      location_desc: 'Station Operational Promenade',
      coordinates_3d: isBharati ? { x: -16, y: 3.5, z: 18 } : { x: 14, y: 3.0, z: 18 },
      current_state: {
        gateway_role: 'POLAR-EDGE Zero-Trust Rugged Telemetry Gateway',
        acquisition_bus: '100 Hz Real-Time Sensor Stream',
        uplink_transceiver: isBharati ? 'GSAT-11 Primary / Inmarsat Fallback' : 'Inmarsat BGAN / HF Radio',
        storage_buffer: 'NVMe Ring Buffer with CRC32 Integrity Checks',
        encryption: 'HMAC-SHA256 Authenticated',
      },
      source_type: 'REAL_PUBLIC',
    };
  }

  if (assetId.includes('hab') || assetId.includes('BLOCKS') || assetId.includes('BUILDING')) {
    return {
      id: assetId,
      station_id: stationId,
      asset_type_id: 'type_hab',
      name: isBharati ? 'Bharati Main Aerodynamic Habitat' : 'Maitri Living & Science Complex',
      code: isBharati ? 'BH-HAB-01' : 'MA-HAB-01',
      status: 'NORMAL',
      health_score: 97.5,
      criticality: 'CRITICAL',
      location_desc: 'Station Primary Living & Operations Enclosure',
      coordinates_3d: { x: 0, y: 5.0, z: 0 },
      current_state: {
        indoor_temperature_c: isBharati ? 20.8 : 19.5,
        indoor_pressure_hpa: 988.4,
        occupancy_ratio: isBharati ? '18 / 25 Personnel' : '22 / 25 Personnel',
        life_support_state: 'OPTIMAL',
        thermal_envelope: 'Vacuum-Insulated Facade, Triple Glazed',
      },
      source_type: 'REAL_PUBLIC',
    };
  }

  return {
    id: assetId,
    station_id: stationId,
    asset_type_id: 'type_subsystem',
    name: assetId.replace(/[_-]/g, ' ').toUpperCase(),
    code: assetId.toUpperCase(),
    status: 'NORMAL',
    health_score: 96.0,
    criticality: 'HIGH',
    location_desc: 'Operational Station Sector',
    coordinates_3d: { x: 0, y: 2.0, z: 0 },
    current_state: {
      operational_mode: 'ACTIVE',
      telemetry_link: 'ONLINE',
      station: isBharati ? 'Bharati Antarctic Base' : 'Maitri Antarctic Base',
    },
    source_type: 'REAL_PUBLIC',
  };
}

export const Station3DViewer: React.FC<Props> = ({ stationId, onSelectStation, onNavigateToSimulation }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const mountRef = useRef<HTMLDivElement>(null);
  const [assets, setAssets] = useState<StationAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<StationAsset | null>(null);
  const [consequences, setConsequences] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Visual Modes & Controls State
  const [visualMode, setVisualMode] = useState<VisualMode>('REALISTIC');
  const [lightingViewMode, setLightingViewMode] = useState<LightingViewMode>('OPERATIONAL');
  const [gridVisible, setGridVisible] = useState(true);
  const [snowVisible, setSnowVisible] = useState(true);
  const [flowVisible, setFlowVisible] = useState(true);
  const [humanScaleVisible, setHumanScaleVisible] = useState(false);
  const [measuringActive, setMeasuringActive] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<MeasurementResult | null>(null);

  // Geolocation & Spatial Model Audit Modal
  const [isGeolocModalOpen, setIsGeolocModalOpen] = useState(false);

  // 10-Link Cross-Domain Causal Chain Modal
  const [isCausalModalOpen, setIsCausalModalOpen] = useState(false);

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
    setSelectedAsset(null);
    setAssets([]);
    loadAssets();
  }, [stationId]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await api.getStationAssets(stationId);
      setAssets(data);
      if (data.length > 0) {
        const isBharati = stationId === 'station_bharati';
        const primaryAsset = data.find(a => isBharati ? a.id === 'bh_gen_01' : a.id === 'ma_gen_01') || data[0];
        setSelectedAsset(primaryAsset);
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
        OVERVIEW: { pos: new THREE.Vector3(52, 34, 48), look: new THREE.Vector3(0, 4, 0) },
        MAIN_BUILDING: { pos: new THREE.Vector3(0, 18, 36), look: new THREE.Vector3(0, 6, 0) },
        ENERGY: { pos: new THREE.Vector3(-48, 14, 2), look: new THREE.Vector3(-36, 2, -14) },
        WATER: { pos: new THREE.Vector3(22, 12, -12), look: new THREE.Vector3(12, 2, -24) },
        COMMS: { pos: new THREE.Vector3(42, 20, 36), look: new THREE.Vector3(32, 10, 24) },
        FUEL: { pos: new THREE.Vector3(46, 14, -14), look: new THREE.Vector3(36, 2, -26) },
        LOGISTICS: { pos: new THREE.Vector3(-46, 14, 36), look: new THREE.Vector3(-36, 2, 24) },
        SCIENCE: { pos: new THREE.Vector3(-2, 14, 30), look: new THREE.Vector3(-12, 4, 20) },
        RESET: { pos: new THREE.Vector3(52, 34, 48), look: new THREE.Vector3(0, 4, 0) },
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
    environment.updateTheme(isDark);
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

    // 5.5 Cache authentic PBR materials across all meshes for flawless visual mode restoration
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        if (!obj.userData) obj.userData = {};
        if (!obj.userData.originalMaterial) {
          obj.userData.originalMaterial = obj.material;
        }
      }
    });

    // 6. Dependency Flow Overlay
    const flowOverlay = new DependencyFlowOverlay(scene, stationId);
    flowOverlay.setVisible(visualMode === 'DEPENDENCY');
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
          const match = resolveInteractiveAsset(foundAssetId, stationId, assets);
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
          const match = resolveInteractiveAsset(foundAssetId, stationId, assets);
          if (match) {
            setSelectedAsset(match);
            if (match.coordinates_3d) {
              const c = match.coordinates_3d;
              const targetLook = new THREE.Vector3(c.x, c.y + 0.5, c.z);
              const targetPos = new THREE.Vector3(c.x + 10, c.y + 6, c.z + 12);
              flyCameraTo(targetPos, targetLook, 0.7);
            }
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

  // Synchronize Visual Modes across Materials and Overlays
  useEffect(() => {
    if (!materialsRef.current || !sceneRef.current) return;
    const mats = materialsRef.current;

    if (visualMode === 'REALISTIC') {
      // 1. Fully restore all authentic PBR materials
      sceneRef.current.traverse(obj => {
        if (obj instanceof THREE.Mesh && obj.userData?.originalMaterial) {
          obj.material = obj.userData.originalMaterial;
        }
      });
      // Restore beacon materials
      if (bharatiBuilderRef.current) bharatiBuilderRef.current.updateBeacons();
      if (maitriBuilderRef.current) maitriBuilderRef.current.updateBeacons();
      // In REALISTIC PBR mode, flow tubes remain hidden so pure PBR surfaces and lighting shine
      if (flowOverlayRef.current) {
        flowOverlayRef.current.setVisible(false);
        flowOverlayRef.current.setHighlightedAsset(null);
      }
    } 
    else if (visualMode === 'TELEMETRY') {
      // 2. Telemetry Mode: Recolor interactive machinery by live operational status
      // Static background structure gets subdued backdrop contrast for high pop
      sceneRef.current.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          if (obj.material === mats.missionLogoBadge || obj.userData?.isLogo || obj.material === mats.insulatedGlass) {
            return;
          }
          const assetId = obj.userData?.assetId;
          if (assetId) {
            // Find live asset state
            const asset = resolveInteractiveAsset(assetId, stationId, assets);
            const status = asset?.status || 'NORMAL';
            if (status === 'NORMAL') obj.material = mats.statusNormal;
            else if (status === 'WATCH' || status === 'WARNING') obj.material = mats.statusWarning;
            else if (status === 'CRITICAL' || status === 'FAILED') obj.material = mats.statusCritical;
            else if (status === 'OFFLINE') obj.material = mats.statusOffline;
            else obj.material = mats.statusNormal;
          } else {
            // Static architecture gets dimmed high-contrast telemetry backdrop
            if (obj !== environmentRef.current?.terrainMesh && obj !== environmentRef.current?.iceMesh && obj.userData?.originalMaterial) {
              obj.material = mats.telemetryBackdrop;
            }
          }
        }
      });
      if (flowOverlayRef.current) {
        flowOverlayRef.current.setVisible(false);
      }
    }
    else if (visualMode === 'DEPENDENCY') {
      // 3. Dependency Mode: Turn on flow lines & make buildings ghost/x-ray so internal/external networks are visible
      if (flowOverlayRef.current) {
        flowOverlayRef.current.setVisible(true);
        flowOverlayRef.current.setHighlightedAsset(selectedAsset ? selectedAsset.id : null);
      }

      sceneRef.current.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          const assetId = obj.userData?.assetId;
          if (assetId) {
            // Highlight nodes connected to flow lines
            if (assetId.includes('fuel')) {
              obj.material = mats.statusWarning; // Amber fuel highlight
            } else if (assetId.includes('gen') || assetId.includes('pdb') || assetId.includes('solar') || assetId.includes('bess') || assetId.includes('wind')) {
              obj.material = mats.flowHighlighted; // Cyan electrical highlight
            } else if (assetId.includes('water') || assetId.includes('pump') || assetId.includes('res') || assetId.includes('RO')) {
              obj.material = mats.roMembraneVessel; // Water blue highlight
            } else if (assetId.includes('hvac') || assetId.includes('boiler') || assetId.includes('BLR')) {
              obj.material = mats.thermalWarm; // Heating orange highlight
            } else if (assetId.includes('comms') || assetId.includes('sat') || assetId.includes('SAT')) {
              obj.material = mats.antennaSteel; // Comms violet/steel highlight
            } else {
              obj.material = mats.ghostTranslucent;
            }
          } else if (obj.userData?.originalMaterial) {
            // Non-asset structures (building exterior envelope, stilts, roofs) become ghost translucent
            if (obj !== environmentRef.current?.terrainMesh && obj !== environmentRef.current?.iceMesh) {
              obj.material = mats.ghostTranslucent;
            }
          }
        }
      });
    }
    else if (visualMode === 'ENGINEERING') {
      // 4. Engineering Wireframe Mode
      sceneRef.current.traverse(obj => {
        if (obj instanceof THREE.Mesh && obj !== environmentRef.current?.terrainMesh && obj !== environmentRef.current?.iceMesh) {
          obj.material = mats.wireframeEngineering;
        }
      });
      if (flowOverlayRef.current) {
        flowOverlayRef.current.setVisible(false);
      }
    }
    else if (visualMode === 'THERMAL') {
      // 5. Thermal False-Color IR Mode
      sceneRef.current.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          const aId = obj.userData?.assetId;
          if (aId?.includes('gen') || aId?.includes('boiler') || aId?.includes('BLR')) obj.material = mats.thermalHot;
          else if (aId?.includes('hvac') || aId?.includes('solar') || aId?.includes('bess')) obj.material = mats.thermalWarm;
          else if (aId?.includes('water') || aId?.includes('fuel') || aId?.includes('pump')) obj.material = mats.thermalCold;
          else if (obj !== environmentRef.current?.terrainMesh && obj !== environmentRef.current?.iceMesh) obj.material = mats.thermalNormal;
        }
      });
      if (flowOverlayRef.current) {
        flowOverlayRef.current.setVisible(false);
      }
    }
  }, [visualMode, assets, stationId, flowVisible, selectedAsset]);

  // Update Dependency Flow tracing when selected asset changes in DEPENDENCY mode
  useEffect(() => {
    if (flowOverlayRef.current && visualMode === 'DEPENDENCY') {
      flowOverlayRef.current.setHighlightedAsset(selectedAsset ? selectedAsset.id : null);
    }
  }, [selectedAsset, visualMode]);

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
    if (flowOverlayRef.current) {
      if (visualMode === 'DEPENDENCY') {
        flowOverlayRef.current.setVisible(flowVisible);
      } else {
        flowOverlayRef.current.setVisible(false);
      }
    }
  }, [flowVisible, visualMode]);

  // Synchronize Human Scale Avatar Visibility
  useEffect(() => {
    if (environmentRef.current) environmentRef.current.setHumanScaleVisible(humanScaleVisible);
  }, [humanScaleVisible]);

  // Synchronize Theme Changes (Light / Dark Antarctic atmosphere, lighting, and grid)
  useEffect(() => {
    if (environmentRef.current) {
      environmentRef.current.updateTheme(isDark);
    }
  }, [isDark]);

  // Synchronize Atmosphere Lighting View Mode
  useEffect(() => {
    if (environmentRef.current) {
      environmentRef.current.setLightingViewMode(lightingViewMode);
    }
  }, [lightingViewMode]);

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

  const handleVisualModeChange = useCallback((mode: VisualMode) => {
    setVisualMode(mode);
    if (mode === 'DEPENDENCY') {
      setFlowVisible(true);
    } else {
      setFlowVisible(false);
    }
  }, []);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-polar-base overflow-hidden flex font-mono select-none">
      {/* 3D WebGL Canvas Mount */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none" 
      />

      {/* Top Left HUD Station Telemetry Overlay */}
      <DigitalTwinHUD
        stationId={stationId}
        onSelectStation={onSelectStation}
        visualMode={visualMode}
        lightingViewMode={lightingViewMode}
        onLightingViewModeChange={setLightingViewMode}
        onOpenGeolocAudit={() => setIsGeolocModalOpen(true)}
        onOpenCausalChain={() => setIsCausalModalOpen(true)}
        measurementResult={measurementResult}
        measuringActive={measuringActive}
        onClearMeasurement={handleClearMeasurement}
        activeSimulationTitle={activeScenario?.title}
        activeSimulationTimeLabel={activeStep?.timeLabel}
        onResetSimulation={handleResetScenario}
        healthScore={stationId === 'station_bharati' ? 96.5 : 94.2}
        generationKw={stationId === 'station_bharati' ? 185.0 : 160.0}
      />

      {/* Dedicated Dependency Flow Legend HUD */}
      {visualMode === 'DEPENDENCY' && !selectedAsset && (
        <DependencyFlowLegend
          stationId={stationId}
          selectedAsset={selectedAsset}
          onClearSelection={() => setSelectedAsset(null)}
          onSelectAsset={handleFocusAsset}
        />
      )}

      {/* Dedicated Telemetry HUD */}
      {visualMode === 'TELEMETRY' && (
        <TelemetryModeHUD
          stationId={stationId}
          assets={assets}
          selectedAssetId={selectedAsset?.id}
          onSelectAsset={handleFocusAsset}
        />
      )}

      {/* Floating Bottom Control Toolbar */}
      <DigitalTwinToolbar
        visualMode={visualMode}
        onVisualModeChange={handleVisualModeChange}
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

      {/* NCPOR Geodetic Grounding & 3D Spatial Audit Modal */}
      <GeolocationValidationModal
        isOpen={isGeolocModalOpen}
        onClose={() => setIsGeolocModalOpen(false)}
        stationId={stationId}
      />

      {/* 10-Link Cross-Domain Causal Chain Forensic Modal */}
      <CausalChainModal
        isOpen={isCausalModalOpen}
        onClose={() => setIsCausalModalOpen(false)}
        stationId={stationId}
      />
    </div>
  );
};
