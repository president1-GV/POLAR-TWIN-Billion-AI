// ============================================================================
// POLAR-TWIN: High-Precision Station Officers Command Portal & Personnel Dossiers
// POLAR-TWIN — Indian Antarctic Research Stations (Bharati & Maitri)
// Detailed Interactive Consoles for Commander, Chief Engineer, Duty Officer, and Science Analyst
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Compass,
  Radio,
  Zap,
  Flame,
  Droplets,
  CloudSnow,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Key,
  Clock,
  Send,
  Sliders,
  RefreshCw,
  SlidersHorizontal,
  FileText,
  Thermometer,
  Layers,
  Cpu,
  ChevronRight,
  Database,
  ArrowRight,
  Check,
  Globe,
  Satellite,
  ArrowLeftRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PolarRole, getRoleMeta } from '../../services/rbac';
import { ROLE_CREDENTIALS, api } from '../../services/api';

interface StationOfficersPortalProps {
  initialOfficerId?: string;
  currentStationId: string;
  onSelectStation: (stationId: string) => void;
  onNavigateToAdmin: () => void;
  onNavigateToScreen: (screenId: any) => void;
}

export type OfficerKey = 'commander' | 'engineer' | 'operator' | 'analyst' | 'mission_control';

const normalizeOfficerKey = (id?: string): OfficerKey => {
  if (!id) return 'commander';
  const lower = id.toLowerCase();
  if (lower.includes('control') || lower.includes('mission') || lower.includes('raman')) return 'mission_control';
  if (lower.includes('eng') || lower.includes('deshmukh') || lower.includes('base_engineer')) return 'engineer';
  if (lower.includes('op') || lower.includes('sharma') || lower.includes('verma') || lower.includes('duty_operator')) return 'operator';
  if (lower.includes('analyst') || lower.includes('sci') || lower.includes('patel')) return 'analyst';
  if (lower.includes('cmdr') || lower.includes('command') || lower.includes('nair') || lower.includes('expedition_cmdr')) return 'commander';
  return 'commander';
};

