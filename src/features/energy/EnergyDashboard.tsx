import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Flame, 
  BatteryCharging, 
  Sun, 
  Wind, 
  TrendingUp, 
  ArrowDownRight, 
  Thermometer, 
  Layers 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';

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

  const microgrid = energyData?.microgrid || { total_demand_kw: 185.0, hvac_load_kw: 62.0, solar_generation_kw: 8.4, reserve_margin_pct: 26.0 };
  const genset = energyData?.primary_generator || { load_pct: 74.0, fuel_flow_lph: 38.5, exhaust_temp_c: 385.0 };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-polar-cyan font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-polar-cyan" />
            <span>ISOLATED POLAR MICROGRID & THERMAL GENERATION</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            ENERGY DIGITAL TWIN & FUEL DEPLETION MODEL
          </h2>
        </div>
        <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
      </div>

      {/* Primary KPI Meters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Demand */}
        <div className="polar-panel p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>STATION POWER DEMAND</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{microgrid.total_demand_kw}</span>
            <span className="text-xs font-mono text-slate-300">kW</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Base: {microgrid.base_load_kw || 82} kW</span>
            <span>HVAC: {microgrid.hvac_load_kw} kW</span>
          </div>
        </div>

        {/* Generator Load & Reserve */}
        <div className="polar-panel p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>GENSET 01 LOAD</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              genset.load_pct > 90 ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
            }`}>
              {genset.load_pct}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{microgrid.generator_net_load_kw || 176.6}</span>
            <span className="text-xs font-mono text-slate-300">kW</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Spinning Reserve:</span>
            <strong className="text-polar-cyan">{microgrid.reserve_margin_pct}%</strong>
          </div>
        </div>

        {/* Battery BESS */}
        <div className="polar-panel p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>LITHIUM BESS (200 kWh)</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-emerald-400">{energyData?.battery_soc_pct || 86.5}%</span>
            <span className="text-xs font-mono text-slate-400">SoC</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400">
            Bridging Autonomy: <strong>3.7 hours</strong>
          </div>
        </div>

        {/* Fuel Consumption */}
        <div className="polar-panel p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>POLAR DIESEL BURN RATE</span>
            <Flame className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{genset.fuel_flow_lph}</span>
            <span className="text-xs font-mono text-slate-300">L/hr</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Daily Burn: <strong>~{Math.round(genset.fuel_flow_lph * 24)} L</strong></span>
            <span className="text-emerald-400">186 Days Left</span>
          </div>
        </div>
      </div>

      {/* Causal Physical Propagation Chain */}
      <div className="bg-polar-900 border border-polar-750/80 p-4 rounded-xl">
        <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
          Thermodynamic Causal Coupling Loop
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
          <div className="bg-polar-950 p-3 rounded border border-polar-800">
            <span className="text-[10px] text-slate-500">1. AMBIENT WEATHER</span>
            <div className="font-bold text-white mt-1">-18.4°C, 11.2 m/s</div>
            <div className="text-[10px] text-slate-400">Wind-chill loss factor: 1.28x</div>
          </div>
          <div className="bg-polar-950 p-3 rounded border border-polar-800">
            <span className="text-[10px] text-slate-500">2. HVAC THERMAL DEMAND</span>
            <div className="font-bold text-white mt-1">62.0 kW (Thermal)</div>
            <div className="text-[10px] text-slate-400">Maintains +21.5°C indoor</div>
          </div>
          <div className="bg-polar-950 p-3 rounded border border-polar-800">
            <span className="text-[10px] text-slate-500">3. MICROGRID POWER</span>
            <div className="font-bold text-white mt-1">185.0 kW Total</div>
            <div className="text-[10px] text-slate-400">Base 82kW + HVAC 62kW + PV offset</div>
          </div>
          <div className="bg-polar-950 p-3 rounded border border-polar-800">
            <span className="text-[10px] text-slate-500">4. GENSET LOAD</span>
            <div className="font-bold text-white mt-1">74.0% Rated Capacity</div>
            <div className="text-[10px] text-slate-400">Exhaust Temp: 385°C</div>
          </div>
          <div className="bg-polar-950 p-3 rounded border border-polar-800">
            <span className="text-[10px] text-slate-500">5. FUEL DEPLETION</span>
            <div className="font-bold text-cyan-400 mt-1">38.5 Litres/Hour</div>
            <div className="text-[10px] text-emerald-400">186.3 Days Runway</div>
          </div>
        </div>
      </div>

      {/* 24-Hour Forward Forecast Chart */}
      {forecast && (
        <div className="polar-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                24-Hour Diurnal Demand & Fuel Consumption Forecast
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Calculated from solar elevation angles, radiative heat loss, and diurnal Antarctic atmospheric equations.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-amber-400 rounded" /> Demand (kW)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-cyan-400 rounded" /> Fuel (L/hr)</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast.hourly_points} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#080E1A', borderColor: '#1F3258', borderRadius: 8, fontSize: 12, fontFamily: 'monospace' }}
                  labelStyle={{ color: '#00E5FF', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="demand_kw" name="Total Demand (kW)" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#demandGrad)" />
                <Area type="monotone" dataKey="fuel_burn_lph" name="Fuel Burn (L/h)" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#fuelGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
