import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Flame, 
  Wind, 
  Thermometer, 
  AlertTriangle, 
  ShieldCheck, 
  Compass, 
  Radio, 
  Layers, 
  Box, 
  Map as MapIcon, 
  ArrowRight,
  TrendingDown,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { AntarcticGISMap } from './AntarcticGISMap';
import { Station3DViewer } from '../digital-twin/Station3DViewer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataFreshness } from '../../components/ui/DataFreshness';
import { StationDrawer } from '../../components/ui/StationDrawer';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

interface Props {
  onNavigate: (screen: any) => void;
  onSelectStation: (stationId: string) => void;
}

export const ExecutiveCommandCenter: React.FC<Props> = ({ onNavigate, onSelectStation }) => {
  const [stations, setStations] = useState<any[]>([]);
  const [activeStationId, setActiveStationId] = useState<string>('station_bharati');
  const [loading, setLoading] = useState(true);
  const [centerViewMode, setCenterViewMode] = useState<'MAP' | '3D_TWIN'>('MAP');
  const [drawerStation, setDrawerStation] = useState<any | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getStations();
      setStations(data);
      setLastSyncTime(new Date());
    } catch (e) {
      console.error('Failed to load stations:', e);
    } finally {
      setLoading(false);
    }
  };

  const selectedStationObj = stations.find((s) => s.id === activeStationId) || stations[0];

  if (loading && stations.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton label="INITIALIZING ANTARCTIC MISSION CONTROL..." rows={5} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* 1. COMMAND CENTER HERO */}
      <section className="bg-[#0B1220] border border-[#1E293B] rounded-lg p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>POLAR-TWIN • ANTARCTIC OPERATIONS</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">MoES / NCPOR</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight font-mono">
              EXECUTIVE SITUATIONAL COMMAND CENTER
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Real-time station intelligence, infrastructure state, environmental telemetry and predictive operational insight for Bharati & Maitri research bases.
            </p>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('demo')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#111827] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] text-xs font-mono font-medium transition-colors"
            >
              <span>Run System Demonstration</span>
            </button>
            <button
              onClick={() => onNavigate('simulation')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-500/40 text-xs font-mono font-medium transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-sky-400" />
              <span>What-If Simulator</span>
            </button>
          </div>
        </div>

        {/* Operational Status Sub-Strip */}
        <div className="mt-4 pt-3 border-t border-[#1E293B] grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">DATA STATUS:</span>
            <DataFreshness lastUpdatedTimestamp={lastSyncTime} isLive={true} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">ACTIVE BASES:</span>
            <span className="text-emerald-400 font-semibold">2 / 2 OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">SYSTEM HEALTH:</span>
            <span className="text-slate-200 font-semibold">98.4% NOMINAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">DATA BACKEND:</span>
            <span className="text-emerald-400 font-semibold">Supabase Cloud</span>
          </div>
        </div>
      </section>

      {/* 2. CORE OPERATIONAL KPI STRIP */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Stations */}
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-lg p-4 font-mono shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase tracking-wider">
              <span>Station Availability</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">2 / 2</span>
              <span className="text-xs text-slate-400">STATIONS</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <StatusBadge status="OPERATIONAL" size="sm" />
              <span className="text-slate-400">100% Online</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#1E293B] text-[10px] text-slate-500">
            Bharati (Larsemann) & Maitri (Schirmacher)
          </div>
        </div>

        {/* KPI 2: Microgrid Load */}
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-lg p-4 font-mono shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase tracking-wider">
              <span>Total Microgrid Load</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">395.0</span>
              <span className="text-xs text-slate-400">kW</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">↓ 4.2%</span>
              <span>vs peak forecast</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Combined Generation</span>
            <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
          </div>
        </div>

        {/* KPI 3: Fuel Reserve */}
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-lg p-4 font-mono shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase tracking-wider">
              <span>Polar Fuel Runway</span>
              <Flame className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">186.3</span>
              <span className="text-xs text-slate-400">DAYS</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">
              Above Minimum Buffer (35,000 L)
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Burn Rate: 82.5 L/hr combined</span>
            <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
          </div>
        </div>

        {/* KPI 4: Satellite Connectivity */}
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-lg p-4 font-mono shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase tracking-wider">
              <span>Telemetry Sat-Link</span>
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">ONLINE</span>
              <span className="text-[10px] text-slate-400">INSAT / IRNSS</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Edge Store-and-Forward Synced
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Latency: 640 ms</span>
            <ProvenanceBadge type="EDGE_SIMULATED" />
          </div>
        </div>
      </section>

      {/* 3. CENTRAL OPERATIONAL VISUALIZATION: GEOSPATIAL / DIGITAL TWIN */}
      <section className="bg-[#0B1220] border border-[#1E293B] rounded-lg overflow-hidden shadow-sm">
        {/* Visualization Toolbar */}
        <div className="px-4 py-3 bg-[#111827] border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-bold text-white uppercase tracking-wider">
              CENTRAL OPERATIONAL TWIN VIEW
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[11px]">
              Active Target: <strong className="text-white">{selectedStationObj?.name}</strong>
            </span>
          </div>

          {/* View Mode Toggle: Geospatial Map vs 3D Twin */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#030712] p-0.5 rounded border border-[#1E293B] text-xs">
              <button
                onClick={() => setCenterViewMode('MAP')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                  centerViewMode === 'MAP'
                    ? 'bg-[#1E293B] text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Geospatial Map</span>
              </button>
              <button
                onClick={() => setCenterViewMode('3D_TWIN')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                  centerViewMode === '3D_TWIN'
                    ? 'bg-[#1E293B] text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Physical Twin</span>
              </button>
            </div>

            <button
              onClick={() => onNavigate('digital-twin')}
              className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors px-2 py-1"
            >
              <span>Full Screen</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="min-h-[440px]">
          {centerViewMode === 'MAP' ? (
            <AntarcticGISMap
              selectedStationId={activeStationId}
              onSelectStation={(id) => {
                setActiveStationId(id);
                onSelectStation(id);
                const st = stations.find((s) => s.id === id);
                if (st) setDrawerStation(st);
              }}
              onNavigateToTwin={(id) => {
                onSelectStation(id);
                onNavigate('digital-twin');
              }}
            />
          ) : (
            <div className="h-[480px]">
              <Station3DViewer stationId={activeStationId} />
            </div>
          )}
        </div>
      </section>

      {/* 4. DUAL STATION OPERATIONAL STATUS CARDS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stations.map((st) => {
          const isBharati = st.id === 'station_bharati';
          const env = st.environment || {};
          const health = st.overall_health_score || 96.5;

          return (
            <div
              key={st.id}
              className="bg-[#0B1220] border border-[#1E293B] hover:border-slate-700 transition-colors rounded-lg flex flex-col justify-between shadow-sm font-mono"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-[#111827] border-b border-[#1E293B] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-white font-bold tracking-wider uppercase">{st.name}</span>
                  <span className="text-slate-400 text-[11px]">({st.station_code})</span>
                </div>
                <div className="flex items-center gap-2">
                  <ProvenanceBadge type="REAL_PUBLIC" provider="NCPOR" />
                  <StatusBadge status={st.operational_status || 'OPERATIONAL'} size="sm" />
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                {/* Location Bar */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-[#1E293B] pb-2.5">
                  <div>
                    <span className="text-slate-500">Region: </span>
                    <span className="text-slate-300">{st.region}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Coords: </span>
                    <span className="text-cyan-400">
                      {st.latitude.toFixed(3)}° S, {st.longitude.toFixed(3)}° E
                    </span>
                  </div>
                </div>

                {/* Weather Telemetry Strip */}
                <div className="grid grid-cols-3 gap-2.5 bg-[#030712] p-3 rounded-lg border border-[#1E293B]">
                  <div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 uppercase">
                      <Thermometer className="w-3 h-3 text-cyan-400" />
                      Air Temp
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {env.temperature_c ?? -18.5} °C
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Chill: {env.apparent_temp_c ?? -29.0} °C
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 uppercase">
                      <Wind className="w-3 h-3 text-sky-400" />
                      Wind Speed
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {env.wind_speed_ms ?? 11.2} m/s
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Gust: {env.wind_gust_ms ?? 16.5} m/s
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 uppercase">
                      <Activity className="w-3 h-3 text-amber-400" />
                      Barometer
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {env.atmospheric_pressure_hpa ?? 986.0} hPa
                    </div>
                    <div className="text-[10px] text-slate-400">
                      RH: {env.relative_humidity_pct ?? 65}%
                    </div>
                  </div>
                </div>

                {/* Subsystem Telemetry */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Microgrid Demand:</span>
                    <span className="font-bold text-white">
                      {st.generation_kw ?? (isBharati ? 185.0 : 210.0)} kW
                    </span>
                  </div>
                  <div className="w-full bg-[#030712] h-1.5 rounded-full overflow-hidden border border-[#1E293B]">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '74%' }} />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">Fuel Consumption Rate:</span>
                    <span className="font-bold text-cyan-400">
                      {st.fuel_burn_lph ?? (isBharati ? 38.5 : 44.0)} L/hr
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Habitat Indoor Climate:</span>
                    <span className="font-bold text-emerald-400">
                      +{st.thermal_indoor_c ?? 21.5} °C (Regulated)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-[#111827] border-t border-[#1E293B] flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Crew: <strong className="text-white">{st.current_occupancy}</strong> / {st.population_capacity}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveStationId(st.id);
                      onSelectStation(st.id);
                      setDrawerStation(st);
                    }}
                    className="px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs transition-colors border border-slate-700"
                  >
                    Quick Inspect
                  </button>
                  <button
                    onClick={() => {
                      onSelectStation(st.id);
                      onNavigate('digital-twin');
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-500/40 text-xs font-semibold transition-colors"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>3D Twin</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 5. STATION INSPECTION SLIDE-OUT DRAWER */}
      <StationDrawer
        isOpen={drawerStation !== null}
        onClose={() => setDrawerStation(null)}
        station={drawerStation}
        onNavigateToTwin={(id) => {
          onSelectStation(id);
          onNavigate('digital-twin');
        }}
        onNavigateToEnergy={(id) => {
          onSelectStation(id);
          onNavigate('energy');
        }}
        onNavigateToSimulation={(id) => {
          onSelectStation(id);
          onNavigate('simulation');
        }}
      />
    </div>
  );
};