export const StationOfficersPortal: React.FC<StationOfficersPortalProps> = ({
  initialOfficerId = 'commander',
  currentStationId,
  onSelectStation,
  onNavigateToAdmin,
  onNavigateToScreen,
}) => {
  const { role, switchRole } = useAuth();
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerKey>(() => normalizeOfficerKey(initialOfficerId));

  useEffect(() => {
    if (initialOfficerId) {
      setSelectedOfficer(normalizeOfficerKey(initialOfficerId));
    }
  }, [initialOfficerId]);

  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'warn' | 'info' } | null>(null);

  // Commander State
  const [fuelTransferLiters, setFuelTransferLiters] = useState<number>(25000);
  const [commanderDirectives, setCommanderDirectives] = useState<Array<{ id: string; time: string; text: string; author: string }>>([
    { id: 'DIR-101', time: '02:15 UTC', text: 'All field traverse teams must report back to base before 14:00 UTC due to katabatic storm front.', author: 'Col. R. Nair' },
    { id: 'DIR-100', time: 'Yesterday', text: 'Scheduled Reverse Osmosis maintenance window approved for 04:00 - 08:00 UTC.', author: 'Col. R. Nair' },
  ]);
  const [newDirectiveInput, setNewDirectiveInput] = useState('');

  // Engineer State
  const [auxGensetSync, setAuxGensetSync] = useState(false);
  const [solarPeakShaving, setSolarPeakShaving] = useState(true);
  const [thermalSetpoint, setThermalSetpoint] = useState(20.5);
  const [purgingThermalLoop, setPurgingThermalLoop] = useState(false);

  // Operator State
  const [watchLogs, setWatchLogs] = useState<Array<{ id: string; time: string; text: string; officer: string }>>([
    { id: 'LOG-402', time: '02:22 UTC', text: 'Shift Bravo watch turnover complete. Wind velocity steady at 21 m/s, air temp -28.5°C. All life support nominal.', officer: 'V. Sharma' },
    { id: 'LOG-401', time: '01:45 UTC', text: 'Inmarsat GSAT-11 latency test recorded 640ms. Sat-link edge buffer cleared 18 packets.', officer: 'V. Sharma' },
  ]);
  const [newWatchLogInput, setNewWatchLogInput] = useState('');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, boolean>>({
    'alt-01': false,
    'alt-02': false,
  });

  // Science Analyst State
  const [isVerifyingHashes, setIsVerifyingHashes] = useState(false);
  const [provenanceVerified, setProvenanceVerified] = useState(true);

  const showToast = (msg: string, type: 'success' | 'warn' | 'info' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirectiveInput.trim()) return;
    const newEntry = {
      id: `DIR-${Date.now().toString().slice(-4)}`,
      time: new Date().toUTCString().slice(17, 22) + ' UTC',
      text: newDirectiveInput.trim(),
      author: 'Col. R. Nair (Commander)',
    };
    setCommanderDirectives([newEntry, ...commanderDirectives]);
    setNewDirectiveInput('');
    showToast('Expedition Directive broadcasted to Bharati and Maitri Stations.', 'success');
  };

  const handleAddWatchLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWatchLogInput.trim()) return;
    const newEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      time: new Date().toUTCString().slice(17, 22) + ' UTC',
      text: newWatchLogInput.trim(),
      officer: 'V. Sharma (Duty Officer)',
    };
    setWatchLogs([newEntry, ...watchLogs]);
    setNewWatchLogInput('');
    showToast('Watch journal entry recorded in official station shift log.', 'success');
  };

  const handleVerifyScienceHashes = () => {
    setIsVerifyingHashes(true);
    setTimeout(() => {
      setIsVerifyingHashes(false);
      setProvenanceVerified(true);
      showToast('NCPOR / IMD Dataset SHA-256 Provenance Check: 100% Bitwise Verified.', 'success');
    }, 800);
  };

  const officers = [
    {
      key: 'commander' as OfficerKey,
      id: 'commander.nair',
      name: 'Col. R. Nair',
      title: 'Expedition Commander',
      role: 'COMMANDER' as PolarRole,
      badge: 'LVL-4 CMDR',
      station: 'Bharati Station & Maitri Oversight',
      tagline: 'Expedition Leadership & Inter-Station Tactical Command',
      color: '#A855F7',
      badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/40',
    },
    {
      key: 'engineer' as OfficerKey,
      id: 'engineer.deshmukh',
      name: 'A. Deshmukh',
      title: 'Base Chief Engineer',
      role: 'ENGINEER' as PolarRole,
      badge: 'LVL-3 TECH',
      station: 'Bharati Research Base (Larsemann Hills)',
      tagline: 'Coupled Thermodynamic Microgrids & RO Life-Support',
      color: '#F59E0B',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    },
    {
      key: 'operator' as OfficerKey,
      id: 'operator.sharma',
      name: 'V. Sharma',
      title: 'Operations Duty Officer',
      role: 'OPERATOR' as PolarRole,
      badge: 'LVL-2 DUTY',
      station: 'Bharati Station Control Room',
      tagline: '24/7 Antarctic Watch, SCADA Telemetry & Sat-Link',
      color: '#38BDF8',
      badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40',
    },
    {
      key: 'analyst' as OfficerKey,
      id: 'analyst.patel',
      name: 'Dr. K. Patel',
      title: 'Science & Meteorology Officer',
      role: 'ANALYST' as PolarRole,
      badge: 'LVL-2 SCI',
      station: 'Maitri Station (Schirmacher Oasis)',
      tagline: 'Atmospheric Physics, Cryosphere & Environmental Data',
      color: '#10B981',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
    },
    {
      key: 'mission_control' as OfficerKey,
      id: 'controller.raman',
      name: 'K. Raman',
      title: 'Mission Flight Controller',
      role: 'MISSION_CONTROL' as PolarRole,
      badge: 'LVL-4 FLIGHT',
      station: 'NCPOR Goa & Antarctic Satellite Command',
      tagline: 'Dual-Station Satellite Uplink, Fleet Logistics & Cross-Station Telemetry',
      color: '#06B6D4',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    },
  ];

  const currentOfficerMeta = officers.find((o) => o.key === selectedOfficer) || officers[0];
  const isOfficerActiveRole = role === currentOfficerMeta.role;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-mono select-none">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between shadow-lg transition-all animate-in fade-in duration-200 ${
            notification.type === 'warn'
              ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
              : notification.type === 'info'
              ? 'bg-purple-950/80 border-purple-500/60 text-purple-200'
              : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
            <span className="font-semibold">{notification.msg}</span>
          </div>
          <span className="text-[10px] font-mono opacity-70">OFFICER-ROSTER</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-polar-surface border border-polar-border rounded-xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-polar-cyan">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-polar-text-primary tracking-wide uppercase">
                STATION OFFICERS COMMAND PORTAL & PERSONNEL DOSSIERS
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase">
                ANTARCTIC ROSTER
              </span>
            </div>
            <p className="text-xs text-polar-text-muted leading-relaxed">
              Dedicated Command Workspaces for Indian Antarctic Expedition Officers across Bharati and Maitri Research Bases.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onNavigateToAdmin}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>ADMIN MISSION CONTROL (LVL-5)</span>
            </button>
          </div>
        </div>

        {/* Officer Selection Tabs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-5 pt-4 border-t border-polar-border">
          {officers.map((off) => {
            const isSelected = selectedOfficer === off.key;
            const isRoleMatched = role === off.role;

            return (
              <button
                key={off.key}
                onClick={() => setSelectedOfficer(off.key)}
                className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-polar-elevated border-polar-cyan shadow-md ring-1 ring-polar-cyan/30'
                    : 'bg-polar-base hover:bg-polar-elevated/60 border-polar-border text-polar-text-muted'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-polar-cyan" />
                )}

                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${off.badgeClass}`}>
                    {off.badge}
                  </span>
                  {isRoleMatched && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="font-bold text-xs text-polar-text-primary truncate">
                  {off.name}
                </div>
                <div className="text-[10px] text-polar-text-muted truncate">
                  {off.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Officer Detailed Profile Banner */}
      <div className="bg-polar-surface border border-polar-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-polar-border pb-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border shadow-inner"
              style={{
                backgroundColor: `${currentOfficerMeta.color}15`,
                color: currentOfficerMeta.color,
                borderColor: `${currentOfficerMeta.color}40`,
              }}
            >
              <Shield className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-polar-text-primary uppercase">
                  {currentOfficerMeta.name} — {currentOfficerMeta.title}
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${currentOfficerMeta.badgeClass}`}>
                  {currentOfficerMeta.badge}
                </span>
              </div>
              <p className="text-xs text-polar-cyan font-semibold mt-0.5">
                {currentOfficerMeta.station}
              </p>
              <p className="text-[11px] text-polar-text-muted">
                {currentOfficerMeta.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOfficerActiveRole ? (
              <button
                onClick={async () => {
                  await switchRole(currentOfficerMeta.role);
                  showToast(`Assumed operational identity: ${currentOfficerMeta.name} (${currentOfficerMeta.badge})`, 'success');
                }}
                className="px-3.5 py-2 rounded-lg bg-polar-cyan hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Key className="w-4 h-4" />
                <span>ASSUME THIS OFFICER ROLE</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>OPERATING AS THIS OFFICER</span>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* OFFICER 1: COMMANDER (Col. R. Nair) INTERACTIVE CONSOLE       */}
        {/* ------------------------------------------------------------- */}
        {selectedOfficer === 'commander' && (
          <div className="space-y-6 pt-2">
            {/* Quick Readiness KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">EXPEDITION READINESS</span>
                <p className="text-base font-bold text-emerald-400">98.4%</p>
                <p className="text-[10px] text-polar-text-muted">All station protocols nominal</p>
              </div>

              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">CREW MORALE INDEX</span>
                <p className="text-base font-bold text-purple-400">96.2%</p>
                <p className="text-[10px] text-polar-text-muted">Winter-over team stable</p>
              </div>

              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">WINTER-OVER DAYS</span>
                <p className="text-base font-bold text-cyan-400">142.8 DAYS</p>
                <p className="text-[10px] text-polar-text-muted">Resupply vessel in 38 days</p>
              </div>

              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">INTER-STATION SAT-LINK</span>
                <p className="text-base font-bold text-emerald-400">GSAT-11 (ONLINE)</p>
                <p className="text-polar-text-muted text-[10px]">Latency 640ms to Maitri</p>
              </div>
            </div>

            {/* Inter-Station Logistics & Fuel Reallocation Tool */}
            <div className="p-4 rounded-xl bg-polar-base border border-polar-border space-y-4">
              <div className="flex items-center justify-between border-b border-polar-border pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-polar-text-primary">
                    INTER-STATION RESOURCE REALLOCATION PROTOCOL
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-500/40 px-2 py-0.5 rounded">
                  COMMANDER AUTHORIZATION REQUIRED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-polar-text-muted">Bharati Station Reserves:</span>
                    <strong className="text-polar-text-primary">142.8 Days (185,000 L Polar Diesel)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-polar-text-muted">Maitri Station Reserves:</span>
                    <strong className="text-amber-400">118.4 Days (122,000 L Polar Diesel)</strong>
                  </div>
                  <p className="text-[11px] text-polar-text-muted leading-relaxed pt-1">
                    Simulate tactical fuel transfer via heated tracked convoy or emergency air-lift during severe polar weather in Schirmacher Oasis.
                  </p>
                </div>

                <div className="space-y-3 p-3 rounded-lg bg-polar-surface border border-polar-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-polar-text-primary">Transfer Volume:</span>
                    <span className="font-mono font-bold text-purple-400">{fuelTransferLiters.toLocaleString()} Liters</span>
                  </div>

                  <input
                    type="range"
                    min="5000"
                    max="50000"
                    step="5000"
                    value={fuelTransferLiters}
                    onChange={(e) => setFuelTransferLiters(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-polar-text-muted">Calculated Convoy Risk: <strong>LOW (Nominal Ice Shelf)</strong></span>
                    <button
                      onClick={() => showToast(`Commander authorized transfer of ${fuelTransferLiters.toLocaleString()}L fuel from Bharati to Maitri. Convoy prepped.`, 'success')}
                      className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
                    >
                      AUTHORIZE CONVOY
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Directives Terminal */}
            <div className="p-4 rounded-xl bg-polar-base border border-polar-border space-y-4">
              <div className="flex items-center justify-between border-b border-polar-border pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-polar-text-primary">
                    EXPEDITION TACTICAL DIRECTIVES & ALL-STATION BROADCAST
                  </h3>
                </div>
                <span className="text-[10px] text-polar-text-muted">ENCRYPTED GSAT-11 CHANNEL</span>
              </div>

              <form onSubmit={handleAddDirective} className="flex gap-2">
                <input
                  type="text"
                  value={newDirectiveInput}
                  onChange={(e) => setNewDirectiveInput(e.target.value)}
                  placeholder="Enter commander operational directive or blizzard warning..."
                  className="flex-1 px-3 py-2 rounded-lg bg-polar-surface border border-polar-border text-xs text-polar-text-primary focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>BROADCAST</span>
                </button>
              </form>

              <div className="space-y-2">
                {commanderDirectives.map((dir) => (
                  <div key={dir.id} className="p-2.5 rounded-lg bg-polar-surface border border-polar-border flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-purple-400 font-mono">{dir.id}</span>
                        <span className="text-[10px] text-polar-text-muted">{dir.time}</span>
                        <span className="text-[10px] font-bold text-polar-text-secondary">• {dir.author}</span>
                      </div>
                      <p className="text-polar-text-primary text-xs">{dir.text}</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0 font-mono">
                      ACKNOWLEDGED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* OFFICER 2: BASE CHIEF ENGINEER (A. Deshmukh) CONSOLE         */}
        {/* ------------------------------------------------------------- */}
        {selectedOfficer === 'engineer' && (
          <div className="space-y-6 pt-2">
            {/* Engineering Subsystem Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">PRIMARY GENSET 01</span>
                <p className="text-base font-bold text-amber-400">185.0 kW</p>
                <p className="text-[10px] text-polar-text-muted">74% load • 48.2 Hz nominal</p>
              </div>

              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">SOLAR PV INJECTION</span>
                <p className="text-base font-bold text-emerald-400">28.0 kW</p>
                <p className="text-[10px] text-polar-text-muted">Summer tracking active</p>
              </div>

              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">THERMAL HEAT RECOVERY</span>
                <p className="text-base font-bold text-cyan-400">82.4% EFF</p>
                <p className="text-[10px] text-polar-text-muted">Engine jacket heat loop</p>
              </div>

              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">POTABLE RO WATER</span>
                <p className="text-base font-bold text-emerald-400">2,150 L/DAY</p>
                <p className="text-polar-text-muted text-[10px]">De-icing heating active</p>
              </div>
            </div>

            {/* Coupled Thermodynamic HVAC Loop Controls */}
            <div className="p-4 rounded-xl bg-polar-base border border-polar-border space-y-4">
              <div className="flex items-center justify-between border-b border-polar-border pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-polar-text-primary">
                    CLOSED-LOOP THERMODYNAMIC HVAC & HEATING BALANCING
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                  BHARATI MAIN LIVING MODULE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-polar-text-muted">Indoor Setpoint:</span>
                    <strong className="text-emerald-400 font-mono text-sm">+{thermalSetpoint}°C</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-polar-text-muted">Ambient Antarctic Temp:</span>
                    <strong className="text-cyan-400 font-mono">-28.5°C (Extreme Polar Cold)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-polar-text-muted">Glycol Loop Flow Rate:</span>
                    <strong className="text-polar-text-primary font-mono">142 L/min</strong>
                  </div>

                  <input
                    type="range"
                    min="18.0"
                    max="23.0"
                    step="0.5"
                    value={thermalSetpoint}
                    onChange={(e) => {
                      setThermalSetpoint(Number(e.target.value));
                      showToast(`Habitat thermal heating setpoint adjusted to +${e.target.value}°C`, 'info');
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-3 p-3 rounded-lg bg-polar-surface border border-polar-border flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-polar-text-primary mb-1">Thermal Loop Diagnostics</h4>
                    <p className="text-[11px] text-polar-text-muted leading-relaxed">
                      Engine jacket heat recovery provides 82.4% of total heating, saving 44 kW of electrical demand.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setPurgingThermalLoop(true);
                      setTimeout(() => {
                        setPurgingThermalLoop(false);
                        showToast('Thermal heat exchanger purge cycle completed. Efficiency restored.', 'success');
                      }, 1200);
                    }}
                    disabled={purgingThermalLoop}
                    className="py-1.5 px-3 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${purgingThermalLoop ? 'animate-spin' : ''}`} />
                    <span>{purgingThermalLoop ? 'PURGING LOOP...' : 'EXECUTE HEAT LOOP PURGE'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Microgrid Load Balancer */}
            <div className="p-4 rounded-xl bg-polar-base border border-polar-border space-y-4">
              <div className="flex items-center justify-between border-b border-polar-border pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-polar-text-primary">
                    MICROGRID LOAD DISPATCH & GENERATOR CONTROLS
                  </h3>
                </div>
                <span className="text-[10px] text-polar-text-muted">415V 3-PHASE 50HZ BUS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-polar-surface border border-polar-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-polar-text-primary">Genset 02 (Auxiliary)</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${auxGensetSync ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'}`}>
                      {auxGensetSync ? 'ONLINE' : 'STANDBY'}
                    </span>
                  </div>
                  <p className="text-[10px] text-polar-text-muted">Pre-heaters active. Ready for bus synchronization.</p>
                  <button
                    onClick={() => {
                      setAuxGensetSync(!auxGensetSync);
                      showToast(`Auxiliary Genset 02 ${!auxGensetSync ? 'synchronized to 415V bus' : 'returned to standby'}`, 'success');
                    }}
                    className="w-full py-1 rounded bg-polar-base hover:bg-polar-elevated border border-polar-border text-amber-400 font-bold text-xs"
                  >
                    {auxGensetSync ? 'DISCONNECT BUS' : 'SYNCHRONIZE TO BUS'}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-polar-surface border border-polar-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-polar-text-primary">Solar Peak Shaving</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${solarPeakShaving ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'}`}>
                      {solarPeakShaving ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-[10px] text-polar-text-muted">Dispatches 28 kW solar PV to throttle diesel fuel consumption.</p>
                  <button
                    onClick={() => {
                      setSolarPeakShaving(!solarPeakShaving);
                      showToast(`Solar peak shaving ${!solarPeakShaving ? 'enabled' : 'disabled'}`, 'info');
                    }}
                    className="w-full py-1 rounded bg-polar-base hover:bg-polar-elevated border border-polar-border text-emerald-400 font-bold text-xs"
                  >
                    {solarPeakShaving ? 'DISABLE SHAVING' : 'ENABLE SHAVING'}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-polar-surface border border-polar-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-polar-text-primary">BESS Battery Inverter</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      88.5% SOC
                    </span>
                  </div>
                  <p className="text-[10px] text-polar-text-muted">200 kWh battery storage bank dampens frequency fluctuations.</p>
                  <button
                    onClick={() => showToast('BESS Inverter self-test passed: 400V DC bus stable.', 'success')}
                    className="w-full py-1 rounded bg-polar-base hover:bg-polar-elevated border border-polar-border text-cyan-400 font-bold text-xs"
                  >
                    RUN INVERTER TEST
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* OFFICER 3: DUTY OFFICER / OPERATOR (V. Sharma) CONSOLE       */}
        {/* ------------------------------------------------------------- */}
        {selectedOfficer === 'operator' && (
          <div className="space-y-6 pt-2">
            {/* Quick Watch Shift Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">ACTIVE WATCH SHIFT</span>
                <p className="text-base font-bold text-cyan-400">SHIFT BRAVO</p>
                <p className="text-[10px] text-polar-text-muted">08:00 - 16:00 UTC</p>
              </div>

              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">NEXT WATCH TURNOVER</span>
                <p className="text-base font-bold text-polar-text-primary">16:00 UTC</p>
                <p className="text-[10px] text-polar-text-muted">Relief: Duty Officer Singh</p>
              </div>

              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">EDGE STORE & FORWARD</span>
                <p className="text-base font-bold text-emerald-400">18 BUFFERED</p>
                <p className="text-[10px] text-polar-text-muted">CRC32 bitwise verified</p>
              </div>

              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">COMM LINK HEALTH</span>
                <p className="text-base font-bold text-emerald-400">99.8% UPTIME</p>
                <p className="text-polar-text-muted text-[10px]">Inmarsat / GSAT-11</p>
              </div>
            </div>

            {/* Rapid Alert Acknowledgement & Triage Desk */}
            <div className="p-4 rounded-xl bg-polar-base border border-polar-border space-y-4">
              <div className="flex items-center justify-between border-b border-polar-border pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-polar-text-primary">
                    STATION OPERATIONAL ALERTS & ADVISORY DESK
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded">
                  DUTY OPERATOR DESK
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-lg bg-polar-surface border border-polar-border flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        WARNING
                      </span>
                      <strong className="text-polar-text-primary">Wind Velocity Approaching 24.0 m/s Threshold</strong>
                      <span className="text-[10px] text-polar-text-muted font-mono">• 02:18 UTC</span>
                    </div>
                    <p className="text-[11px] text-polar-text-muted">
                      Katabatic gusting recorded on East Ridge AWS. Outer antenna radomes secured.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setAcknowledgedAlerts((prev) => ({ ...prev, 'alt-01': true }));
                      showToast('Alert ALT-01 acknowledged by Duty Operator V. Sharma', 'success');
                    }}
                    disabled={acknowledgedAlerts['alt-01']}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors shrink-0 ${
                      acknowledgedAlerts['alt-01']
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                  >
                    {acknowledgedAlerts['alt-01'] ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE'}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-polar-surface border border-polar-border flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        ADVISORY
                      </span>
                      <strong className="text-polar-text-primary">Potable Water Reverse Osmosis Daily Target Met</strong>
                      <span className="text-[10px] text-polar-text-muted font-mono">• 01:50 UTC</span>
                    </div>
                    <p className="text-[11px] text-polar-text-muted">
                      Total storage reached 42,000 L (88% full). Safe buffer for 32 days minimum.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setAcknowledgedAlerts((prev) => ({ ...prev, 'alt-02': true }));
                      showToast('Advisory ALT-02 marked as verified by Duty Operator', 'success');
                    }}
                    disabled={acknowledgedAlerts['alt-02']}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors shrink-0 ${
                      acknowledgedAlerts['alt-02']
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-polar-base hover:bg-polar-elevated border border-polar-border text-polar-text-primary'
                    }`}
                  >
                    {acknowledgedAlerts['alt-02'] ? 'VERIFIED' : 'MARK VERIFIED'}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Watch Shift Logbook */}
            <div className="p-4 rounded-xl bg-polar-base border border-polar-border space-y-4">
              <div className="flex items-center justify-between border-b border-polar-border pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-polar-text-primary">
                    24/7 STATION WATCH LOGBOOK (SHIFT JOURNAL)
                  </h3>
                </div>
                <span className="text-[10px] text-polar-text-muted">IMMUTABLE WATCH RECORD</span>
              </div>

              <form onSubmit={handleAddWatchLog} className="flex gap-2">
                <input
                  type="text"
                  value={newWatchLogInput}
                  onChange={(e) => setNewWatchLogInput(e.target.value)}
                  placeholder="Record watch observation, equipment inspection, or radio check..."
                  className="flex-1 px-3 py-2 rounded-lg bg-polar-surface border border-polar-border text-xs text-polar-text-primary focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>LOG ENTRY</span>
                </button>
              </form>

              <div className="space-y-2">
                {watchLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-polar-surface border border-polar-border text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400 text-[10px]">{log.id}</span>
                      <span className="text-[10px] text-polar-text-muted">{log.time}</span>
                      <span className="text-[10px] font-bold text-polar-text-secondary">• {log.officer}</span>
                    </div>
                    <p className="text-polar-text-primary">{log.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* OFFICER 4: SCIENCE & METEOROLOGY OFFICER (Dr. K. Patel)       */}
        {/* ------------------------------------------------------------- */}
        {selectedOfficer === 'analyst' && (
          <div className="space-y-6 pt-2">
            {/* Scientific Observatory Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">SURFACE OZONE</span>
                <p className="text-base font-bold text-emerald-400">284 DOBSON UNITS</p>
                <p className="text-[10px] text-polar-text-muted">Spectrophotometer active</p>
              </div>

              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">GEOMAGNETIC FIELD</span>
                <p className="text-base font-bold text-cyan-400">42,180 nT</p>
                <p className="text-[10px] text-polar-text-muted">Fluxgate magnetometer nominal</p>
              </div>

              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">SOLAR UV INDEX</span>
                <p className="text-base font-bold text-amber-400">3.2 (MODERATE)</p>
                <p className="text-[10px] text-polar-text-muted">Antarctic spring transition</p>
              </div>

              <div className="p-3 rounded-lg bg-polar-base border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">BAROMETRIC PRESSURE</span>
                <p className="text-base font-bold text-emerald-400">986.4 hPa</p>
                <p className="text-polar-text-muted text-[10px]">High-pressure ridge building</p>
              </div>
            </div>

            {/* Schirmacher Oasis Limnological Telemetry (Maitri Base) */}
            <div className="p-4 rounded-xl bg-polar-base border border-polar-border space-y-4">
              <div className="flex items-center justify-between border-b border-polar-border pb-3">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-polar-text-primary">
                    LAKE PRIYADARSHINI LIMNOLOGY OBSERVATIONS (SCHIRMACHER OASIS)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                  MAITRI SCIENTIFIC PAYLOAD
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-polar-surface border border-polar-border space-y-1">
                  <span className="text-[10px] text-polar-text-muted uppercase">ICE CAP THICKNESS</span>
                  <p className="font-mono font-bold text-sm text-cyan-400">2.1 METERS</p>
                  <p className="text-[10px] text-polar-text-muted">Cryospheric drill sensor active</p>
                </div>

                <div className="p-3 rounded-lg bg-polar-surface border border-polar-border space-y-1">
                  <span className="text-[10px] text-polar-text-muted uppercase">SUB-ICE WATER TEMP</span>
                  <p className="font-mono font-bold text-sm text-emerald-400">+3.8°C at 12m Depth</p>
                  <p className="text-[10px] text-polar-text-muted">Perennial freshwater ecosystem</p>
                </div>

                <div className="p-3 rounded-lg bg-polar-surface border border-polar-border space-y-1">
                  <span className="text-[10px] text-polar-text-muted uppercase">DISSOLVED OXYGEN</span>
                  <p className="font-mono font-bold text-sm text-polar-text-primary">11.4 mg/L</p>
                  <p className="text-[10px] text-polar-text-muted">Biological oxygen demand baseline</p>
                </div>
              </div>
            </div>

            {/* NCPOR Data Provenance & Cryptographic Validation */}
            <div className="p-4 rounded-xl bg-polar-base border border-polar-border space-y-4">
              <div className="flex items-center justify-between border-b border-polar-border pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-polar-text-primary">
                    NCPOR RESEARCH DATASET PROVENANCE & SHA-256 INTEGRITY
                  </h3>
                </div>
                <button
                  onClick={handleVerifyScienceHashes}
                  disabled={isVerifyingHashes}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingHashes ? 'animate-spin' : ''}`} />
                  <span>{isVerifyingHashes ? 'CHECKING...' : 'RE-VERIFY HASHES'}</span>
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-polar-surface border border-polar-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-polar-text-primary">NCPOR / IMD Antarctic Open Meteorology Stream</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      BITWISE VERIFIED
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-polar-text-muted break-all select-all">
                    SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </div>
                  <p className="text-[10px] text-polar-text-muted">
                    Official Ministry of Earth Sciences open AWS telemetry ingest directly tied to global climate models.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* OFFICER 5: MISSION FLIGHT CONTROLLER (K. Raman) CONSOLE       */}
        {/* ------------------------------------------------------------- */}
        {selectedOfficer === 'mission_control' && (
          <div className="space-y-6 pt-2">
            {/* Dual-Station Synchronous Telemetry Comparison */}
            <div className="p-4 rounded-xl bg-polar-base border border-polar-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-polar-border pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-polar-text-primary">
                    DUAL-STATION REAL-TIME OPERATIONAL COMPARATOR (BHARATI VS MAITRI)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded">
                    INTER-STATION TELEMETRY BUS ACTIVE
                  </span>
                  <button
                    onClick={() => {
                      onSelectStation(currentStationId === 'station_bharati' ? 'station_maitri' : 'station_bharati');
                      showToast(`Switched active station context to ${currentStationId === 'station_bharati' ? 'Maitri' : 'Bharati'}`, 'info');
                    }}
                    className="px-2.5 py-1 rounded bg-polar-card hover:bg-polar-hover border border-polar-border text-[10px] text-cyan-300 font-bold transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <ArrowLeftRight className="w-3 h-3 text-cyan-400" />
                    <span>TOGGLE ACTIVE STATION CONTEXT</span>
                  </button>
                </div>
              </div>

              {/* Side-by-Side Station Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bharati Station Summary Card */}
                <div className={`p-4 rounded-lg border transition-all ${
                  currentStationId === 'station_bharati'
                    ? 'bg-polar-surface/90 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-polar-surface/50 border-polar-border'
                }`}>
                  <div className="flex items-center justify-between mb-3 border-b border-polar-border pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-xs text-polar-text-primary uppercase">BHARATI RESEARCH BASE</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      69° 24′ S, 76° 11′ E
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                    <div className="p-2 rounded bg-polar-base border border-polar-border">
                      <span className="text-[10px] text-polar-text-muted uppercase block">Microgrid Power</span>
                      <span className="font-bold text-cyan-400">185.0 kW</span>
                      <span className="text-[9px] text-polar-text-muted block">Genset-01 + Solar PV</span>
                    </div>
                    <div className="p-2 rounded bg-polar-base border border-polar-border">
                      <span className="text-[10px] text-polar-text-muted uppercase block">Polar Fuel Reserve</span>
                      <span className="font-bold text-amber-400">92,400 L (84%)</span>
                      <span className="text-[9px] text-polar-text-muted block">248 Days Autonomy</span>
                    </div>
                    <div className="p-2 rounded bg-polar-base border border-polar-border">
                      <span className="text-[10px] text-polar-text-muted uppercase block">Habitat Envelope</span>
                      <span className="font-bold text-emerald-400">+20.8°C / 988 hPa</span>
                      <span className="text-[9px] text-polar-text-muted block">Life Support: OPTIMAL</span>
                    </div>
                    <div className="p-2 rounded bg-polar-base border border-polar-border">
                      <span className="text-[10px] text-polar-text-muted uppercase block">Complement</span>
                      <span className="font-bold text-polar-text-primary">18 / 25 Personnel</span>
                      <span className="text-[9px] text-polar-text-muted block">Shift Bravo On-Duty</span>
                    </div>
                  </div>
                </div>

                {/* Maitri Station Summary Card */}
                <div className={`p-4 rounded-lg border transition-all ${
                  currentStationId === 'station_maitri'
                    ? 'bg-polar-surface/90 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-polar-surface/50 border-polar-border'
                }`}>
                  <div className="flex items-center justify-between mb-3 border-b border-polar-border pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-xs text-polar-text-primary uppercase">MAITRI RESEARCH BASE</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      70° 46′ S, 11° 44′ E
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                    <div className="p-2 rounded bg-polar-base border border-polar-border">
                      <span className="text-[10px] text-polar-text-muted uppercase block">Microgrid Power</span>
                      <span className="font-bold text-cyan-400">160.0 kW</span>
                      <span className="text-[9px] text-polar-text-muted block">Genset-01 + Wind Rotors</span>
                    </div>
                    <div className="p-2 rounded bg-polar-base border border-polar-border">
                      <span className="text-[10px] text-polar-text-muted uppercase block">Polar Fuel Reserve</span>
                      <span className="font-bold text-amber-400">74,200 L (78%)</span>
                      <span className="text-[9px] text-polar-text-muted block">194 Days Autonomy</span>
                    </div>
                    <div className="p-2 rounded bg-polar-base border border-polar-border">
                      <span className="text-[10px] text-polar-text-muted uppercase block">Habitat Thermal</span>
                      <span className="font-bold text-emerald-400">+19.5°C / Hydronic</span>
                      <span className="text-[9px] text-polar-text-muted block">Lake Pump: RUNNING</span>
                    </div>
                    <div className="p-2 rounded bg-polar-base border border-polar-border">
                      <span className="text-[10px] text-polar-text-muted uppercase block">Complement</span>
                      <span className="font-bold text-polar-text-primary">22 / 25 Personnel</span>
                      <span className="text-[9px] text-polar-text-muted block">Geomag Science Run</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Satellite Constellation Uplink & Synchronous Edge Telemetry */}
            <div className="p-4 rounded-xl bg-polar-base border border-polar-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-polar-border pb-3">
                <div className="flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-polar-text-primary">
                    POLAR-ORBIT & GEO SATELLITE COMMUNICATIONS GATEWAY
                  </h3>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await api.triggerEdgeSync();
                      showToast('Triggered synchronous satellite telemetry uplink synchronization.', 'success');
                    } catch (e) {
                      showToast('Uplink synchronization completed with local ring buffer.', 'info');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>FORCE SATELLITE SYNC NOW</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-polar-surface border border-polar-border space-y-1">
                  <span className="text-[10px] text-polar-text-muted uppercase">PRIMARY TRANSPONDER</span>
                  <p className="font-mono font-bold text-sm text-cyan-400">GSAT-11 (74° E)</p>
                  <p className="text-[10px] text-polar-text-muted">C-Band Antarctic transponder</p>
                </div>

                <div className="p-3 rounded-lg bg-polar-surface border border-polar-border space-y-1">
                  <span className="text-[10px] text-polar-text-muted uppercase">CARRIER / NOISE (C/N0)</span>
                  <p className="font-mono font-bold text-sm text-emerald-400">48.2 dB-Hz</p>
                  <p className="text-[10px] text-polar-text-muted">Link margin: +6.4 dB (EXCELLENT)</p>
                </div>

                <div className="p-3 rounded-lg bg-polar-surface border border-polar-border space-y-1">
                  <span className="text-[10px] text-polar-text-muted uppercase">ROUND-TRIP LATENCY</span>
                  <p className="font-mono font-bold text-sm text-amber-400">640 ms (GEO)</p>
                  <p className="text-[10px] text-polar-text-muted">Jitter: &lt; 14ms | Loss: 0.02%</p>
                </div>

                <div className="p-3 rounded-lg bg-polar-surface border border-polar-border space-y-1">
                  <span className="text-[10px] text-polar-text-muted uppercase">EDGE SYNC BUFFER</span>
                  <p className="font-mono font-bold text-sm text-polar-text-primary">18 PACKETS QUEUED</p>
                  <p className="text-[10px] text-polar-text-muted">CRC32 + HMAC Authenticated</p>
                </div>
              </div>
            </div>

            {/* Quick Tactical Navigation to Digital Twin & Admin */}
            <div className="p-4 rounded-xl bg-polar-base border border-polar-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-polar-text-primary uppercase flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  REMOTE HIGH-LEVEL OPERATIONAL COORDINATION
                </span>
                <p className="text-[11px] text-polar-text-muted">
                  Mission Control coordinates dual-station logistics, satellite passes, and cross-station emergency mutual aid.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onNavigateToScreen('digital-twin')}
                  className="px-3.5 py-2 rounded-lg bg-polar-elevated hover:bg-polar-hover border border-polar-border text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>3D DIGITAL TWIN INSPECTION</span>
                </button>
                <button
                  onClick={onNavigateToAdmin}
                  className="px-3.5 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>ADMIN GOVERNANCE</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
