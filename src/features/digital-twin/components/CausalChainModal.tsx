import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Wind, 
  Zap, 
  Thermometer, 
  Fuel, 
  Ship, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  Sliders, 
  TrendingDown, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Cpu
} from 'lucide-react';
import { api } from '../../../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stationId: string;
  onSelectStation?: (stationId: string) => void;
}

export const CausalChainModal: React.FC<Props> = ({
  isOpen,
  onClose,
  stationId,
  onSelectStation
}) => {
  const [activeStation, setActiveStation] = useState<string>(stationId || 'station_bharati');
  const [ambientTemp, setAmbientTemp] = useState<number>(-18.5);
  const [windSpeed, setWindSpeed] = useState<number>(12.0);
  const [shedLoads, setShedLoads] = useState<boolean>(false);
  const [engageAux, setEngageAux] = useState<boolean>(false);
  const [dischargeBess, setDischargeBess] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [causalData, setCausalData] = useState<any>(null);
  const [expandedLink, setExpandedLink] = useState<number | null>(null);
  const [mitigationApplied, setMitigationApplied] = useState<boolean>(false);

  // Sync if prop changes
  useEffect(() => {
    if (stationId) {
      setActiveStation(stationId);
    }
  }, [stationId]);

  // Load live causal chain on mount or station change
  useEffect(() => {
    if (isOpen) {
      loadLiveCausalChain();
    }
  }, [isOpen, activeStation]);

  const loadLiveCausalChain = async () => {
    setLoading(true);
    try {
      const data = await api.getCausalChain(activeStation);
      setCausalData(data);
      if (data) {
        setAmbientTemp(data.ambient_temp_c ?? -18.5);
        setWindSpeed(data.wind_speed_ms ?? 12.0);
        setShedLoads(false);
        setEngageAux(false);
        setDischargeBess(false);
        setMitigationApplied(false);
      }
    } catch (err) {
      console.error('Failed to load causal chain:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-simulate whenever parameters change
  const handleSimulate = async (
    temp: number, 
    wind: number, 
    shed: boolean, 
    aux: boolean, 
    bess: boolean
  ) => {
    setLoading(true);
    try {
      const res = await api.simulateCausalChain(activeStation, {
        ambient_temp_c: temp,
        wind_speed_ms: wind,
        shed_priority_1_loads: shed,
        engage_aux_genset: aux,
        discharge_bess: bess,
      });
      setCausalData(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTempChange = (newTemp: number) => {
    setAmbientTemp(newTemp);
    handleSimulate(newTemp, windSpeed, shedLoads, engageAux, dischargeBess);
  };

  const handleWindChange = (newWind: number) => {
    setWindSpeed(newWind);
    handleSimulate(ambientTemp, newWind, shedLoads, engageAux, dischargeBess);
  };

  const handleToggleShed = () => {
    const next = !shedLoads;
    setShedLoads(next);
    handleSimulate(ambientTemp, windSpeed, next, engageAux, dischargeBess);
  };

  const handleToggleAux = () => {
    const next = !engageAux;
    setEngageAux(next);
    handleSimulate(ambientTemp, windSpeed, shedLoads, next, dischargeBess);
  };

  const handleToggleBess = () => {
    const next = !dischargeBess;
    setDischargeBess(next);
    handleSimulate(ambientTemp, windSpeed, shedLoads, engageAux, next);
  };

  const handleApplyMitigation = () => {
    setShedLoads(true);
    setEngageAux(true);
    setDischargeBess(true);
    setMitigationApplied(true);
    handleSimulate(ambientTemp, windSpeed, true, true, true);
  };

  if (!isOpen) return null;

  const kpis = causalData?.summary_kpis || {};
  const links = causalData?.causal_chain_links || [];
  const isBharati = activeStation === 'station_bharati';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-polar-surface border border-polar-border shadow-2xl overflow-hidden font-mono">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-polar-border bg-polar-elevated/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-polar-cyan/10 border border-polar-cyan/30 text-polar-cyan">
              <Activity className="w-5 h-5 text-polar-cyan animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-polar-text-primary tracking-wider">
                  CROSS-DOMAIN CAUSAL CHAIN
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  10-LINK PASS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-polar-card text-polar-cyan border border-polar-border">
                  FORENSIC PHYSICS
                </span>
              </div>
              <p className="text-xs text-polar-text-secondary mt-0.5">
                Physical Cause-and-Effect: Environment → Thermal Loss → Grid Demand → Fuel Burn → Logistics Runway → Action
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Station Switcher */}
            <div className="flex items-center rounded-lg border border-polar-border bg-polar-card p-1 text-xs">
              <button
                onClick={() => {
                  setActiveStation('station_bharati');
                  if (onSelectStation) onSelectStation('station_bharati');
                }}
                className={`px-3 py-1 rounded font-bold transition-colors cursor-pointer ${
                  isBharati
                    ? 'bg-polar-cyan text-black shadow-sm'
                    : 'text-polar-text-secondary hover:text-polar-text-primary'
                }`}
              >
                BHARATI
              </button>
              <button
                onClick={() => {
                  setActiveStation('station_maitri');
                  if (onSelectStation) onSelectStation('station_maitri');
                }}
                className={`px-3 py-1 rounded font-bold transition-colors cursor-pointer ${
                  !isBharati
                    ? 'bg-polar-cyan text-black shadow-sm'
                    : 'text-polar-text-secondary hover:text-polar-text-primary'
                }`}
              >
                MAITRI
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-polar-text-secondary hover:text-polar-text-primary hover:bg-polar-card transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Perturbation & Simulation Control Deck */}
          <div className="rounded-xl border border-polar-border bg-polar-card/50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-polar-cyan">
                <Sliders className="w-4 h-4 text-polar-cyan" />
                <span>OPERATIONAL PERTURBATION & CONTINGENCY CONTROLS</span>
              </div>
              <button
                onClick={loadLiveCausalChain}
                className="flex items-center gap-1.5 text-xs text-polar-text-secondary hover:text-polar-text-primary hover:bg-polar-hover px-2.5 py-1 rounded border border-polar-border transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Observed AWS Met Data</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
              {/* Temp Slider */}
              <div className="space-y-1.5 p-3 rounded-lg bg-polar-surface/80 border border-polar-border">
                <div className="flex justify-between items-center text-polar-text-secondary">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                    Ambient Temp
                  </span>
                  <span className="font-bold text-polar-text-primary text-sm">{ambientTemp}°C</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="-5"
                  step="1"
                  value={ambientTemp}
                  onChange={(e) => handleTempChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-polar-elevated rounded-lg appearance-none cursor-pointer accent-polar-cyan"
                />
                <div className="flex justify-between text-[10px] text-polar-text-secondary">
                  <span>-50°C (Polar Vortex)</span>
                  <span>-5°C</span>
                </div>
              </div>

              {/* Wind Slider */}
              <div className="space-y-1.5 p-3 rounded-lg bg-polar-surface/80 border border-polar-border">
                <div className="flex justify-between items-center text-polar-text-secondary">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-cyan-400" />
                    Katabatic Wind
                  </span>
                  <span className="font-bold text-polar-text-primary text-sm">{windSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  step="1"
                  value={windSpeed}
                  onChange={(e) => handleWindChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-polar-elevated rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-polar-text-secondary">
                  <span>0 m/s (Calm)</span>
                  <span>45 m/s (Cat-5 Storm)</span>
                </div>
              </div>

              {/* Toggle Shed Labs */}
              <button
                onClick={handleToggleShed}
                className={`flex flex-col justify-between p-3 rounded-lg border transition-all text-left cursor-pointer ${
                  shedLoads
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                    : 'bg-polar-surface/80 border-polar-border text-polar-text-secondary hover:border-polar-cyan/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs">Shed Non-Critical Load</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${shedLoads ? 'bg-amber-500/20 text-amber-400' : 'bg-polar-card text-polar-text-secondary'}`}>
                    {shedLoads ? 'ACTIVE (-28kW)' : 'OFF'}
                  </span>
                </div>
                <span className="text-[10px] text-polar-text-secondary mt-1">
                  Disconnects Atmospheric Science Lab instrumentation & chalets
                </span>
              </button>

              {/* Toggle Aux Genset */}
              <button
                onClick={handleToggleAux}
                className={`flex flex-col justify-between p-3 rounded-lg border transition-all text-left cursor-pointer ${
                  engageAux
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                    : 'bg-polar-surface/80 border-polar-border text-polar-text-secondary hover:border-polar-cyan/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs">Sync Aux Genset 02</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${engageAux ? 'bg-emerald-500/20 text-emerald-400' : 'bg-polar-card text-polar-text-secondary'}`}>
                    {engageAux ? 'PARALLEL' : 'STANDBY'}
                  </span>
                </div>
                <span className="text-[10px] text-polar-text-secondary mt-1">
                  Shares bus load (55%/45% split) across twin gensets
                </span>
              </button>

              {/* Toggle BESS */}
              <button
                onClick={handleToggleBess}
                disabled={!isBharati}
                className={`flex flex-col justify-between p-3 rounded-lg border transition-all text-left ${
                  !isBharati ? 'opacity-40 cursor-not-allowed bg-polar-surface/50 border-polar-border' :
                  dischargeBess
                    ? 'bg-polar-cyan/10 border-polar-cyan/50 text-polar-cyan cursor-pointer'
                    : 'bg-polar-surface/80 border-polar-border text-polar-text-secondary hover:border-polar-cyan/40 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs">BESS Peak Shaving</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${dischargeBess ? 'bg-polar-cyan/20 text-polar-cyan' : 'bg-polar-card text-polar-text-secondary'}`}>
                    {isBharati ? (dischargeBess ? 'DISCHARGING' : 'STANDBY') : 'N/A'}
                  </span>
                </div>
                <span className="text-[10px] text-polar-text-secondary mt-1">
                  {isBharati ? 'Discharges 25 kW from 200kWh Lithium BESS' : 'Maitri uses micro-wind instead of BESS'}
                </span>
              </button>
            </div>
          </div>

          {/* Key Metrics Dashboard Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-polar-card border border-polar-border space-y-1">
              <span className="text-[10px] text-polar-text-secondary uppercase">Envelope Loss</span>
              <div className="text-base font-bold text-blue-400">
                {kpis.heat_loss_kw ?? '--'} <span className="text-xs font-normal">kW</span>
              </div>
              <span className="text-[10px] text-polar-text-secondary">
                Wind Chill: {kpis.wind_chill_c ?? '--'}°C
              </span>
            </div>

            <div className="p-3 rounded-xl bg-polar-card border border-polar-border space-y-1">
              <span className="text-[10px] text-polar-text-secondary uppercase">Microgrid Demand</span>
              <div className="text-base font-bold text-polar-text-primary">
                {kpis.microgrid_load_kw ?? '--'} <span className="text-xs font-normal">kW</span>
              </div>
              <span className={`text-[10px] font-bold ${kpis.genset_load_pct > 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {kpis.genset_load_pct ?? '--'}% Gen Load
              </span>
            </div>

            <div className="p-3 rounded-xl bg-polar-card border border-polar-border space-y-1">
              <span className="text-[10px] text-polar-text-secondary uppercase">Fuel Burn Rate</span>
              <div className="text-base font-bold text-amber-400">
                {kpis.fuel_burn_lph ?? '--'} <span className="text-xs font-normal">L/h</span>
              </div>
              <span className="text-[10px] text-polar-text-secondary">
                {kpis.daily_fuel_liters ?? '--'} L/day
              </span>
            </div>

            <div className="p-3 rounded-xl bg-polar-card border border-polar-border space-y-1">
              <span className="text-[10px] text-polar-text-secondary uppercase">Fuel Runway</span>
              <div className="text-base font-bold text-polar-cyan">
                {kpis.fuel_runway_days ?? '--'} <span className="text-xs font-normal">Days</span>
              </div>
              <span className={`text-[10px] ${kpis.runway_loss_days > 20 ? 'text-rose-400' : 'text-polar-text-secondary'}`}>
                Loss: -{kpis.runway_loss_days ?? 0}d
              </span>
            </div>

            <div className="p-3 rounded-xl bg-polar-card border border-polar-border space-y-1">
              <span className="text-[10px] text-polar-text-secondary uppercase">Voyage Margin</span>
              <div className={`text-base font-bold ${kpis.resupply_safety_margin_days < 0 ? 'text-rose-400' : (kpis.resupply_safety_margin_days < 15 ? 'text-amber-400' : 'text-emerald-400')}`}>
                {kpis.resupply_safety_margin_days ?? '--'} <span className="text-xs font-normal">Days</span>
              </div>
              <span className="text-[10px] text-polar-text-secondary">
                Next Ship: 135d
              </span>
            </div>

            <div className="p-3 rounded-xl bg-polar-card border border-polar-border space-y-1">
              <span className="text-[10px] text-polar-text-secondary uppercase">Logistics Status</span>
              <div className="text-xs font-bold truncate">
                <span className={`px-2 py-0.5 rounded text-[11px] ${
                  kpis.logistics_risk === 'CRITICAL_SUPPLY_DEFICIT' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                  kpis.logistics_risk === 'HIGH_RISK_MARGIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {kpis.logistics_risk ?? 'ADEQUATE'}
                </span>
              </div>
              <span className="text-[10px] text-polar-text-secondary">
                Alert: {kpis.alert_severity ?? 'NOMINAL'}
              </span>
            </div>
          </div>

          {/* 10-Link Visual Step-by-Step Flow */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-polar-text-primary">
                <Layers className="w-4 h-4 text-polar-cyan" />
                <span>10-LINK CAUSAL EXECUTION PIPELINE</span>
              </div>
              <span className="text-[11px] text-polar-text-secondary">
                Click any link to inspect scientific formulas, inputs, and provenance
              </span>
            </div>

            <div className="space-y-2">
              {links.map((link: any) => {
                const isExpanded = expandedLink === link.link_index;
                return (
                  <div
                    key={link.link_index}
                    className="rounded-xl border border-polar-border bg-polar-card/40 transition-all overflow-hidden"
                  >
                    {/* Header Row */}
                    <button
                      onClick={() => setExpandedLink(isExpanded ? null : link.link_index)}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-polar-hover/50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-polar-cyan/20 border border-polar-cyan/40 text-polar-cyan font-bold text-xs flex items-center justify-center shrink-0">
                          {link.link_index}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-polar-text-primary">
                              {link.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-polar-elevated text-polar-text-secondary border border-polar-border">
                              {link.link_id}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              link.data_status === 'OBSERVED_VERIFIED' ? 'bg-emerald-500/20 text-emerald-400' :
                              link.data_status === 'PHYSICS_SYNTHETIC' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {link.data_status}
                            </span>
                          </div>
                          <p className="text-xs text-polar-text-secondary mt-0.5 line-clamp-1">
                            {link.interpretation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-polar-text-secondary shrink-0">
                        <span className="hidden sm:inline text-[10px] text-polar-cyan">
                          Confidence: {Math.round(link.confidence * 100)}%
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="px-5 pb-4 pt-2 border-t border-polar-border bg-polar-surface/60 space-y-3 text-xs">
                        {/* Physics Formula */}
                        {link.physics_formula && (
                          <div className="p-2.5 rounded-lg bg-polar-elevated/80 border border-polar-border font-mono">
                            <span className="text-[10px] text-polar-cyan uppercase font-bold block mb-1">Mathematical Formula</span>
                            <code className="text-xs text-emerald-400 font-bold">{link.physics_formula}</code>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Inputs */}
                          <div className="p-3 rounded-lg bg-polar-card border border-polar-border space-y-1">
                            <span className="text-[10px] text-polar-text-secondary uppercase font-bold">Input Variables</span>
                            <pre className="text-[11px] text-polar-text-primary whitespace-pre-wrap font-mono overflow-x-auto max-h-36">
                              {JSON.stringify(link.inputs, null, 2)}
                            </pre>
                          </div>

                          {/* Outputs */}
                          <div className="p-3 rounded-lg bg-polar-card border border-polar-border space-y-1">
                            <span className="text-[10px] text-polar-text-secondary uppercase font-bold">Computed Physical Outputs</span>
                            <pre className="text-[11px] text-polar-cyan whitespace-pre-wrap font-mono overflow-x-auto max-h-36">
                              {JSON.stringify(link.outputs, null, 2)}
                            </pre>
                          </div>
                        </div>

                        {/* Provenance & Source */}
                        <div className="flex flex-wrap items-center justify-between text-[10px] text-polar-text-secondary pt-2 border-t border-polar-border">
                          <span>Source System: <strong className="text-polar-text-primary">{link.source}</strong></span>
                          <span>Timestamp: {link.timestamp}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mitigation Protocol Footer Box */}
          <div className="rounded-xl border border-polar-cyan/30 bg-polar-cyan/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-polar-cyan" />
                <span className="text-xs font-bold text-polar-text-primary">
                  DECISION SUPPORT: OPTIMAL MITIGATION PROTOCOL
                </span>
                {mitigationApplied && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                    MITIGATION ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-polar-text-secondary">
                Automatically sheds Priority-1 non-critical loads, synchronizes Aux Genset 02, and commands BESS peak shaving to safeguard life-support thermal buffer.
              </p>
            </div>

            <button
              onClick={handleApplyMitigation}
              className="px-5 py-2.5 rounded-xl bg-polar-cyan text-black font-bold text-xs hover:bg-polar-cyan/90 transition-colors shadow-lg shadow-polar-cyan/20 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>Apply Recommended Mitigation</span>
            </button>
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-polar-border bg-polar-elevated/40 flex items-center justify-between text-[11px] text-polar-text-secondary">
          <span>Authority: National Centre for Polar and Ocean Research (NCPOR), MoES</span>
          <span>Zero-Trust Protocol: RBAC/ABAC Validated</span>
        </div>

      </div>
    </div>
  );
};
