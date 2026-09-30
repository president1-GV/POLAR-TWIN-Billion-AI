// ============================================================================
// POLAR-TWIN: Mission Control Command Center
// Operational Authority: CROSS_STATION_OPS (Level 4 Flight Control Clearance)
// Header: POLAR-TWIN MISSION CONTROL
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Radio, 
  Layers, 
  Activity, 
  Zap, 
  Flame, 
  Droplet, 
  Fuel, 
  Clock, 
  RefreshCw, 
  Map as MapIcon, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AntarcticGISMap } from './AntarcticGISMap';
import { TelemetryMetric } from '../../components/ui/TelemetryMetric';
import { DataFreshness } from '../../components/ui/DataFreshness';
import { CommandButton } from '../../components/ui/CommandButton';
import polarTwinIcon from '../../assets/polar-twin-icon.png';

interface Props {
  currentStationId?: string;
  onNavigate: (screen: any) => void;
  onSelectStation: (stationId: string) => void;
}

export const MissionControlCommandCenter: React.FC<Props> = ({
  currentStationId = 'station_bharati',
  onNavigate,
  onSelectStation
}) => {
  const { user, operationalAuthority, stationScope } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [edgeStatus, setEdgeStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [syncTriggering, setSyncTriggering] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [stationList, edge] = await Promise.all([
        api.getStations(),
        api.getEdgeStatus()
      ]);
      setStations(stationList);
      setEdgeStatus(edge);
      setLastSyncTime(new Date());
    } catch (e) {
      console.error('Mission control load failure:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerCrossStationSync = async () => {
    setSyncTriggering(true);
    try {
      await api.triggerEdgeSync();
      setSyncFeedback('Edge synchronization packets successfully replayed to NCPOR central cloud.');
      setTimeout(() => setSyncFeedback(null), 4000);
      await loadData();
    } catch (e) {
      console.error('Sync failed:', e);
    } finally {
      setSyncTriggering(false);
    }
  };

  const bharati = stations.find(s => s.id === 'station_bharati') || { name: 'Bharati', health_score: 97.4 };
  const maitri = stations.find(s => s.id === 'station_maitri') || { name: 'Maitri', health_score: 88.2 };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1720px] mx-auto font-sans select-none overflow-hidden">
      {/* 1. HERO BAR: POLAR-TWIN MISSION CONTROL */}
      <section className="bg-polar-card border border-blue-500/40 rounded-md p-4 sm:p-5 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <img 
              src={polarTwinIcon} 
              alt="POLAR-TWIN" 
              className="w-16 h-16 rounded-full object-contain border-2 border-blue-500/60 shadow-xl ring-4 ring-blue-500/20 shrink-0 hidden sm:block bg-polar-bg/40 p-0.5" 
            />
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-blue-400 font-bold uppercase tracking-widest mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>NCPOR HEADQUARTERS • CONTINENTAL COMMAND</span>
                <span className="text-polar-border">|</span>
                <span className="bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                  AUTHORITY: {operationalAuthority}
                </span>
                <span className="text-polar-border">|</span>
                <span className="text-polar-text-muted">SCOPE: DUAL STATION (BHARATI & MAITRI)</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-polar-text-primary tracking-tight font-mono">
                POLAR-TWIN MISSION CONTROL
              </h1>
              <p className="text-xs text-polar-text-secondary mt-1 max-w-3xl leading-relaxed font-mono">
                Continental flight control, dual-station operational synchronization, and satellite store-and-forward edge oversight.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <CommandButton
              variant="secondary"
              icon={Radio}
              onClick={() => onNavigate('edge')}
            >
              Edge Gateway
            </CommandButton>
            <CommandButton
              variant="primary"
              icon={Globe}
              onClick={handleTriggerCrossStationSync}
              disabled={syncTriggering}
            >
              {syncTriggering ? 'Syncing...' : 'Trigger Edge Sync'}
            </CommandButton>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-polar-border grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Data Freshness:</span>
            <DataFreshness lastUpdatedTimestamp={lastSyncTime} isLive={true} />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Flight Controller:</span>
            <span className="text-blue-400 font-bold truncate">{user?.display_name || 'K. Raman (Flight Controller)'}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Tracked Stations:</span>
            <span className="text-emerald-400 font-bold truncate">2 Active Bases (100% Telemetry)</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Constellation Link:</span>
            <span className="text-polar-text-primary font-bold truncate">GSAT-11 / Inmarsat BGAN</span>
          </div>
        </div>
      </section>

      {syncFeedback && (
        <div className="p-3 bg-blue-500/15 border border-blue-500/40 rounded text-blue-300 font-mono text-xs flex items-center justify-between">
          <span>{syncFeedback}</span>
          <span className="text-[10px] uppercase font-bold text-blue-400">EDGE SYNC COMPLETE</span>
        </div>
      )}

      {/* 2. DUAL-STATION TELEMETRY COMPARISON STRIP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono">
        {/* Bharati Station Telemetry Card */}
        <div 
          onClick={() => onSelectStation('station_bharati')}
          className={`p-4 rounded-md border transition-all cursor-pointer ${
            currentStationId === 'station_bharati' 
              ? 'bg-polar-card border-cyan-500/60 ring-1 ring-cyan-500/30' 
              : 'bg-polar-base border-polar-border hover:border-polar-border-active'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-polar-border">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="font-bold text-sm text-polar-text-primary">BHARATI STATION</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
              69.408° S, 76.187° E
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-polar-text-muted block">SYSTEM HEALTH</span>
              <span className="text-base font-bold text-emerald-400">97.4% NOMINAL</span>
            </div>
            <div>
              <span className="text-[10px] text-polar-text-muted block">MICROGRID DEMAND</span>
              <span className="text-base font-bold text-amber-400">395.0 kW</span>
            </div>
            <div>
              <span className="text-[10px] text-polar-text-muted block">POLAR FUEL RUNWAY</span>
              <span className="text-base font-bold text-cyan-400">186.3 DAYS</span>
            </div>
            <div>
              <span className="text-[10px] text-polar-text-muted block">AMBIENT WEATHER</span>
              <span className="text-base font-bold text-purple-400">-24.2°C • 18.4 m/s</span>
            </div>
          </div>
        </div>

        {/* Maitri Station Telemetry Card */}
        <div 
          onClick={() => onSelectStation('station_maitri')}
          className={`p-4 rounded-md border transition-all cursor-pointer ${
            currentStationId === 'station_maitri' 
              ? 'bg-polar-card border-cyan-500/60 ring-1 ring-cyan-500/30' 
              : 'bg-polar-base border-polar-border hover:border-polar-border-active'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-polar-border">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="font-bold text-sm text-polar-text-primary">MAITRI STATION</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
              70.766° S, 11.740° E
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-polar-text-muted block">SYSTEM HEALTH</span>
              <span className="text-base font-bold text-emerald-400">88.2% OPERATIONAL</span>
            </div>
            <div>
              <span className="text-[10px] text-polar-text-muted block">MICROGRID DEMAND</span>
              <span className="text-base font-bold text-amber-400">160.0 kW</span>
            </div>
            <div>
              <span className="text-[10px] text-polar-text-muted block">POLAR FUEL RUNWAY</span>
              <span className="text-base font-bold text-cyan-400">142.8 DAYS</span>
            </div>
            <div>
              <span className="text-[10px] text-polar-text-muted block">AMBIENT WEATHER</span>
              <span className="text-base font-bold text-purple-400">-28.5°C • 21.0 m/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONTINENTAL ANTARCTIC GEOGRAPHIC MAP */}
      <section className="bg-polar-card border border-polar-border rounded-md p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-polar-border">
          <div className="flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-polar-text-primary font-mono uppercase tracking-wide">
              Continental Geospatial Overview (NCPOR GIS Registry)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-polar-text-muted">
            EPSG:3031 ANTARCTIC POLAR STEREOGRAPHIC
          </span>
        </div>
        <div className="h-96 rounded overflow-hidden border border-polar-border">
          <AntarcticGISMap 
            selectedStationId={currentStationId}
            onSelectStation={onSelectStation}
            onNavigateToTwin={() => onNavigate('digital-twin')}
          />
        </div>
      </section>
    </div>
  );
};
