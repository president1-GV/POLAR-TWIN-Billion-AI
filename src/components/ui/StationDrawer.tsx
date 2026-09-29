import React from 'react';
import { 
  X, 
  MapPin, 
  Zap, 
  Flame, 
  Radio, 
  Thermometer, 
  Wind, 
  Activity, 
  Box, 
  AlertTriangle, 
  Users, 
  Compass, 
  ExternalLink 
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { DataFreshness } from './DataFreshness';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

interface StationDetails {
  id: string;
  name: string;
  station_code: string;
  region: string;
  latitude: number;
  longitude: number;
  elevation_meters: number;
  operational_status: string;
  connectivity_status: string;
  current_occupancy: number;
  population_capacity: number;
  overall_health_score?: number;
  generation_kw?: number;
  fuel_burn_lph?: number;
  thermal_indoor_c?: number;
  environment?: {
    temperature_c?: number;
    apparent_temp_c?: number;
    wind_speed_ms?: number;
    wind_gust_ms?: number;
    atmospheric_pressure_hpa?: number;
    relative_humidity_pct?: number;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  station: StationDetails | null;
  onNavigateToTwin: (stationId: string) => void;
  onNavigateToEnergy: (stationId: string) => void;
  onNavigateToSimulation: (stationId: string) => void;
}

export const StationDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  station,
  onNavigateToTwin,
  onNavigateToEnergy,
  onNavigateToSimulation,
}) => {
  if (!isOpen || !station) return null;

  const isBharati = station.id === 'station_bharati';
  const env = station.environment || {};

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-[#0B1220] border-l border-[#1E293B] h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#111827]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                {station.name}
              </h2>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              {station.region} • {station.station_code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 font-mono text-xs">
          {/* Status & Freshness Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <StatusBadge status={station.operational_status || 'OPERATIONAL'} size="md" />
            <DataFreshness isLive={true} />
          </div>

          {/* Geographical Coordinates */}
          <div className="bg-[#111827] p-3 rounded-lg border border-[#1E293B] space-y-2">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              Geodetic Coordinates
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-200">
              <div>
                <span className="text-slate-500">Latitude: </span>
                <span className="text-white font-semibold">{station.latitude.toFixed(4)}° S</span>
              </div>
              <div>
                <span className="text-slate-500">Longitude: </span>
                <span className="text-white font-semibold">{station.longitude.toFixed(4)}° E</span>
              </div>
              <div>
                <span className="text-slate-500">Elevation: </span>
                <span className="text-white">{station.elevation_meters || (isBharati ? 35 : 117)} m a.s.l.</span>
              </div>
              <div>
                <span className="text-slate-500">Datum: </span>
                <span className="text-slate-300">WGS84 / EPSG:3031</span>
              </div>
            </div>
          </div>

          {/* Primary Operations Telemetry */}
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Station Operations Telemetry</span>
              <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Microgrid Load */}
              <div className="bg-[#111827] p-3 rounded-lg border border-[#1E293B]">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Microgrid Demand
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {station.generation_kw ?? (isBharati ? 185.0 : 210.0)} <span className="text-xs text-slate-400">kW</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">
                  Spinning Reserve: 28.0%
                </div>
              </div>

              {/* Fuel Reserve */}
              <div className="bg-[#111827] p-3 rounded-lg border border-[#1E293B]">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                  <Flame className="w-3 h-3 text-cyan-400" />
                  Fuel Burn Rate
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {station.fuel_burn_lph ?? (isBharati ? 38.5 : 44.0)} <span className="text-xs text-slate-400">L/hr</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Reserve: 186.3 Days
                </div>
              </div>

              {/* Satellite Link */}
              <div className="bg-[#111827] p-3 rounded-lg border border-[#1E293B]">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  Satellite Link
                </div>
                <div className="text-base font-bold text-emerald-400 mt-1">
                  ONLINE
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Store-and-Forward Synced
                </div>
              </div>

              {/* Occupancy */}
              <div className="bg-[#111827] p-3 rounded-lg border border-[#1E293B]">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                  <Users className="w-3 h-3 text-sky-400" />
                  Expedition Crew
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {station.current_occupancy} <span className="text-xs text-slate-400">/ {station.population_capacity}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Life Support: NOMINAL
                </div>
              </div>
            </div>
          </div>

          {/* Meteorological Conditions */}
          <div className="bg-[#111827] p-3 rounded-lg border border-[#1E293B] space-y-2">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                Live Atmospheric Data
              </div>
              <ProvenanceBadge type="REAL_PUBLIC" provider="NCPOR" />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 bg-[#0B1220] rounded border border-[#1E293B]">
                <div className="text-[9px] text-slate-500 uppercase">Air Temp</div>
                <div className="text-sm font-bold text-white mt-0.5">{env.temperature_c ?? -18.5}°C</div>
                <div className="text-[9px] text-slate-400">Chill: {env.apparent_temp_c ?? -29}°C</div>
              </div>
              <div className="p-2 bg-[#0B1220] rounded border border-[#1E293B]">
                <div className="text-[9px] text-slate-500 uppercase">Wind Velocity</div>
                <div className="text-sm font-bold text-white mt-0.5">{env.wind_speed_ms ?? 11.2} m/s</div>
                <div className="text-[9px] text-slate-400">Gust: {env.wind_gust_ms ?? 16.5}</div>
              </div>
              <div className="p-2 bg-[#0B1220] rounded border border-[#1E293B]">
                <div className="text-[9px] text-slate-500 uppercase">Pressure</div>
                <div className="text-sm font-bold text-white mt-0.5">{env.atmospheric_pressure_hpa ?? 986} hPa</div>
                <div className="text-[9px] text-slate-400">RH: {env.relative_humidity_pct ?? 65}%</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                onClose();
                onNavigateToTwin(station.id);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-all shadow"
            >
              <Box className="w-4 h-4" />
              <span>Launch 3D Spatial Digital Twin</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigateToEnergy(station.id);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 transition-all border border-[#334155]"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>View Microgrid & Fuel Analytics</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigateToSimulation(station.id);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 transition-all border border-[#334155]"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Run Station What-If Simulator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
