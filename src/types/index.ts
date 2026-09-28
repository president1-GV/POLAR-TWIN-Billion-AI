export type ProvenanceType = 'REAL_PUBLIC' | 'PHYSICS_SYNTHETIC' | 'EDGE_SIMULATED' | 'FUTURE_IOT' | 'MOCK';

export type AssetStatus = 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL' | 'FAILED' | 'OFFLINE';

export type CriticalityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type LinkStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'SYNCING';

export type AlertSeverity = 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';

export interface Station {
  id: string;
  station_code: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  elevation_meters: number;
  operational_status: string;
  connectivity_status: LinkStatus;
  primary_power_source: string;
  population_capacity: number;
  current_occupancy: number;
  overall_health_score?: number;
  life_support_state?: string;
  generation_kw?: number;
  fuel_burn_lph?: number;
  thermal_indoor_c?: number;
  active_alerts_count?: number;
}

export interface StationAsset {
  id: string;
  station_id: string;
  parent_asset_id?: string;
  asset_type_id: string;
  name: string;
  code: string;
  status: AssetStatus;
  health_score: number;
  criticality: CriticalityLevel;
  location_desc?: string;
  coordinates_3d: { x: number; y: number; z: number };
  current_state: Record<string, any>;
  source_type: ProvenanceType;
  model_version?: string;
}

export interface EnvironmentObservation {
  station_id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  temperature_c: number;
  apparent_temp_c: number;
  wind_speed_ms: number;
  wind_gust_ms: number;
  wind_direction_deg: number;
  atmospheric_pressure_hpa: number;
  relative_humidity_pct: number;
  solar_radiation_wm2: number;
  visibility_km: number;
  blizzard_condition: boolean;
  provenance: {
    source_type: ProvenanceType;
    provider_name: string;
    endpoint: string;
    status: string;
    verified_at: string;
    note: string;
  };
}

export interface Alert {
  id: string;
  station_id: string;
  asset_id?: string;
  title: string;
  severity: AlertSeverity;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED';
  source_type: ProvenanceType;
  evidence: string[] | string;
  predicted_consequence?: string;
  recommended_action?: string;
  created_at: string;
}

export interface LogisticsItem {
  id: string;
  station_id: string;
  category: 'FUEL' | 'FOOD' | 'MEDICAL' | 'SPARE_PARTS' | 'SCIENTIFIC_SUPPLIES' | 'WATER';
  name: string;
  sku: string;
  current_stock: number;
  unit: string;
  daily_burn_rate: number;
  minimum_reserve: number;
  days_remaining: number;
  shortage_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  storage_location?: string;
}

export interface Shipment {
  id: string;
  vessel_name: string;
  voyage_number: string;
  departure_port: string;
  destination_station_id: string;
  scheduled_departure: string;
  scheduled_arrival: string;
  delay_days: number;
  status: string;
  cargo_manifest: Array<{ item: string; quantity: number; unit: string }>;
}

export interface EdgeStatus {
  device_id: string;
  station_id: string;
  link_status: LinkStatus;
  sequence_counter: number;
  buffer_queue_size: number;
  local_buffer_sample: any[];
  local_alerts_count: number;
  local_alerts: any[];
  hardware_specification: string;
}
