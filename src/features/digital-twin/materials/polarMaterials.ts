import * as THREE from 'three';
import polarTwinIcon from '../../../assets/polar-twin-icon.png';

export interface PolarMaterialLibrary {
  // Environmental Materials
  snowTerrain: THREE.MeshStandardMaterial;
  iceSurface: THREE.MeshPhysicalMaterial;
  moraineRock: THREE.MeshStandardMaterial;
  lakePriyadarshini: THREE.MeshPhysicalMaterial;
  groundGrid: THREE.LineBasicMaterial;

  // Station Structural Materials
  bharatiHull: THREE.MeshStandardMaterial;
  bharatiHullAccent: THREE.MeshStandardMaterial;
  maitriOrangeHull: THREE.MeshStandardMaterial;
  maitriRoof: THREE.MeshStandardMaterial;
  structuralSteel: THREE.MeshStandardMaterial;
  steelStilts: THREE.MeshStandardMaterial;
  catwalkGrate: THREE.MeshStandardMaterial;
  insulatedGlass: THREE.MeshPhysicalMaterial;
  doorFrame: THREE.MeshStandardMaterial;

  // Industrial Equipment Materials
  machineryCast: THREE.MeshStandardMaterial;
  stainlessPipe: THREE.MeshStandardMaterial;
  exhaustStack: THREE.MeshStandardMaterial;
  radiatorGrille: THREE.MeshStandardMaterial;
  fuelTankBharati: THREE.MeshStandardMaterial;
  fuelTankMaitri: THREE.MeshStandardMaterial;
  solarPvCell: THREE.MeshStandardMaterial;
  solarFrame: THREE.MeshStandardMaterial;
  radomeDome: THREE.MeshStandardMaterial;
  antennaSteel: THREE.MeshStandardMaterial;
  switchgearCabinet: THREE.MeshStandardMaterial;
  transformerFins: THREE.MeshStandardMaterial;
  roMembraneVessel: THREE.MeshStandardMaterial;
  pumpMotor: THREE.MeshStandardMaterial;
  boilerVessel: THREE.MeshStandardMaterial;
  windTurbineBlade: THREE.MeshStandardMaterial;
  helipadSurface: THREE.MeshStandardMaterial;
  helipadMarking: THREE.MeshStandardMaterial;

  // Cargo & Vehicle Materials
  containerRed: THREE.MeshStandardMaterial;
  containerBlue: THREE.MeshStandardMaterial;
  containerWhite: THREE.MeshStandardMaterial;
  containerGreen: THREE.MeshStandardMaterial;
  snowcatYellow: THREE.MeshStandardMaterial;
  snowcatTrack: THREE.MeshStandardMaterial;

  // Operational & Telemetry Status Materials
  statusNormal: THREE.MeshStandardMaterial;
  statusWarning: THREE.MeshStandardMaterial;
  statusCritical: THREE.MeshStandardMaterial;
  statusOffline: THREE.MeshStandardMaterial;

  // Engineering & Special Visual Mode Materials
  wireframeEngineering: THREE.MeshBasicMaterial;
  thermalCold: THREE.MeshStandardMaterial;
  thermalNormal: THREE.MeshStandardMaterial;
  thermalWarm: THREE.MeshStandardMaterial;
  thermalHot: THREE.MeshStandardMaterial;

  // Interactive Selection Highlights
  selectedOutline: THREE.MeshBasicMaterial;
  hoverHighlight: THREE.MeshStandardMaterial;

  // National Mission Identity & Insignia
  missionLogoBadge: THREE.MeshStandardMaterial;
}

/**
 * Creates and returns a unified, high-performance PBR material library.
 * Reuses single instance materials across all modular geometries for 60 FPS performance.
 */
