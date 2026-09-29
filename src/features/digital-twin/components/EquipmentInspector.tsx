import React from 'react';
import { StationAsset } from '../../../types';
import { ProvenanceBadge } from '../../../components/common/ProvenanceBadge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
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
  ArrowDownRight
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

  // Maitri
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

export const EquipmentInspector: React.FC<Props> = ({
  asset,
  onClose,
  onFocusCamera,
  onSelectRelatedAsset,
  onTriggerSimulation,
  consequences,
}) => {
  const relations = ASSET_RELATIONS[asset.id] || { upstream: [], downstream: [] };

  return (
    <div className="absolute top-4 right-4 bottom-4 w-[26rem] bg-polar-surface/95 border border-polar-border rounded-xl shadow-2xl flex flex-col z-30 overflow-hidden backdrop-blur-md font-mono select-none">
      {/* Header with Asset Code, Name and Quick Actions */}
      <div className="p-4 bg-polar-card border-b border-polar-border">
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
          </div>
          <button
            onClick={onClose}
            className="text-polar-text-muted hover:text-polar-text-primary p-1 rounded hover:bg-polar-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-sm font-bold text-polar-text-primary mt-1.5 leading-snug">
          {asset.name}
        </h2>
        <p className="text-[11px] text-polar-text-muted font-sans mt-0.5">
          {asset.location_desc || 'Station Infrastructure Asset'}
        </p>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-polar-border">
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
      </div>

      {/* Main Scrollable Inspector Body */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
        {/* Status & Health Gauge Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-polar-card p-2.5 rounded-lg border border-polar-border">
            <span className="text-[10px] text-polar-text-muted uppercase block font-semibold">
              Operational Status
            </span>
            <div className="mt-1">
              <StatusBadge status={asset.status} size="sm" />
            </div>
          </div>

          <div className="bg-polar-card p-2.5 rounded-lg border border-polar-border">
            <span className="text-[10px] text-polar-text-muted uppercase block font-semibold">
              Asset Health Score
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

        {/* Live Physical Telemetry Stream */}
        <div className="space-y-2">
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

        {/* System Dependencies: Upstream & Downstream Navigation */}
        <div className="space-y-2 pt-2 border-t border-polar-border">
          <div className="flex items-center gap-1.5 text-xs text-polar-text-primary font-bold uppercase tracking-wider">
            <GitFork className="w-3.5 h-3.5 text-polar-cyan" />
            <span>Infrastructure Graph Topology</span>
          </div>

          {/* Upstream Supplies */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-polar-text-muted uppercase font-semibold flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-polar-cyan" />
              Upstream Supply Dependencies:
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
              <p className="text-[11px] text-polar-text-muted italic pl-2">None (Primary Source / Infeed)</p>
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

        {/* Downstream Cascading Consequences Card */}
        {consequences && (
          <div className="space-y-2 pt-2 border-t border-polar-border">
            <div className="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-400 font-bold uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Downstream Cascade Consequences</span>
            </div>

            <div className="bg-polar-card p-3 rounded-lg border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-rose-500 dark:text-rose-400 font-bold">
                <span>Microgrid Deficit:</span>
                <span>-{consequences.power_deficit_kw || (asset.id.includes('gen') ? 185 : 0)} kW</span>
              </div>

              <div className="flex items-center justify-between text-amber-500 dark:text-amber-400 font-bold">
                <span>Freeze Line (+5°C) Window:</span>
                <span>{consequences.thermal_decay_to_5c_hours || '3.8'} hours</span>
              </div>

              <div className="text-[11px] text-polar-text-secondary pt-1 leading-relaxed border-t border-polar-border">
                Failure of this unit directly threatens life-support HVAC, water RO trace heating, and scientific payload bus.
              </div>
            </div>
          </div>
        )}

        {/* Technical Specifications & Coordinates */}
        <div className="space-y-1.5 pt-2 border-t border-polar-border text-[11px] text-polar-text-secondary">
          <div className="flex items-center justify-between">
            <span>Spatial Coordinates:</span>
            <span className="text-polar-text-primary font-mono">
              [{asset.coordinates_3d.x}, {asset.coordinates_3d.y}, {asset.coordinates_3d.z}]
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Model Version:</span>
            <span className="text-polar-text-primary">{asset.model_version || 'v2.4-PBR'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Inspection Cycle:</span>
            <span className="text-emerald-500 dark:text-emerald-400 font-semibold">Q1-2027 (Compliant)</span>
          </div>
        </div>
      </div>

      {/* Footer Provenance Stamp */}
      <div className="p-3 bg-polar-card border-t border-polar-border flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 text-polar-text-secondary">
          <Clock className="w-3 h-3 text-polar-cyan" />
          <span>Sync: Real-Time Coupled Engine</span>
        </div>
        <ProvenanceBadge type={asset.source_type || 'PHYSICS_SYNTHETIC'} />
      </div>
    </div>
  );
};
