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
  ArrowUpRight 
} from 'lucide-react';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';

interface Props {
  onNavigate: (screen: any) => void;
  onSelectStation: (stationId: string) => void;
}

export const ExecutiveCommandCenter: React.FC<Props> = ({ onNavigate, onSelectStation }) => {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getStations();
      setStations(data);
    } catch (e) {
      console.error('Failed to load stations:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner: Global Situational Awareness */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-polar-900 border border-polar-750/80 p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-polar-cyan font-semibold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            National Antarctic Station Operations Center • MoES / NCPOR
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            EXECUTIVE SITUATIONAL COMMAND CENTER
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-mono">
            Real-time digital twin telemetry, coupled thermodynamic physics propagation, and predictive health monitoring for Indian Antarctic bases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('demo')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/50 text-xs font-mono font-bold transition-all shadow-lg hover:shadow-red-600/20"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            RUN KILLER DEMO (SIH 26060)
          </button>
          <button
            onClick={() => onNavigate('simulation')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-polar-600 hover:bg-polar-500 text-white text-xs font-mono font-bold transition-all shadow-md"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            WHAT-IF SIMULATOR
          </button>
        </div>
      </div>

      {/* Global Status Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="polar-panel p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>STATIONS ACTIVE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">2 / 2</span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">100% OPERATIONAL</span>
          </div>
          <div className="mt-2 pt-2 border-t border-polar-800 text-[10px] font-mono text-slate-500">
            Bharati (Larsemann) & Maitri (Schirmacher)
          </div>
        </div>

        <div className="polar-panel p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>TOTAL MICROGRID DEMAND</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">395.0</span>
            <span className="text-xs font-mono text-slate-300">kW</span>
          </div>
          <div className="mt-2 pt-2 border-t border-polar-800 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500">Thermal + Base Load</span>
            <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
          </div>
        </div>

        <div className="polar-panel p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>POLAR DIESEL RESERVE</span>
            <Flame className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">186.3</span>
            <span className="text-xs font-mono text-slate-300">DAYS</span>
          </div>
          <div className="mt-2 pt-2 border-t border-polar-800 flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400">Above Min Reserve (35kL)</span>
            <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
          </div>
        </div>

        <div className="polar-panel p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>SAT-LINK RESILIENCE</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-emerald-400">ONLINE</span>
            <span className="text-[10px] font-mono text-slate-400">CRC-VALIDATED</span>
          </div>
          <div className="mt-2 pt-2 border-t border-polar-800 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500">Edge Store-and-Forward</span>
            <ProvenanceBadge type="EDGE_SIMULATED" />
          </div>
        </div>
      </div>

      {/* Dual Station Cards: Maitri & Bharati */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stations.map((st) => {
          const isBharati = st.id === 'station_bharati';
          const env = st.environment || {};
          const health = st.overall_health_score || 96.5;

          return (
            <div
              key={st.id}
              className="polar-panel border-polar-750 hover:border-polar-cyan/50 transition-all flex flex-col justify-between"
            >
              {/* Header */}
              <div className="polar-panel-header">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-white font-bold">{st.name}</span>
                  <span className="text-[10px] text-slate-400">({st.station_code})</span>
                </div>
                <div className="flex items-center gap-2">
                  <ProvenanceBadge type="REAL_PUBLIC" provider="NCPOR" />
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-polar-800 text-polar-cyan border border-polar-700">
                    HEALTH {health}%
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Coordinates & Region */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-polar-800/80 pb-3">
                  <div>
                    <span className="text-slate-500">Region: </span>
                    <span className="text-slate-200">{st.region}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Coords: </span>
                    <span className="text-polar-cyan">{st.latitude.toFixed(3)}°S, {st.longitude.toFixed(3)}°E</span>
                  </div>
                </div>

                {/* Live Atmospheric Conditions */}
                <div className="grid grid-cols-3 gap-3 bg-polar-950/80 p-3 rounded-lg border border-polar-800">
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-polar-cyan" />
                      TEMP (AIR)
                    </div>
                    <div className="text-base font-mono font-bold text-white mt-1">
                      {env.temperature_c ?? -18.5} °C
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Chill: {env.apparent_temp_c ?? -29.0} °C
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Wind className="w-3 h-3 text-polar-cyan" />
                      WIND SPEED
                    </div>
                    <div className="text-base font-mono font-bold text-white mt-1">
                      {env.wind_speed_ms ?? 11.2} m/s
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Gust: {env.wind_gust_ms ?? 16.5} m/s
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-polar-cyan" />
                      BAROMETER
                    </div>
                    <div className="text-base font-mono font-bold text-white mt-1">
                      {env.atmospheric_pressure_hpa ?? 986.0} hPa
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Humidity: {env.relative_humidity_pct ?? 65}%
                    </div>
                  </div>
                </div>

                {/* Subsystem Telemetry */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Microgrid Demand:</span>
                    <span className="font-bold text-white">{st.generation_kw ?? (isBharati ? 185.0 : 210.0)} kW</span>
                  </div>
                  <div className="w-full bg-polar-950 h-2 rounded-full overflow-hidden border border-polar-800">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '74%' }} />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-slate-400">Fuel Consumption Rate:</span>
                    <span className="font-bold text-cyan-400">{st.fuel_burn_lph ?? (isBharati ? 38.5 : 44.0)} L/hr</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Habitat Indoor Temp:</span>
                    <span className="font-bold text-emerald-400">+{st.thermal_indoor_c ?? 21.5} °C (Regulated)</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-polar-950/60 border-t border-polar-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Occupancy: <strong className="text-white">{st.current_occupancy}</strong> / {st.population_capacity} Expeditioners
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectStation(st.id);
                      onNavigate('digital-twin');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-polar-700 hover:bg-polar-600 text-polar-cyan border border-polar-cyan/30 text-xs font-mono font-semibold transition-all"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Open 3D Twin
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
