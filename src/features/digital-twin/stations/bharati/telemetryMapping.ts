import { ProvenanceType } from '../../../../types';

/**
 * BHARATI ANTARCTIC RESEARCH STATION — TELEMETRY & METEOROLOGICAL DATA LAYER MAPPING
 * 
 * Strict Data Provenance Directive:
 * - Meteorological AWS observations (Temp, Wind, Pressure, Humidity) originate from NCPOR AWS.
 * - Operational infrastructure telemetry (Genset load, Fuel levels, Pump states) have separate source classification.
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

export const BHARATI_DATA_CHANNELS: TelemetryChannelSpec[] = [
  // 1. NCPOR Meteorological Observation Layer (Automatic Weather Station)
  {
    channelId: 'bh_met_temp',
    assetId: 'bh_met_aws',
    parameterName: 'Ambient Air Temperature',
    unit: '°C',
    sourceCategory: 'METEOROLOGICAL_DATA',
    provenance: 'REAL_PUBLIC',
    officialSourceLabel: 'NCPOR / IMD Automatic Weather Station (AWS Bharati)',
    updateIntervalSec: 60,
  },
  {
    channelId: 'bh_met_wind_speed',
    assetId: 'bh_met_aws',
    parameterName: 'Horizontal Wind Speed',
    unit: 'm/s',
    sourceCategory: 'METEOROLOGICAL_DATA',
    provenance: 'REAL_PUBLIC',
    officialSourceLabel: 'NCPOR / IMD Ultrasonic Anemometer',
    updateIntervalSec: 10,
  },
  {
    channelId: 'bh_met_wind_dir',
    assetId: 'bh_met_aws',
    parameterName: 'Wind Direction (Katabatic Vector)',
    unit: '°',
    sourceCategory: 'METEOROLOGICAL_DATA',
    provenance: 'REAL_PUBLIC',
    officialSourceLabel: 'NCPOR / IMD Wind Vane',
    updateIntervalSec: 10,
  },
  {
    channelId: 'bh_met_pressure',
    assetId: 'bh_met_aws',
    parameterName: 'Atmospheric Surface Pressure',
    unit: 'hPa',
    sourceCategory: 'METEOROLOGICAL_DATA',
    provenance: 'REAL_PUBLIC',
    officialSourceLabel: 'NCPOR Barometric Sensor Suite',
    updateIntervalSec: 60,
  },
  {
    channelId: 'bh_met_humidity',
    assetId: 'bh_met_aws',
    parameterName: 'Relative Humidity',
    unit: '%',
    sourceCategory: 'METEOROLOGICAL_DATA',
    provenance: 'REAL_PUBLIC',
    officialSourceLabel: 'NCPOR Capacitive Humidity Sensor',
    updateIntervalSec: 60,
  },

  // 2. Operational Infrastructure Telemetry (Power, Life Support, Water, Fuel)
  {
    channelId: 'bh_gen1_kw',
    assetId: 'bh_gen_01',
    parameterName: 'Generator Active Power Output',
    unit: 'kW',
    sourceCategory: 'OPERATIONAL_TELEMETRY',
    provenance: 'PHYSICS_SYNTHETIC',
    officialSourceLabel: 'Coupled Thermodynamic Engine Model (Genset Bay 1)',
    updateIntervalSec: 5,
  },
  {
    channelId: 'bh_fuel_farm_vol',
    assetId: 'bh_fuel_farm',
    parameterName: 'Bulk Fuel Reserve Volume',
    unit: 'L',
    sourceCategory: 'OPERATIONAL_TELEMETRY',
    provenance: 'PHYSICS_SYNTHETIC',
    officialSourceLabel: 'Hydrostatic Tank Gauging Simulation',
    updateIntervalSec: 30,
  },
  {
    channelId: 'bh_sw_pump_flow',
    assetId: 'bh_seawater_pump',
    parameterName: 'Coastal Sea Intake Flow Rate',
    unit: 'L/min',
    sourceCategory: 'OPERATIONAL_TELEMETRY',
    provenance: 'PHYSICS_SYNTHETIC',
    officialSourceLabel: 'Sea-Water Intake Ultrasonic Flowmeter Model',
    updateIntervalSec: 15,
  },
  {
    channelId: 'bh_hab_temp',
    assetId: 'bh_hab_core',
    parameterName: 'Habitat Indoor Temperature',
    unit: '°C',
    sourceCategory: 'OPERATIONAL_TELEMETRY',
    provenance: 'PHYSICS_SYNTHETIC',
    officialSourceLabel: 'Building Thermal Resistance Network (Envelope R=8.5)',
    updateIntervalSec: 15,
  },
];
