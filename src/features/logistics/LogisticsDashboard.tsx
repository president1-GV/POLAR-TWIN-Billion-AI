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
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataFreshness } from '../../components/ui/DataFreshness';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

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

  if (loading && items.length === 0) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <LoadingSkeleton label="CALCULATING LOGISTICS RUNWAYS..." rows={4} />
      </div>
    );
  }

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

  const stationName = stationId === 'station_bharati' ? 'Bharati Station' : 'Maitri Station';

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1220] border border-[#1E293B] p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>ANTARCTIC EXPEDITION SUPPLY CHAIN & INVENTORY FORECASTING</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{stationName}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1 font-sans">
            LOGISTICS INTELLIGENCE & RESUPPLY VESSEL TRACKING
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <DataFreshness isLive={true} />
          <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
        </div>
      </div>

      {/* Shipment Tracker Card */}
      <div className="bg-[#0B1220] border border-[#1E293B] p-5 rounded-lg space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#111827] border border-[#1E293B] flex items-center justify-center text-cyan-400">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">MV Vasiliy Golovnin</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-500/40">
                  44th Indian Scientific Expedition to Antarctica (ISEA)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Route: Cape Town, RSA → Larsemann Hills (Bharati) • Icebreaker Escort: ACTIVE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500">Scheduled Arrival:</span>
              <div className="font-bold text-white">15 DEC 2026</div>
            </div>
            <div className="border-l border-[#1E293B] pl-4">
              <span className="text-slate-500">Days to Arrival:</span>
              <div className="font-bold text-cyan-400">78 Days</div>
            </div>
          </div>
        </div>

        {/* Interactive Shipment Delay What-If Slider */}
        <div className="bg-[#111827] p-4 rounded-lg border border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <SlidersHorizontal className="w-4 h-4" />
              <span>WHAT-IF SIMULATION: SEA ICE PACK & BLIZZARD DELAY</span>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-[#0B1220] border border-[#1E293B] text-white font-bold">
              {delayDays === 0 ? 'ON SCHEDULE (+0 DAYS)' : `DELAYED BY +${delayDays} DAYS`}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="30"
            value={delayDays}
            onChange={(e) => setDelayDays(parseInt(e.target.value))}
            className="w-full h-1.5 bg-[#0B1220] rounded appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex justify-between text-[10px] text-slate-500">
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
              className={`bg-[#0B1220] border rounded-lg p-4 transition-all shadow-sm ${
                isCritical ? 'border-rose-500/60 bg-rose-950/20' :
                isHigh ? 'border-amber-500/50 bg-amber-950/15' : 'border-[#1E293B]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-[#111827] border border-[#1E293B] text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <span className="text-[10px] text-slate-500 uppercase">{item.category}</span>
                  </div>
                </div>

                <StatusBadge status={item.shortage_risk_level} size="sm" showIcon={false} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-[#1E293B]/70 pt-2.5">
                <div>
                  <span className="text-slate-500 text-[10px]">CURRENT STOCK</span>
                  <div className="font-bold text-white mt-0.5">
                    {item.current_stock.toLocaleString()} <span className="text-[10px] text-slate-400">{item.unit}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">DAILY BURN RATE</span>
                  <div className="font-bold text-slate-300 mt-0.5">
                    {item.daily_burn_rate} <span className="text-[10px] text-slate-400">{item.unit}/day</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">POST-DELAY DAYS REMAINING</span>
                  <div className={`font-bold mt-0.5 ${
                    isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {item.simulated_days_remaining} Days
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">MIN BUFFER</span>
                  <div className="text-slate-400 mt-0.5">
                    {item.minimum_reserve.toLocaleString()} {item.unit}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
