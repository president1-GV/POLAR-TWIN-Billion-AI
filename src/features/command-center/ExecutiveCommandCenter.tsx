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
  TrendingUp,
  Clock,
  ExternalLink,
  ChevronRight,
  Droplet,
  Fuel,
  Play
} from 'lucide-react';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { AntarcticGISMap } from './AntarcticGISMap';
import { Station3DViewer } from '../digital-twin/Station3DViewer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataFreshness } from '../../components/ui/DataFreshness';
import { StationDrawer } from '../../components/ui/StationDrawer';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { TelemetryMetric } from '../../components/ui/TelemetryMetric';
import { MissionSummary } from '../../components/ui/MissionSummary';
import { CommandButton } from '../../components/ui/CommandButton';

interface Props {
  onNavigate: (screen: any) => void;
  onSelectStation: (stationId: string) => void;
}

export const ExecutiveCommandCenter: React.FC<Props> = ({ onNavigate, onSelectStation }) => {
  const [stations, setStations] = useState<any[]>([]);
  const [activeStationId, setActiveStationId] = useState<string>('station_bharati');
  const [loading, setLoading] = useState(true);
  const [centerViewMode, setCenterViewMode] = useState<'3D_TWIN' | 'MAP'>('3D_TWIN');
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

  // Historical sparkline telemetry buffer
  const powerSparkline = [378, 382, 385, 380, 391, 395, 394, 395];
  const fuelSparkline = [189.5, 189.1, 188.4, 187.9, 187.2, 186.8, 186.5, 186.3];
  const waterSparkline = [3100, 3150, 3180, 3190, 3200, 3210, 3195, 3200];
  const satSparkline = [99.2, 99.5, 99.7, 99.8, 99.8, 99.8, 99.8, 99.8];
  const healthSparkline = [97.0, 97.2, 97.2, 97.4, 97.4, 97.4, 97.4, 97.4];

  if (loading && stations.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton label="INITIALIZING ANTARCTIC MISSION CONTROL..." rows={5} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1680px] mx-auto font-sans select-none">
      {/* 1. COMMAND CENTER HERO BAR */}
      <section className="bg-[#07111D] border border-[#1E293B] rounded-md p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#38BDF8] font-bold uppercase tracking-widest mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>POLAR-TWIN • ANTARCTIC MISSION OPERATIONS</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">MoES / NCPOR</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-mono">
              EXECUTIVE SITUATIONAL COMMAND CENTER
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed font-mono">
              Autonomous digital-twin intelligence, coupled thermodynamics, and operational resilience console for Bharati & Maitri Antarctic research bases.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <CommandButton
              variant="secondary"
              icon={Play}
              onClick={() => onNavigate('demo')}
            >
              System Demonstration
            </CommandButton>
            <CommandButton
              variant="primary"
              icon={AlertTriangle}
              onClick={() => onNavigate('simulation')}
            >
              What-If Contingency Simulator
            </CommandButton>
          </div>
        </div>

        {/* Global Operational Status Sub-Strip */}
        <div className="mt-4 pt-3 border-t border-[#1E293B] grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase text-[10px]">Data Freshness:</span>
            <DataFreshness lastUpdatedTimestamp={lastSyncTime} isLive={true} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase text-[10px]">Active Stations:</span>
            <span className="text-emerald-400 font-semibold">2 / 2 OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase text-[10px]">Telemetry Link:</span>
            <span className="text-slate-200 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              GSAT-11 / INMARSAT NOMINAL
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase text-[10px]">Database Host:</span>
            <span className="text-emerald-400 font-semibold">Supabase Cloud</span>
          </div>
        </div>
      </section>

      {/* 2. MISSION SUMMARY (Phase 6 Compositional Layout) */}
      <MissionSummary
        activeStationsCount={2}
        totalStationsCount={2}
        microgridStatus="NOMINAL • 395 kW"
        waterStatus="OPTIMAL • 3,200 L/d"
        fuelStatus="HEALTHY • 186.3 DAYS"
        connectivityStatus="ONLINE • GSAT-11 (640ms)"
        weatherStatus="-24.2°C • 18.4 m/s KATABATIC"
      />

      {/* 3. CRITICAL TELEMETRY METRIC STRIP (Phase 6 & 7) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <TelemetryMetric
          label="Power Demand"
          value="395.0"
          unit="kW"
          status="NORMAL"
          trend="+3.2% vs 24h"
          trendDirection="up"
          timestamp="14:32:08 UTC"
          sparklineData={powerSparkline}
          sparklineColor="#F59E0B"
          provenance="PHYSICS_MODEL"
          icon={Zap}
        />

        <TelemetryMetric
          label="Polar Fuel Runway"
          value="186.3"
          unit="DAYS"
          status="NORMAL"
          trend="-0.4% vs 24h"
          trendDirection="down"
          timestamp="14:32:08 UTC"
          sparklineData={fuelSparkline}
          sparklineColor="#38BDF8"
          provenance="PHYSICS_MODEL"
          icon={Fuel}
        />

        <TelemetryMetric
          label="Water Production"
          value="3,200"
          unit="L/day"
          status="NORMAL"
          trend="+1.1% vs 24h"
          trendDirection="up"
          timestamp="14:32:08 UTC"
          sparklineData={waterSparkline}
          sparklineColor="#60A5FA"
          provenance="PHYSICS_MODEL"
          icon={Droplet}
        />

        <TelemetryMetric
          label="Satellite Link"
          value="ONLINE"
          unit="GSAT-11"
          status="ONLINE"
          trend="99.8% Uptime"
          trendDirection="neutral"
          timestamp="14:32:08 UTC"
          sparklineData={satSparkline}
          sparklineColor="#10B981"
          provenance="EDGE_CACHE"
          icon={Radio}
        />

        <TelemetryMetric
          label="Station Health"
          value="97.4"
          unit="%"
          status="NOMINAL"
          trend="+0.0% vs 24h"
          trendDirection="neutral"
          timestamp="14:32:08 UTC"
          sparklineData={healthSparkline}
          sparklineColor="#10B981"
          provenance="LIVE_NCPOR"
          icon={ShieldCheck}
        />
      </section>

      {/* 4. CENTRAL OPERATIONAL VISUALIZATION: DIGITAL TWIN / GEOSPATIAL MAP */}
      <section className="bg-[#07111D] border border-[#1E293B] rounded-md overflow-hidden shadow-sm">
        {/* Visualization Toolbar */}
        <div className="px-4 py-3 bg-[#0A1422] border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              PRIMARY OPERATIONAL DIGITAL TWIN VIEWPORT
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[11px]">
              Target: <strong className="text-white">{selectedStationObj?.name}</strong>
            </span>
          </div>

          {/* View Mode Toggle: 3D Twin (Centerpiece) vs Geospatial Map */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#050A12] p-0.5 rounded border border-[#1E293B] text-xs">
              <button
                onClick={() => setCenterViewMode('3D_TWIN')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                  centerViewMode === '3D_TWIN'
                    ? 'bg-[#1E293B] text-[#38BDF8] font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Physical Twin</span>
              </button>
              <button
                onClick={() => setCenterViewMode('MAP')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                  centerViewMode === 'MAP'
                    ? 'bg-[#1E293B] text-[#38BDF8] font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Geospatial Map</span>
              </button>
            </div>

            <button
              onClick={() => onNavigate('digital-twin')}
              className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#38BDF8] transition-colors px-2 py-1"
            >
              <span>Full Screen 3D</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div className="min-h-[500px]">
          {centerViewMode === '3D_TWIN' ? (
            <div className="h-[520px]">
              <Station3DViewer 
                stationId={activeStationId} 
                onNavigateToSimulation={(_key) => onNavigate('simulation')}
              />
            </div>
          ) : (
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
          )}
        </div>
      </section>

      {/* 5. DUAL STATION OPERATIONAL CARDS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {stations.map((st) => {
          const isBharati = st.id === 'station_bharati';
          const env = st.environment || {};
          const health = st.overall_health_score || 96.5;

          return (
            <div
              key={st.id}
              className="bg-[#07111D] border border-[#1E293B] hover:border-[#26354A] transition-colors rounded-md flex flex-col justify-between shadow-sm font-mono"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-[#0A1422] border-b border-[#1E293B] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-white font-bold tracking-wider uppercase">{st.name}</span>
                  <span className="text-slate-400 text-[11px]">({st.station_code})</span>
                </div>
                <div className="flex items-center gap-2">
                  <ProvenanceBadge type="LIVE_NCPOR" provider="NCPOR" />
                  <StatusBadge status={st.operational_status || 'OPERATIONAL'} size="sm" />
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                {/* Location Bar */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-[#1E293B] pb-2.5">
                  <div>
                    <span className="text-slate-500">Region: </span>
                    <span className="text-slate-200">{st.region}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Coordinates: </span>
                    <span className="text-[#38BDF8]">
                      {st.latitude.toFixed(3)}° S, {st.longitude.toFixed(3)}° E
                    </span>
                  </div>
                </div>

                {/* Weather Telemetry Strip */}
                <div className="grid grid-cols-3 gap-2.5 bg-[#050A12] p-3 rounded border border-[#1E293B]">
                  <div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 uppercase">
                      <Thermometer className="w-3 h-3 text-[#38BDF8]" />
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
                      <Activity className="w-3 h-3 text-emerald-400" />
                      Pressure
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {env.pressure_msl_hpa ?? 988.4} hPa
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Humidity: {env.humidity_pct ?? 65}%
                    </div>
                  </div>
                </div>

                {/* Key Subsystem Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-[#0A1422] rounded border border-[#1E293B]">
                    <span className="text-[10px] text-slate-500 uppercase block">Generation</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {isBharati ? '185.0' : '160.0'} kW
                    </span>
                    <span className="text-[9px] text-slate-400">3x Volvo Gensets</span>
                  </div>

                  <div className="p-2.5 bg-[#0A1422] rounded border border-[#1E293B]">
                    <span className="text-[10px] text-slate-500 uppercase block">Fuel Autonomy</span>
                    <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                      {isBharati ? '192.4' : '178.1'} d
                    </span>
                    <span className="text-[9px] text-slate-400">Polar ATF / Jet-A1</span>
                  </div>

                  <div className="p-2.5 bg-[#0A1422] rounded border border-[#1E293B]">
                    <span className="text-[10px] text-slate-500 uppercase block">Indoor Temp</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      +21.2 °C
                    </span>
                    <span className="text-[9px] text-slate-400">HVAC Loop Target</span>
                  </div>

                  <div className="p-2.5 bg-[#0A1422] rounded border border-[#1E293B]">
                    <span className="text-[10px] text-slate-500 uppercase block">Sat Uptime</span>
                    <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                      99.8%
                    </span>
                    <span className="text-[9px] text-slate-400">C-Band / Inmarsat</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-4 py-3 bg-[#0A1422] border-t border-[#1E293B] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Health Index:</span>
                  <span className="text-xs font-bold text-emerald-400">{health}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDrawerStation(st);
                      setActiveStationId(st.id);
                      onSelectStation(st.id);
                    }}
                    className="px-2.5 py-1 text-[11px] bg-[#1E293B] hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors"
                  >
                    Inspect Station
                  </button>
                  <button
                    onClick={() => {
                      setActiveStationId(st.id);
                      onSelectStation(st.id);
                      onNavigate('digital-twin');
                    }}
                    className="px-2.5 py-1 text-[11px] bg-[#38BDF8] hover:bg-[#0284C7] text-slate-950 font-bold rounded transition-colors flex items-center gap-1"
                  >
                    <span>3D Twin</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Slide-out Station Detail Drawer */}
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
