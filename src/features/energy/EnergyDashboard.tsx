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

interface Props {
  stationId: string;
}

export const EnergyDashboard: React.FC<Props> = ({ stationId }) => {
  const [energyData, setEnergyData] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1220] border border-[#1E293B] p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>ISOLATED POLAR MICROGRID & THERMAL GENERATION</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{stationName}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1 font-sans">
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
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider">
              <span>Station Power Demand</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{microgrid.total_demand_kw}</span>
              <span className="text-xs text-slate-400">kW</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Base: {microgrid.base_load_kw || 82} kW</span>
              <span>HVAC: {microgrid.hvac_load_kw} kW</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-500">
            <span>Grid Status</span>
            <StatusBadge status="OPERATIONAL" size="sm" />
          </div>
        </div>

        {/* Generator Load & Reserve */}
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider">
              <span>Primary Genset Load</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                genset.load_pct > 90 ? 'bg-rose-950 text-rose-400 border border-rose-500/40' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
              }`}>
                {genset.load_pct}% LOAD
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{microgrid.generator_net_load_kw || 176.6}</span>
              <span className="text-xs text-slate-400">kW</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Spinning Reserve:</span>
              <strong className="text-cyan-400">{microgrid.reserve_margin_pct}%</strong>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1E293B] text-[10px] text-slate-500">
            Operating within optimal engine envelope
          </div>
        </div>

        {/* Battery BESS */}
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider">
              <span>Lithium BESS (200 kWh)</span>
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">{energyData?.battery_soc_pct || 86.5}%</span>
              <span className="text-xs text-slate-400">SoC</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Bridging Autonomy: <strong className="text-white">3.7 hours</strong>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-500">
            <span>Cell Balance: 3.42V</span>
            <span className="text-emerald-400">CHARGED</span>
          </div>
        </div>

        {/* Fuel Consumption */}
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider">
              <span>Polar Diesel Burn Rate</span>
              <Flame className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{genset.fuel_flow_lph}</span>
              <span className="text-xs text-slate-400">L/hr</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Daily Burn: ~{Math.round(genset.fuel_flow_lph * 24)} L</span>
              <span className="text-emerald-400 font-semibold">186.3d Left</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1E293B] text-[10px] text-slate-500">
            Storage Tank: 98,400 L
          </div>
        </div>
      </div>

      {/* Causal Physical Propagation Chain */}
      <div className="bg-[#0B1220] border border-[#1E293B] p-4 rounded-lg">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Thermodynamic Causal Coupling Loop
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-[#111827] p-3 rounded border border-[#1E293B]">
            <span className="text-[10px] text-slate-500">1. AMBIENT WEATHER</span>
            <div className="font-bold text-white mt-1">-18.4°C, 11.2 m/s</div>
            <div className="text-[10px] text-slate-400 mt-1">Wind-chill loss factor: 1.28x</div>
          </div>
          <div className="bg-[#111827] p-3 rounded border border-[#1E293B]">
            <span className="text-[10px] text-slate-500">2. HVAC THERMAL DEMAND</span>
            <div className="font-bold text-white mt-1">62.0 kW (Thermal)</div>
            <div className="text-[10px] text-slate-400 mt-1">Maintains +21.5°C indoor</div>
          </div>
          <div className="bg-[#111827] p-3 rounded border border-[#1E293B]">
            <span className="text-[10px] text-slate-500">3. MICROGRID POWER</span>
            <div className="font-bold text-white mt-1">185.0 kW Total</div>
            <div className="text-[10px] text-slate-400 mt-1">Base 82kW + HVAC 62kW</div>
          </div>
          <div className="bg-[#111827] p-3 rounded border border-[#1E293B]">
            <span className="text-[10px] text-slate-500">4. GENSET LOAD</span>
            <div className="font-bold text-white mt-1">74.0% Rated Capacity</div>
            <div className="text-[10px] text-slate-400 mt-1">Exhaust Temp: 385°C</div>
          </div>
          <div className="bg-[#111827] p-3 rounded border border-[#1E293B]">
            <span className="text-[10px] text-slate-500">5. FUEL DEPLETION</span>
            <div className="font-bold text-cyan-400 mt-1">38.5 Litres/Hour</div>
            <div className="text-[10px] text-emerald-400 mt-1">186.3 Days Runway</div>
          </div>
        </div>
      </div>

      {/* 24-Hour Forward Forecast Chart */}
      {forecast && (
        <div className="bg-[#0B1220] border border-[#1E293B] p-5 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                24-Hour Diurnal Demand & Fuel Consumption Forecast
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Calculated from solar elevation angles, radiative heat loss, and diurnal Antarctic atmospheric equations.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-1 bg-amber-400 rounded" />
                <span>Demand (kW)</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
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
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1E293B', borderRadius: 6, fontSize: 12, fontFamily: 'monospace' }}
                  labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="demand_kw" name="Total Demand (kW)" stroke="#F59E0B" strokeWidth={1.75} fillOpacity={1} fill="url(#demandGrad)" />
                <Area type="monotone" dataKey="fuel_burn_lph" name="Fuel Burn (L/h)" stroke="#38BDF8" strokeWidth={1.75} fillOpacity={1} fill="url(#fuelGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
