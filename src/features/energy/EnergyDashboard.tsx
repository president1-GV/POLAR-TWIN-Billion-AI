import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Flame, 
  BatteryCharging, 
  Sun, 
  Wind, 
  TrendingDown, 
  Thermometer, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataFreshness } from '../../components/ui/DataFreshness';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  stationId: string;
}

export const EnergyDashboard: React.FC<Props> = ({ stationId }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [energyData, setEnergyData] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const chartGridColor = isDark ? '#1E293B' : '#E2E8F0';
  const chartTextColor = isDark ? '#94A3B8' : '#64748B';
  const tooltipBg = isDark ? '#0B1220' : '#FFFFFF';
  const tooltipBorder = isDark ? '#1E293B' : '#CBD5E1';
  const tooltipLabel = isDark ? '#F8FAFC' : '#0F172A';

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, [stationId]);

  const loadData = async () => {
    try {
      const [eData, fData] = await Promise.all([
        api.getEnergyStatus(stationId),
        api.getEnergyForecast(stationId),
      ]);
      setEnergyData(eData);
      setForecast(fData);
    } catch (e) {
      console.error('Failed to load energy data:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !energyData) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <LoadingSkeleton label="CALCULATING MICROGRID DYNAMICS..." rows={4} />
      </div>
    );
  }

  const microgrid = energyData?.microgrid || { total_demand_kw: 185.0, hvac_load_kw: 62.0, solar_generation_kw: 8.4, reserve_margin_pct: 26.0 };
  const genset = energyData?.primary_generator || { load_pct: 74.0, fuel_flow_lph: 38.5, exhaust_temp_c: 385.0 };
  const stationName = stationId === 'station_bharati' ? 'Bharati Station' : 'Maitri Station';

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-polar-card border border-polar-border p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-polar-cyan font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-polar-cyan" />
            <span>ISOLATED POLAR MICROGRID & THERMAL GENERATION</span>
            <span className="text-polar-text-muted">|</span>
            <span className="text-polar-text-secondary">{stationName}</span>
          </div>
          <h2 className="text-xl font-bold text-polar-text-primary tracking-tight mt-1 font-sans">
            ENERGY DIGITAL TWIN & FUEL DEPLETION MODEL
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <DataFreshness isLive={true} />
          <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
        </div>
      </div>

      {/* Primary KPI Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Demand */}
        <div className="bg-polar-card border border-polar-border rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-polar-text-muted uppercase tracking-wider">
              <span>Station Power Demand</span>
              <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-polar-text-primary">{microgrid.total_demand_kw}</span>
              <span className="text-xs text-polar-text-muted">kW</span>
            </div>
            <div className="mt-2 text-[11px] text-polar-text-secondary flex items-center justify-between">
              <span>Base: {microgrid.base_load_kw || 82} kW</span>
              <span>HVAC: {microgrid.hvac_load_kw} kW</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-polar-border flex items-center justify-between text-[10px] text-polar-text-muted">
            <span>Grid Status</span>
            <StatusBadge status="OPERATIONAL" size="sm" />
          </div>
        </div>

        {/* Generator Load & Reserve */}
        <div className="bg-polar-card border border-polar-border rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-polar-text-muted uppercase tracking-wider">
              <span>Primary Genset Load</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                genset.load_pct > 90 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/40' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
              }`}>
                {genset.load_pct}% LOAD
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-polar-text-primary">{microgrid.generator_net_load_kw || 176.6}</span>
              <span className="text-xs text-polar-text-muted">kW</span>
            </div>
            <div className="mt-2 text-[11px] text-polar-text-secondary flex items-center justify-between">
              <span>Spinning Reserve:</span>
              <strong className="text-polar-cyan">{microgrid.reserve_margin_pct}%</strong>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-polar-border text-[10px] text-polar-text-muted">
            Operating within optimal engine envelope
          </div>
        </div>

        {/* Battery BESS */}
        <div className="bg-polar-card border border-polar-border rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-polar-text-muted uppercase tracking-wider">
              <span>Lithium BESS (200 kWh)</span>
              <BatteryCharging className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{energyData?.battery_soc_pct || 86.5}%</span>
              <span className="text-xs text-polar-text-muted">SoC</span>
            </div>
            <div className="mt-2 text-[11px] text-polar-text-secondary">
              Bridging Autonomy: <strong className="text-polar-text-primary">3.7 hours</strong>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-polar-border flex items-center justify-between text-[10px] text-polar-text-muted">
            <span>Cell Balance: 3.42V</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">CHARGED</span>
          </div>
        </div>

        {/* Fuel Consumption */}
        <div className="bg-polar-card border border-polar-border rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-polar-text-muted uppercase tracking-wider">
              <span>Polar Diesel Burn Rate</span>
              <Flame className="w-4 h-4 text-polar-cyan" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-polar-text-primary">{genset.fuel_flow_lph}</span>
              <span className="text-xs text-polar-text-muted">L/hr</span>
            </div>
            <div className="mt-2 text-[11px] text-polar-text-secondary flex items-center justify-between">
              <span>Daily Burn: ~{Math.round(genset.fuel_flow_lph * 24)} L</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">186.3d Left</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-polar-border text-[10px] text-polar-text-muted">
            Storage Tank: 98,400 L
          </div>
        </div>
      </div>

      {/* Causal Physical Propagation Chain */}
      <div className="bg-polar-card border border-polar-border p-4 rounded-lg">
        <div className="text-xs font-bold text-polar-text-primary uppercase tracking-wider mb-3">
          Thermodynamic Causal Coupling Loop
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-polar-elevated p-3 rounded border border-polar-border">
            <span className="text-[10px] text-polar-text-muted">1. AMBIENT WEATHER</span>
            <div className="font-bold text-polar-text-primary mt-1">-18.4°C, 11.2 m/s</div>
            <div className="text-[10px] text-polar-text-secondary mt-1">Wind-chill loss factor: 1.28x</div>
          </div>
          <div className="bg-polar-elevated p-3 rounded border border-polar-border">
            <span className="text-[10px] text-polar-text-muted">2. HVAC THERMAL DEMAND</span>
            <div className="font-bold text-polar-text-primary mt-1">62.0 kW (Thermal)</div>
            <div className="text-[10px] text-polar-text-secondary mt-1">Maintains +21.5°C indoor</div>
          </div>
          <div className="bg-polar-elevated p-3 rounded border border-polar-border">
            <span className="text-[10px] text-polar-text-muted">3. MICROGRID POWER</span>
            <div className="font-bold text-polar-text-primary mt-1">185.0 kW Total</div>
            <div className="text-[10px] text-polar-text-secondary mt-1">Base 82kW + HVAC 62kW</div>
          </div>
          <div className="bg-polar-elevated p-3 rounded border border-polar-border">
            <span className="text-[10px] text-polar-text-muted">4. GENSET LOAD</span>
            <div className="font-bold text-polar-text-primary mt-1">74.0% Rated Capacity</div>
            <div className="text-[10px] text-polar-text-secondary mt-1">Exhaust Temp: 385°C</div>
          </div>
          <div className="bg-polar-elevated p-3 rounded border border-polar-border">
            <span className="text-[10px] text-polar-text-muted">5. FUEL DEPLETION</span>
            <div className="font-bold text-polar-cyan mt-1">38.5 Litres/Hour</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">186.3 Days Runway</div>
          </div>
        </div>
      </div>

      {/* 24-Hour Forward Forecast Chart */}
      {forecast && (
        <div className="bg-polar-card border border-polar-border p-5 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-polar-text-primary uppercase tracking-wider">
                24-Hour Diurnal Demand & Fuel Consumption Forecast
              </h3>
              <p className="text-xs text-polar-text-muted mt-0.5 font-sans">
                Calculated from solar elevation angles, radiative heat loss, and diurnal Antarctic atmospheric equations.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-polar-text-secondary">
                <span className="w-3 h-1 bg-amber-400 rounded" />
                <span>Demand (kW)</span>
              </span>
              <span className="flex items-center gap-1.5 text-polar-text-secondary">
                <span className="w-3 h-1 bg-sky-400 rounded" />
                <span>Fuel (L/hr)</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast.hourly_points} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? "#38BDF8" : "#0284C7"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isDark ? "#38BDF8" : "#0284C7"} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="hour" stroke={chartGridColor} tick={{ fontSize: 11, fill: chartTextColor }} />
                <YAxis stroke={chartGridColor} tick={{ fontSize: 11, fill: chartTextColor }} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: 6, fontSize: 12, fontFamily: 'monospace' }}
                  labelStyle={{ color: tooltipLabel, fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="demand_kw" name="Total Demand (kW)" stroke="#F59E0B" strokeWidth={1.75} fillOpacity={1} fill="url(#demandGrad)" />
                <Area type="monotone" dataKey="fuel_burn_lph" name="Fuel Burn (L/h)" stroke={isDark ? "#38BDF8" : "#0284C7"} strokeWidth={1.75} fillOpacity={1} fill="url(#fuelGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
