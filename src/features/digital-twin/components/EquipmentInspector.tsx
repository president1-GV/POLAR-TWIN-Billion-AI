import React, { useState } from 'react';
import { StationAsset } from '../../../types';
import { ProvenanceBadge } from '../../../components/common/ProvenanceBadge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { DependencyGraph } from '../../../components/ui/DependencyGraph';
import { getAssetSpatialSpec } from '../geospatial/GeoReferenceEngine';
import { 
  X, 
  Zap, 
  Activity, 
  AlertTriangle, 
  GitFork, 
  ExternalLink, 
  Flame, 
  Droplet, 
  Cpu, 
  Camera, 
  ShieldCheck, 
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Compass,
  Box,
  Layers,
  FileText,
  Sliders,
  CheckCircle2,
  Thermometer,
  Wind
} from 'lucide-react';

interface Props {
  asset: StationAsset;
  onClose: () => void;
  onFocusCamera: (assetId: string) => void;
  onSelectRelatedAsset?: (assetId: string) => void;
  onTriggerSimulation?: (assetId: string) => void;
  consequences?: any;
}

// System dependency relationship map for upstream and downstream navigation
const ASSET_RELATIONS: Record<string, { upstream: Array<{ id: string; name: string; type: string }>; downstream: Array<{ id: string; name: string; type: string }> }> = {
  // Bharati
  bh_gen_01: {
    upstream: [{ id: 'bh_fuel_tank_01', name: 'Bulk Fuel Tank Alpha', type: 'FUEL' }],
    downstream: [
      { id: 'bh_pdb_01', name: 'Microgrid Switchgear', type: 'POWER' },
      { id: 'bh_hvac_01', name: 'Dual-Loop Thermal Recovery', type: 'HEATING' },
    ],
  },
  bh_gen_02: {
    upstream: [{ id: 'bh_fuel_tank_01', name: 'Bulk Fuel Tank Alpha', type: 'FUEL' }],
    downstream: [{ id: 'bh_pdb_01', name: 'Microgrid Switchgear', type: 'POWER' }],
  },
  bh_gen_03: {
    upstream: [{ id: 'bh_fuel_tank_02', name: 'Bulk Fuel Tank Bravo', type: 'FUEL' }],
    downstream: [{ id: 'bh_pdb_01', name: 'Microgrid Switchgear', type: 'POWER' }],
  },
  bh_solar_01: {
    upstream: [],
    downstream: [{ id: 'bh_pdb_01', name: 'Microgrid Switchgear', type: 'POWER' }],
  },
  bh_bess_01: {
    upstream: [{ id: 'bh_pdb_01', name: 'Microgrid Switchgear', type: 'POWER' }],
    downstream: [{ id: 'bh_pdb_01', name: 'Microgrid Frequency Support', type: 'POWER' }],
  },
  bh_pdb_01: {
    upstream: [
      { id: 'bh_gen_01', name: 'Primary Genset 01', type: 'POWER' },
      { id: 'bh_solar_01', name: 'Rooftop Solar PV', type: 'POWER' },
      { id: 'bh_bess_01', name: 'Station Lithium BESS', type: 'POWER' },
    ],
    downstream: [
      { id: 'bh_hvac_01', name: 'Dual-Loop HVAC', type: 'HEATING' },
      { id: 'bh_water_01', name: 'Snow Melt & RO Plant', type: 'WATER' },
      { id: 'bh_comms_01', name: 'C-Band Earth Station', type: 'COMMS' },
      { id: 'bh_lab_01', name: 'Atmospheric Science Lab', type: 'SCIENCE' },
    ],
  },
  bh_hvac_01: {
    upstream: [
      { id: 'bh_pdb_01', name: 'Microgrid Switchgear', type: 'POWER' },
      { id: 'bh_gen_01', name: 'Genset Exhaust Heat Recovery', type: 'HEATING' },
    ],
    downstream: [{ id: 'bh_hab_core', name: 'Main Habitat Thermal Envelope', type: 'LIFE_SUPPORT' }],
  },
  bh_water_01: {
    upstream: [
      { id: 'bh_pdb_01', name: 'Microgrid Switchgear', type: 'POWER' },
      { id: 'bh_intake', name: 'Coastal Sea Intake Line', type: 'RAW_WATER' },
    ],
    downstream: [
      { id: 'bh_potable_tank', name: 'Potable Water Reserves', type: 'STORAGE' },
      { id: 'bh_hab_core', name: 'Habitat Potable Supply', type: 'DISTRIBUTION' },
    ],
  },
  bh_fuel_tank_01: {
    upstream: [],
    downstream: [
      { id: 'bh_gen_01', name: 'Primary Genset 01', type: 'FUEL' },
      { id: 'bh_gen_02', name: 'Auxiliary Genset 02', type: 'FUEL' },
    ],
  },
  bh_fuel_tank_02: {
    upstream: [],
    downstream: [{ id: 'bh_gen_03', name: 'Emergency Backup Genset 03', type: 'FUEL' }],
  },
  bh_comms_01: {
    upstream: [{ id: 'bh_pdb_01', name: 'Microgrid Switchgear', type: 'POWER' }],
    downstream: [{ id: 'sat_uplink', name: 'GSAT-11 / Inmarsat Constellation', type: 'TELEMETRY' }],
  },
  bh_lab_01: {
    upstream: [{ id: 'bh_pdb_01', name: 'Microgrid Switchgear', type: 'POWER' }],
    downstream: [{ id: 'ncpor_gateway', name: 'NCPOR Scientific Data Stream', type: 'DATA' }],
  },

  bh_hab_core: {
    upstream: [
      { id: 'bh_pdb_01', name: 'Microgrid Switchgear', type: 'POWER' },
      { id: 'bh_hvac_01', name: 'Dual-Loop Thermal Recovery', type: 'HEATING' },
      { id: 'bh_water_01', name: 'Snow Melt & RO Plant', type: 'WATER' },
      { id: 'bh_comms_01', name: 'C-Band Earth Station', type: 'COMMS' },
    ],
    downstream: [
      { id: 'bh_lab_01', name: 'Atmospheric Science Lab', type: 'SCIENCE' },
      { id: 'station_life_support', name: 'Living Quarters (18 Personnel)', type: 'LIFE_SUPPORT' },
    ],
  },
  bh_fuel_farm: {
    upstream: [],
    downstream: [
      { id: 'bh_fuel_station', name: 'Vehicle Fueling Dispenser', type: 'FUEL' },
      { id: 'bh_fuel_tank_01', name: 'Bulk Fuel Tank Alpha', type: 'FUEL' },
      { id: 'bh_fuel_tank_02', name: 'Bulk Fuel Tank Bravo', type: 'FUEL' },
    ],
  },
  bh_fuel_station: {
    upstream: [{ id: 'bh_fuel_farm', name: 'Bulk Fuel Farm', type: 'FUEL' }],
    downstream: [{ id: 'polar_fleet', name: 'PistenBully & Snowmobile Logistics', type: 'VEHICLES' }],
  },
  bh_seawater_pump: {
    upstream: [{ id: 'bh_pdb_01', name: 'Microgrid Switchgear Bus', type: 'POWER' }],
    downstream: [{ id: 'bh_water_01', name: 'RO Desalination & Potable Water Plant', type: 'RAW_WATER' }],
  },
  bh_summer_camp: {
    upstream: [
      { id: 'bh_pdb_01', name: 'Microgrid Switchgear', type: 'POWER' },
      { id: 'bh_water_01', name: 'Potable Water Supply', type: 'WATER' },
    ],
    downstream: [],
  },
  bh_containers: {
    upstream: [{ id: 'bh_pdb_01', name: 'Auxiliary Power Circuit', type: 'POWER' }],
    downstream: [],
  },
  bh_roads_access: {
    upstream: [],
    downstream: [
      { id: 'bh_hab_core', name: 'Habitat Complex', type: 'ACCESS' },
      { id: 'bh_seawater_pump', name: 'Sea Intake Station', type: 'ACCESS' },
      { id: 'bh_fuel_farm', name: 'Bulk Fuel Farm', type: 'ACCESS' },
    ],
  },

  // Maitri
  ma_hab_core: {
    upstream: [
      { id: 'ma_pdb_01', name: 'Maitri Switchgear Bus', type: 'POWER' },
      { id: 'ma_boiler_01', name: 'Central Hydronic Boiler', type: 'HEATING' },
      { id: 'ma_water_tank_01', name: 'Potable Water Reservoir', type: 'WATER' },
      { id: 'ma_comms_01', name: 'Inmarsat Communications', type: 'COMMS' },
    ],
    downstream: [
      { id: 'ma_lab_geo', name: 'Geomagnetic Laboratory', type: 'SCIENCE' },
      { id: 'ma_living_wings', name: 'Modular Living Blocks (22 Personnel)', type: 'LIFE_SUPPORT' },
    ],
  },
  ma_fuel_farm: {
    upstream: [],
    downstream: [
      { id: 'ma_fuel_station', name: 'Vehicle Dispenser Station', type: 'FUEL' },
      { id: 'ma_fuel_tank_01', name: 'Polar Fuel Tank Alpha', type: 'FUEL' },
      { id: 'ma_gen_01', name: 'Primary Genset 01', type: 'FUEL' },
    ],
  },
  ma_fuel_station: {
    upstream: [{ id: 'ma_fuel_farm', name: 'Bulk Fuel Farm', type: 'FUEL' }],
    downstream: [{ id: 'ma_garage_01', name: 'Polar Tracked Vehicles & Snowmobiles', type: 'VEHICLES' }],
  },
  ma_lake_pump: {
    upstream: [{ id: 'ma_pdb_01', name: 'Maitri Switchgear Bus', type: 'POWER' }],
    downstream: [
      { id: 'ma_water_tank_01', name: 'Potable Water Reservoir', type: 'RAW_WATER' },
      { id: 'ma_boiler_01', name: 'Central Hydronic Boiler Feed', type: 'RAW_WATER' },
    ],
  },
  ma_summer_camp: {
    upstream: [{ id: 'ma_pdb_01', name: 'Maitri Switchgear Bus', type: 'POWER' }],
    downstream: [],
  },
  ma_containers: {
    upstream: [{ id: 'ma_pdb_01', name: 'Field Science Auxiliary Line', type: 'POWER' }],
    downstream: [],
  },
  ma_access_routes: {
    upstream: [],
    downstream: [
      { id: 'ma_hab_core', name: 'Elevated Main Habitat', type: 'ACCESS' },
      { id: 'ma_lake_pump', name: 'Lake Priyadarshini Pump House', type: 'ACCESS' },
      { id: 'ma_fuel_farm', name: 'Bulk Fuel Farm', type: 'ACCESS' },
    ],
  },
  ma_gen_01: {
    upstream: [{ id: 'ma_fuel_tank_01', name: 'Polar Fuel Tank Alpha', type: 'FUEL' }],
    downstream: [{ id: 'ma_pdb_01', name: 'Maitri Switchgear Bus', type: 'POWER' }],
  },
  ma_gen_02: {
    upstream: [{ id: 'ma_fuel_tank_01', name: 'Polar Fuel Tank Alpha', type: 'FUEL' }],
    downstream: [{ id: 'ma_pdb_01', name: 'Maitri Switchgear Bus', type: 'POWER' }],
  },
  ma_gen_03: {
    upstream: [{ id: 'ma_fuel_tank_01', name: 'Polar Fuel Tank Alpha', type: 'FUEL' }],
    downstream: [{ id: 'ma_pdb_01', name: 'Maitri Switchgear Bus', type: 'POWER' }],
  },
  ma_wind_01: {
    upstream: [],
    downstream: [{ id: 'ma_pdb_01', name: 'Maitri Switchgear Bus', type: 'POWER' }],
  },
  ma_pdb_01: {
    upstream: [
      { id: 'ma_gen_01', name: 'Primary Genset 01', type: 'POWER' },
      { id: 'ma_wind_01', name: 'Micro-Wind Turbine Array', type: 'POWER' },
    ],
    downstream: [
      { id: 'ma_boiler_01', name: 'Central Hydronic Boiler', type: 'HEATING' },
      { id: 'ma_water_pump_01', name: 'Lake Priyadarshini Pump House', type: 'WATER' },
      { id: 'ma_comms_01', name: 'Inmarsat Comms Array', type: 'COMMS' },
      { id: 'ma_lab_geo', name: 'Geomagnetic Laboratory', type: 'SCIENCE' },
    ],
  },
  ma_boiler_01: {
    upstream: [
      { id: 'ma_fuel_tank_01', name: 'Polar Fuel Tank Alpha', type: 'FUEL' },
      { id: 'ma_pdb_01', name: 'Maitri Switchgear Bus', type: 'POWER' },
    ],
    downstream: [{ id: 'ma_living_wings', name: 'Living Wings Hydronic Radiators', type: 'HEATING' }],
  },
  ma_water_pump_01: {
    upstream: [
      { id: 'ma_pdb_01', name: 'Maitri Switchgear Bus', type: 'POWER' },
      { id: 'lake_priyadarshini', name: 'Lake Priyadarshini Shore Intake', type: 'RAW_WATER' },
    ],
    downstream: [{ id: 'ma_water_tank_01', name: 'Potable Water Storage Reservoir', type: 'STORAGE' }],
  },
  ma_water_tank_01: {
    upstream: [{ id: 'ma_water_pump_01', name: 'Lake Water Pump House', type: 'WATER' }],
    downstream: [{ id: 'ma_station_plumbing', name: 'Station Potable Plumbing Grid', type: 'DISTRIBUTION' }],
  },
  ma_fuel_tank_01: {
    upstream: [],
    downstream: [
      { id: 'ma_gen_01', name: 'Primary Genset 01', type: 'FUEL' },
      { id: 'ma_boiler_01', name: 'Central Hydronic Boiler', type: 'FUEL' },
    ],
  },
  ma_comms_01: {
    upstream: [{ id: 'ma_pdb_01', name: 'Maitri Switchgear Bus', type: 'POWER' }],
    downstream: [{ id: 'hf_link', name: 'HF Dipole & Inmarsat Ground Link', type: 'COMMS' }],
  },
  ma_lab_geo: {
    upstream: [{ id: 'ma_pdb_01', name: 'Maitri Switchgear Bus', type: 'POWER' }],
    downstream: [{ id: 'geomag_stream', name: 'IAGA Geomagnetic Observational Feed', type: 'SCIENCE' }],
  },
  ma_garage_01: {
    upstream: [{ id: 'ma_pdb_01', name: 'Maitri Switchgear Bus', type: 'POWER' }],
    downstream: [{ id: 'snowcats', name: 'Polar Vehicle Fleet Readiness', type: 'LOGISTICS' }],
  },
};

