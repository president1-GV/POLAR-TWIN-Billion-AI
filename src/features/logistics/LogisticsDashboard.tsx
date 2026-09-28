import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Flame, 
  Package, 
  HeartPulse, 
  Wrench, 
  Droplet, 
  AlertTriangle, 
  Ship, 
  Clock, 
  SlidersHorizontal 
} from 'lucide-react';
import { api } from '../../services/api';
import { LogisticsItem, Shipment } from '../../types';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';

interface Props {
  stationId: string;
}

export const LogisticsDashboard: React.FC<Props> = ({ stationId }) => {
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [delayDays, setDelayDays] = useState(0);
  const [delayProjections, setDelayProjections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [stationId]);

  useEffect(() => {
    runDelaySimulation(delayDays);
  }, [delayDays, stationId]);

  const loadData = async () => {
    try {
      const [itData, shData] = await Promise.all([
        api.getInventory(stationId),
        api.getShipments(stationId),
      ]);
      setItems(itData);
      setShipments(shData);
    } catch (e) {
      console.error('Failed to load logistics data:', e);
    } finally {
      setLoading(false);
    }
  };

  const runDelaySimulation = async (days: number) => {
    try {
      const res = await api.simulateLogisticsDelay(stationId, days);
      setDelayProjections(res.projections || []);
    } catch (e) {
      console.error('Failed delay simulation:', e);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'FUEL': return Flame;
      case 'FOOD': return Package;
      case 'MEDICAL': return HeartPulse;
      case 'SPARE_PARTS': return Wrench;
      case 'WATER': return Droplet;
      default: return Package;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-polar-cyan font-bold uppercase tracking-wider">
            <Truck className="w-4 h-4 text-polar-cyan" />
            <span>ANTARCTIC EXPEDITION SUPPLY CHAIN & INVENTORY FORECASTING</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            LOGISTICS INTELLIGENCE & RESUPPLY VESSEL TRACKING
          </h2>
        </div>
        <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
      </div>

      {/* Shipment Tracker Card */}
      <div className="polar-panel p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-polar-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-polar-800 border border-polar-700 flex items-center justify-center text-polar-cyan">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">MV Vasiliy Golovnin</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  44th Indian Scientific Expedition to Antarctica
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Route: Cape Town, RSA → Larsemann Hills (Bharati) • Icebreaker Escort: Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500">Scheduled Arrival:</span>
              <div className="font-bold text-white">15 DEC 2026</div>
            </div>
            <div className="border-l border-polar-800 pl-4">
              <span className="text-slate-500">Days to Arrival:</span>
              <div className="font-bold text-polar-cyan">78 Days</div>
            </div>
          </div>
        </div>

        {/* Interactive Shipment Delay What-If Slider */}
        <div className="bg-polar-950/80 p-4 rounded-lg border border-polar-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <SlidersHorizontal className="w-4 h-4" />
              <span>WHAT-IF SIMULATION: SEA ICE PACK & BLIZZARD DELAY</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-polar-900 border border-polar-750 text-white font-bold">
              {delayDays === 0 ? 'ON SCHEDULE (+0 DAYS)' : `DELAYED BY +${delayDays} DAYS`}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="30"
            value={delayDays}
            onChange={(e) => setDelayDays(parseInt(e.target.value))}
            className="w-full h-2 bg-polar-800 rounded-lg appearance-none cursor-pointer accent-polar-cyan"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0 Days (On-Time Resupply)</span>
            <span>+10 Days (Pack Ice Pressure)</span>
            <span>+20 Days (Severe Ice Trapping)</span>
            <span>+30 Days (Critical Season Delay)</span>
          </div>
        </div>
      </div>

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {delayProjections.map((item) => {
          const Icon = getCategoryIcon(item.category);
          const isCritical = item.shortage_risk_level === 'CRITICAL';
          const isHigh = item.shortage_risk_level === 'HIGH';

          return (
            <div
              key={item.item_id}
              className={`polar-panel p-4 transition-all ${
                isCritical ? 'border-red-500/80 bg-red-950/20' :
                isHigh ? 'border-amber-500/60 bg-amber-950/10' : 'border-polar-750'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-polar-800 border border-polar-700 text-polar-cyan">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500">{item.category}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isCritical ? 'bg-red-950 text-red-400 border border-red-500/50 animate-pulse' :
                  isHigh ? 'bg-amber-950 text-amber-400 border border-amber-500/50' :
                  'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {item.shortage_risk_level} RISK
                </span>
              </div>

              {/* Numbers */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono bg-polar-950 p-2.5 rounded border border-polar-800">
                <div>
                  <span className="text-[10px] text-slate-500">CURRENT STOCK</span>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {item.current_stock.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">DAYS REMAINING</span>
                  <div className="font-bold text-polar-cyan text-sm mt-0.5">
                    {item.days_remaining_nominal} Days
                  </div>
                </div>
              </div>

              {/* Rationale & Emergency Reserve */}
              <div className="mt-3 pt-2 border-t border-polar-800 text-[11px] font-mono text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Burn Rate: <strong>{item.daily_burn_rate}/day</strong></span>
                  <span>Min Reserve: <strong>{item.minimum_reserve}</strong></span>
                </div>
                <div className={`mt-2 text-[10px] p-2 rounded ${
                  isCritical ? 'bg-red-950/60 text-red-300 border border-red-900' :
                  isHigh ? 'bg-amber-950/60 text-amber-300 border border-amber-900' :
                  'bg-polar-950 text-slate-400'
                }`}>
                  {item.evidence_rationale}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
