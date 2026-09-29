import React, { useState, useEffect, useMemo } from 'react';
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
  SlidersHorizontal,
  ShieldAlert,
  Search,
  RefreshCw,
  Anchor,
  Calendar,
  Layers,
  CheckCircle2,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp
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
  const [simulating, setSimulating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [rationingMode, setRationingMode] = useState(false);
  const [showManifest, setShowManifest] = useState(false);

  useEffect(() => {
    loadData();
  }, [stationId]);

  useEffect(() => {
    runDelaySimulation(delayDays);
  }, [delayDays, stationId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itData, shData] = await Promise.all([
        api.getInventory(stationId),
        api.getShipments(stationId),
      ]);
      setItems(Array.isArray(itData) ? itData : []);
      setShipments(Array.isArray(shData) ? shData : []);
    } catch (e) {
      console.error('Failed to load logistics data:', e);
    } finally {
      setLoading(false);
    }
  };

  const runDelaySimulation = async (days: number) => {
    setSimulating(true);
    try {
      const res = await api.simulateLogisticsDelay(stationId, days);
      if (res && Array.isArray(res.projections) && res.projections.length > 0) {
        setDelayProjections(res.projections);
      }
    } catch (e) {
      console.error('Failed delay simulation:', e);
    } finally {
      setSimulating(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toUpperCase()) {
      case 'FUEL': return Flame;
      case 'FOOD': return Package;
      case 'MEDICAL': return HeartPulse;
      case 'SPARE_PARTS': return Wrench;
      case 'WATER': return Droplet;
      default: return Package;
    }
  };

  // Reconcile items with delayProjections defensively
  const reconciledItems = useMemo(() => {
    const burnMultiplier = rationingMode ? 0.8 : 1.0;

    // Build map from delayProjections for quick lookup
    const projMap = new Map<string, any>();
    delayProjections.forEach((p) => {
      const k1 = p.item_id || p.id;
      const k2 = p.sku;
      if (k1) projMap.set(String(k1), p);
      if (k2) projMap.set(String(k2), p);
    });

    const sourceItems = items.length > 0 ? items : delayProjections;

    return sourceItems.map((item, idx) => {
      const itemId = item.item_id || item.id || `item_${idx}`;
      const sku = item.sku || `SKU-${idx}`;
      const proj = projMap.get(String(itemId)) || projMap.get(String(sku)) || {};

      const name = item.name || proj.name || 'Unnamed Inventory Resource';
      const category = (item.category || proj.category || 'FUEL').toUpperCase();
      const unit = item.unit || proj.unit || 'Units';
      const currentStock = Number(item.current_stock ?? proj.current_stock ?? 0);
      const rawBurn = Number(item.daily_burn_rate ?? proj.daily_burn_rate ?? 1);
      const dailyBurn = Math.round(rawBurn * burnMultiplier * 100) / 100;
      const minReserve = Number(item.minimum_reserve ?? proj.minimum_reserve ?? 0);

      // Days remaining calculated with rationing
      const nominalDays = dailyBurn > 0 ? Math.round((currentStock / dailyBurn) * 10) / 10 : 999;
      const effectiveDelay = Math.max(0, delayDays);
      const simulatedDays = Math.max(0, Math.round((nominalDays - effectiveDelay) * 10) / 10);

      // Evaluate shortage risk
      const reserveDays = dailyBurn > 0 ? minReserve / dailyBurn : 0;
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      let contingency = proj.recommended_contingency || 'Operational runway nominal.';

      if (simulatedDays <= reserveDays * 0.7 || simulatedDays < 10) {
        riskLevel = 'CRITICAL';
        contingency = 'CRITICAL: Initiate Tier-3 emergency rationing; shed non-vital pod heating and request emergency resupply.';
      } else if (simulatedDays <= reserveDays * 1.2 || simulatedDays < 25) {
        riskLevel = 'HIGH';
        contingency = 'HIGH: Initiate Tier-2 conservation; reduce auxiliary generator runtime.';
      } else if (simulatedDays <= reserveDays * 1.8 || simulatedDays < 45) {
        riskLevel = 'MEDIUM';
        contingency = 'MEDIUM: Close monitoring required; check seal integrity and reduce secondary heating loops.';
      }

      const storageLocation = item.storage_location || proj.storage_location || 'Central Depot';

      return {
        id: itemId,
        sku,
        name,
        category,
        unit,
        current_stock: currentStock,
        daily_burn_rate: dailyBurn,
        minimum_reserve: minReserve,
        nominal_days: nominalDays,
        simulated_days_remaining: simulatedDays,
        shortage_risk_level: riskLevel,
        storage_location: storageLocation,
        recommended_contingency: contingency,
        reserve_ratio: minReserve > 0 ? Math.min(100, Math.round((currentStock / minReserve) * 100)) : 100,
      };
    });
  }, [items, delayProjections, delayDays, rationingMode]);

  // Filter items by category & search query
  const filteredItems = useMemo(() => {
    return reconciledItems.filter((it) => {
      const matchCat = selectedCategory === 'ALL' || it.category === selectedCategory;
      const matchQuery = !searchQuery || 
        it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.storage_location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [reconciledItems, selectedCategory, searchQuery]);

  // Overall KPIs
  const kpis = useMemo(() => {
    const totalCount = reconciledItems.length;
    const criticalCount = reconciledItems.filter(i => i.shortage_risk_level === 'CRITICAL').length;
    const highCount = reconciledItems.filter(i => i.shortage_risk_level === 'HIGH').length;
    const minRunway = reconciledItems.length > 0 
      ? Math.min(...reconciledItems.map(i => i.simulated_days_remaining))
      : 0;

    return {
      totalCount,
      criticalCount,
      highCount,
      minRunway: isFinite(minRunway) ? minRunway : 0,
    };
  }, [reconciledItems]);

  const activeShipment = shipments[0] || {
    vessel_name: stationId === 'station_bharati' ? 'MV Vasiliy Golovnin' : 'MV Ivan Papanin',
    voyage_number: stationId === 'station_bharati' ? 'V44-IND-ANTARCTIC' : 'V44-MAITRI-EXP',
    departure_port: 'Cape Town, South Africa',
    destination_station_id: stationId,
    scheduled_departure: '2026-11-20T08:00:00Z',
    scheduled_arrival: '2026-12-15T14:00:00Z',
    delay_days: delayDays,
    status: delayDays > 15 ? 'CRITICAL_DELAY' : delayDays > 0 ? 'DELAYED' : 'EN_ROUTE',
    cargo_manifest: [
      { item: 'Polar Diesel / ATF Grade A-1', quantity: 180000, unit: 'Liters' },
      { item: 'Cold-Climate Dry & Frozen Provisions', quantity: 12000, unit: 'kg' },
      { item: 'Scientific Instrumentation & Genset Overhaul Modules', quantity: 45, unit: 'Crates' },
    ],
  };

  const stationName = stationId === 'station_bharati' 
    ? 'Bharati Station (Larsemann Hills)' 
    : 'Maitri Station (Schirmacher Oasis)';

  const categories = [
    { key: 'ALL', label: 'All Resources', count: reconciledItems.length },
    { key: 'FUEL', label: 'Fuel & Diesel', count: reconciledItems.filter(i => i.category === 'FUEL').length },
    { key: 'FOOD', label: 'Provisions & Rations', count: reconciledItems.filter(i => i.category === 'FOOD').length },
    { key: 'MEDICAL', label: 'Medical Supplies', count: reconciledItems.filter(i => i.category === 'MEDICAL').length },
    { key: 'SPARE_PARTS', label: 'Spare Parts & Tools', count: reconciledItems.filter(i => i.category === 'SPARE_PARTS').length },
    { key: 'WATER', label: 'Potable Water', count: reconciledItems.filter(i => i.category === 'WATER').length },
  ];

  if (loading && items.length === 0) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <LoadingSkeleton label="CALCULATING ANTARCTIC EXPEDITION LOGISTICS RUNWAYS..." rows={5} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-polar-card border border-polar-border p-4 rounded-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-polar-cyan font-bold uppercase tracking-wider">
            <Truck className="w-4 h-4 text-polar-cyan" />
            <span>ANTARCTIC EXPEDITION SUPPLY CHAIN & INVENTORY FORECASTING</span>
            <span className="text-polar-border">|</span>
            <span className="text-polar-text-secondary">{stationName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-polar-text-primary tracking-tight mt-1 font-sans">
            LOGISTICS INTELLIGENCE & RESUPPLY VESSEL TRACKING
          </h2>
          <p className="text-xs text-polar-text-secondary mt-0.5 font-sans">
            Deterministic stock burn depletion integration, pack-ice voyage delay simulations, and reserve margin alarms
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadData()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-polar-elevated border border-polar-border hover:border-polar-cyan/50 text-xs text-polar-text-secondary hover:text-polar-cyan transition"
            title="Refresh inventory telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-polar-cyan' : ''}`} />
            <span>Sync</span>
          </button>
          <DataFreshness isLive={true} />
          <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-polar-card border border-polar-border p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs text-polar-text-muted">
            <span>TRACKED RESOURCES</span>
            <Layers className="w-4 h-4 text-polar-cyan" />
          </div>
          <div className="text-2xl font-bold text-polar-text-primary mt-1">
            {kpis.totalCount} <span className="text-xs font-normal text-polar-text-muted">Items</span>
          </div>
          <div className="text-[11px] text-emerald-500 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> All categories monitored
          </div>
        </div>

        <div className="bg-polar-card border border-polar-border p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs text-polar-text-muted">
            <span>MINIMUM RUNWAY</span>
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className={`text-2xl font-bold mt-1 ${kpis.minRunway < 20 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
            {kpis.minRunway} <span className="text-xs font-normal text-polar-text-muted">Days</span>
          </div>
          <div className="text-[11px] text-polar-text-secondary mt-1">
            Shortest remaining stock duration
          </div>
        </div>

        <div className="bg-polar-card border border-polar-border p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs text-polar-text-muted">
            <span>SHORTAGE RISK</span>
            <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-bold mt-1">
            {kpis.criticalCount > 0 ? (
              <span className="text-rose-500 dark:text-rose-400">{kpis.criticalCount} Critical</span>
            ) : kpis.highCount > 0 ? (
              <span className="text-amber-500 dark:text-amber-400">{kpis.highCount} Elevated</span>
            ) : (
              <span className="text-emerald-500 dark:text-emerald-400">0 Critical</span>
            )}
          </div>
          <div className="text-[11px] text-polar-text-secondary mt-1">
            {kpis.criticalCount + kpis.highCount} items require protocol attention
          </div>
        </div>

        <div className="bg-polar-card border border-polar-border p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs text-polar-text-muted">
            <span>RESUPPLY VOYAGE ETA</span>
            <Ship className="w-4 h-4 text-polar-cyan" />
          </div>
          <div className="text-2xl font-bold text-polar-cyan mt-1">
            {78 + delayDays} <span className="text-xs font-normal text-polar-text-muted">Days</span>
          </div>
          <div className="text-[11px] text-polar-text-secondary mt-1">
            {delayDays > 0 ? `+${delayDays}d pack ice delay simulated` : 'Voyage on scheduled timeline'}
          </div>
        </div>
      </div>

      {/* Resupply Vessel Tracker Card */}
      <div className="bg-polar-card border border-polar-border p-5 rounded-lg space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-polar-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-polar-elevated border border-polar-border flex items-center justify-center text-polar-cyan shrink-0">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold text-polar-text-primary">{activeShipment.vessel_name}</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                  {activeShipment.voyage_number}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-polar-cyan/10 text-polar-cyan border border-polar-cyan/30">
                  ICEBREAKER ESCORT: ACTIVE
                </span>
              </div>
              <p className="text-xs text-polar-text-secondary mt-1 font-sans">
                Voyage: {activeShipment.departure_port} → {stationName} • Transit Status:{' '}
                <span className={delayDays > 0 ? 'text-amber-500 dark:text-amber-400 font-semibold' : 'text-emerald-500 dark:text-emerald-400 font-semibold'}>
                  {delayDays > 15 ? 'CRITICAL DELAY' : delayDays > 0 ? `DELAYED (+${delayDays}d)` : 'ON SCHEDULE'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-polar-text-muted block text-[10px]">SCHEDULED ARRIVAL</span>
              <div className="font-bold text-polar-text-primary text-sm">15 DEC 2026</div>
            </div>
            <div className="border-l border-polar-border pl-6">
              <span className="text-polar-text-muted block text-[10px]">PROJECTED ARRIVAL</span>
              <div className={`font-bold text-sm ${delayDays > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-polar-cyan'}`}>
                {78 + delayDays} Days Remaining
              </div>
            </div>
          </div>
        </div>

        {/* Cargo Manifest Toggle */}
        <div className="flex items-center justify-between text-xs bg-polar-elevated px-3 py-2 rounded border border-polar-border">
          <div className="flex items-center gap-2 text-polar-text-secondary">
            <Anchor className="w-3.5 h-3.5 text-polar-cyan" />
            <span>Vessel Cargo Manifest: {activeShipment.cargo_manifest?.length || 3} Major Modules Scheduled</span>
          </div>
          <button
            onClick={() => setShowManifest(!showManifest)}
            className="flex items-center gap-1 text-polar-cyan hover:opacity-80 text-xs font-semibold"
          >
            <span>{showManifest ? 'Hide Manifest' : 'View Manifest'}</span>
            {showManifest ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expanded Cargo Manifest */}
        {showManifest && (
          <div className="bg-polar-elevated p-3 rounded-lg border border-polar-border grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs animate-fadeIn">
            {activeShipment.cargo_manifest?.map((cargo: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded bg-polar-card border border-polar-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-polar-text-primary">{cargo.item}</div>
                  <div className="text-[10px] text-polar-text-muted">Expedition Resupply</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-polar-cyan">
                    {cargo.quantity?.toLocaleString()} <span className="text-[10px] text-polar-text-muted">{cargo.unit}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    CONFIRMED
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Interactive Shipment Delay What-If Slider */}
        <div className="bg-polar-elevated p-4 rounded-lg border border-polar-border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-semibold">
              <SlidersHorizontal className="w-4 h-4" />
              <span>WHAT-IF SIMULATION: SEA ICE PACK & BLIZZARD DELAY</span>
              {simulating && <span className="text-[10px] text-polar-cyan animate-pulse">(Simulating...)</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRationingMode(!rationingMode)}
                className={`px-2.5 py-1 rounded text-xs border transition ${
                  rationingMode
                    ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 font-bold'
                    : 'bg-polar-card border-polar-border text-polar-text-secondary hover:text-polar-text-primary'
                }`}
                title="Toggle 20% emergency rationing reduction across all burn rates"
              >
                {rationingMode ? '★ RATIONING ACTIVE (-20% BURN)' : 'RATIONING PROTOCOL (OFF)'}
              </button>
              <span className="px-2.5 py-1 rounded bg-polar-card border border-polar-border text-polar-text-primary font-bold">
                {delayDays === 0 ? 'ON SCHEDULE (+0 DAYS)' : `DELAYED BY +${delayDays} DAYS`}
              </span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={delayDays}
            onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
            className="w-full h-2 bg-polar-base dark:bg-polar-surface rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-polar-border"
          />

          <div className="flex justify-between text-[10px] text-polar-text-muted font-mono">
            <span>0 Days (Nominal Arrival)</span>
            <span>+10 Days (Pack Ice Drag)</span>
            <span>+20 Days (Severe Ice Pressure)</span>
            <span>+30 Days (Critical Season Lock)</span>
          </div>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-polar-card p-1.5 rounded-lg border border-polar-border">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded text-xs transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-polar-cyan/15 text-polar-cyan border border-polar-cyan/50 font-bold'
                    : 'text-polar-text-secondary hover:text-polar-text-primary hover:bg-polar-elevated'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${isActive ? 'bg-polar-cyan/25 text-polar-text-primary' : 'bg-polar-elevated text-polar-text-muted'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Filter */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-polar-text-muted" />
          <input
            type="text"
            placeholder="Search resources, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-polar-card border border-polar-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-polar-text-primary placeholder-polar-text-muted focus:outline-none focus:border-polar-cyan/60 font-mono"
          />
        </div>
      </div>

      {/* Inventory Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-polar-card border border-polar-border rounded-lg p-10 text-center text-polar-text-muted text-xs">
          <Package className="w-8 h-8 text-polar-text-muted mx-auto mb-2 opacity-50" />
          <p>No inventory items found matching &quot;{searchQuery || selectedCategory}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item, idx) => {
            const Icon = getCategoryIcon(item.category);
            const isCritical = item.shortage_risk_level === 'CRITICAL';
            const isHigh = item.shortage_risk_level === 'HIGH';
            const isMedium = item.shortage_risk_level === 'MEDIUM';

            return (
              <div
                key={item.id || item.sku || idx}
                className={`border rounded-lg p-4 transition-all shadow-sm flex flex-col justify-between ${
                  isCritical ? 'border-rose-500/60 bg-rose-500/10' :
                  isHigh ? 'border-amber-500/50 bg-amber-500/10' :
                  isMedium ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-polar-border bg-polar-card'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded bg-polar-elevated border ${
                        isCritical ? 'border-rose-500/50 text-rose-500 dark:text-rose-400' :
                        isHigh ? 'border-amber-500/50 text-amber-500 dark:text-amber-400' : 'border-polar-border text-polar-cyan'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-polar-text-primary line-clamp-1">{item.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-polar-text-muted uppercase">{item.category}</span>
                          <span className="text-polar-border text-[10px]">•</span>
                          <span className="text-[10px] text-polar-cyan font-mono">{item.sku}</span>
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={item.shortage_risk_level} size="sm" showIcon={false} />
                  </div>

                  {/* Stock Metrics Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs border-t border-polar-border/70 pt-3">
                    <div>
                      <span className="text-polar-text-muted text-[10px] block">CURRENT STOCK</span>
                      <div className="font-bold text-polar-text-primary mt-0.5">
                        {(item.current_stock ?? 0).toLocaleString()} <span className="text-[10px] text-polar-text-muted">{item.unit}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-polar-text-muted text-[10px] block">DAILY BURN RATE</span>
                      <div className="font-bold text-polar-text-primary mt-0.5">
                        {item.daily_burn_rate ?? 0} <span className="text-[10px] text-polar-text-muted">{item.unit}/day</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-polar-text-muted text-[10px] block">POST-DELAY RUNWAY</span>
                      <div className={`font-bold mt-0.5 text-sm ${
                        isCritical ? 'text-rose-500 dark:text-rose-400 animate-pulse' :
                        isHigh ? 'text-amber-500 dark:text-amber-400' :
                        isMedium ? 'text-yellow-600 dark:text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {item.simulated_days_remaining} Days
                      </div>
                    </div>
                    <div>
                      <span className="text-polar-text-muted text-[10px] block">MINIMUM RESERVE</span>
                      <div className="text-polar-text-secondary mt-0.5">
                        {(item.minimum_reserve ?? 0).toLocaleString()} {item.unit}
                      </div>
                    </div>
                  </div>

                  {/* Visual Runway Depletion Bar */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex justify-between text-[10px] text-polar-text-muted">
                      <span>Reserve Buffer</span>
                      <span className={isCritical ? 'text-rose-500 dark:text-rose-400' : isHigh ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {item.reserve_ratio}% of threshold
                      </span>
                    </div>
                    <div className="w-full bg-polar-elevated h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isCritical ? 'bg-rose-500' :
                          isHigh ? 'bg-amber-500' :
                          isMedium ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(8, item.reserve_ratio))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer: Storage Location & Contingency Rationale */}
                <div className="mt-3.5 pt-2.5 border-t border-polar-border/70 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-polar-text-muted">
                    <span>STORAGE LOCATION</span>
                    <span className="text-polar-text-secondary font-sans">{item.storage_location}</span>
                  </div>

                  {(isCritical || isHigh) && (
                    <div className={`p-2 rounded text-[10px] flex items-start gap-1.5 ${
                      isCritical ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                    }`}>
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{item.recommended_contingency}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
