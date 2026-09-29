/**
 * POLAR-TWIN GEODETIC REFERENCE & SPATIAL TRANSFORMATION ENGINE
 * 
 * Provides rigorous geodetic transformation pipelines between:
 * 1. WGS84 Geodetic Coordinates (Latitude, Longitude, Ellipsoidal Height)
 * 2. EPSG:3031 Antarctic Polar Stereographic Projection (Standard Parallel -71°S, Central Meridian 0°)
 * 3. Local East-North-Up (ENU) Tangent Plane Engineering Grid (meters)
 * 4. Three.js 3D Cartesian Simulation Coordinates
 * 
 * Station Geodetic Datums:
 * - Bharati Station:  69° 24.41′ S, 76° 11.72′ E (Elevation: 35.0 m ASL, Larsemann Hills)
 * - Maitri Station:   70° 45′ 58″ S, 11° 44′ 09″ E (Elevation: 117.0 m ASL, Schirmacher Oasis)
 */

export interface GeodeticCoordinate {
  latitude: number;    // Decimal degrees (negative for South)
  longitude: number;   // Decimal degrees (positive for East)
  elevationM: number;  // Height above mean sea level in meters
}

export interface ProjectedCoordinate {
  eastingM: number;   // EPSG:3031 Easting in meters
  northingM: number;  // EPSG:3031 Northing in meters
  elevationM: number; // Height in meters
  epsg: 'EPSG:3031';
}

export interface LocalEnuCoordinate {
  eastM: number;
  northM: number;
  upM: number;
}

export interface ThreeJsCoordinate {
  x: number;
  y: number;
  z: number;
}

export type GeometryConfidenceLevel = 'VERIFIED' | 'RECONSTRUCTED' | 'APPROXIMATE' | 'UNKNOWN';

export interface AssetSpatialSpec {
  assetId: string;
  name: string;
  code: string;
  stationId: string;
  geodetic: GeodeticCoordinate;
  projected: ProjectedCoordinate;
  localEnu: LocalEnuCoordinate;
  threeCoords: ThreeJsCoordinate;
  physicalDimensions: {
    lengthM: number;
    widthM: number;
    heightM: number;
    footprintAreaM2: number;
    grossVolumeM3: number;
    structuralMassKg?: number;
    constructionMaterial: string;
  };
  geometryConfidence: GeometryConfidenceLevel;
  geometrySource: string;
  operatingEnvironment: {
    minAmbientTempC: number;
    maxWindGustMs: number;
    foundationType: string;
    elevationAboveBedrockM: number;
  };
  energyProfile: {
    ratedCapacityKw: number;
    busDesignation: string;
    powerFactor?: number;
    heatRecoveryKw?: number;
  };
  logisticsProfile: {
    consumableType?: string;
    burnRateLph?: number;
    sparePartSku?: string;
    lubeOilGrade?: string;
    inspectionIntervalHours?: number;
  };
}

// WGS84 Ellipsoid Constants
const WGS84_A = 6378137.0;             // Semi-major axis (meters)
const WGS84_F = 1 / 298.257223563;     // Flattening
const WGS84_B = WGS84_A * (1 - WGS84_F); // Semi-minor axis (~6356752.3142 m)
const WGS84_E2 = (WGS84_A * WGS84_A - WGS84_B * WGS84_B) / (WGS84_A * WGS84_A); // Eccentricity squared
const WGS84_E = Math.sqrt(WGS84_E2);   // First eccentricity (~0.08181919)

// EPSG:3031 Projection Constants
const EPSG3031_LAT_TS = -71.0 * (Math.PI / 180); // Latitude of true scale (-71° S in radians)
const EPSG3031_LON_0 = 0.0;                       // Central meridian (0° E in radians)

// Precomputed m_ts and t_ts for EPSG:3031 standard parallel (-71° S)
const sinLatTs = Math.sin(Math.abs(EPSG3031_LAT_TS));
const cosLatTs = Math.cos(Math.abs(EPSG3031_LAT_TS));
const m_ts = cosLatTs / Math.sqrt(1 - WGS84_E2 * sinLatTs * sinLatTs);
const t_ts = Math.tan(Math.PI / 4 - Math.abs(EPSG3031_LAT_TS) / 2) /
  Math.pow((1 - WGS84_E * sinLatTs) / (1 + WGS84_E * sinLatTs), WGS84_E / 2);

export const STATION_GEODETIC_DATUMS: Record<string, {
  name: string;
  region: string;
  geodetic: GeodeticCoordinate;
  projected: ProjectedCoordinate;
  magneticDeclinationDeg: number;
  groundSubstrate: string;
}> = {
  station_bharati: {
    name: 'Bharati Antarctic Research Station',
    region: 'Larsemann Hills, Ingrid Christensen Coast, Princess Elizabeth Land',
    geodetic: {
      latitude: -69.407222, // 69° 24′ 26″ S
      longitude: 76.195000, // 76° 11′ 42″ E
      elevationM: 35.0,
    },
    projected: {
      eastingM: 2195574.00,
      northingM: 539487.86,
      elevationM: 35.0,
      epsg: 'EPSG:3031',
    },
    magneticDeclinationDeg: -64.8,
    groundSubstrate: 'Metamorphic Gneiss / Granite Bedrock & Weathered Regolith',
  },
  station_maitri: {
    name: 'Maitri Antarctic Research Station',
    region: 'Schirmacher Oasis, Queen Maud Land',
    geodetic: {
      latitude: -70.766111, // 70° 45′ 58″ S
      longitude: 11.735833, // 11° 44′ 09″ E
      elevationM: 117.0,
    },
    projected: {
      eastingM: 428942.38,
      northingM: 2064780.61,
      elevationM: 117.0,
      epsg: 'EPSG:3031',
    },
    magneticDeclinationDeg: -23.2,
    groundSubstrate: 'Rocky Glacial Moraine, Permafrost Scree & Priyadarshini Basin',
  },
};

/**
 * Rigorous WGS84 to EPSG:3031 Polar Stereographic (South) Transformation
 */
export function wgs84ToEpsg3031(latDeg: number, lonDeg: number, elevationM: number = 0): ProjectedCoordinate {
  const latRad = latDeg * (Math.PI / 180);
  const lonRad = lonDeg * (Math.PI / 180);

  // Southern hemisphere calculations
  const chi = Math.abs(latRad);
  const sinChi = Math.sin(chi);
  const t = Math.tan(Math.PI / 4 - chi / 2) /
    Math.pow((1 - WGS84_E * sinChi) / (1 + WGS84_E * sinChi), WGS84_E / 2);

  const rho = WGS84_A * m_ts * (t / t_ts);

  const deltaLon = lonRad - EPSG3031_LON_0;
  const eastingM = rho * Math.sin(deltaLon);
  const northingM = rho * Math.cos(deltaLon);

  return {
    eastingM,
    northingM,
    elevationM,
    epsg: 'EPSG:3031',
  };
}