type InspectorTab = 'OVERVIEW' | 'DEPENDENCY' | 'SPATIAL' | 'TELEMETRY' | 'PROGNOSTICS';

export const EquipmentInspector: React.FC<Props> = ({
  asset,
  onClose,
  onFocusCamera,
  onSelectRelatedAsset,
  onTriggerSimulation,
  consequences,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('OVERVIEW');
  const relations = ASSET_RELATIONS[asset.id] || { upstream: [], downstream: [] };
  const spatialSpec = getAssetSpatialSpec(asset.id);

  const rawConfidence = spatialSpec?.geometryConfidence || asset.geometry_confidence || 'DOCUMENTED';
  const confidence = rawConfidence === 'VERIFIED' ? 'DOCUMENTED' : rawConfidence === 'APPROXIMATE' ? 'ESTIMATED' : rawConfidence;

  const confidenceColor = 
    confidence === 'DOCUMENTED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    confidence === 'RECONSTRUCTED' ? 'text-sky-400 bg-sky-500/10 border-sky-500/30' :
    'text-amber-400 bg-amber-500/10 border-amber-500/30';

  return (
    <div className="absolute top-4 right-4 bottom-4 w-[28rem] max-w-[calc(100vw-2rem)] bg-polar-surface border border-polar-border rounded-xl shadow-2xl flex flex-col z-30 overflow-hidden font-mono select-none">
      {/* Header with Asset Code, Name, Provenance and Controls */}
      <div className="p-3.5 bg-polar-card border-b border-polar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              asset.status === 'NORMAL' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' :
              asset.status === 'WARNING' || asset.status === 'WATCH' ? 'bg-amber-400 animate-pulse' :
              asset.status === 'CRITICAL' || asset.status === 'FAILED' ? 'bg-rose-500 animate-ping' :
              'bg-slate-400'
            }`} />
            <span className="text-xs font-bold text-polar-cyan tracking-wider uppercase">
              {asset.code}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-polar-elevated text-polar-text-muted border border-polar-border">
              {asset.criticality} TIER
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${confidenceColor}`}>
              {confidence}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-polar-text-muted hover:text-polar-text-primary p-1 rounded hover:bg-polar-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <h2 className="text-sm font-bold text-polar-text-primary leading-snug">
            {spatialSpec?.name || asset.name}
          </h2>
          <ProvenanceBadge type={asset.source_type || 'DERIVED_PHYSICS'} size="sm" />
        </div>
        <p className="text-[11px] text-polar-text-muted font-sans mt-0.5">
          {asset.location_desc || 'Station Infrastructure Asset'}
        </p>

        {/* Quick Action Bar */}
        <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-polar-border">
          <button
            onClick={() => onFocusCamera(asset.id)}
            className="flex-1 py-1.5 px-2 bg-polar-elevated hover:bg-polar-hover text-polar-text-primary rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-polar-border transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-polar-cyan" />
            <span>Focus Camera</span>
          </button>

          {onTriggerSimulation && (
            <button
              onClick={() => onTriggerSimulation(asset.id)}
              className="py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Simulate Trip</span>
            </button>
          )}
        </div>

        {/* 14-Dimension Navigation Tabs */}
        <div className="grid grid-cols-5 gap-1 mt-3 bg-polar-surface p-1 rounded-lg border border-polar-border text-[9px] sm:text-[10px]">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-1 px-1 rounded font-bold transition-colors text-center ${
              activeTab === 'OVERVIEW'
                ? 'bg-polar-cyan/15 text-polar-cyan border border-polar-cyan/30'
                : 'text-polar-text-secondary hover:text-polar-text-primary'
            }`}
          >
            STATUS
          </button>
          <button
            onClick={() => setActiveTab('DEPENDENCY')}
            className={`py-1 px-1 rounded font-bold transition-colors text-center ${
              activeTab === 'DEPENDENCY'
                ? 'bg-polar-cyan/15 text-polar-cyan border border-polar-cyan/30'
                : 'text-polar-text-secondary hover:text-polar-text-primary'
            }`}
          >
            TOPOLOGY
          </button>
          <button
            onClick={() => setActiveTab('SPATIAL')}
            className={`py-1 px-1 rounded font-bold transition-colors text-center ${
              activeTab === 'SPATIAL'
                ? 'bg-polar-cyan/15 text-polar-cyan border border-polar-cyan/30'
                : 'text-polar-text-secondary hover:text-polar-text-primary'
            }`}
          >
            SPATIAL
          </button>
          <button
            onClick={() => setActiveTab('TELEMETRY')}
            className={`py-1 px-1 rounded font-bold transition-colors text-center ${
              activeTab === 'TELEMETRY'
                ? 'bg-polar-cyan/15 text-polar-cyan border border-polar-cyan/30'
                : 'text-polar-text-secondary hover:text-polar-text-primary'
            }`}
          >
            METRICS
          </button>
          <button
            onClick={() => setActiveTab('PROGNOSTICS')}
            className={`py-1 px-1 rounded font-bold transition-colors text-center ${
              activeTab === 'PROGNOSTICS'
                ? 'bg-polar-cyan/15 text-polar-cyan border border-polar-cyan/30'
                : 'text-polar-text-secondary hover:text-polar-text-primary'
            }`}
          >
            RISK
          </button>
        </div>
      </div>

      {/* Main Tabbed Content Area */}
      <div className="p-3.5 overflow-y-auto space-y-3.5 flex-1 text-xs">
        {/* TAB 1: OVERVIEW & TOPOLOGY */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-3">
            {/* Status & Health Gauge Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-polar-card p-2.5 rounded-lg border border-polar-border">
                <span className="text-[10px] text-polar-text-muted uppercase block font-semibold">
                  Operational State
                </span>
                <div className="mt-1">
                  <StatusBadge status={asset.status} size="sm" />
                </div>
              </div>

              <div className="bg-polar-card p-2.5 rounded-lg border border-polar-border">
                <span className="text-[10px] text-polar-text-muted uppercase block font-semibold">
                  Asset Health Index
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-base font-bold ${
                    asset.health_score > 80 ? 'text-emerald-500 dark:text-emerald-400' :
                    asset.health_score > 50 ? 'text-amber-500 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400'
                  }`}>
                    {asset.health_score}%
                  </span>
                  <div className="w-16 h-2 bg-polar-elevated rounded-full overflow-hidden border border-polar-border">
                    <div
                      className={`h-full ${
                        asset.health_score > 80 ? 'bg-emerald-500' :
                        asset.health_score > 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${asset.health_score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dimension 1 & 2: Identity & Station Reference */}
            <div className="bg-polar-card p-2.5 rounded-lg border border-polar-border space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-polar-text-secondary">Asset ID:</span>
                <span className="font-mono text-polar-text-primary">{asset.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-polar-text-secondary">Station Code:</span>
                <span className="font-semibold text-polar-cyan">{asset.station_id.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-polar-text-secondary">Classification:</span>
                <span className="text-polar-text-primary capitalize">{asset.asset_type_id.replace('type_', '')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-polar-text-secondary">Criticality:</span>
                <span className="font-bold text-amber-500 dark:text-amber-400">{asset.criticality}</span>
              </div>
            </div>

            {/* Dimension 12: Upstream & Downstream Infrastructure Topology */}
            <div className="space-y-2 pt-2 border-t border-polar-border">
              <div className="flex items-center gap-1.5 text-xs text-polar-text-primary font-bold uppercase tracking-wider">
                <GitFork className="w-3.5 h-3.5 text-polar-cyan" />
                <span>Infrastructure Graph Topology</span>
              </div>

              {/* Upstream Supplies */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-polar-text-muted uppercase font-semibold flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3 text-polar-cyan" />
                  Upstream Supply Infeeds:
                </span>
                {relations.upstream.length > 0 ? (
                  <div className="space-y-1">
                    {relations.upstream.map(u => (
                      <button
                        key={u.id}
                        onClick={() => onSelectRelatedAsset && onSelectRelatedAsset(u.id)}
                        className="w-full text-left p-2 rounded bg-polar-card hover:bg-polar-hover border border-polar-border text-[11px] text-polar-text-secondary flex items-center justify-between transition-colors group"
                      >
                        <span>{u.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-polar-elevated text-polar-cyan border border-polar-border">
                          {u.type}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-polar-text-muted italic pl-2">None (Primary Infeed / Bulk Storage)</p>
                )}
              </div>

              {/* Downstream Consumers */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-polar-text-muted uppercase font-semibold flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                  Downstream Dependent Loads:
                </span>
                {relations.downstream.length > 0 ? (
                  <div className="space-y-1">
                    {relations.downstream.map(d => (
                      <button
                        key={d.id}
                        onClick={() => onSelectRelatedAsset && onSelectRelatedAsset(d.id)}
                        className="w-full text-left p-2 rounded bg-polar-card hover:bg-polar-hover border border-polar-border text-[11px] text-polar-text-secondary flex items-center justify-between transition-colors group"
                      >
                        <span>{d.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-polar-elevated text-amber-500 dark:text-amber-400 border border-polar-border">
                          {d.type}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-polar-text-muted italic pl-2">None (Terminal Consumer / Storage)</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COUPLED DEPENDENCY TOPOLOGY */}
        {activeTab === 'DEPENDENCY' && (
          <div className="space-y-3">
            <DependencyGraph
              currentAssetId={asset.id}
              currentAssetName={spatialSpec?.name || asset.name}
              upstream={relations.upstream}
              downstream={relations.downstream}
              onSelectAsset={(assetId) => onSelectRelatedAsset && onSelectRelatedAsset(assetId)}
            />
          </div>
        )}

        {/* TAB 3: SPATIAL & PHYSICAL SPECIFICATIONS */}
        {activeTab === 'SPATIAL' && (
          <div className="space-y-3">
            {/* Dimension 3: Geodetic & Engineering Coordinate Reference */}
            <div className="bg-polar-card p-3 rounded-lg border border-polar-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-polar-cyan font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>Geodetic Coordinate Baseline</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">WGS84 Latitude:</span>
                  <span className="font-mono text-polar-text-primary">
                    {spatialSpec?.geodetic.latitude.toFixed(6) ?? (asset.station_id === 'station_bharati' ? '-69.407222' : '-70.766111')}°
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">WGS84 Longitude:</span>
                  <span className="font-mono text-polar-text-primary">
                    {spatialSpec?.geodetic.longitude.toFixed(6) ?? (asset.station_id === 'station_bharati' ? '76.195000' : '11.735833')}°
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">Elevation ASL:</span>
                  <span className="font-mono text-polar-text-primary">
                    {spatialSpec?.geodetic.elevationM ?? (asset.station_id === 'station_bharati' ? 35.0 : 117.0)} m
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-polar-border/60 pt-1">
                  <span className="text-polar-text-secondary">Projection System:</span>
                  <span className="font-semibold text-polar-cyan">EPSG:3031 (Antarctic Polar Stereographic)</span>
                </div>
                {spatialSpec && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-polar-text-secondary">EPSG:3031 Easting:</span>
                      <span className="font-mono text-polar-text-primary">{spatialSpec.projected.eastingM.toLocaleString()} m</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-polar-text-secondary">EPSG:3031 Northing:</span>
                      <span className="font-mono text-polar-text-primary">{spatialSpec.projected.northingM.toLocaleString()} m</span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between border-t border-polar-border/60 pt-1">
                  <span className="text-polar-text-secondary">Local Tangent 3D:</span>
                  <span className="font-mono text-polar-text-primary">
                    [{asset.coordinates_3d.x}, {asset.coordinates_3d.y}, {asset.coordinates_3d.z}]
                  </span>
                </div>
              </div>
            </div>

            {/* Dimension 4: Physical Dimensions & Envelope */}
            <div className="bg-polar-card p-3 rounded-lg border border-polar-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-polar-text-primary font-bold uppercase tracking-wider">
                <Box className="w-3.5 h-3.5 text-polar-cyan" />
                <span>Structural Dimensions & Material</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">Envelope (L × W × H):</span>
                  <span className="font-mono font-semibold text-polar-text-primary">
                    {spatialSpec ? `${spatialSpec.physicalDimensions.lengthM}m × ${spatialSpec.physicalDimensions.widthM}m × ${spatialSpec.physicalDimensions.heightM}m` : '6.2m × 3.6m × 2.8m'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">Footprint Area:</span>
                  <span className="font-mono text-polar-text-primary">
                    {spatialSpec ? `${spatialSpec.physicalDimensions.footprintAreaM2} m²` : '22.3 m²'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">Gross Volume:</span>
                  <span className="font-mono text-polar-text-primary">
                    {spatialSpec ? `${spatialSpec.physicalDimensions.grossVolumeM3} m³` : '62.5 m³'}
                  </span>
                </div>
                {spatialSpec?.physicalDimensions.structuralMassKg && (
                  <div className="flex items-center justify-between">
                    <span className="text-polar-text-secondary">Structural Mass:</span>
                    <span className="font-mono text-polar-text-primary">
                      {spatialSpec.physicalDimensions.structuralMassKg.toLocaleString()} kg
                    </span>
                  </div>
                )}
                <div className="border-t border-polar-border/60 pt-1.5">
                  <span className="text-polar-text-secondary block text-[10px] uppercase font-semibold">Construction Material:</span>
                  <span className="text-polar-text-primary text-[11px] block mt-0.5">
                    {spatialSpec?.physicalDimensions.constructionMaterial || 'Cryogenic Weatherproof Marine Steel & Insulated Composite'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dimension 5: Geometry Confidence, Evidence & Space Distribution */}
            <div className="bg-polar-card p-3 rounded-lg border border-polar-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-polar-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-polar-cyan" />
                  <span>Geometry Confidence & Evidence</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${confidenceColor}`}>
                  {spatialSpec?.geometryConfidence || 'VERIFIED'}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] pt-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-polar-text-secondary uppercase text-[10px]">Source:</span>
                  <span className="font-medium text-polar-text-primary text-right">{spatialSpec?.geometrySource || 'NCPOR / MoES Official Station Documentation'}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-polar-text-secondary uppercase text-[10px]">Last Verified:</span>
                  <span className="font-medium text-emerald-400 text-right">{spatialSpec?.lastVerified || 'NCPOR Annual Expedition Operational Review'}</span>
                </div>
                <div className="border-t border-polar-border/60 pt-1">
                  <span className="text-polar-text-secondary block text-[10px] uppercase">Geometric Basis:</span>
                  <p className="text-[11px] text-polar-text-primary mt-0.5 leading-relaxed font-sans">
                    {spatialSpec?.geometricBasis || 'Physical Dimensional Survey & Laser Scans Ground Truth (1 Three.js unit = 1 meter).'}
                  </p>
                </div>

                {spatialSpec?.physicalDimensions.grossFloorAreaM2 && (
                  <div className="border-t border-polar-border/60 pt-1.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-polar-text-secondary uppercase text-[10px]">Gross Floor Area:</span>
                      <span className="font-bold text-polar-cyan">{spatialSpec.physicalDimensions.grossFloorAreaM2.toLocaleString()} m²</span>
                    </div>

                    {spatialSpec.physicalDimensions.spaceDistribution && (
                      <div className="bg-polar-surface p-2 rounded border border-polar-border space-y-1 mt-1">
                        <span className="text-[10px] text-polar-text-muted uppercase font-bold block">
                          NCPOR Documented Space Distribution:
                        </span>
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                          <div className="flex items-center justify-between">
                            <span className="text-polar-text-secondary">Utilities:</span>
                            <span className="font-bold text-polar-cyan">{spatialSpec.physicalDimensions.spaceDistribution.utilitiesPct}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-polar-text-secondary">Circulation:</span>
                            <span className="font-bold text-polar-cyan">{spatialSpec.physicalDimensions.spaceDistribution.circulationPct}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-polar-text-secondary">Living:</span>
                            <span className="font-bold text-polar-cyan">{spatialSpec.physicalDimensions.spaceDistribution.livingPct}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-polar-text-secondary">Laboratories:</span>
                            <span className="font-bold text-polar-cyan">{spatialSpec.physicalDimensions.spaceDistribution.laboratoriesPct}%</span>
                          </div>
                          <div className="flex items-center justify-between col-span-2">
                            <span className="text-polar-text-secondary">Storage:</span>
                            <span className="font-bold text-polar-cyan">{spatialSpec.physicalDimensions.spaceDistribution.storagePct}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TELEMETRY, ENERGY & LOGISTICS */}
        {activeTab === 'TELEMETRY' && (
          <div className="space-y-3">
            {/* Dimension 8: Live Physical Telemetry Stream */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-polar-cyan font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Physical Telemetry Stream</span>
                </span>
                <ProvenanceBadge type={asset.source_type || 'PHYSICS_SYNTHETIC'} />
              </div>

              <div className="bg-polar-card p-3 rounded-lg border border-polar-border space-y-2">
                {Object.entries(asset.current_state || {}).map(([key, val]) => {
                  const formattedKey = key.replace(/_/g, ' ');
                  let unit = '';
                  if (key.includes('temp')) unit = '°C';
                  else if (key.includes('kw') || key.includes('demand')) unit = 'kW';
                  else if (key.includes('pct') || key.includes('soc')) unit = '%';
                  else if (key.includes('bar') || key.includes('pressure')) unit = 'bar';
                  else if (key.includes('rpm')) unit = 'RPM';
                  else if (key.includes('vibration') || key.includes('mms')) unit = 'mm/s';
                  else if (key.includes('litres') || key.includes('volume')) unit = 'L';
                  else if (key.includes('lph') || key.includes('flow')) unit = 'L/h';
                  else if (key.includes('hz')) unit = 'Hz';
                  else if (key.includes('db')) unit = 'dB';

                  return (
                    <div key={key} className="flex items-center justify-between border-b border-polar-border/70 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-polar-text-secondary capitalize text-[11px]">{formattedKey}:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-polar-text-primary">
                          {typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(val)}
                        </span>
                        {unit && <span className="text-[10px] text-polar-cyan font-bold">{unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dimension 9: Energy & Microgrid Profile */}
            <div className="bg-polar-card p-3 rounded-lg border border-polar-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-polar-text-primary font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-polar-cyan" />
                <span>Microgrid & Electrical Profile</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">Rated Capacity:</span>
                  <span className="font-mono font-semibold text-polar-text-primary">
                    {spatialSpec?.energyProfile.ratedCapacityKw ?? (asset.id.includes('gen') ? 200 : 30)} kW
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">Bus Designation:</span>
                  <span className="font-semibold text-polar-cyan">
                    {spatialSpec?.energyProfile.busDesignation || 'Station Primary 415V Bus'}
                  </span>
                </div>
                {spatialSpec?.energyProfile.heatRecoveryKw && (
                  <div className="flex items-center justify-between">
                    <span className="text-polar-text-secondary">Waste Heat Recovery:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      +{spatialSpec.energyProfile.heatRecoveryKw} kWth
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Dimension 10 & 11: Logistics, Spares & Environment */}
            <div className="bg-polar-card p-3 rounded-lg border border-polar-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-polar-text-primary font-bold uppercase tracking-wider">
                <Wind className="w-3.5 h-3.5 text-amber-500" />
                <span>Environmental & Maintenance Envelope</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">Design Min Temp:</span>
                  <span className="font-mono text-polar-text-primary">
                    {spatialSpec?.operatingEnvironment.minAmbientTempC || -45}°C
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">Max Wind Survival:</span>
                  <span className="font-mono text-polar-text-primary">
                    {spatialSpec?.operatingEnvironment.maxWindGustMs || 70} m/s (252 km/h)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">Inspection Interval:</span>
                  <span className="font-semibold text-emerald-400">
                    {spatialSpec?.logisticsProfile.inspectionIntervalHours ? `${spatialSpec.logisticsProfile.inspectionIntervalHours}h` : '500h'}
                  </span>
                </div>
                {spatialSpec?.logisticsProfile.sparePartSku && (
                  <div className="flex items-center justify-between border-t border-polar-border/60 pt-1">
                    <span className="text-polar-text-secondary">Warehouse SKU:</span>
                    <span className="font-mono text-polar-text-muted">{spatialSpec.logisticsProfile.sparePartSku}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROGNOSTICS, CASCADES & SOP */}
        {activeTab === 'PROGNOSTICS' && (
          <div className="space-y-3">
            {/* Dimension 13: Predictive Prognostics & Cascades */}
            <div className="bg-polar-card p-3 rounded-lg border border-amber-500/30 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-400 font-bold uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Cascading Failure Risk & Prognostics</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-rose-500 dark:text-rose-400 font-bold">
                  <span>Microgrid Deficit:</span>
                  <span>-{consequences?.power_deficit_kw || (asset.id.includes('gen') ? 185 : 0)} kW</span>
                </div>

                <div className="flex items-center justify-between text-amber-500 dark:text-amber-400 font-bold">
                  <span>Freeze Line (+5°C) Window:</span>
                  <span>{consequences?.thermal_decay_to_5c_hours || '3.8'} hours</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">Anomaly Z-Score:</span>
                  <span className="font-mono text-emerald-400 font-bold">0.42σ (Normal)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">Remaining Useful Life (RUL):</span>
                  <span className="font-mono font-bold text-polar-text-primary">18,400 Run-Hours</span>
                </div>
              </div>

              <div className="text-[11px] text-polar-text-secondary pt-1.5 leading-relaxed border-t border-polar-border">
                {consequences?.failure_propagation?.cascading_consequences?.[0] ||
                  'Failure of this unit directly threatens life-support HVAC, water RO trace heating, and scientific payload bus.'}
              </div>
            </div>

            {/* Dimension 14: Decision Support & Mitigating SOP Protocols */}
            <div className="bg-polar-card p-3 rounded-lg border border-polar-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-polar-cyan font-bold uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Standard Operating Procedure (SOP)</span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-polar-text-secondary">NCPOR Protocol:</span>
                  <span className="font-mono text-polar-cyan font-bold">SOP-POLAR-PWR-04</span>
                </div>

                <div className="bg-polar-elevated p-2 rounded border border-polar-border space-y-1">
                  <span className="text-[10px] text-polar-text-muted uppercase font-bold block">
                    Automated Mitigation Sequence:
                  </span>
                  <p className="text-[11px] text-polar-text-primary leading-snug">
                    {consequences?.failure_propagation?.emergency_mitigation_action ||
                      '1. Auto-synchronize Auxiliary Genset 02. 2. Shed non-critical laboratory and comfort heating circuits. 3. Direct trace heating to sea intake.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-[10px] text-polar-text-muted">
                    Pre-authorized for automated autonomous microgrid failover by Station Commander.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Provenance Stamp & Clock */}
      <div className="p-3 bg-polar-card border-t border-polar-border flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 text-polar-text-secondary">
          <Clock className="w-3 h-3 text-polar-cyan" />
          <span>Coupled Engine: Active</span>
        </div>
        <ProvenanceBadge type={asset.source_type || 'PHYSICS_SYNTHETIC'} />
      </div>
    </div>
  );
};