export function createPolarMaterialLibrary(): PolarMaterialLibrary {
  // Environmental
  const snowTerrain = new THREE.MeshStandardMaterial({
    color: 0xE2EEF8,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: false,
  });

  const iceSurface = new THREE.MeshPhysicalMaterial({
    color: 0x38BDF8,
    roughness: 0.12,
    metalness: 0.15,
    transmission: 0.45,
    transparent: true,
    opacity: 0.88,
    ior: 1.31, // Ice refractive index
  });

  const moraineRock = new THREE.MeshStandardMaterial({
    color: 0x2A2724,
    roughness: 0.92,
    metalness: 0.10,
  });

  const lakePriyadarshini = new THREE.MeshPhysicalMaterial({
    color: 0x0284C7,
    roughness: 0.08,
    metalness: 0.20,
    transmission: 0.55,
    transparent: true,
    opacity: 0.82,
    ior: 1.33,
  });

  const groundGrid = new THREE.LineBasicMaterial({
    color: 0x1E293B,
    transparent: true,
    opacity: 0.45,
  });

  // Station Architecture
  const bharatiHull = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.55,
    roughness: 0.35,
  });

  const bharatiHullAccent = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    metalness: 0.65,
    roughness: 0.30,
  });

  const maitriOrangeHull = new THREE.MeshStandardMaterial({
    color: 0xEA580C,
    metalness: 0.25,
    roughness: 0.45,
  });

  const maitriRoof = new THREE.MeshStandardMaterial({
    color: 0x9A3412,
    metalness: 0.35,
    roughness: 0.40,
  });

  const structuralSteel = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    metalness: 0.85,
    roughness: 0.25,
  });

  const steelStilts = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.88,
    roughness: 0.22,
  });

  const catwalkGrate = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.75,
    roughness: 0.50,
  });

  const insulatedGlass = new THREE.MeshPhysicalMaterial({
    color: 0x0E7490,
    metalness: 0.85,
    roughness: 0.08,
    transmission: 0.60,
    transparent: true,
    opacity: 0.70,
    ior: 1.52,
  });

  const doorFrame = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    metalness: 0.70,
    roughness: 0.30,
  });

  // Industrial Equipment
  const machineryCast = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.75,
    roughness: 0.35,
  });

  const stainlessPipe = new THREE.MeshStandardMaterial({
    color: 0xCBD5E1,
    metalness: 0.92,
    roughness: 0.18,
  });

  const exhaustStack = new THREE.MeshStandardMaterial({
    color: 0x64748B,
    metalness: 0.85,
    roughness: 0.25,
  });

  const radiatorGrille = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    metalness: 0.60,
    roughness: 0.60,
  });

  const fuelTankBharati = new THREE.MeshStandardMaterial({
    color: 0x0284C7,
    metalness: 0.50,
    roughness: 0.28,
  });

  const fuelTankMaitri = new THREE.MeshStandardMaterial({
    color: 0xD97706,
    metalness: 0.45,
    roughness: 0.32,
  });

  const solarPvCell = new THREE.MeshStandardMaterial({
    color: 0x0B132B,
    metalness: 0.95,
    roughness: 0.08,
    emissive: new THREE.Color(0x0284C7),
    emissiveIntensity: 0.08,
  });

  const solarFrame = new THREE.MeshStandardMaterial({
    color: 0x64748B,
    metalness: 0.90,
    roughness: 0.25,
  });

  const radomeDome = new THREE.MeshStandardMaterial({
    color: 0xF8FAFC,
    roughness: 0.30,
    metalness: 0.05,
  });

  const antennaSteel = new THREE.MeshStandardMaterial({
    color: 0xE2E8F0,
    metalness: 0.92,
    roughness: 0.15,
  });

  const switchgearCabinet = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    metalness: 0.65,
    roughness: 0.40,
  });

  const transformerFins = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.70,
    roughness: 0.35,
  });

  const roMembraneVessel = new THREE.MeshStandardMaterial({
    color: 0x0EA5E9,
    metalness: 0.60,
    roughness: 0.22,
  });

  const pumpMotor = new THREE.MeshStandardMaterial({
    color: 0x0284C7,
    metalness: 0.70,
    roughness: 0.30,
  });

  const boilerVessel = new THREE.MeshStandardMaterial({
    color: 0xB45309,
    metalness: 0.55,
    roughness: 0.35,
  });

  const windTurbineBlade = new THREE.MeshStandardMaterial({
    color: 0xF8FAFC,
    metalness: 0.30,
    roughness: 0.25,
  });

  const helipadSurface = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    metalness: 0.30,
    roughness: 0.85,
  });

  const helipadMarking = new THREE.MeshStandardMaterial({
    color: 0xFACC15,
    metalness: 0.10,
    roughness: 0.50,
  });

  // Logistics & Vehicles
  const containerRed = new THREE.MeshStandardMaterial({
    color: 0xDC2626,
    metalness: 0.40,
    roughness: 0.45,
  });

  const containerBlue = new THREE.MeshStandardMaterial({
    color: 0x2563EB,
    metalness: 0.40,
    roughness: 0.45,
  });

  const containerWhite = new THREE.MeshStandardMaterial({
    color: 0xF1F5F9,
    metalness: 0.30,
    roughness: 0.40,
  });

  const containerGreen = new THREE.MeshStandardMaterial({
    color: 0x16A34A,
    metalness: 0.40,
    roughness: 0.45,
  });

  const snowcatYellow = new THREE.MeshStandardMaterial({
    color: 0xEAB308,
    metalness: 0.50,
    roughness: 0.35,
  });

  const snowcatTrack = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.80,
    roughness: 0.60,
  });

  // Operational Status Materials
  const statusNormal = new THREE.MeshStandardMaterial({
    color: 0x10B981,
    emissive: new THREE.Color(0x10B981),
    emissiveIntensity: 0.45,
    roughness: 0.30,
  });

  const statusWarning = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    emissive: new THREE.Color(0xF59E0B),
    emissiveIntensity: 0.55,
    roughness: 0.30,
  });

  const statusCritical = new THREE.MeshStandardMaterial({
    color: 0xEF4444,
    emissive: new THREE.Color(0xEF4444),
    emissiveIntensity: 0.70,
    roughness: 0.30,
  });

  const statusOffline = new THREE.MeshStandardMaterial({
    color: 0x64748B,
    roughness: 0.70,
    metalness: 0.10,
  });

  // Modes
  const wireframeEngineering = new THREE.MeshBasicMaterial({
    color: 0x06B6D4,
    wireframe: true,
    transparent: true,
    opacity: 0.65,
  });

  const thermalCold = new THREE.MeshStandardMaterial({
    color: 0x1E40AF,
    emissive: new THREE.Color(0x1D4ED8),
    emissiveIntensity: 0.35,
    roughness: 0.4,
  });

  const thermalNormal = new THREE.MeshStandardMaterial({
    color: 0x10B981,
    emissive: new THREE.Color(0x059669),
    emissiveIntensity: 0.35,
    roughness: 0.4,
  });

  const thermalWarm = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    emissive: new THREE.Color(0xD97706),
    emissiveIntensity: 0.45,
    roughness: 0.4,
  });

  const thermalHot = new THREE.MeshStandardMaterial({
    color: 0xEF4444,
    emissive: new THREE.Color(0xDC2626),
    emissiveIntensity: 0.65,
    roughness: 0.4,
  });

  // Selection
  const selectedOutline = new THREE.MeshBasicMaterial({
    color: 0x22D3EE,
    wireframe: true,
    transparent: true,
    opacity: 0.85,
  });

  const hoverHighlight = new THREE.MeshStandardMaterial({
    color: 0x38BDF8,
    emissive: new THREE.Color(0x0284C7),
    emissiveIntensity: 0.4,
    roughness: 0.3,
  });

  // National Polar Mission Logo Badge Material
  const textureLoader = new THREE.TextureLoader();
  const iconTexture = textureLoader.load(polarTwinIcon);
  iconTexture.colorSpace = THREE.SRGBColorSpace;

  const missionLogoBadge = new THREE.MeshStandardMaterial({
    map: iconTexture,
    roughness: 0.25,
    metalness: 0.15,
    transparent: true,
    alphaTest: 0.05,
    emissive: new THREE.Color(0xFFFFFF),
    emissiveMap: iconTexture,
    emissiveIntensity: 0.28,
  });

  return {
    snowTerrain,
    iceSurface,
    moraineRock,
    lakePriyadarshini,
    groundGrid,
    bharatiHull,
    bharatiHullAccent,
    maitriOrangeHull,
    maitriRoof,
    structuralSteel,
    steelStilts,
    catwalkGrate,
    insulatedGlass,
    doorFrame,
    machineryCast,
    stainlessPipe,
    exhaustStack,
    radiatorGrille,
    fuelTankBharati,
    fuelTankMaitri,
    solarPvCell,
    solarFrame,
    radomeDome,
    antennaSteel,
    switchgearCabinet,
    transformerFins,
    roMembraneVessel,
    pumpMotor,
    boilerVessel,
    windTurbineBlade,
    helipadSurface,
    helipadMarking,
    containerRed,
    containerBlue,
    containerWhite,
    containerGreen,
    snowcatYellow,
    snowcatTrack,
    statusNormal,
    statusWarning,
    statusCritical,
    statusOffline,
    wireframeEngineering,
    thermalCold,
    thermalNormal,
    thermalWarm,
    thermalHot,
    selectedOutline,
    hoverHighlight,
    missionLogoBadge,
  };
}
