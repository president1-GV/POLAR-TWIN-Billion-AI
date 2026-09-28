import React, { useState, useEffect } from 'react';
import { 
  CloudSnow, 
  Wind, 
  Thermometer, 
  Gauge, 
  Sun, 
  Eye, 
  Compass, 
  AlertOctagon, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../../services/api';
import { EnvironmentObservation } from '../../types';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';

interface Props {
  stationId: string;
}

export const MeteorologyView: React.FC<Props> = ({ stationId }) => {
  const [obs, setObs] = useState<EnvironmentObservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
    const interval = setInterval(loadWeather, 10000);
    return () => clearInterval(interval);
  }, [stationId]);

  const loadWeather = async () => {
    try {
      const data = await api.getEnvironment(stationId);
      setObs(data);
    } catch (e) {
      console.error('Failed to load meteorology:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!obs) {
    return <div className="p-8 text-center font-mono text-slate-400">Loading Antarctic Meteorological Stream...</div>;
  }

  const prov = obs.provenance;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-polar-cyan font-bold uppercase tracking-wider">
            <CloudSnow className="w-4 h-4 text-polar-cyan" />
            <span>NCPOR METEOROLOGICAL ADAPTER & ATMOSPHERIC OBSERVATIONS</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            ANTARCTIC METEOROLOGY & WEATHER SENSING
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Station: <strong>{obs.station_name}</strong> • Coordinates: {obs.latitude.toFixed(4)}°S, {obs.longitude.toFixed(4)}°E
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ProvenanceBadge type={prov.source_type} provider={prov.provider_name} />
          <button
            onClick={loadWeather}
            className="p-2 rounded bg-polar-800 hover:bg-polar-700 text-slate-300 hover:text-white transition-all"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Blizzard / Storm Condition Alert */}
      {obs.blizzard_condition ? (
        <div className="bg-red-950/80 border border-red-500/80 p-4 rounded-xl flex items-center gap-3 text-red-200">
          <AlertOctagon className="w-6 h-6 text-red-400 shrink-0 animate-ping" />
          <div>
            <div className="font-mono font-bold text-sm text-red-100">
              SEVERE BLIZZARD IN PROGRESS (WIND &gt; 25 m/s)
            </div>
            <p className="text-xs font-mono text-red-300 mt-0.5">
              High-velocity katabatic gale detected. Outdoor movement forbidden. Life-support trace heating active.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-lg flex items-center justify-between text-xs font-mono text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Atmospheric parameters within tolerable Antarctic operating boundaries.</span>
          </div>
          <span className="text-[10px] text-slate-400">Timestamp: {obs.timestamp} UTC</span>
        </div>
      )}

      {/* Main Meteorological Gauges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Air Temperature */}
        <div className="polar-panel p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>AMBIENT TEMPERATURE</span>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-3xl font-mono font-bold text-white">
            {obs.temperature_c.toFixed(1)} °C
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 border-t border-polar-800 pt-2 flex items-center justify-between">
            <span>Wind Chill Factor:</span>
            <strong className="text-polar-cyan">{obs.apparent_temp_c.toFixed(1)} °C</strong>
          </div>
        </div>

        {/* Wind Speed & Gusts */}
        <div className="polar-panel p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>WIND VELOCITY</span>
            <Wind className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-mono font-bold text-white">
            {obs.wind_speed_ms.toFixed(1)} <span className="text-base text-slate-400">m/s</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 border-t border-polar-800 pt-2 flex items-center justify-between">
            <span>Max Gusts:</span>
            <strong className="text-amber-300">{obs.wind_gust_ms.toFixed(1)} m/s</strong>
          </div>
        </div>

        {/* Surface Barometric Pressure */}
        <div className="polar-panel p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>SURFACE PRESSURE</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-mono font-bold text-white">
            {obs.atmospheric_pressure_hpa.toFixed(1)} <span className="text-base text-slate-400">hPa</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 border-t border-polar-800 pt-2 flex items-center justify-between">
            <span>Relative Humidity:</span>
            <strong className="text-white">{obs.relative_humidity_pct.toFixed(0)}%</strong>
          </div>
        </div>

        {/* Solar Radiation */}
        <div className="polar-panel p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>DIRECT SOLAR IRRADIANCE</span>
            <Sun className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="mt-2 text-3xl font-mono font-bold text-white">
            {obs.solar_radiation_wm2.toFixed(0)} <span className="text-base text-slate-400">W/m²</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 border-t border-polar-800 pt-2 flex items-center justify-between">
            <span>Visibility Range:</span>
            <strong className="text-white">{obs.visibility_km.toFixed(1)} km</strong>
          </div>
        </div>
      </div>

      {/* Provenance & Adapter Disclosure Card */}
      <div className="polar-panel p-4 space-y-2">
        <div className="text-xs font-mono font-bold text-polar-cyan uppercase tracking-wider flex items-center justify-between">
          <span>DATA PROVENANCE & TRANSPARENCY AUDIT</span>
          <span className="text-[10px] text-emerald-400 font-semibold">{prov.status}</span>
        </div>
        <p className="text-xs font-mono text-slate-300 leading-relaxed">
          {prov.note}
        </p>
        <div className="pt-2 border-t border-polar-800 text-[10px] font-mono text-slate-500 break-all">
          Feed Endpoint: {prov.endpoint}
        </div>
      </div>
    </div>
  );
};
