import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Layers, 
  Wind, 
  Ship, 
  Navigation,
  Plus,
  Minus,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';

interface Props {
  selectedStationId?: string;
  onSelectStation: (stationId: string) => void;
  onNavigateToTwin: (stationId: string) => void;
}

export const AntarcticGISMap: React.FC<Props> = ({
  selectedStationId = 'station_bharati',
  onSelectStation,
  onNavigateToTwin,
}) => {
  const [showSeaIce, setShowSeaIce] = useState(true);
  const [showWinds, setShowWinds] = useState(true);
  const [showLogistics, setShowLogistics] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const stations = [
    {
      id: 'station_bharati',
      name: 'Bharati Antarctic Station',
      code: 'BHARATI',
      region: 'Larsemann Hills, Princess Elizabeth Land',
      coords: '69.408° S, 76.187° E',
      elevation: '35 m a.s.l.',
      status: 'ACTIVE',
      cx: 560,
      cy: 230,
      health: 96.5,
      temp: -18.4,
      wind: '11.2 m/s',
      power: '185 kW',
      isPrimary: true,
    },
    {
      id: 'station_maitri',
      name: 'Maitri Antarctic Station',
      code: 'MAITRI',
      region: 'Schirmacher Oasis, Queen Maud Land',
      coords: '70.766° S, 11.740° E',
      elevation: '117 m a.s.l.',
      status: 'ACTIVE',
      cx: 260,
      cy: 215,
      health: 88.2,
      temp: -22.1,
      wind: '14.8 m/s',
      power: '160 kW',
      isPrimary: true,
    },
    {
      id: 'station_dg',
      name: 'Dakshin Gangotri (Historical / Storage Depot)',
      code: 'DG-01',
      region: 'Wohlthat Mountains Ice Shelf',
      coords: '70.090° S, 12.000° E',
      elevation: '15 m a.s.l.',
      status: 'SUBMERGED_DEPOT',
      cx: 275,
      cy: 200,
      health: 0.0,
      temp: -23.5,
      wind: '16.0 m/s',
      power: '0 kW',
      isPrimary: false,
    },
  ];

  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.6, z + 0.15));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.85, z - 0.15));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="bg-[#0B1220] border-t border-[#1E293B] overflow-hidden font-mono">
      {/* GIS Header Toolbar */}
      <div className="bg-[#111827] border-b border-[#1E293B] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white uppercase tracking-wider">
            POLAR GEOSPATIAL OPERATIONS VIEW
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#030712] text-slate-400 border border-[#1E293B]">
            EPSG:3031 Polar Stereographic
          </span>
        </div>

        {/* Layer Toggles & Zoom Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              onClick={() => setShowSeaIce(!showSeaIce)}
              className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                showSeaIce 
                  ? 'bg-sky-950/60 border-sky-500/40 text-sky-300' 
                  : 'bg-[#030712] border-[#1E293B] text-slate-500 hover:text-slate-300'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Sea Ice Pack</span>
            </button>
            <button
              onClick={() => setShowWinds(!showWinds)}
              className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                showWinds 
                  ? 'bg-blue-950/60 border-blue-500/40 text-blue-300' 
                  : 'bg-[#030712] border-[#1E293B] text-slate-500 hover:text-slate-300'
              }`}
            >
              <Wind className="w-3 h-3" />
              <span>Katabatic Flow</span>
            </button>
            <button
              onClick={() => setShowLogistics(!showLogistics)}
              className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                showLogistics 
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300' 
                  : 'bg-[#030712] border-[#1E293B] text-slate-500 hover:text-slate-300'
              }`}
            >
              <Ship className="w-3 h-3" />
              <span>Supply Corridors</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-[#030712] rounded border border-[#1E293B] p-0.5">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 text-slate-400 hover:text-white transition-colors border-l border-r border-[#1E293B]"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="p-1 text-slate-400 hover:text-white transition-colors text-[10px] px-1.5"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <ProvenanceBadge type="REAL_PUBLIC" provider="NCPOR / PostGIS" />
        </div>
      </div>

      {/* Map Canvas / SVG Viewport */}
      <div className="relative w-full h-[380px] bg-[#030712] flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 800 460"
          className="w-full h-full select-none transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Scientific Continent Shader */}
            <radialGradient id="continentGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0E1B31" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#0B1628" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#030712" stopOpacity="0.3" />
            </radialGradient>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.75" />
            </linearGradient>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.5" strokeOpacity="0.35" />
            </pattern>
          </defs>

          {/* Coordinate Grid Background */}
          <rect width="800" height="460" fill="url(#gridPattern)" />

          {/* Latitude Concentric Rings (60°S, 70°S, 80°S) */}
          <circle cx="400" cy="270" r="230" fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="3 4" strokeOpacity="0.4" />
          <circle cx="400" cy="270" r="160" fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="3 4" strokeOpacity="0.5" />
          <circle cx="400" cy="270" r="90" fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="3 4" strokeOpacity="0.6" />
          <circle cx="400" cy="270" r="3" fill="#38BDF8" opacity="0.6" />
          <text x="408" y="274" fill="#94A3B8" fontSize="8" fontFamily="monospace" opacity="0.7">90°S SOUTH POLE</text>
          <text x="565" y="274" fill="#64748B" fontSize="8" fontFamily="monospace" opacity="0.6">80°S</text>
          <text x="635" y="274" fill="#64748B" fontSize="8" fontFamily="monospace" opacity="0.6">70°S</text>

          {/* Sea Ice Margin */}
          {showSeaIce && (
            <path
              d="M 120 180 Q 200 120, 400 110 Q 600 120, 700 200 Q 730 330, 580 390 Q 420 420, 240 380 Q 90 300, 120 180 Z"
              fill="#0284C7"
              fillOpacity="0.03"
              stroke="#0284C7"
              strokeWidth="1"
              strokeDasharray="4 4"
              strokeOpacity="0.25"
            />
          )}

          {/* Antarctic Continent Outline (EPSG:3031 Representation) */}
          <path
            d="M 180 230 C 210 170, 310 150, 400 160 C 470 150, 550 170, 600 210 C 660 250, 670 320, 580 360 C 510 390, 440 370, 360 380 C 260 370, 190 320, 170 270 C 160 250, 170 240, 180 230 Z"
            fill="url(#continentGlow)"
            stroke="#38BDF8"
            strokeWidth="1.2"
            strokeOpacity="0.45"
          />

          {/* Antarctic Peninsula Extension */}
          <path
            d="M 230 180 Q 190 120, 180 80 Q 195 90, 220 130 Q 245 160, 250 180 Z"
            fill="#0B1628"
            stroke="#38BDF8"
            strokeWidth="1"
            strokeOpacity="0.35"
          />
          <text x="130" y="85" fill="#64748B" fontSize="8" fontFamily="monospace">ANTARCTIC PENINSULA</text>

          {/* Ice Shelves */}
          <path d="M 330 360 Q 400 380, 450 360" fill="none" stroke="#60A5FA" strokeWidth="1" strokeDasharray="2 3" strokeOpacity="0.3" />
          <text x="350" y="395" fill="#64748B" fontSize="8" fontFamily="monospace" opacity="0.6">ROSS ICE SHELF</text>

          {/* Katabatic Wind Vectors */}
          {showWinds && (
            <g stroke="#38BDF8" strokeWidth="0.8" strokeOpacity="0.3" fill="none">
              <path d="M 400 270 Q 470 250, 540 240" strokeDasharray="3 3" />
              <path d="M 400 270 Q 330 240, 280 225" strokeDasharray="3 3" />
              <path d="M 400 270 Q 410 320, 420 360" strokeDasharray="3 3" />
              <path d="M 400 270 Q 360 310, 300 350" strokeDasharray="3 3" />
              <text x="470" y="240" fill="#38BDF8" fontSize="8" fontFamily="monospace" opacity="0.5">KATABATIC DRAINAGE →</text>
            </g>
          )}

          {/* Maritime Supply Corridors */}
          {showLogistics && (
            <g>
              <path
                d="M 320 20 Q 280 100, 260 215"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <path
                d="M 450 20 Q 520 120, 560 230"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text x="340" y="30" fill="#F59E0B" fontSize="8" fontFamily="monospace" opacity="0.85">
                ▲ RESUPPLY CORRIDOR (CAPE TOWN / GOA)
              </text>
            </g>
          )}

          {/* Interactive Stations */}
          {stations.map((st) => {
            const isSelected = selectedStationId === st.id;
            const isDG = st.id === 'station_dg';

            return (
              <g
                key={st.id}
                className="cursor-pointer transition-all"
                onClick={() => onSelectStation(st.id)}
              >
                {/* Highlight Circle on Selection */}
                {isSelected && (
                  <circle
                    cx={st.cx}
                    cy={st.cy}
                    r="12"
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                    className="animate-spin"
                    style={{ transformOrigin: `${st.cx}px ${st.cy}px`, animationDuration: '8s' }}
                  />
                )}

                {/* Core Dot */}
                <circle
                  cx={st.cx}
                  cy={st.cy}
                  r={isSelected ? '5' : '4'}
                  fill={isDG ? '#64748B' : isSelected ? '#22D3EE' : '#10B981'}
                  stroke="#030712"
                  strokeWidth="1.5"
                />

                {/* Station Callout Label */}
                <g transform={`translate(${st.cx + 10}, ${st.cy - 12})`}>
                  <rect
                    x="0"
                    y="0"
                    width={st.isPrimary ? 120 : 100}
                    height={st.isPrimary ? 38 : 22}
                    rx="3"
                    fill="#0B1220"
                    fillOpacity="0.95"
                    stroke={isSelected ? '#22D3EE' : '#1E293B'}
                    strokeWidth={isSelected ? '1.2' : '1'}
                  />
                  <text x="7" y="13" fill="#F8FAFC" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    {st.code}
                  </text>
                  <text x="7" y="23" fill={st.status === 'ACTIVE' ? '#10B981' : '#64748B'} fontSize="8" fontFamily="monospace">
                    ● {st.status === 'ACTIVE' ? 'OPERATIONAL' : 'SUBMERGED'}
                  </text>
                  {st.isPrimary && (
                    <text x="7" y="33" fill="#94A3B8" fontSize="8" fontFamily="monospace">
                      {st.temp}°C | {st.power}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Selected Station Floating Quick-Action Card */}
        {selectedStationId && (
          <div className="absolute bottom-3 left-3 bg-[#0B1220]/95 border border-[#1E293B] p-3 rounded-lg shadow-xl backdrop-blur-md max-w-sm font-mono text-xs">
            <div className="flex items-center justify-between gap-2 border-b border-[#1E293B] pb-2 mb-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-white uppercase">
                  {stations.find((s) => s.id === selectedStationId)?.name}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-3 text-slate-300">
              <div>
                <span className="text-slate-500">Region: </span>
                <span className="truncate block">{stations.find((s) => s.id === selectedStationId)?.region.split(',')[0]}</span>
              </div>
              <div>
                <span className="text-slate-500">Elevation: </span>
                <span>{stations.find((s) => s.id === selectedStationId)?.elevation}</span>
              </div>
              <div>
                <span className="text-slate-500">Coordinates: </span>
                <span>{stations.find((s) => s.id === selectedStationId)?.coords}</span>
              </div>
              <div>
                <span className="text-slate-500">Microgrid Bus: </span>
                <span className="text-amber-400">{stations.find((s) => s.id === selectedStationId)?.power}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTwin(selectedStationId)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-sky-950/70 hover:bg-sky-900/70 border border-sky-500/40 text-sky-200 text-xs font-semibold transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Launch 3D Spatial Twin ({stations.find((s) => s.id === selectedStationId)?.code})</span>
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-[#0B1220]/90 border border-[#1E293B] p-2 rounded text-[10px] font-mono text-slate-400 space-y-1 backdrop-blur-sm pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Active Research Station</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Submerged / Storage Depot</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 bg-amber-400" />
            <span>Maritime Resupply Corridor</span>
          </div>
        </div>
      </div>
    </div>
  );
};