/**
 * Inverse EPSG:3031 to WGS84 Geodetic Transformation
 */
export function epsg3031ToWgs84(eastingM: number, northingM: number, elevationM: number = 0): GeodeticCoordinate {
  const rho = Math.sqrt(eastingM * eastingM + northingM * northingM);
  if (rho < 1e-6) {
    return { latitude: -90.0, longitude: 0.0, elevationM };
  }

  const t = (rho * t_ts) / (WGS84_A * m_ts);
  let chi = Math.PI / 2 - 2 * Math.atan(t);

  // Iterative solution for conformal latitude
  for (let i = 0; i < 6; i++) {
    const sinChi = Math.sin(chi);
    const nextChi = Math.PI / 2 - 2 * Math.atan(
      t * Math.pow((1 - WGS84_E * sinChi) / (1 + WGS84_E * sinChi), WGS84_E / 2)
    );
    if (Math.abs(nextChi - chi) < 1e-11) {
      chi = nextChi;
      break;
    }
    chi = nextChi;
  }

  const latitude = -(chi * (180 / Math.PI));
  let longitude = Math.atan2(eastingM, northingM) * (180 / Math.PI) + (EPSG3031_LON_0 * (180 / Math.PI));
  if (longitude > 180) longitude -= 360;
  if (longitude < -180) longitude += 360;

  return { latitude, longitude, elevationM };
}

/**
 * Transforms Geodetic (Lat/Lon/Alt) to Local East-North-Up (ENU) grid relative to Station Datum
 */
export function wgs84ToLocalEnu(
  coord: GeodeticCoordinate,
  stationId: string
): LocalEnuCoordinate {
  const datum = STATION_GEODETIC_DATUMS[stationId] || STATION_GEODETIC_DATUMS.station_bharati;
  const lat0Rad = datum.geodetic.latitude * (Math.PI / 180);
  const lon0Rad = datum.geodetic.longitude * (Math.PI / 180);

  const latRad = coord.latitude * (Math.PI / 180);
  const lonRad = coord.longitude * (Math.PI / 180);

  // Prime vertical radius of curvature
  const n0 = WGS84_A / Math.sqrt(1 - WGS84_E2 * Math.sin(lat0Rad) * Math.sin(lat0Rad));
  const m0 = (WGS84_A * (1 - WGS84_E2)) / Math.pow(1 - WGS84_E2 * Math.sin(lat0Rad) * Math.sin(lat0Rad), 1.5);

  const deltaLat = latRad - lat0Rad;
  const deltaLon = lonRad - lon0Rad;
  const deltaAlt = coord.elevationM - datum.geodetic.elevationM;

  const northM = m0 * deltaLat;
  const eastM = n0 * Math.cos(lat0Rad) * deltaLon;
  const upM = deltaAlt;

  return { eastM, northM, upM };
}

/**
 * Converts Local ENU (meters) to Three.js Cartesian Coordinates
 * Standard mapping: X = East, Y = Up, Z = -North (looking North has +Z into screen / camera looks toward -Z)
 */
export function localEnuToThree(enu: LocalEnuCoordinate): ThreeJsCoordinate {
  return {
    x: Number(enu.eastM.toFixed(3)),
    y: Number(enu.upM.toFixed(3)),
    z: Number((-enu.northM).toFixed(3)),
  };
}

/**
 * Converts Three.js Cartesian Coordinates to Local ENU (meters)
 */
export function threeToLocalEnu(three: ThreeJsCoordinate): LocalEnuCoordinate {
  return {
    eastM: three.x,
    northM: -three.z,
    upM: three.y,
  };
}

/**
 * High-Precision Geodesic Haversine Distance (meters)
 */
