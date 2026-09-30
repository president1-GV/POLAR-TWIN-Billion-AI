import { StationAsset, ProvenanceType, AssetStatus, CriticalityLevel } from '../../types';

export type VisualMode = 
  | 'REALISTIC'     // Industrial PBR materials with cold polar lighting & status beacons
  | 'ENGINEERING'   // Technical schematic / wireframe structural mode
  | 'TELEMETRY'     // Color-coded asset health & load heatmap
  | 'DEPENDENCY'    // Visualized power, water, fuel, and data network flow lines
  | 'THERMAL';      // Infrared false-color thermal simulation gradient

export type CameraPresetId = 
  | 'OVERVIEW'
  | 'MAIN_BUILDING'
  | 'ENERGY'
  | 'WATER'
  | 'COMMS'
  | 'FUEL'
  | 'LOGISTICS'
  | 'SCIENCE'
  | 'RESET';

export interface CameraPreset {
  id: CameraPresetId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

export interface SystemFlowEdge {
  id: string;
  sourceAssetId: string;
  targetAssetId: string;
  type: 'POWER' | 'FUEL' | 'WATER' | 'HEATING' | 'COMMS';
  points: [number, number, number][];
  color: string;
  flowSpeed: number;
}

export interface MeasurementPoint {
  x: number;
  y: number;
  z: number;
  label?: string;
}

export interface MeasurementResult {
  pointA: MeasurementPoint;
  pointB: MeasurementPoint;
  distanceMeters: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
}

export interface WhatIfScenarioStep {
  timeOffsetHours: number;
  timeLabel: string;
  powerDeficitKw: number;
  indoorTempC: number;
  waterRemainingLiters: number;
  affectedAssetIds: string[];
  systemStatus: 'WARNING' | 'CRITICAL' | 'EMERGENCY';
  summary: string;
  recommendedAction: string;
}

export interface WhatIfScenario {
  id: string;
  title: string;
  description: string;
  triggerAssetId: string;
  defaultAmbientTempC: number;
  steps: WhatIfScenarioStep[];
}

export type LightingViewMode = 'OPERATIONAL' | 'SCIENTIFIC' | 'NIGHT' | 'WEATHER';

