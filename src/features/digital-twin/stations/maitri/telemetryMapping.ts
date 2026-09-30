import { ProvenanceType } from '../../../../types';

/**
 * MAITRI ANTARCTIC RESEARCH STATION — TELEMETRY & METEOROLOGICAL DATA LAYER MAPPING
 * 
 * Strict Data Provenance Directive:
 * - Meteorological observations (Temp, Wind, Pressure, Humidity) originate from NCPOR AWS Maitri.
 * - Operational infrastructure telemetry (Genset load, Boiler temp, Lake pump states) have separate source classification.
 * - Never label synthetic telemetry as 'OBSERVED' or 'LIVE'.
 */

export interface TelemetryChannelSpec {
  channelId: string;
  assetId: string;
  parameterName: string;
  unit: string;
  sourceCategory: 'METEOROLOGICAL_DATA' | 'OPERATIONAL_TELEMETRY';
  provenance: ProvenanceType;
  officialSourceLabel: string;
  updateIntervalSec: number;
}

export const MAITRI_DATA_CHANNELS: TelemetryChannelSpec[] = [
  // 1. NCPOR Meteorological Observation Layer (Automatic Weather Station)
  {
    channelId: 'ma_met_temp',
    assetId: 'ma_met_aws',
    parameterName: 'Ambient Air Temperature',
    unit: '°C',
    sourceCategory: 'METEOROLOGICAL_DATA',
    provenance: 'REAL_PUBLIC',
    officialSourceLabel: 'NCPOR / IMD Automatic Weather Station (AWS Maitri)',
    updateIntervalSec: 60,
  },
  {
    channelId: 'ma_met_wind_speed',
    assetId: 'ma_met_aws',
    parameterName: 'Wind Speed',
    unit: 'm/s',
    sourceCategory: 'METEOROLOGICAL_DATA',
    provenance: 'REAL_PUBLIC',
    officialSourceLabel: 'NCPOR / IMD Anemometer Suite',
    updateIntervalSec: 10,
  },
  {
    channelId: 'ma_met_wind_dir',
    assetId: 'ma_met_aws',
    parameterName: 'Wind Direction',
    unit: '°',
    sourceCategory: 'METEOROLOGICAL_DATA',
    provenance: 'REAL_PUBLIC',
    officialSourceLabel: 'NCPOR / IMD Wind Direction Sensor',
    updateIntervalSec: 10,
  },
  {
    channelId: 'ma_met_pressure',
    assetId: 'ma_met_aws',
    parameterName: 'Surface Barometric Pressure',
    unit: 'hPa',
    sourceCategory: 'METEOROLOGICAL_DATA',
    provenance: 'REAL_PUBLIC',
    officialSourceLabel: 'NCPOR Barometric Sensor (Schirmacher Oasis)',
    updateIntervalSec: 60,
  },
  {
    channelId: 'ma_met_humidity',
    assetId: 'ma_met_aws',
    parameterName: 'Relative Humidity',
    unit: '%',
    sourceCategory: 'METEOROLOGICAL_DATA',
    provenance: 'REAL_PUBLIC',
    officialSourceLabel: 'NCPOR Relative Humidity Sensor',
    updateIntervalSec: 60,
  },

  // 2. Operational Infrastructure Telemetry (Power, Boiler, Lake Intake, Fuel)
  {
    channelId: 'ma_gen1_kw',
    assetId: 'ma_gen_01',
    parameterName: 'Generator Active Power Output',
    unit: 'kW',
    sourceCategory: 'OPERATIONAL_TELEMETRY',
    provenance: 'PHYSICS_SYNTHETIC',
    officialSourceLabel: 'Thermodynamic Power House Simulation',
    updateIntervalSec: 5,
  },
  {
    channelId: 'ma_boiler_temp',
    assetId: 'ma_boiler_01',
    parameterName: 'Hydronic Boiler Supply Temperature',
    unit: '°C',
    sourceCategory: 'OPERATIONAL_TELEMETRY',
    provenance: 'PHYSICS_SYNTHETIC',
    officialSourceLabel: 'Thermal Loop Simulation',
    updateIntervalSec: 10,
  },
  {
    channelId: 'ma_lake_pump_flow',
    assetId: 'ma_lake_pump',
    parameterName: 'Lake Priyadarshini Water Intake Flow',
    unit: 'L/min',
    sourceCategory: 'OPERATIONAL_TELEMETRY',
    provenance: 'PHYSICS_SYNTHETIC',
    officialSourceLabel: 'Lake Pumping Hydraulic Model',
    updateIntervalSec: 15,
  },
  {
    channelId: 'ma_hab_temp',
    assetId: 'ma_hab_core',
    parameterName: 'Stilt Modular Complex Indoor Temp',
    unit: '°C',
    sourceCategory: 'OPERATIONAL_TELEMETRY',
    provenance: 'PHYSICS_SYNTHETIC',
    officialSourceLabel: 'Underfloor Stilt Heat Loss & Convection Model',
    updateIntervalSec: 15,
  },
];