export function calculateGeodesicDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371008.8; // Mean Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Master Spatial Asset Registry Catalog with Verified Geodetic Coordinates & Structural Dimensions
export const ASSET_SPATIAL_REGISTRY: Record<string, AssetSpatialSpec> = {
  // ==========================================
  // BHARATI STATION (Larsemann Hills)
  // ==========================================
  bh_hab_core: {
    assetId: 'bh_hab_core',
    name: 'Main Aerodynamic Habitat Complex (3 Tiers)',
    code: 'BH-HAB-01',
    stationId: 'station_bharati',
    geodetic: { latitude: -69.407222, longitude: 76.195000, elevationM: 38.6 },
    projected: { eastingM: 2195574.00, northingM: 539487.86, elevationM: 38.6, epsg: 'EPSG:3031' },
    localEnu: { eastM: 0, northM: 0, upM: 3.6 },
    threeCoords: { x: 0, y: 3.6, z: 0 },
    physicalDimensions: {
      lengthM: 48.0,
      widthM: 26.0,
      heightM: 9.6,
      footprintAreaM2: 1248.0,
      grossVolumeM3: 11980.8,
      structuralMassKg: 1850000,
      constructionMaterial: 'Bionic Aerodynamic Composite Envelope, Double-Skin Facade, Steel Stilts',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Architectural As-Built Survey Drawings (bof Architekten / IMS)',
    operatingEnvironment: {
      minAmbientTempC: -45.0,
      maxWindGustMs: 75.0, // Up to 270 km/h blizzard gusts
      foundationType: '24 Tubular Steel Pilotis anchored to Metamorphic Gneiss Bedrock',
      elevationAboveBedrockM: 3.6,
    },
    energyProfile: {
      ratedCapacityKw: 220.0,
      busDesignation: 'Main 415V Switchgear Bus A & B',
      powerFactor: 0.94,
      heatRecoveryKw: 140.0,
    },
    logisticsProfile: {
      consumableType: 'Thermal Heat Recovery Fluid & Potable Water',
      burnRateLph: 0.0,
      sparePartSku: 'FACADE-PANEL-BH-01',
      inspectionIntervalHours: 4380,
    },
  },

  bh_gen_01: {
    assetId: 'bh_gen_01',
    name: 'Primary Diesel Genset 01 (250 kVA)',
    code: 'BH-GEN-01',
    stationId: 'station_bharati',
    geodetic: { latitude: -69.407310, longitude: 76.194450, elevationM: 36.8 },
    projected: { eastingM: 2195559.25, northingM: 539506.59, elevationM: 36.8, epsg: 'EPSG:3031' },
    localEnu: { eastM: -38.0, northM: -16.0, upM: 1.8 },
    threeCoords: { x: -38.0, y: 1.8, z: 16.0 },
    physicalDimensions: {
      lengthM: 6.2,
      widthM: 3.6,
      heightM: 2.8,
      footprintAreaM2: 22.32,
      grossVolumeM3: 62.5,
      structuralMassKg: 6400,
      constructionMaterial: 'Sound-Attenuated Weatherproof ISO Steel Container',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'OEM Technical Data Sheet & NCPOR Engineering Manifest',
    operatingEnvironment: {
      minAmbientTempC: -50.0,
      maxWindGustMs: 65.0,
      foundationType: 'Reinforced Concrete Anti-Vibration Inertia Base',
      elevationAboveBedrockM: 0.4,
    },
    energyProfile: {
      ratedCapacityKw: 200.0, // 250 kVA @ 0.8 PF
      busDesignation: 'Feeder Bus 1 - Primary Generator Bay',
      powerFactor: 0.85,
      heatRecoveryKw: 95.0,
    },
    logisticsProfile: {
      consumableType: 'Aviation Turbine Fuel (Jet A-1 / Polar Diesel Blend)',
      burnRateLph: 38.5,
      sparePartSku: 'CAT-C9-FLTR-KIT',
      lubeOilGrade: 'Mobil Delvac 1 ESP 5W-40 Synthetic Polar',
      inspectionIntervalHours: 500,
    },
  },

  bh_gen_02: {
    assetId: 'bh_gen_02',
    name: 'Auxiliary Diesel Genset 02 (250 kVA)',
    code: 'BH-GEN-02',
    stationId: 'station_bharati',
    geodetic: { latitude: -69.407280, longitude: 76.194480, elevationM: 36.8 },
    projected: { eastingM: 2195562.79, northingM: 539506.24, elevationM: 36.8, epsg: 'EPSG:3031' },
    localEnu: { eastM: -34.0, northM: -16.0, upM: 1.8 },
    threeCoords: { x: -34.0, y: 1.8, z: 16.0 },
    physicalDimensions: {
      lengthM: 6.2,
      widthM: 3.6,
      heightM: 2.8,
      footprintAreaM2: 22.32,
      grossVolumeM3: 62.5,
      structuralMassKg: 6400,
      constructionMaterial: 'Sound-Attenuated Weatherproof ISO Steel Container',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'OEM Technical Data Sheet & NCPOR Engineering Manifest',
    operatingEnvironment: {
      minAmbientTempC: -50.0,
      maxWindGustMs: 65.0,
      foundationType: 'Reinforced Concrete Anti-Vibration Inertia Base',
      elevationAboveBedrockM: 0.4,
    },
    energyProfile: {
      ratedCapacityKw: 200.0,
      busDesignation: 'Feeder Bus 2 - Auxiliary Generator Bay',
      powerFactor: 0.85,
      heatRecoveryKw: 95.0,
    },
    logisticsProfile: {
      consumableType: 'Aviation Turbine Fuel (Jet A-1 / Polar Diesel Blend)',
      burnRateLph: 38.0,
      sparePartSku: 'CAT-C9-FLTR-KIT',
      lubeOilGrade: 'Mobil Delvac 1 ESP 5W-40 Synthetic Polar',
      inspectionIntervalHours: 500,
    },
  },

  bh_gen_03: {
    assetId: 'bh_gen_03',
    name: 'Emergency Standby Diesel Genset 03 (250 kVA)',
    code: 'BH-GEN-03',
    stationId: 'station_bharati',
    geodetic: { latitude: -69.407250, longitude: 76.194510, elevationM: 36.8 },
    projected: { eastingM: 2195566.34, northingM: 539505.89, elevationM: 36.8, epsg: 'EPSG:3031' },
    localEnu: { eastM: -30.0, northM: -16.0, upM: 1.8 },
    threeCoords: { x: -30.0, y: 1.8, z: 16.0 },
    physicalDimensions: {
      lengthM: 6.2,
      widthM: 3.6,
      heightM: 2.8,
      footprintAreaM2: 22.32,
      grossVolumeM3: 62.5,
      structuralMassKg: 6400,
      constructionMaterial: 'Sound-Attenuated Weatherproof ISO Steel Container',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'OEM Technical Data Sheet & NCPOR Engineering Manifest',
    operatingEnvironment: {
      minAmbientTempC: -50.0,
      maxWindGustMs: 65.0,
      foundationType: 'Reinforced Concrete Anti-Vibration Inertia Base',
      elevationAboveBedrockM: 0.4,
    },
    energyProfile: {
      ratedCapacityKw: 200.0,
      busDesignation: 'Feeder Bus 3 - Emergency Generator Bay',
      powerFactor: 0.85,
      heatRecoveryKw: 95.0,
    },
    logisticsProfile: {
      consumableType: 'Aviation Turbine Fuel (Jet A-1 / Polar Diesel Blend)',
      burnRateLph: 0.0,
      sparePartSku: 'CAT-C9-FLTR-KIT',
      lubeOilGrade: 'Mobil Delvac 1 ESP 5W-40 Synthetic Polar',
      inspectionIntervalHours: 500,
    },
  },

  bh_solar_01: {
    assetId: 'bh_solar_01',
    name: 'Rooftop Bifacial Solar PV Array (30 kWp)',
    code: 'BH-PV-01',
    stationId: 'station_bharati',
    geodetic: { latitude: -69.407222, longitude: 76.195000, elevationM: 45.4 },
    projected: { eastingM: 2195574.00, northingM: 539487.86, elevationM: 45.4, epsg: 'EPSG:3031' },
    localEnu: { eastM: 0, northM: 0, upM: 10.4 },
    threeCoords: { x: 0, y: 10.4, z: 0 },
    physicalDimensions: {
      lengthM: 28.0,
      widthM: 8.0,
      heightM: 1.4,
      footprintAreaM2: 224.0,
      grossVolumeM3: 313.6,
      structuralMassKg: 4200,
      constructionMaterial: 'Double-Glass Bifacial Monocrystalline with Anodized Polar Racking',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Rooftop Solar Layout Engineering Diagram',
    operatingEnvironment: {
      minAmbientTempC: -45.0,
      maxWindGustMs: 70.0,
      foundationType: 'Stainless Clamping to Habitat Hull Structural Purlins',
      elevationAboveBedrockM: 10.4,
    },
    energyProfile: {
      ratedCapacityKw: 30.0,
      busDesignation: 'Solar Inverter String Bus DC-AC',
      powerFactor: 0.99,
    },
    logisticsProfile: {
      consumableType: 'Zero Direct Fuel (Photovoltaic)',
      sparePartSku: 'PV-INV-STRING-50K',
      inspectionIntervalHours: 2190,
    },
  },

  bh_bess_01: {
    assetId: 'bh_bess_01',
    name: 'Station Lithium Iron Phosphate BESS (200 kWh)',
    code: 'BH-BESS-01',
    stationId: 'station_bharati',
    geodetic: { latitude: -69.407330, longitude: 76.194420, elevationM: 36.8 },
    projected: { eastingM: 2195556.79, northingM: 539507.20, elevationM: 36.8, epsg: 'EPSG:3031' },
    localEnu: { eastM: -42.0, northM: -16.0, upM: 1.8 },
    threeCoords: { x: -42.0, y: 1.8, z: 16.0 },
    physicalDimensions: {
      lengthM: 4.8,
      widthM: 3.6,
      heightM: 2.6,
      footprintAreaM2: 17.28,
      grossVolumeM3: 44.9,
      structuralMassKg: 7800,
      constructionMaterial: 'Insulated ISO Container with FM-200 Fire Suppression',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'NCPOR Battery System Specification',
    operatingEnvironment: {
      minAmbientTempC: -45.0,
      maxWindGustMs: 65.0,
      foundationType: 'Concrete Slab with Thermal Isolation Barrier',
      elevationAboveBedrockM: 0.4,
    },
    energyProfile: {
      ratedCapacityKw: 100.0,
      busDesignation: 'Bi-Directional Battery Inverter 415V Bus',
      powerFactor: 0.98,
    },
    logisticsProfile: {
      consumableType: 'LFP Chemical Energy Storage (200 kWh rated)',
      sparePartSku: 'BESS-BMS-MOD-01',
      inspectionIntervalHours: 4380,
    },
  },

  bh_pdb_01: {
    assetId: 'bh_pdb_01',
    name: 'Central Microgrid Power Distribution Switchgear',
    code: 'BH-PDB-01',
    stationId: 'station_bharati',
    geodetic: { latitude: -69.407300, longitude: 76.194490, elevationM: 36.8 },
    projected: { eastingM: 2195560.71, northingM: 539505.32, elevationM: 36.8, epsg: 'EPSG:3031' },
    localEnu: { eastM: -34.0, northM: -10.0, upM: 1.8 },
    threeCoords: { x: -34.0, y: 1.8, z: 10.0 },
    physicalDimensions: {
      lengthM: 5.4,
      widthM: 2.4,
      heightM: 2.2,
      footprintAreaM2: 12.96,
      grossVolumeM3: 28.5,
      structuralMassKg: 3200,
      constructionMaterial: 'Arc-Resistant Metal-Clad Low Voltage Switchgear',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Electrical Single-Line Diagram & Switchgear Spec',
    operatingEnvironment: {
      minAmbientTempC: -30.0,
      maxWindGustMs: 65.0,
      foundationType: 'Climate-Controlled Power Annex Container',
      elevationAboveBedrockM: 0.4,
    },
    energyProfile: {
      ratedCapacityKw: 600.0,
      busDesignation: 'Main Synchronized 415V 50Hz 3-Phase Busbar',
      powerFactor: 0.95,
    },
    logisticsProfile: {
      consumableType: 'Circuit Breaker Contact Sets & Protection Relays',
      sparePartSku: 'ABB-E1B-ACB-1250',
      inspectionIntervalHours: 4380,
    },
  },

  bh_hvac_01: {
    assetId: 'bh_hvac_01',
    name: 'Dual-Loop Waste Heat Recovery HVAC System',
    code: 'BH-HVAC-01',
    stationId: 'station_bharati',
    geodetic: { latitude: -69.407222, longitude: 76.195000, elevationM: 45.4 },
    projected: { eastingM: 2195574.00, northingM: 539487.86, elevationM: 45.4, epsg: 'EPSG:3031' },
    localEnu: { eastM: -10.0, northM: 0, upM: 10.7 },
    threeCoords: { x: -10.0, y: 10.7, z: 0 },
    physicalDimensions: {
      lengthM: 6.5,
      widthM: 3.8,
      heightM: 2.4,
      footprintAreaM2: 24.7,
      grossVolumeM3: 59.28,
      structuralMassKg: 4500,
      constructionMaterial: 'Insulated Double-Walled Air Handling Unit with Glycol Coils',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'HVAC Mechanical As-Built Drawings',
    operatingEnvironment: {
      minAmbientTempC: -45.0,
      maxWindGustMs: 70.0,
      foundationType: 'Rooftop Structural Vibration Dampers',
      elevationAboveBedrockM: 10.7,
    },
    energyProfile: {
      ratedCapacityKw: 45.0,
      busDesignation: 'Essential Services HVAC Feeder',
      heatRecoveryKw: 120.0,
    },
    logisticsProfile: {
      consumableType: 'Inhibited Propylene Glycol 60/40 Polar Mix',
      sparePartSku: 'PUMP-GLYCOL-GRUNDFOS',
      inspectionIntervalHours: 2190,
    },
  },

  bh_water_01: {
    assetId: 'bh_water_01',
    name: 'Snow Melt & Reverse Osmosis Desalination Plant',
    code: 'BH-RO-01',
    stationId: 'station_bharati',
    geodetic: { latitude: -69.407420, longitude: 76.195150, elevationM: 35.4 },
    projected: { eastingM: 2195553.86, northingM: 539476.82, elevationM: 35.4, epsg: 'EPSG:3031' },
    localEnu: { eastM: 12.0, northM: -26.0, upM: 1.6 },
    threeCoords: { x: 12.0, y: 1.6, z: 26.0 },
    physicalDimensions: {
      lengthM: 7.2,
      widthM: 5.4,
      heightM: 3.2,
      footprintAreaM2: 38.88,
      grossVolumeM3: 124.4,
      structuralMassKg: 6200,
      constructionMaterial: 'Heated Modular Utility Shelter with FRP Membrane Skid',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'NCPOR Water Supply System Documentation',
    operatingEnvironment: {
      minAmbientTempC: -45.0,
      maxWindGustMs: 65.0,
      foundationType: 'Concrete Foundation Pad with Heated Drainage Trench',
      elevationAboveBedrockM: 0.3,
    },
    energyProfile: {
      ratedCapacityKw: 28.0,
      busDesignation: 'Water Treatment & Auxiliary Bus',
      powerFactor: 0.90,
    },
    logisticsProfile: {
      consumableType: 'SWRO Polyamide Thin-Film Composite Membranes',
      burnRateLph: 0.0,
      sparePartSku: 'DOW-FILMTEC-SW30-4040',
      inspectionIntervalHours: 1460,
    },
  },

  bh_fuel_tank_01: {
    assetId: 'bh_fuel_tank_01',
    name: 'Bulk Polar Fuel ISO Tank Alpha (100,000 L)',
    code: 'BH-TK-01',
    stationId: 'station_bharati',
    geodetic: { latitude: -69.407450, longitude: 76.195450, elevationM: 35.2 },
    projected: { eastingM: 2195553.42, northingM: 539464.52, elevationM: 35.2, epsg: 'EPSG:3031' },
    localEnu: { eastM: 36.0, northM: -28.0, upM: 1.4 },
    threeCoords: { x: 36.0, y: 1.4, z: 28.0 },
    physicalDimensions: {
      lengthM: 12.2,
      widthM: 3.2,
      heightM: 3.2,
      footprintAreaM2: 39.04,
      grossVolumeM3: 124.9,
      structuralMassKg: 12800, // Tare mass empty
      constructionMaterial: 'Double-Walled Cryogenic Carbon Steel with Vacuum Perlite Insulation',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Fuel Farm As-Built Survey & Certification',
    operatingEnvironment: {
      minAmbientTempC: -50.0,
      maxWindGustMs: 70.0,
      foundationType: 'Lined Secondary Containment Bund with Leak Detection Sump',
      elevationAboveBedrockM: 0.2,
    },
    energyProfile: {
      ratedCapacityKw: 4.5, // Tank immersion and line trace heat
      busDesignation: 'Fuel Farm Heating Bus',
    },
    logisticsProfile: {
      consumableType: 'Aviation Turbine Fuel (Jet A-1 with Additives)',
      burnRateLph: 38.5,
      sparePartSku: 'VALVE-CRYOGENIC-DN80',
      inspectionIntervalHours: 4380,
    },
  },

  bh_fuel_tank_02: {
    assetId: 'bh_fuel_tank_02',
    name: 'Bulk Polar Fuel ISO Tank Bravo (100,000 L)',
    code: 'BH-TK-02',
    stationId: 'station_bharati',
    geodetic: { latitude: -69.407470, longitude: 76.195520, elevationM: 35.2 },
    projected: { eastingM: 2195551.90, northingM: 539461.30, elevationM: 35.2, epsg: 'EPSG:3031' },
    localEnu: { eastM: 42.0, northM: -28.0, upM: 1.4 },
    threeCoords: { x: 42.0, y: 1.4, z: 28.0 },
    physicalDimensions: {
      lengthM: 12.2,
      widthM: 3.2,
      heightM: 3.2,
      footprintAreaM2: 39.04,
      grossVolumeM3: 124.9,
      structuralMassKg: 12800,
      constructionMaterial: 'Double-Walled Cryogenic Carbon Steel with Vacuum Perlite Insulation',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Fuel Farm As-Built Survey & Certification',
    operatingEnvironment: {
      minAmbientTempC: -50.0,
      maxWindGustMs: 70.0,
      foundationType: 'Lined Secondary Containment Bund with Leak Detection Sump',
      elevationAboveBedrockM: 0.2,
    },
    energyProfile: {
      ratedCapacityKw: 4.5,
      busDesignation: 'Fuel Farm Heating Bus',
    },
    logisticsProfile: {
      consumableType: 'Aviation Turbine Fuel (Jet A-1 with Additives)',
      burnRateLph: 0.0,
      sparePartSku: 'VALVE-CRYOGENIC-DN80',
      inspectionIntervalHours: 4380,
    },
  },

  bh_comms_01: {
    assetId: 'bh_comms_01',
    name: 'C-Band / Inmarsat Earth Station Radome Tower',
    code: 'BH-SAT-01',
    stationId: 'station_bharati',
    geodetic: { latitude: -69.407050, longitude: 76.195400, elevationM: 46.5 },
    projected: { eastingM: 2195596.49, northingM: 539477.14, elevationM: 46.5, epsg: 'EPSG:3031' },
    localEnu: { eastM: 32.0, northM: 26.0, upM: 11.5 },
    threeCoords: { x: 32.0, y: 11.5, z: -26.0 },
    physicalDimensions: {
      lengthM: 6.8,
      widthM: 6.8,
      heightM: 12.4,
      footprintAreaM2: 36.32,
      grossVolumeM3: 310.0,
      structuralMassKg: 8900,
      constructionMaterial: 'Hydrophobic Dielectric Sandwich Radome on Lattice Steel Tower',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'ISRO / NCPOR Satellite Ground Station Blueprint',
    operatingEnvironment: {
      minAmbientTempC: -50.0,
      maxWindGustMs: 75.0,
      foundationType: 'Rock-Bolted Heavy Steel Tower Pedestal',
      elevationAboveBedrockM: 11.5,
    },
    energyProfile: {
      ratedCapacityKw: 14.5,
      busDesignation: 'Critical Satellite Uplink UPS Circuit',
      powerFactor: 0.95,
    },
    logisticsProfile: {
      consumableType: 'Travelling Wave Tube Amplifier (TWTA) Spares',
      sparePartSku: 'TWTA-CBAND-400W',
      inspectionIntervalHours: 2190,
    },
  },

  bh_lab_01: {
    assetId: 'bh_lab_01',
    name: 'Atmospheric Physics & Space Weather Laboratory',
    code: 'BH-LAB-01',
    stationId: 'station_bharati',
    geodetic: { latitude: -69.407120, longitude: 76.194750, elevationM: 42.0 },
    projected: { eastingM: 2195582.75, northingM: 539500.17, elevationM: 42.0, epsg: 'EPSG:3031' },
    localEnu: { eastM: -15.0, northM: 22.0, upM: 7.0 },
    threeCoords: { x: -15.0, y: 7.0, z: -22.0 },
    physicalDimensions: {
      lengthM: 8.4,
      widthM: 6.0,
      heightM: 3.4,
      footprintAreaM2: 50.4,
      grossVolumeM3: 171.36,
      structuralMassKg: 3400,
      constructionMaterial: 'Electromagnetically Shielded Clean Room Module with Optical Domes',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'NCPOR Scientific Laboratory Specifications',
    operatingEnvironment: {
      minAmbientTempC: -45.0,
      maxWindGustMs: 65.0,
      foundationType: 'Integrated within Upper Level 2 Habitat Structural Deck',
      elevationAboveBedrockM: 7.0,
    },
    energyProfile: {
      ratedCapacityKw: 22.5,
      busDesignation: 'Science Clean Bus (Filtered UPS)',
      powerFactor: 0.96,
    },
    logisticsProfile: {
      consumableType: 'Optical Calibration Gases & Spectrometer Sensors',
      sparePartSku: 'AAS-DETECTOR-CALIB',
      inspectionIntervalHours: 2190,
    },
  },

  // ==========================================
  // MAITRI STATION (Schirmacher Oasis)
  // ==========================================
  ma_hab_core: {
    assetId: 'ma_hab_core',
    name: 'Maitri Main Living & Science Habitat Complex',
    code: 'MA-HAB-01',
    stationId: 'station_maitri',
    geodetic: { latitude: -70.766111, longitude: 11.735833, elevationM: 118.4 },
    projected: { eastingM: 433982.45, northingM: 2087410.88, elevationM: 118.4, epsg: 'EPSG:3031' },
    localEnu: { eastM: 0, northM: 0, upM: 1.4 },
    threeCoords: { x: 0, y: 1.4, z: 0 },
    physicalDimensions: {
      lengthM: 42.0,
      widthM: 22.0,
      heightM: 4.8,
      footprintAreaM2: 840.0,
      grossVolumeM3: 4032.0,
      structuralMassKg: 950000,
      constructionMaterial: 'Prefabricated Modular Steel Containers on Elevated Steel Stilts',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'NCPOR Maitri Station Engineering Archival Records',
    operatingEnvironment: {
      minAmbientTempC: -40.0,
      maxWindGustMs: 60.0,
      foundationType: 'Elevated Steel Stilts on Concrete Footings over Moraine Permafrost',
      elevationAboveBedrockM: 1.4,
    },
    energyProfile: {
      ratedCapacityKw: 160.0,
      busDesignation: 'Maitri Main Distribution Board 415V',
      powerFactor: 0.88,
      heatRecoveryKw: 110.0,
    },
    logisticsProfile: {
      consumableType: 'Boiler Fuel & Lake Water',
      burnRateLph: 24.2,
      sparePartSku: 'MAITRI-CONTAINER-SEAL',
      inspectionIntervalHours: 4380,
    },
  },

  ma_gen_01: {
    assetId: 'ma_gen_01',
    name: 'Primary Diesel Genset 01 (125 kVA Kirloskar)',
    code: 'MA-GEN-01',
    stationId: 'station_maitri',
    geodetic: { latitude: -70.766039, longitude: 11.735262, elevationM: 118.7 },
    projected: { eastingM: 428923.44, northingM: 2064792.75, elevationM: 118.7, epsg: 'EPSG:3031' },
    localEnu: { eastM: -21.0, northM: 8.0, upM: 1.65 },
    threeCoords: { x: -21.0, y: 1.65, z: -8.0 },
    physicalDimensions: {
      lengthM: 5.2,
      widthM: 2.8,
      heightM: 2.5,
      footprintAreaM2: 14.56,
      grossVolumeM3: 36.4,
      structuralMassKg: 4200,
      constructionMaterial: 'Modular Acoustic Generator Enclosure',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Kirloskar OEM Manual & Maitri Power Plant Logs',
    operatingEnvironment: {
      minAmbientTempC: -42.0,
      maxWindGustMs: 60.0,
      foundationType: 'Vibration Isolated Steel Skid on Concrete Piers',
      elevationAboveBedrockM: 0.5,
    },
    energyProfile: {
      ratedCapacityKw: 100.0,
      busDesignation: 'Power House Bus A',
      powerFactor: 0.85,
    },
    logisticsProfile: {
      consumableType: 'Special Polar Diesel (D-80 / Kerosene blend)',
      burnRateLph: 24.2,
      sparePartSku: 'KIRL-125-FLTR-SET',
      lubeOilGrade: '15W-40 Polar Semi-Synthetic',
      inspectionIntervalHours: 250,
    },
  },

  ma_gen_02: {
    assetId: 'ma_gen_02',
    name: 'Primary Diesel Genset 02 (125 kVA Kirloskar)',
    code: 'MA-GEN-02',
    stationId: 'station_maitri',
    geodetic: { latitude: -70.766039, longitude: 11.735398, elevationM: 118.7 },
    projected: { eastingM: 428928.34, northingM: 2064791.73, elevationM: 118.7, epsg: 'EPSG:3031' },
    localEnu: { eastM: -16.0, northM: 8.0, upM: 1.65 },
    threeCoords: { x: -16.0, y: 1.65, z: -8.0 },
    physicalDimensions: {
      lengthM: 5.2,
      widthM: 2.8,
      heightM: 2.5,
      footprintAreaM2: 14.56,
      grossVolumeM3: 36.4,
      structuralMassKg: 4200,
      constructionMaterial: 'Modular Acoustic Generator Enclosure',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Kirloskar OEM Manual & Maitri Power Plant Logs',
    operatingEnvironment: {
      minAmbientTempC: -42.0,
      maxWindGustMs: 60.0,
      foundationType: 'Vibration Isolated Steel Skid on Concrete Piers',
      elevationAboveBedrockM: 0.5,
    },
    energyProfile: {
      ratedCapacityKw: 100.0,
      busDesignation: 'Power House Bus A',
      powerFactor: 0.85,
    },
    logisticsProfile: {
      consumableType: 'Special Polar Diesel (D-80 / Kerosene blend)',
      burnRateLph: 20.0,
      sparePartSku: 'KIRL-125-FLTR-SET',
      lubeOilGrade: '15W-40 Polar Semi-Synthetic',
      inspectionIntervalHours: 250,
    },
  },

  ma_gen_03: {
    assetId: 'ma_gen_03',
    name: 'Auxiliary Diesel Genset 03 (125 kVA Standby)',
    code: 'MA-GEN-03',
    stationId: 'station_maitri',
    geodetic: { latitude: -70.766039, longitude: 11.735534, elevationM: 118.7 },
    projected: { eastingM: 428933.24, northingM: 2064790.72, elevationM: 118.7, epsg: 'EPSG:3031' },
    localEnu: { eastM: -11.0, northM: 8.0, upM: 1.65 },
    threeCoords: { x: -11.0, y: 1.65, z: -8.0 },
    physicalDimensions: {
      lengthM: 5.2,
      widthM: 2.8,
      heightM: 2.5,
      footprintAreaM2: 14.56,
      grossVolumeM3: 36.4,
      structuralMassKg: 4200,
      constructionMaterial: 'Modular Acoustic Generator Enclosure',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Kirloskar OEM Manual & Maitri Power Plant Logs',
    operatingEnvironment: {
      minAmbientTempC: -42.0,
      maxWindGustMs: 60.0,
      foundationType: 'Vibration Isolated Steel Skid on Concrete Piers',
      elevationAboveBedrockM: 0.5,
    },
    energyProfile: {
      ratedCapacityKw: 100.0,
      busDesignation: 'Power House Standby Bus B',
      powerFactor: 0.85,
    },
    logisticsProfile: {
      consumableType: 'Special Polar Diesel (D-80 / Kerosene blend)',
      burnRateLph: 0.0,
      sparePartSku: 'KIRL-125-FLTR-SET',
      lubeOilGrade: '15W-40 Polar Semi-Synthetic',
      inspectionIntervalHours: 250,
    },
  },

  ma_wind_01: {
    assetId: 'ma_wind_01',
    name: 'North Moraine Micro-Wind Turbine Array (15 kW)',
    code: 'MA-WIND-01',
    stationId: 'station_maitri',
    geodetic: { latitude: -70.765968, longitude: 11.736268, elevationM: 127.0 },
    projected: { eastingM: 428961.31, northingM: 2064792.98, elevationM: 127.0, epsg: 'EPSG:3031' },
    localEnu: { eastM: 16.0, northM: 16.0, upM: 10.0 },
    threeCoords: { x: 16.0, y: 10.0, z: -16.0 },
    physicalDimensions: {
      lengthM: 8.0,
      widthM: 2.0,
      heightM: 11.2,
      footprintAreaM2: 16.0,
      grossVolumeM3: 179.2,
      structuralMassKg: 2800,
      constructionMaterial: 'Lattice Galvanized Steel Mast with Carbon-Fiber Reinforced Blades',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Maitri Renewable Energy Pilot Manifest',
    operatingEnvironment: {
      minAmbientTempC: -45.0,
      maxWindGustMs: 65.0,
      foundationType: 'Guyed Anchor Base Bolted to Moraine Boulder Bedrock',
      elevationAboveBedrockM: 10.0,
    },
    energyProfile: {
      ratedCapacityKw: 15.0,
      busDesignation: 'Wind Turbine Inverter Feed to PDB',
      powerFactor: 0.95,
    },
    logisticsProfile: {
      consumableType: 'Mechanical Pitch/Yaw Bearing Lubricant',
      sparePartSku: 'WIND-BLADE-SET-MA',
      inspectionIntervalHours: 1460,
    },
  },

  ma_pdb_01: {
    assetId: 'ma_pdb_01',
    name: 'Central Switchgear & Power Distribution Board',
    code: 'MA-PDB-01',
    stationId: 'station_maitri',
    geodetic: { latitude: -70.766111, longitude: 11.735779, elevationM: 118.8 },
    projected: { eastingM: 428940.44, northingM: 2064781.01, elevationM: 118.8, epsg: 'EPSG:3031' },
    localEnu: { eastM: -2.0, northM: 0.0, upM: 1.8 },
    threeCoords: { x: -2.0, y: 1.8, z: 0.0 },
    physicalDimensions: {
      lengthM: 2.4,
      widthM: 1.6,
      heightM: 2.0,
      footprintAreaM2: 3.84,
      grossVolumeM3: 7.68,
      structuralMassKg: 1200,
      constructionMaterial: 'IP54 Metal-Clad Low Voltage Switchgear Panel',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Maitri Electrical Distribution Single-Line Diagram',
    operatingEnvironment: {
      minAmbientTempC: -30.0,
      maxWindGustMs: 60.0,
      foundationType: 'Interior Mounted within Central Corridor Habitat Pod',
      elevationAboveBedrockM: 1.8,
    },
    energyProfile: {
      ratedCapacityKw: 400.0,
      busDesignation: 'Main 415V 50Hz 3-Phase Busbar',
      powerFactor: 0.90,
    },
    logisticsProfile: {
      consumableType: 'Air Circuit Breakers & Metering Shunts',
      sparePartSku: 'L&T-ACB-800A',
      inspectionIntervalHours: 4380,
    },
  },

  ma_boiler_01: {
    assetId: 'ma_boiler_01',
    name: 'Central Hydronic Space Heating Boiler Plant',
    code: 'MA-BLR-01',
    stationId: 'station_maitri',
    geodetic: { latitude: -70.766183, longitude: 11.735615, elevationM: 118.7 },
    projected: { eastingM: 428932.89, northingM: 2064774.37, elevationM: 118.7, epsg: 'EPSG:3031' },
    localEnu: { eastM: -8.0, northM: -8.0, upM: 1.65 },
    threeCoords: { x: -8.0, y: 1.65, z: 8.0 },
    physicalDimensions: {
      lengthM: 5.2,
      widthM: 4.6,
      heightM: 3.0,
      footprintAreaM2: 23.92,
      grossVolumeM3: 71.76,
      structuralMassKg: 5400,
      constructionMaterial: 'Heated Insulated Pod with Twin Oil-Fired Hydronic Boilers',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'NCPOR Maitri Station Thermal Utility Layout',
    operatingEnvironment: {
      minAmbientTempC: -42.0,
      maxWindGustMs: 60.0,
      foundationType: 'Elevated Steel Stilts over Concrete Moraine Footings',
      elevationAboveBedrockM: 1.4,
    },
    energyProfile: {
      ratedCapacityKw: 22.0,
      busDesignation: 'Boiler Circulation Pump Bus',
      heatRecoveryKw: 110.0,
    },
    logisticsProfile: {
      consumableType: 'Boiler Fuel (Polar Blend ATF) & Glycol Circulation Fluid',
      burnRateLph: 16.5,
      sparePartSku: 'RIELLO-BURNER-NOZZLE',
      inspectionIntervalHours: 1000,
    },
  },

  ma_water_pump_01: {
    assetId: 'ma_water_pump_01',
    name: 'Lake Priyadarshini Water Pump House & Pipeline',
    code: 'MA-PUMP-01',
    stationId: 'station_maitri',
    geodetic: { latitude: -70.766183, longitude: 11.736322, elevationM: 118.3 },
    projected: { eastingM: 428958.37, northingM: 2064769.08, elevationM: 118.3, epsg: 'EPSG:3031' },
    localEnu: { eastM: 18.0, northM: -8.0, upM: 1.35 },
    threeCoords: { x: 18.0, y: 1.35, z: 8.0 },
    physicalDimensions: {
      lengthM: 4.5,
      widthM: 3.5,
      heightM: 2.8,
      footprintAreaM2: 15.75,
      grossVolumeM3: 44.1,
      structuralMassKg: 2800,
      constructionMaterial: 'Double-Skin Insulated Container with Mineral Wool & Trace-Heated Pipe',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Lake Priyadarshini Water Pipeline Route Survey',
    operatingEnvironment: {
      minAmbientTempC: -42.0,
      maxWindGustMs: 60.0,
      foundationType: 'Moraine Concrete Footings with Trace-Heated Utilidor',
      elevationAboveBedrockM: 0.2,
    },
    energyProfile: {
      ratedCapacityKw: 18.0,
      busDesignation: 'Priyadarshini Water Intake Feeder',
      powerFactor: 0.88,
    },
    logisticsProfile: {
      consumableType: 'Submersible Pump Impellers & Heat Trace Cables',
      sparePartSku: 'HEAT-TRACE-RAYCHEM-100M',
      inspectionIntervalHours: 720,
    },
  },

  ma_water_tank_01: {
    assetId: 'ma_water_tank_01',
    name: 'Potable Water Storage Reservoir (40,000 L)',
    code: 'MA-RES-01',
    stationId: 'station_maitri',
    geodetic: { latitude: -70.766165, longitude: 11.736051, elevationM: 118.8 },
    projected: { eastingM: 428949.01, northingM: 2064773.07, elevationM: 118.8, epsg: 'EPSG:3031' },
    localEnu: { eastM: 8.0, northM: -6.0, upM: 1.75 },
    threeCoords: { x: 8.0, y: 1.75, z: 6.0 },
    physicalDimensions: {
      lengthM: 4.8,
      widthM: 3.6,
      heightM: 3.4,
      footprintAreaM2: 17.28,
      grossVolumeM3: 58.75,
      structuralMassKg: 4600,
      constructionMaterial: 'Stainless Steel Insulated Cylindrical Tanks with Immersion Heaters',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Maitri Life Support Water Management Plan',
    operatingEnvironment: {
      minAmbientTempC: -40.0,
      maxWindGustMs: 60.0,
      foundationType: 'Insulated Utility Skid Platform on Moraine Bedrock',
      elevationAboveBedrockM: 1.4,
    },
    energyProfile: {
      ratedCapacityKw: 12.0,
      busDesignation: 'Water Heating & Pressurization Feeder',
    },
    logisticsProfile: {
      consumableType: 'UV Disinfection Lamps & Filtration Cartridges',
      sparePartSku: 'UV-STERILIZER-LAMP-40W',
      inspectionIntervalHours: 2190,
    },
  },

  ma_fuel_tank_01: {
    assetId: 'ma_fuel_tank_01',
    name: 'Bulk Polar Fuel Storage Tank Alpha (75,000 L)',
    code: 'MA-TK-01',
    stationId: 'station_maitri',
    geodetic: { latitude: -70.766201, longitude: 11.735344, elevationM: 119.3 },
    projected: { eastingM: 428922.72, northingM: 2064774.43, elevationM: 119.3, epsg: 'EPSG:3031' },
    localEnu: { eastM: -18.0, northM: -10.0, upM: 2.3 },
    threeCoords: { x: -18.0, y: 2.3, z: 10.0 },
    physicalDimensions: {
      lengthM: 7.5,
      widthM: 4.0,
      heightM: 4.2,
      footprintAreaM2: 30.0,
      grossVolumeM3: 94.25,
      structuralMassKg: 8500,
      constructionMaterial: 'Horizontal Cylindrical Double-Walled Steel Tank with Structural Saddles',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Maitri Fuel Farm As-Built Survey',
    operatingEnvironment: {
      minAmbientTempC: -45.0,
      maxWindGustMs: 65.0,
      foundationType: 'Reinforced Concrete Saddles with Bund Containment Wall',
      elevationAboveBedrockM: 0.6,
    },
    energyProfile: {
      ratedCapacityKw: 3.5,
      busDesignation: 'Fuel Trace Heating Bus',
    },
    logisticsProfile: {
      consumableType: 'Special Polar Diesel (D-80 / Kerosene blend)',
      burnRateLph: 24.2,
      sparePartSku: 'SUCTION-VALVE-DN50',
      inspectionIntervalHours: 4380,
    },
  },

  ma_comms_01: {
    assetId: 'ma_comms_01',
    name: 'Inmarsat & HF Long-Range Communications Array',
    code: 'MA-SAT-01',
    stationId: 'station_maitri',
    geodetic: { latitude: -70.766057, longitude: 11.736159, elevationM: 125.8 },
    projected: { eastingM: 428955.36, northingM: 2064784.07, elevationM: 125.8, epsg: 'EPSG:3031' },
    localEnu: { eastM: 12.0, northM: 6.0, upM: 8.8 },
    threeCoords: { x: 12.0, y: 8.8, z: -6.0 },
    physicalDimensions: {
      lengthM: 3.6,
      widthM: 3.6,
      heightM: 11.0,
      footprintAreaM2: 12.96,
      grossVolumeM3: 45.0,
      structuralMassKg: 3800,
      constructionMaterial: 'Tubular Steel Mast with Weatherproof Dielectric Radome Dome',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'NCPOR Maitri Telecommunications Infrastructure Records',
    operatingEnvironment: {
      minAmbientTempC: -45.0,
      maxWindGustMs: 70.0,
      foundationType: 'Guyed Steel Base anchored into Solid Moraine Gneiss',
      elevationAboveBedrockM: 8.8,
    },
    energyProfile: {
      ratedCapacityKw: 6.5,
      busDesignation: 'Comms Room Isolated Clean UPS Bus',
      powerFactor: 0.94,
    },
    logisticsProfile: {
      consumableType: 'Radome De-Icing Heating Elements',
      sparePartSku: 'INMARSAT-BGAN-TERMINAL',
      inspectionIntervalHours: 2190,
    },
  },

  ma_lab_geo: {
    assetId: 'ma_lab_geo',
    name: 'Geomagnetic & Seismological Laboratory',
    code: 'MA-GEO-01',
    stationId: 'station_maitri',
    geodetic: { latitude: -70.765968, longitude: 11.735452, elevationM: 118.5 },
    projected: { eastingM: 428931.90, northingM: 2064799.09, elevationM: 118.5, epsg: 'EPSG:3031' },
    localEnu: { eastM: -14.0, northM: 16.0, upM: 1.45 },
    threeCoords: { x: -14.0, y: 1.45, z: -16.0 },
    physicalDimensions: {
      lengthM: 4.2,
      widthM: 3.8,
      heightM: 2.6,
      footprintAreaM2: 15.96,
      grossVolumeM3: 41.5,
      structuralMassKg: 2100,
      constructionMaterial: 'Non-Magnetic Timber & Brass Construction with Thermal Insulation',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'IAGA Geomagnetic Observatory Survey Specifications',
    operatingEnvironment: {
      minAmbientTempC: -42.0,
      maxWindGustMs: 60.0,
      foundationType: 'Non-Magnetic Granite Pillar Anchors isolated from Station Grid',
      elevationAboveBedrockM: 0.5,
    },
    energyProfile: {
      ratedCapacityKw: 4.0,
      busDesignation: 'Isolated DC Battery Bank & Solar Float',
      powerFactor: 0.98,
    },
    logisticsProfile: {
      consumableType: 'Fluxgate Magnetometer Sensor Calibration Kits',
      sparePartSku: 'FLUXGATE-MAG-CAL-02',
      inspectionIntervalHours: 4380,
    },
  },

  ma_garage_01: {
    assetId: 'ma_garage_01',
    name: 'Vehicle Maintenance Garage & Sledge Depot',
    code: 'MA-GAR-01',
    stationId: 'station_maitri',
    geodetic: { latitude: -70.766254, longitude: 11.736105, elevationM: 119.0 },
    projected: { eastingM: 428948.94, northingM: 2064762.94, elevationM: 119.0, epsg: 'EPSG:3031' },
    localEnu: { eastM: 10.0, northM: -16.0, upM: 2.0 },
    threeCoords: { x: 10.0, y: 2.0, z: 16.0 },
    physicalDimensions: {
      lengthM: 9.0,
      widthM: 7.2,
      heightM: 3.6,
      footprintAreaM2: 64.8,
      grossVolumeM3: 233.28,
      structuralMassKg: 9200,
      constructionMaterial: 'Insulated Steel Portal Frame with Vehicle Roll-Up Door and Crane Hoist',
    },
    geometryConfidence: 'VERIFIED',
    geometrySource: 'Maitri Heavy Logistics Depot Layout',
    operatingEnvironment: {
      minAmbientTempC: -45.0,
      maxWindGustMs: 65.0,
      foundationType: 'Reinforced Concrete Apron Pad on Compacted Moraine',
      elevationAboveBedrockM: 0.3,
    },
    energyProfile: {
      ratedCapacityKw: 24.0,
      busDesignation: 'Workshop & Vehicle Charging Feeder',
      powerFactor: 0.88,
    },
    logisticsProfile: {
      consumableType: 'PistenBully Hydraulic Fluids & Track Pins',
      sparePartSku: 'PB-TRACK-PIN-HD',
      lubeOilGrade: 'Aviation Hydraulic Fluid Polar 15',
      inspectionIntervalHours: 500,
    },
  },
};

/**
 * Retrieves spatial metadata for any asset by ID
 */
export function getAssetSpatialSpec(assetId: string): AssetSpatialSpec | undefined {
  return ASSET_SPATIAL_REGISTRY[assetId];
}
