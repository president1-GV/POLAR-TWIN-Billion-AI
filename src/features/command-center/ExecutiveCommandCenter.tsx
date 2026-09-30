import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Flame, 
  Wind, 
  Thermometer, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert,
  Users,
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
  Play,
  Cpu,
  Shield,
  CheckCircle2,
  AlertOctagon,
  Terminal,
  Server
} from 'lucide-react';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { AntarcticGISMap } from './AntarcticGISMap';
import { Station3DViewer } from '../digital-twin/Station3DViewer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataFreshness } from '../../components/ui/DataFreshness';
import polarTwinIcon from '../../assets/polar-twin-icon.png';
import { StationDrawer } from '../../components/ui/StationDrawer';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { TelemetryMetric } from '../../components/ui/TelemetryMetric';
import { MissionSummary } from '../../components/ui/MissionSummary';
import { CommandButton } from '../../components/ui/CommandButton';
import { useAuth } from '../../context/AuthContext';
import { toCanonicalRole, getRoleMeta } from '../../services/rbac';

interface Props {
  currentStationId?: string;
  onNavigate: (screen: any) => void;
  onSelectStation: (stationId: string) => void;
}

export const ExecutiveCommandCenter: React.FC<Props> = ({ 
  currentStationId = 'station_bharati',
  onNavigate, 
  onSelectStation 
}) => {
  const { role } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<{ bharati?: any; maitri?: any }>({});
  const [activeStationId, setActiveStationId] = useState<string>(currentStationId);
  const [loading, setLoading] = useState(true);
  const [centerViewMode, setCenterViewMode] = useState<'3D_TWIN' | 'MAP'>('3D_TWIN');
  const [drawerStation, setDrawerStation] = useState<any | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Synchronize internal station state whenever currentStationId changes externally
  useEffect(() => {
    if (currentStationId && currentStationId !== activeStationId) {
      setActiveStationId(currentStationId);
    }
  }, [currentStationId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [stationList, envBh, envMai] = await Promise.all([
        api.getStations().catch(() => []),
        api.getEnvironment('station_bharati').catch(() => null),
        api.getEnvironment('station_maitri').catch(() => null),
      ]);
      setStations(stationList || []);
      setWeatherData({ bharati: envBh, maitri: envMai });
      setLastSyncTime(new Date());
    } catch (e) {
      console.error('Failed to load command center data:', e);
    } finally {
      setLoading(false);
    }
  };

  const isBharati = activeStationId === 'station_bharati';
  const selectedStationObj = stations.find((s) => s.id === activeStationId) || stations[0];

  // Historical sparkline telemetry buffer (reacts dynamically to activeStationId)
  const powerSparkline = isBharati 
    ? [378, 382, 385, 380, 391, 395, 394, 395]
    : [152, 155, 158, 160, 159, 160, 160, 160];
  const fuelSparkline = isBharati 
    ? [189.5, 189.1, 188.4, 187.9, 187.2, 186.8, 186.5, 186.3]
    : [146.2, 145.8, 145.0, 144.5, 143.9, 143.4, 143.0, 142.8];
  const waterSparkline = isBharati 
    ? [3100, 3150, 3180, 3190, 3200, 3210, 3195, 3200]
    : [2100, 2120, 2140, 2150, 2150, 2150, 2150, 2150];
  const satSparkline = [99.2, 99.5, 99.7, 99.8, 99.8, 99.8, 99.8, 99.8];
  const healthSparkline = isBharati 
    ? [97.0, 97.2, 97.2, 97.4, 97.4, 97.4, 97.4, 97.4]
    : [87.5, 87.8, 88.0, 88.2, 88.2, 88.2, 88.2, 88.2];

  if (loading && stations.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton label="INITIALIZING ANTARCTIC MISSION CONTROL..." rows={5} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-[1720px] mx-auto font-sans select-none overflow-hidden">
      {/* Operational Authority & Direct Mission Control Access Banner */}
      <div className="bg-polar-surface border border-polar-border rounded-lg p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-sm">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: getRoleMeta(role).accentColor }} />
            <span className="text-[11px] text-polar-text-muted font-bold uppercase tracking-wider">CLEARANCE DESK:</span>
            <span className="font-extrabold text-polar-text-primary uppercase tracking-wide">
              {getRoleMeta(role).label}
            </span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold uppercase ${getRoleMeta(role).badgeClass}`}>
            {getRoleMeta(role).clearanceBadge}
          </span>
          <span className="text-[10px] text-polar-text-muted hidden md:inline">
            • Scope: {role === 'ADMIN' || role === 'MISSION_CONTROL' ? 'All Stations (Bharati + Maitri)' : isBharati ? 'Bharati Station' : 'Maitri Station'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => onNavigate('admin')}
            className="px-3 py-1.5 rounded-md bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-500 dark:text-rose-400 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            title="Open NCPOR Root Administration, Zero-Trust Governance & Security Console"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ADMIN MISSION CONTROL</span>
          </button>
          <button
            onClick={() => onNavigate('officers')}
            className="px-3 py-1.5 rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-polar-cyan font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            title="Open Dedicated Antarctic Station Officers Roster & Workspaces"
          >
            <Users className="w-3.5 h-3.5" />
            <span>OFFICERS PORTAL</span>
          </button>
        </div>
      </div>

      {/* 1. COMMAND CENTER HERO BAR */}
      <section className="bg-polar-card border border-polar-border rounded-md p-4 sm:p-5 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <img 
              src={polarTwinIcon} 
              alt="POLAR-TWIN" 
              className="w-16 h-16 rounded-full object-contain border-2 border-polar-cyan/60 shadow-xl ring-4 ring-polar-cyan/20 shrink-0 hidden sm:block bg-polar-bg/40 p-0.5" 
            />
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-polar-cyan font-bold uppercase tracking-widest mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>POLAR-TWIN • ANTARCTIC MISSION OPERATIONS</span>
                <span className="text-polar-border">|</span>
                <span className="text-polar-text-secondary">MoES / NCPOR</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-polar-text-primary tracking-tight font-mono">
                EXECUTIVE SITUATIONAL COMMAND CENTER
              </h1>
              <p className="text-xs text-polar-text-secondary mt-1 max-w-3xl leading-relaxed font-mono">
                Autonomous digital-twin intelligence, coupled thermodynamics, and operational resilience console for Bharati & Maitri Antarctic research bases.
              </p>
            </div>
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
        <div className="mt-4 pt-3 border-t border-polar-border grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono overflow-hidden">
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Data Freshness:</span>
            <DataFreshness lastUpdatedTimestamp={lastSyncTime} isLive={true} />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Active Stations:</span>
            <span className="text-emerald-500 dark:text-emerald-400 font-semibold truncate">2 / 2 OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Telemetry Link:</span>
            <span className="text-polar-text-secondary font-semibold flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
              <span className="truncate">GSAT-11 / INMARSAT</span>
            </span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Database Host:</span>
            <span className="text-emerald-500 dark:text-emerald-400 font-semibold truncate">Supabase Cloud</span>
          </div>
        </div>
      </section>

      {/* 2. MISSION SUMMARY (Phase 6 Compositional Layout) */}
      <MissionSummary
        activeStationsCount={2}
        totalStationsCount={2}
        microgridStatus={isBharati ? "NOMINAL • 395 kW" : "NOMINAL • 160 kW"}
        waterStatus={isBharati ? "OPTIMAL • 3,200 L/d" : "STABLE • 2,150 L/d"}
        fuelStatus={isBharati ? "HEALTHY • 186.3 DAYS" : "STABLE • 142.8 DAYS"}
        connectivityStatus="ONLINE • GSAT-11 (640ms)"
        weatherStatus={isBharati ? "-24.2°C • 18.4 m/s KATABATIC" : "-28.5°C • 21.0 m/s BLIZZARD"}
      />

      {/* 3. CRITICAL TELEMETRY METRIC STRIP (Phase 6 & 7) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 overflow-hidden">
        <TelemetryMetric
          label="Power Demand"
          value={isBharati ? "395.0" : "160.0"}
          unit="kW"
          status="NORMAL"
          trend={isBharati ? "+3.2% vs 24h" : "+1.8% vs 24h"}
          trendDirection="up"
          timestamp="14:32:08 UTC"
          sparklineData={powerSparkline}
          sparklineColor="#F59E0B"
          provenance="PHYSICS_MODEL"
          icon={Zap}
        />

        <TelemetryMetric
          label="Polar Fuel Runway"
          value={isBharati ? "186.3" : "142.8"}
          unit="DAYS"
          status="NORMAL"
          trend={isBharati ? "-0.4% vs 24h" : "-0.3% vs 24h"}
          trendDirection="down"
          timestamp="14:32:08 UTC"
          sparklineData={fuelSparkline}
          sparklineColor="#38BDF8"
          provenance="PHYSICS_MODEL"
          icon={Fuel}
        />

        <TelemetryMetric
          label="Water Production"
          value={isBharati ? "3,200" : "2,150"}
          unit="L/day"
          status="NORMAL"
          trend={isBharati ? "+1.1% vs 24h" : "+0.8% vs 24h"}
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
          value={isBharati ? "97.4" : "88.2"}
          unit="%"
          status={isBharati ? "NOMINAL" : "ACCEPTABLE"}
          trend={isBharati ? "+0.0% vs 24h" : "-0.5% vs 24h"}
          trendDirection="neutral"
          timestamp="14:32:08 UTC"
          sparklineData={healthSparkline}
          sparklineColor="#10B981"
          provenance="LIVE_NCPOR"
          icon={ShieldCheck}
        />
      </section>

      {/* 4. CENTRAL OPERATIONAL VISUALIZATION: DIGITAL TWIN / GEOSPATIAL MAP */}
      <section className="bg-polar-card border border-polar-border rounded-md overflow-hidden shadow-sm">
        {/* Visualization Toolbar */}
        <div className="px-4 py-3 bg-polar-surface border-b border-polar-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-polar-cyan" />
            <span className="font-bold text-polar-text-primary uppercase tracking-wider text-[11px]">
              PRIMARY OPERATIONAL DIGITAL TWIN VIEWPORT
            </span>
            <span className="text-polar-border">|</span>
            <span className="text-polar-text-secondary text-[11px]">
              Target: <strong className="text-polar-text-primary">{selectedStationObj?.name}</strong>
            </span>
          </div>

          {/* View Mode Toggle: 3D Twin (Centerpiece) vs Geospatial Map */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-polar-elevated p-0.5 rounded border border-polar-border text-xs">
              <button
                onClick={() => setCenterViewMode('3D_TWIN')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                  centerViewMode === '3D_TWIN'
                    ? 'bg-polar-card text-polar-cyan font-semibold shadow-sm border border-polar-border'
                    : 'text-polar-text-muted hover:text-polar-text-primary'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Physical Twin</span>
              </button>
              <button
                onClick={() => setCenterViewMode('MAP')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                  centerViewMode === 'MAP'
                    ? 'bg-polar-card text-polar-cyan font-semibold shadow-sm border border-polar-border'
                    : 'text-polar-text-muted hover:text-polar-text-primary'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Geospatial Map</span>
              </button>
            </div>

            <button
              onClick={() => onNavigate('digital-twin')}
              className="hidden md:flex items-center gap-1 text-[11px] text-polar-text-secondary hover:text-polar-cyan transition-colors px-2 py-1"
            >
              <span>Full Screen 3D</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              onClick={() => onNavigate('automation')}
              className="hidden sm:flex items-center gap-1.5 text-[11px] text-polar-cyan hover:text-polar-base bg-polar-cyan/10 hover:bg-polar-cyan border border-polar-cyan/40 rounded px-2.5 py-1 font-semibold transition-all shadow-sm"
              title="Open Smart Automation & Closed-Loop Decision Engine"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Smart Automation</span>
            </button>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div className="min-h-[500px]">
          {centerViewMode === '3D_TWIN' ? (
            <div className="h-[580px]">
              <Station3DViewer 
                key={activeStationId}
                stationId={activeStationId} 
                onSelectStation={(id) => {
                  setActiveStationId(id);
                  onSelectStation(id);
                }}
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
          const isStationBharati = st.id === 'station_bharati';
          const isSelected = st.id === activeStationId;
          const liveEnv = isStationBharati ? weatherData.bharati : weatherData.maitri;
          const env = liveEnv || st.environment || (isStationBharati 
            ? { temperature_c: -18.4, apparent_temp_c: -28.9, wind_speed_ms: 11.2, wind_gust_ms: 16.5, pressure_msl_hpa: 988.4, humidity_pct: 65 }
            : { temperature_c: -22.1, apparent_temp_c: -33.4, wind_speed_ms: 14.8, wind_gust_ms: 21.0, pressure_msl_hpa: 982.1, humidity_pct: 72 }
          );
          const health = isStationBharati ? 98.4 : 96.2;

          return (
            <div
              key={st.id}
              onClick={() => {
                setActiveStationId(st.id);
                onSelectStation(st.id);
              }}
              className={`bg-polar-card border transition-all duration-200 rounded-md flex flex-col justify-between shadow-sm font-mono cursor-pointer ${
                isSelected 
                  ? 'border-polar-cyan/60 ring-2 ring-polar-cyan/25 shadow-md shadow-cyan-500/10' 
                  : 'border-polar-border hover:border-polar-border-strong opacity-85 hover:opacity-100'
              }`}
            >
              {/* Header */}
              <div className="px-4 py-3 bg-polar-surface border-b border-polar-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  <span className="text-polar-text-primary font-bold tracking-wider uppercase">{st.name}</span>
                  <span className="text-polar-text-muted text-[11px]">({st.station_code})</span>
                </div>
                <div className="flex items-center gap-2">
                  <ProvenanceBadge type="LIVE_NCPOR" provider="NCPOR" />
                  <StatusBadge status={st.operational_status || 'OPERATIONAL'} size="sm" />
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                {/* Location Bar */}
                <div className="flex items-center justify-between text-xs text-polar-text-secondary border-b border-polar-border pb-2.5">
                  <div>
                    <span className="text-polar-text-muted">Region: </span>
                    <span className="text-polar-text-primary">{st.region}</span>
                  </div>
                  <div>
                    <span className="text-polar-text-muted">Coordinates: </span>
                    <span className="text-polar-cyan">
                      {st.latitude.toFixed(3)}° S, {st.longitude.toFixed(3)}° E
                    </span>
                  </div>
                </div>

                {/* Weather Telemetry Strip */}
                <div className="grid grid-cols-3 gap-2.5 bg-polar-elevated p-3 rounded border border-polar-border">
                  <div>
                    <div className="text-[10px] text-polar-text-muted flex items-center gap-1 uppercase">
                      <Thermometer className="w-3 h-3 text-polar-cyan" />
                      Air Temp
                    </div>
                    <div className="text-base font-bold text-polar-text-primary mt-0.5">
                      {env.temperature_c ?? (isStationBharati ? -18.4 : -22.1)} °C
                    </div>
                    <div className="text-[10px] text-polar-text-muted">
                      Chill: {env.apparent_temp_c ?? (isStationBharati ? -28.9 : -33.4)} °C
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-polar-text-muted flex items-center gap-1 uppercase">
                      <Wind className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                      Wind Speed
                    </div>
                    <div className="text-base font-bold text-polar-text-primary mt-0.5">
                      {env.wind_speed_ms ?? (isStationBharati ? 11.2 : 14.8)} m/s
                    </div>
                    <div className="text-[10px] text-polar-text-muted">
                      Gust: {env.wind_gust_ms ?? (isStationBharati ? 16.5 : 21.0)} m/s
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-polar-text-muted flex items-center gap-1 uppercase">
                      <Activity className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                      Pressure
                    </div>
                    <div className="text-base font-bold text-polar-text-primary mt-0.5">
                      {env.pressure_msl_hpa ?? (isStationBharati ? 988.4 : 982.1)} hPa
                    </div>
                    <div className="text-[10px] text-polar-text-muted">
                      Humidity: {env.humidity_pct ?? (isStationBharati ? 65 : 72)}%
                    </div>
                  </div>
                </div>

                {/* Key Subsystem Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-polar-elevated rounded border border-polar-border">
                    <span className="text-[10px] text-polar-text-muted uppercase block">Generation</span>
                    <span className="text-sm font-bold text-polar-text-primary mt-0.5 block">
                      {isStationBharati ? '185.0' : '158.0'} kW
                    </span>
                    <span className="text-[9px] text-polar-text-muted truncate block">
                      {isStationBharati ? '3x Volvo (250 kVA)' : '3x Kirloskar (125 kVA)'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-polar-elevated rounded border border-polar-border">
                    <span className="text-[10px] text-polar-text-muted uppercase block">Fuel Autonomy</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {isStationBharati ? '192.4' : '178.1'} d
                    </span>
                    <span className="text-[9px] text-polar-text-muted truncate block">
                      {isStationBharati ? 'Polar ATF (Jet-A1)' : 'Polar ATF / Diesel'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-polar-elevated rounded border border-polar-border">
                    <span className="text-[10px] text-polar-text-muted uppercase block">Indoor Temp</span>
                    <span className="text-sm font-bold text-polar-text-primary mt-0.5 block">
                      {isStationBharati ? '+21.4' : '+20.8'} °C
                    </span>
                    <span className="text-[9px] text-polar-text-muted truncate block">
                      {isStationBharati ? 'Central HVAC Loop' : 'Hydronic Radiator'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-polar-elevated rounded border border-polar-border">
                    <span className="text-[10px] text-polar-text-muted uppercase block">Sat Uptime</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {isStationBharati ? '99.8%' : '99.4%'}
                    </span>
                    <span className="text-[9px] text-polar-text-muted truncate block">
                      {isStationBharati ? 'C-Band GSAT-14' : 'Ku-Band / Edge'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-4 py-3 bg-polar-surface border-t border-polar-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-polar-text-muted">Health Index:</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{health}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDrawerStation(st);
                      setActiveStationId(st.id);
                      onSelectStation(st.id);
                    }}
                    className="px-2.5 py-1 text-[11px] bg-polar-elevated hover:bg-polar-hover text-polar-text-secondary hover:text-polar-text-primary rounded font-medium border border-polar-border transition-colors"
                  >
                    Inspect Station
                  </button>
                  <button
                    onClick={() => {
                      setActiveStationId(st.id);
                      onSelectStation(st.id);
                      onNavigate('digital-twin');
                    }}
                    className="px-2.5 py-1 text-[11px] bg-polar-cyan hover:opacity-90 text-white font-bold rounded transition-colors flex items-center gap-1 shadow-sm"
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

      {/* 6. INTER-STATION CROSS-DOMAIN TELEMETRY MATRIX & OPERATIONAL EQUILIBRIUM */}
      <section className="bg-polar-surface border border-polar-border rounded-lg p-4 sm:p-5 font-mono shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-polar-border">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-polar-cyan" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-polar-text-primary">
              INTER-STATION CROSS-DOMAIN TELEMETRY MATRIX &amp; SYSTEM EQUILIBRIUM
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              ALL NODES NOMINAL
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-polar-text-muted">
            <span>Synchronized with NCPOR Goa Ground Station</span>
            <span className="w-1.5 h-1.5 rounded-full bg-polar-cyan" />
            <span className="text-polar-cyan font-bold">100% RELIABILITY</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-4 text-xs">
          {/* Microgrid & Energy */}
          <div className="p-3.5 bg-polar-elevated rounded-md border border-polar-border flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-polar-text-muted text-[11px] mb-1">
                <span className="flex items-center gap-1.5 font-bold uppercase text-amber-500 dark:text-amber-400">
                  <Zap className="w-3.5 h-3.5" />
                  MICROGRID BUS
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                  415V 50Hz
                </span>
              </div>
              <div className="text-base font-bold text-polar-text-primary mt-1">
                343.0 kW <span className="text-xs font-normal text-polar-text-muted">Combined Load</span>
              </div>
              <p className="text-[10px] text-polar-text-secondary mt-1">
                Bharati: 185 kW (Volvo Penta) • Maitri: 158 kW (Kirloskar). Power factor: 0.94 pf stable.
              </p>
            </div>
            <button
              onClick={() => onNavigate('energy')}
              className="w-full py-1 px-2 text-[11px] text-polar-cyan hover:text-polar-base bg-polar-cyan/10 hover:bg-polar-cyan border border-polar-cyan/30 rounded font-bold transition-all flex items-center justify-center gap-1"
            >
              <span>Manage Microgrid</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Life Support Water RO Desalination */}
          <div className="p-3.5 bg-polar-elevated rounded-md border border-polar-border flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-polar-text-muted text-[11px] mb-1">
                <span className="flex items-center gap-1.5 font-bold uppercase text-sky-500 dark:text-sky-400">
                  <Droplet className="w-3.5 h-3.5" />
                  LIFE-SUPPORT WATER
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 font-bold">
                  POTABLE
                </span>
              </div>
              <div className="text-base font-bold text-polar-text-primary mt-1">
                5,350 L/d <span className="text-xs font-normal text-polar-text-muted">Total Production</span>
              </div>
              <p className="text-[10px] text-polar-text-secondary mt-1">
                Bharati RO Seawater Pump: 3,200 L/d • Maitri Priyadarshini Lake Loop: 2,150 L/d.
              </p>
            </div>
            <button
              onClick={() => onNavigate('logistics')}
              className="w-full py-1 px-2 text-[11px] text-sky-500 hover:text-polar-base bg-sky-500/10 hover:bg-sky-500 border border-sky-500/30 rounded font-bold transition-all flex items-center justify-center gap-1"
            >
              <span>Supply Chain &amp; Water</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Bulk Polar Fuel Storage */}
          <div className="p-3.5 bg-polar-elevated rounded-md border border-polar-border flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-polar-text-muted text-[11px] mb-1">
                <span className="flex items-center gap-1.5 font-bold uppercase text-emerald-500 dark:text-emerald-400">
                  <Fuel className="w-3.5 h-3.5" />
                  BULK FUEL AUTONOMY
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                  185.3d AVG
                </span>
              </div>
              <div className="text-base font-bold text-polar-text-primary mt-1">
                338,400 L <span className="text-xs font-normal text-polar-text-muted">Polar ATF Jet-A1</span>
              </div>
              <p className="text-[10px] text-polar-text-secondary mt-1">
                Larsemann Hills Tanks: 189k L (192.4 d) • Schirmacher Bunkers: 149.4k L (178.1 d).
              </p>
            </div>
            <button
              onClick={() => onNavigate('simulation')}
              className="w-full py-1 px-2 text-[11px] text-emerald-500 hover:text-polar-base bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 rounded font-bold transition-all flex items-center justify-center gap-1"
            >
              <span>What-If Simulator</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Edge Resilience & Sat Link */}
          <div className="p-3.5 bg-polar-elevated rounded-md border border-polar-border flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-polar-text-muted text-[11px] mb-1">
                <span className="flex items-center gap-1.5 font-bold uppercase text-purple-500 dark:text-purple-400">
                  <Radio className="w-3.5 h-3.5" />
                  EDGE SYNC &amp; REPLAY
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20 font-bold">
                  ONLINE
                </span>
              </div>
              <div className="text-base font-bold text-polar-text-primary mt-1">
                0 Dropped <span className="text-xs font-normal text-polar-text-muted">Edge Buffer</span>
              </div>
              <p className="text-[10px] text-polar-text-secondary mt-1">
                Supabase TLS 1.3 socket active. Replay journal empty. Zero-trust token rotation armed.
              </p>
            </div>
            <button
              onClick={() => onNavigate('edge')}
              className="w-full py-1 px-2 text-[11px] text-purple-500 hover:text-polar-base bg-purple-500/10 hover:bg-purple-500 border border-purple-500/30 rounded font-bold transition-all flex items-center justify-center gap-1"
            >
              <span>Edge Resilience</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
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
