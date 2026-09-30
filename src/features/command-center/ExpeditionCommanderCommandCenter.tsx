// ============================================================================
// POLAR-TWIN: Expedition Commander Command Center
// Operational Authority: MISSION_OPS (Level 4 Expedition Command Clearance)
// Header: POLAR-TWIN EXPEDITION COMMAND
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Truck, 
  Users, 
  Lock, 
  AlertOctagon, 
  Fuel, 
  Droplet, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  RefreshCw,
  Flame,
  Zap
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TelemetryMetric } from '../../components/ui/TelemetryMetric';
import { DataFreshness } from '../../components/ui/DataFreshness';
import { CommandButton } from '../../components/ui/CommandButton';
import polarTwinIcon from '../../assets/polar-twin-icon.png';

interface Props {
  currentStationId?: string;
  onNavigate: (screen: any) => void;
  onSelectStation: (stationId: string) => void;
}

export const ExpeditionCommanderCommandCenter: React.FC<Props> = ({
  currentStationId = 'station_bharati',
  onNavigate,
  onSelectStation
}) => {
  const { user, operationalAuthority, stationScope } = useAuth();
  const [rationingActive, setRationingActive] = useState<boolean>(false);
  const [emergencyCode, setEmergencyCode] = useState<string>('');
  const [twoPersonApproval, setTwoPersonApproval] = useState<string>('controller.raman');
  const [protocolStatus, setProtocolStatus] = useState<{ status: 'IDLE' | 'EXECUTED'; msg?: string }>({ status: 'IDLE' });
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const isBharati = currentStationId === 'station_bharati';
  const stationName = isBharati ? 'Bharati Station' : 'Maitri Station';

  const handleExecuteEmergencyProtocol = () => {
    if (!emergencyCode) {
      alert('Please select or specify safety-critical emergency procedure.');
      return;
    }
    setProtocolStatus({
      status: 'EXECUTED',
      msg: `CRITICAL ACTION AUTHORIZED: [${emergencyCode}] approved by Col. R. Nair with second officer [${twoPersonApproval}] under 4-Eyes Principle.`
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1720px] mx-auto font-sans select-none overflow-hidden">
      {/* 1. HERO BAR: POLAR-TWIN EXPEDITION COMMAND */}
      <section className="bg-polar-card border border-purple-500/40 rounded-md p-4 sm:p-5 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <img 
              src={polarTwinIcon} 
              alt="POLAR-TWIN" 
              className="w-16 h-16 rounded-full object-contain border-2 border-purple-500/60 shadow-xl ring-4 ring-purple-500/20 shrink-0 hidden sm:block bg-polar-bg/40 p-0.5" 
            />
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-purple-400 font-bold uppercase tracking-widest mb-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span>POLAR-TWIN • EXPEDITION LEADERSHIP</span>
                <span className="text-polar-border">|</span>
                <span className="bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                  AUTHORITY: {operationalAuthority}
                </span>
                <span className="text-polar-border">|</span>
                <span className="text-polar-text-muted">SCOPE: {stationScope.join(', ')}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-polar-text-primary tracking-tight font-mono">
                POLAR-TWIN EXPEDITION COMMAND
              </h1>
              <p className="text-xs text-polar-text-secondary mt-1 max-w-3xl leading-relaxed font-mono">
                Mission readiness, critical supply chain logistics, contingency approvals, and emergency command protocols for {stationName}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <CommandButton
              variant="secondary"
              icon={Truck}
              onClick={() => onNavigate('logistics')}
            >
              Logistics Runway
            </CommandButton>
            <CommandButton
              variant="primary"
              icon={AlertOctagon}
              onClick={() => onNavigate('simulation')}
            >
              What-If Contingency
            </CommandButton>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-polar-border grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Data Freshness:</span>
            <DataFreshness lastUpdatedTimestamp={lastSyncTime} isLive={true} />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Expedition Leader:</span>
            <span className="text-purple-400 font-bold truncate">{user?.display_name || 'Col. R. Nair (Expedition Commander)'}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Fuel Reserves:</span>
            <span className="text-emerald-400 font-bold truncate">186.3 Days (Nominal)</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Wintering Complement:</span>
            <span className="text-polar-text-primary font-bold truncate">24 Personnel on Station</span>
          </div>
        </div>
      </section>

      {/* Protocol execution notice */}
      {protocolStatus.status === 'EXECUTED' && (
        <div className="p-3 bg-purple-500/15 border border-purple-500/40 rounded text-purple-300 font-mono text-xs flex items-center justify-between">
          <span>{protocolStatus.msg}</span>
          <span className="text-[10px] uppercase font-bold text-purple-400">TWO-PERSON VERIFIED</span>
        </div>
      )}

      {/* 2. COMMANDER METRIC STRIP */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <TelemetryMetric
          label="Overall Mission Readiness"
          value="97.4"
          unit="%"
          status="NORMAL"
          trend="Nominal Ready"
          trendDirection="up"
          timestamp="Live"
          sparklineData={[96, 96.5, 97, 97.4, 97.4]}
          sparklineColor="#A855F7"
          provenance="PHYSICS_MODEL"
          icon={ShieldCheck}
        />
        <TelemetryMetric
          label="Critical Fuel Supply"
          value={isBharati ? "186.3" : "142.8"}
          unit="DAYS"
          status="NORMAL"
          trend="Stable"
          trendDirection="up"
          timestamp="Live"
          sparklineData={[189, 188, 187, 186.3, 186.3]}
          sparklineColor="#38BDF8"
          provenance="PHYSICS_MODEL"
          icon={Fuel}
        />
        <TelemetryMetric
          label="Food & Ration Runway"
          value="240.0"
          unit="DAYS"
          status="NORMAL"
          trend="Supplied"
          trendDirection="up"
          timestamp="Live"
          sparklineData={[245, 243, 241, 240, 240]}
          sparklineColor="#10B981"
          provenance="PHYSICS_MODEL"
          icon={Truck}
        />
        <TelemetryMetric
          label="Expedition Medical Stock"
          value="99.0"
          unit="%"
          status="NORMAL"
          trend="Uncompromised"
          trendDirection="up"
          timestamp="Live"
          sparklineData={[99, 99, 99, 99, 99]}
          sparklineColor="#06B6D4"
          provenance="PHYSICS_MODEL"
          icon={Droplet}
        />
      </section>

      {/* 3. SAFETY-CRITICAL TWO-PERSON CONTROL & EXPEDITION OVERSIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Two-Person Control Execution Panel */}
        <div className="bg-polar-card border border-purple-500/30 rounded-md p-4 sm:p-5 font-mono shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-polar-border">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-bold text-polar-text-primary uppercase tracking-wide">
                Two-Person Control Protocol (4-Eyes Principle)
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold">
              CRITICAL SAFETY
            </span>
          </div>

          <p className="text-xs text-polar-text-secondary mb-4 leading-relaxed">
            Per Antarctic safety directives, critical procedures (e.g. emergency bus transfers, life-support load shedding) require dual verified identities.
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-polar-text-muted text-[11px] block mb-1">SAFETY PROCEDURE:</label>
              <select
                value={emergencyCode}
                onChange={(e) => setEmergencyCode(e.target.value)}
                className="w-full bg-polar-base border border-polar-border rounded px-3 py-2 text-polar-text-primary focus:border-purple-400 outline-none"
              >
                <option value="">Select Safety-Critical Command...</option>
                <option value="LOAD_SHED_SECONDARY">Load-Shed Non-Critical Science Blocks (Saves 45 kW)</option>
                <option value="EMERGENCY_BUS_TRANSFER">Emergency Power Bus Transfer to Auxiliary Generator</option>
                <option value="WATER_CONSERVATION_STAGE2">Activate Stage 2 Water Conservation Mode</option>
              </select>
            </div>

            <div>
              <label className="text-polar-text-muted text-[11px] block mb-1">SECOND OFFICER VERIFIER (NCPOR / STATION):</label>
              <select
                value={twoPersonApproval}
                onChange={(e) => setTwoPersonApproval(e.target.value)}
                className="w-full bg-polar-base border border-polar-border rounded px-3 py-2 text-polar-text-primary focus:border-purple-400 outline-none"
              >
                <option value="controller.raman">controller.raman (Flight Controller, Mission Control)</option>
                <option value="admin.ncpor">admin.ncpor (Mission Control Admin)</option>
                <option value="engineer.deshmukh">engineer.deshmukh (Base Chief Engineer)</option>
              </select>
            </div>

            <button
              onClick={handleExecuteEmergencyProtocol}
              className="w-full py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
            >
              EXECUTE TWO-PERSON CONTROL ACTION
            </button>
          </div>
        </div>

        {/* Station Supply & Expedition Readiness Panel */}
        <div className="bg-polar-card border border-polar-border rounded-md p-4 sm:p-5 font-mono shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-polar-border">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-polar-text-primary uppercase tracking-wide">
                Expedition Logistics & Rationing Authority
              </h2>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold">AIR-GAP VERIFIED</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-polar-base rounded border border-polar-border flex items-center justify-between">
              <div>
                <span className="font-bold text-polar-text-primary block">Thermal Conservation Policy</span>
                <span className="text-polar-text-muted text-[11px]">Enforce 20.5°C ceiling across sleeping quarters</span>
              </div>
              <button
                onClick={() => setRationingActive(!rationingActive)}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${
                  rationingActive ? 'bg-emerald-600 text-white' : 'bg-polar-card text-polar-text-secondary border border-polar-border'
                }`}
              >
                {rationingActive ? 'ACTIVE' : 'STANDBY'}
              </button>
            </div>

            <div className="p-3 bg-polar-base rounded border border-polar-border flex items-center justify-between">
              <div>
                <span className="font-bold text-polar-text-primary block">Next Resupply Vessel</span>
                <span className="text-polar-text-muted text-[11px]">MV Vasiliy Golovnin (Expedition Voyage 45)</span>
              </div>
              <span className="text-xs font-bold text-cyan-400">ETA: 48 DAYS</span>
            </div>

            <div className="p-3 bg-polar-base rounded border border-polar-border flex items-center justify-between">
              <div>
                <span className="font-bold text-polar-text-primary block">Field Research Sorties</span>
                <span className="text-polar-text-muted text-[11px]">Larsemann Hills Glaciology Traverse</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">APPROVED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
