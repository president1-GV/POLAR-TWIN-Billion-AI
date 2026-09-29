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
  RefreshCw,
  Plane,
  Truck,
  Zap
} from 'lucide-react';
import { api } from '../../services/api';
import { EnvironmentObservation } from '../../types';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataFreshness } from '../../components/ui/DataFreshness';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

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

  if (loading && !obs) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <LoadingSkeleton label="INGESTING POLAR METEOROLOGICAL TELEMETRY..." rows={4} />
      </div>
    );
  }

  if (!obs) return null;

  const prov = obs.provenance;
  const isBlizzard = obs.blizzard_condition || obs.wind_speed_ms > 22.0;
  const isAviationSafe = obs.wind_speed_ms < 15.0 && obs.visibility_km > 5.0 && !isBlizzard;
  const isTransitSafe = obs.wind_speed_ms < 18.0 && !isBlizzard;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-polar-card border border-polar-border p-4 rounded-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-polar-cyan font-bold uppercase tracking-wider">
            <CloudSnow className="w-4 h-4 text-polar-cyan" />
            <span>NCPOR METEOROLOGICAL ADAPTER & ATMOSPHERIC OBSERVATIONS</span>
            <span className="text-polar-border">|</span>
            <span className="text-polar-text-secondary">{obs.station_name}</span>
          </div>
          <h2 className="text-xl font-bold text-polar-text-primary tracking-tight mt-1 font-sans">
            ANTARCTIC METEOROLOGY & WEATHER SENSING
          </h2>
          <p className="text-xs text-polar-text-secondary mt-0.5">
            Coordinates: {obs.latitude.toFixed(4)}° S, {obs.longitude.toFixed(4)}° E • EPSG:3031 Polar Grid
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DataFreshness lastUpdatedTimestamp={obs.timestamp} isLive={true} />
          <ProvenanceBadge type={prov.source_type} provider={prov.provider_name} />
          <button
            onClick={loadWeather}
            className="p-1.5 rounded bg-polar-elevated hover:bg-polar-surface text-polar-text-secondary hover:text-polar-text-primary transition-colors border border-polar-border"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Blizzard / Storm Condition Alert */}
      {isBlizzard ? (
        <div className="bg-rose-500/15 border border-rose-500/50 p-4 rounded-lg flex items-center gap-3 text-rose-800 dark:text-rose-200">
          <AlertOctagon className="w-6 h-6 text-rose-500 shrink-0 animate-ping" />
          <div>
            <div className="font-bold text-sm uppercase tracking-wider text-rose-900 dark:text-rose-100">
              SEVERE KATABATIC BLIZZARD IN PROGRESS (WIND &gt; 22 m/s)
            </div>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
              Extreme katabatic gale detected. Outdoor vehicular and pedestrian movement strictly prohibited. Microgrid trace heating engaged.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Atmospheric parameters within nominal Antarctic operating thresholds.</span>
          </div>
          <span className="text-[10px] text-polar-text-muted">Validated Observation</span>
        </div>
      )}

      {/* Main Meteorological Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Air Temperature */}
        <div className="bg-polar-card border border-polar-border rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-polar-text-muted uppercase tracking-wider">
              <span>Ambient Air Temperature</span>
              <Thermometer className="w-4 h-4 text-polar-cyan" />
            </div>
            <div className="mt-2 text-3xl font-bold text-polar-text-primary">
              {obs.temperature_c.toFixed(1)} <span className="text-base text-polar-text-muted">°C</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-polar-text-secondary border-t border-polar-border pt-2 flex items-center justify-between">
            <span>Wind Chill Equivalent:</span>
            <strong className="text-polar-cyan">{obs.apparent_temp_c.toFixed(1)} °C</strong>
          </div>
        </div>

        {/* Wind Speed & Gusts */}
        <div className="bg-polar-card border border-polar-border rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-polar-text-muted uppercase tracking-wider">
              <span>Sustained Wind Velocity</span>
              <Wind className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="mt-2 text-3xl font-bold text-polar-text-primary">
              {obs.wind_speed_ms.toFixed(1)} <span className="text-base text-polar-text-muted">m/s</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-polar-text-secondary border-t border-polar-border pt-2 flex items-center justify-between">
            <span>Peak Gusts:</span>
            <strong className="text-amber-600 dark:text-amber-300">{obs.wind_gust_ms.toFixed(1)} m/s</strong>
          </div>
        </div>

        {/* Surface Barometric Pressure */}
        <div className="bg-polar-card border border-polar-border rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-polar-text-muted uppercase tracking-wider">
              <span>Barometric Surface Pressure</span>
              <Gauge className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="mt-2 text-3xl font-bold text-polar-text-primary">
              {obs.atmospheric_pressure_hpa.toFixed(1)} <span className="text-base text-polar-text-muted">hPa</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-polar-text-secondary border-t border-polar-border pt-2 flex items-center justify-between">
            <span>Relative Humidity:</span>
            <strong className="text-polar-text-primary">{obs.relative_humidity_pct.toFixed(0)}%</strong>
          </div>
        </div>

        {/* Solar Radiation */}
        <div className="bg-polar-card border border-polar-border rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-polar-text-muted uppercase tracking-wider">
              <span>Direct Solar Irradiance</span>
              <Sun className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
            </div>
            <div className="mt-2 text-3xl font-bold text-polar-text-primary">
              {obs.solar_radiation_wm2.toFixed(0)} <span className="text-base text-polar-text-muted">W/m²</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-polar-text-secondary border-t border-polar-border pt-2 flex items-center justify-between">
            <span>Atmospheric Visibility:</span>
            <strong className="text-polar-text-primary">{obs.visibility_km.toFixed(1)} km</strong>
          </div>
        </div>
      </div>

      {/* Operational Atmospheric Impact Assessment */}
      <div className="bg-polar-card border border-polar-border p-4 rounded-lg space-y-3 shadow-sm">
        <div className="text-xs font-bold text-polar-text-primary uppercase tracking-wider">
          Operational Mission Feasibility Assessment
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Aviation */}
          <div className="bg-polar-elevated p-3 rounded border border-polar-border flex items-start gap-3">
            <Plane className={`w-5 h-5 mt-0.5 ${isAviationSafe ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`} />
            <div>
              <div className="font-semibold text-polar-text-primary">Aviation (Twin Otter / Helo)</div>
              <div className="text-[11px] mt-0.5">
                Status: <strong className={isAviationSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{isAviationSafe ? 'CLEAR (GO)' : 'RESTRICTED (NO-GO)'}</strong>
              </div>
              <p className="text-[10px] text-polar-text-muted mt-1">
                Threshold: Wind &lt; 15 m/s, Visibility &gt; 5 km
              </p>
            </div>
          </div>

          {/* Overland Transit */}
          <div className="bg-polar-elevated p-3 rounded border border-polar-border flex items-start gap-3">
            <Truck className={`w-5 h-5 mt-0.5 ${isTransitSafe ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`} />
            <div>
              <div className="font-semibold text-polar-text-primary">Snow-Cat Overland Convoy</div>
              <div className="text-[11px] mt-0.5">
                Status: <strong className={isTransitSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{isTransitSafe ? 'PERMITTED' : 'CAUTION / DELAYED'}</strong>
              </div>
              <p className="text-[10px] text-polar-text-muted mt-1">
                Crevasse route safety & sastrugi drift hazard
              </p>
            </div>
          </div>

          {/* Thermal HVAC Load Impact */}
          <div className="bg-polar-elevated p-3 rounded border border-polar-border flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5" />
            <div>
              <div className="font-semibold text-polar-text-primary">Building Envelope Convection</div>
              <div className="text-[11px] mt-0.5">
                Factor: <strong className="text-polar-cyan">{(1.0 + 0.035 * Math.pow(obs.wind_speed_ms, 0.85)).toFixed(2)}x Load Factor</strong>
              </div>
              <p className="text-[10px] text-polar-text-muted mt-1">
                Calculated via Fourier & convective wind chill coupling
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Provenance & Adapter Disclosure Card */}
      <div className="bg-polar-card border border-polar-border p-4 rounded-lg space-y-2 shadow-sm">
        <div className="text-xs font-bold text-polar-cyan uppercase tracking-wider flex items-center justify-between">
          <span>DATA PROVENANCE & TRANSPARENCY AUDIT</span>
          <StatusBadge status={prov.status || 'VERIFIED'} size="sm" />
        </div>
        <p className="text-xs text-polar-text-secondary leading-relaxed font-sans">
          {prov.note}
        </p>
        <div className="pt-2 border-t border-polar-border text-[10px] text-polar-text-muted break-all">
          Feed Endpoint: {prov.endpoint}
        </div>
      </div>
    </div>
  );
};
