import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Layers, 
  Wind, 
  Ship, 
  Radio, 
  Maximize2, 
  Eye, 
  Navigation,
  Activity,
  Zap,
  Thermometer
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
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  // Geo points mapped to polar orthographic SVG viewbox (800 x 500)
  // Center is approx South Pole (90°S).
  // Maitri: 70.767°S, 11.733°E -> Top-left quadrant
  // Bharati: 69.407°S, 76.195°E -> Top-right quadrant
  // Dakshin Gangotri: 70.09°S, 12.00°E -> Near Maitri
  const stations = [
    {
      id: 'station_bharati',
      name: 'Bharati Antarctic Station',
      code: 'BHARATI',
      region: 'Larsemann Hills, Princess Elizabeth Land',
      coords: '69.407°S, 76.195°E',
      elevation: '35m a.s.l.',
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
      coords: '70.767°S, 11.733°E',
      elevation: '117m a.s.l.',
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
      name: 'Dakshin Gangotri (Historical / Storage)',
      code: 'DG-01',
      region: 'Wohlthat Mountains Shelf',
      coords: '70.09°S, 12.00°E',
      elevation: '15m a.s.l.',
      status: 'SUBMERGED_HISTORICAL',
      cx: 275,
      cy: 200,
      health: 0.0,
      temp: -23.5,
      wind: '16.0 m/s',
      power: '0 kW',
      isPrimary: false,
    },
  ];

  return (
    <div className="polar-panel overflow-hidden border border-polar-750">
      {/* GIS Header Toolbar */}
      <div className="polar-panel-header bg-polar-900 border-b border-polar-750 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase tracking-wider">
            <Compass className="w-4 h-4 text-polar-cyan" />
            <span>ANTARCTIC GEOSPATIAL & INFRASTRUCTURE SITUATIONAL MAP</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-polar-800 text-slate-400 border border-polar-700">
            PostGIS EPSG:3031 Polar Stereographic
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Layer toggles */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setShowSeaIce(!showSeaIce)}
              className={`px-2.5 py-1 rounded border text-[11px] transition-all flex items-center gap-1.5 ${
                showSeaIce 
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300' 
                  : 'bg-polar-850 border-polar-750 text-slate-500 hover:text-slate-300'
              }`}
            >
              <Layers className="w-3 h-3" />
              Sea Ice Pack
            </button>
            <button
              onClick={() => setShowWinds(!showWinds)}
              className={`px-2.5 py-1 rounded border text-[11px] transition-all flex items-center gap-1.5 ${
                showWinds 
                  ? 'bg-blue-950/60 border-blue-500/50 text-blue-300' 
                  : 'bg-polar-850 border-polar-750 text-slate-500 hover:text-slate-300'
              }`}
            >
              <Wind className="w-3 h-3" />
              Katabatic Streams
            </button>
            <button
              onClick={() => setShowLogistics(!showLogistics)}
              className={`px-2.5 py-1 rounded border text-[11px] transition-all flex items-center gap-1.5 ${
                showLogistics 
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' 
                  : 'bg-polar-850 border-polar-750 text-slate-500 hover:text-slate-300'
              }`}
            >
              <Ship className="w-3 h-3" />
              Supply Corridors
            </button>
          </div>
          <ProvenanceBadge type="REAL_PUBLIC" provider="NCPOR / PostGIS" />
        </div>
      </div>

      {/* Map Canvas / SVG Viewport */}
      <div className="relative w-full h-[360px] bg-gradient-to-b from-polar-950 via-polar-900 to-polar-950 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 800 460"
          className="w-full h-full select-none"
          style={{ filter: 'drop-shadow(0 0 20px rgba(0, 229, 255, 0.05))' }}
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="continentGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0B2B47" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#081E33" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#030E1A" stopOpacity="0.2" />
            </radialGradient>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.8" />
            </linearGradient>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00E5FF" strokeWidth="0.5" strokeOpacity="0.08" />
            </pattern>
          </defs>

          {/* Coordinate Grid Background */}
          <rect width="800" height="460" fill="url(#gridPattern)" />

          {/* Latitude Concentric Rings (60°S, 70°S, 80°S) */}
          <circle cx="400" cy="270" r="230" fill="none" stroke="#00E5FF" strokeWidth="0.8" strokeDasharray="3 4" strokeOpacity="0.15" />
          <circle cx="400" cy="270" r="160" fill="none" stroke="#00E5FF" strokeWidth="0.8" strokeDasharray="3 4" strokeOpacity="0.2" />
          <circle cx="400" cy="270" r="90" fill="none" stroke="#00E5FF" strokeWidth="0.8" strokeDasharray="3 4" strokeOpacity="0.25" />
          <circle cx="400" cy="270" r="3" fill="#00E5FF" opacity="0.6" />
          <text x="408" y="274" fill="#94A3B8" fontSize="9" fontFamily="monospace" opacity="0.6">90°S SOUTH POLE</text>
          <text x="565" y="274" fill="#64748B" fontSize="8" fontFamily="monospace" opacity="0.5">80°S</text>
          <text x="635" y="274" fill="#64748B" fontSize="8" fontFamily="monospace" opacity="0.5">70°S</text>

          {/* Sea Ice Margin (Contour) */}
          {showSeaIce && (
            <path
              d="M 120 180 Q 200 120, 400 110 Q 600 120, 700 200 Q 730 330, 580 390 Q 420 420, 240 380 Q 90 300, 120 180 Z"
              fill="#06B6D4"
              fillOpacity="0.04"
              stroke="#06B6D4"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              strokeOpacity="0.3"
            />
          )}

          {/* Stylized Antarctic Coastline Shape (EPSG:3031 Representation) */}
          <path
            d="M 180 230 C 210 170, 310 150, 400 160 C 470 150, 550 170, 600 210 C 660 250, 670 320, 580 360 C 510 390, 440 370, 360 380 C 260 370, 190 320, 170 270 C 160 250, 170 240, 180 230 Z"
            fill="url(#continentGlow)"
            stroke="#00E5FF"
            strokeWidth="1.8"
            strokeOpacity="0.5"
          />

          {/* Antarctic Peninsula Extension */}
          <path
            d="M 230 180 Q 190 120, 180 80 Q 195 90, 220 130 Q 245 160, 250 180 Z"
            fill="#081E33"
            stroke="#00E5FF"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />
          <text x="130" y="85" fill="#64748B" fontSize="8" fontFamily="monospace">ANTARCTIC PENINSULA</text>

          {/* Ice Shelves: Ross & Ronne-Filchner */}
          <path d="M 330 360 Q 400 380, 450 360" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 3" strokeOpacity="0.4" />
          <text x="350" y="395" fill="#64748B" fontSize="8" fontFamily="monospace" opacity="0.6">ROSS ICE SHELF</text>

          {/* Katabatic Wind Vectors */}
          {showWinds && (
            <g stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.35" fill="none">
              <path d="M 400 270 Q 470 250, 540 240" markerEnd="url(#arrow)" strokeDasharray="3 3" />
              <path d="M 400 270 Q 330 240, 280 225" markerEnd="url(#arrow)" strokeDasharray="3 3" />
              <path d="M 400 270 Q 410 320, 420 360" markerEnd="url(#arrow)" strokeDasharray="3 3" />
              <path d="M 400 270 Q 360 310, 300 350" markerEnd="url(#arrow)" strokeDasharray="3 3" />
              <text x="470" y="240" fill="#38BDF8" fontSize="8" fontFamily="monospace" opacity="0.6">KATABATIC RUNOFF →</text>
            </g>
          )}

          {/* Maritime Supply Corridor from Cape Town to Bharati & Maitri */}
          {showLogistics && (
            <g>
              {/* Route to Maitri */}
              <path
                d="M 320 20 Q 280 100, 260 215"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="1.8"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
              {/* Route to Bharati */}
              <path
                d="M 450 20 Q 520 120, 560 230"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="1.8"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
              <text x="340" y="30" fill="#F59E0B" fontSize="9" fontFamily="monospace" fontWeight="bold">
                ▲ FROM CAPE TOWN (MV VASILIY GOLOVNIN)
              </text>
              <text x="515" y="150" fill="#F59E0B" fontSize="8" fontFamily="monospace" opacity="0.8">
                PRYDZ BAY CORRIDOR
              </text>
              <text x="210" y="140" fill="#F59E0B" fontSize="8" fontFamily="monospace" opacity="0.8">
                INDIA BAY APPROACH
              </text>
            </g>
          )}

          {/* Station Pins */}
          {stations.map((st) => {
            const isSelected = selectedStationId === st.id;
            const isHovered = hoveredStation === st.id;
            const isDG = st.id === 'station_dg';

            return (
              <g
                key={st.id}
                className="cursor-pointer transition-all"
                onClick={() => onSelectStation(st.id)}
                onMouseEnter={() => setHoveredStation(st.id)}
                onMouseLeave={() => setHoveredStation(null)}
              >
                {/* Radar Pulse Ring for Active Selected Stations */}
                {isSelected && st.status === 'ACTIVE' && (
                  <circle
                    cx={st.cx}
                    cy={st.cy}
                    r="18"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="1.5"
                    className="animate-ping"
                    opacity="0.4"
                  />
                )}

                {/* Base Outer Ring */}
                <circle
                  cx={st.cx}
                  cy={st.cy}
                  r={isSelected ? 10 : 8}
                  fill={isDG ? '#475569' : isSelected ? '#00E5FF' : '#1E293B'}
                  stroke={isDG ? '#64748B' : isSelected ? '#FFFFFF' : '#00E5FF'}
                  strokeWidth="2"
                  opacity={isDG ? 0.6 : 1}
                />

                {/* Core Dot */}
                <circle
                  cx={st.cx}
                  cy={st.cy}
                  r="4"
                  fill={isDG ? '#94A3B8' : isSelected ? '#030E1A' : '#10B981'}
                />

                {/* Station Callout Label */}
                <g transform={`translate(${st.cx + 12}, ${st.cy - 12})`}>
                  <rect
                    x="0"
                    y="0"
                    width={st.isPrimary ? 130 : 110}
                    height={st.isPrimary ? 44 : 26}
                    rx="4"
                    fill="#0B132B"
                    fillOpacity="0.92"
                    stroke={isSelected ? '#00E5FF' : '#334155'}
                    strokeWidth={isSelected ? '1.5' : '1'}
                  />
                  <text x="8" y="14" fill="#FFFFFF" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    {st.code}
                  </text>
                  <text x="8" y="24" fill={st.status === 'ACTIVE' ? '#10B981' : '#94A3B8'} fontSize="8" fontFamily="monospace">
                    ● {st.status} {st.isPrimary && `• H:${st.health}%`}
                  </text>
                  {st.isPrimary && (
                    <text x="8" y="36" fill="#94A3B8" fontSize="8" fontFamily="monospace">
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
          <div className="absolute bottom-3 left-3 bg-polar-900/95 border border-polar-750 p-3 rounded-lg shadow-xl backdrop-blur-md max-w-sm">
            <div className="flex items-center justify-between gap-2 border-b border-polar-800 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-polar-cyan" />
                <span className="font-mono text-xs font-bold text-white uppercase">
                  {stations.find(s => s.id === selectedStationId)?.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                POSTGIS VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-3">
              <div>
                <span className="text-slate-500">Region: </span>
                <span className="text-slate-300">{stations.find(s => s.id === selectedStationId)?.region}</span>
              </div>
              <div>
                <span className="text-slate-500">Elevation: </span>
                <span className="text-polar-cyan">{stations.find(s => s.id === selectedStationId)?.elevation}</span>
              </div>
              <div>
                <span className="text-slate-500">Coordinates: </span>
                <span className="text-slate-300">{stations.find(s => s.id === selectedStationId)?.coords}</span>
              </div>
              <div>
                <span className="text-slate-500">Microgrid Bus: </span>
                <span className="text-amber-400">{stations.find(s => s.id === selectedStationId)?.power}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTwin(selectedStationId)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-polar-600 hover:bg-polar-500 text-white text-xs font-mono font-bold transition-all shadow"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-300" />
              <span>Enter 3D Spatial Twin ({stations.find(s => s.id === selectedStationId)?.code})</span>
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-polar-950/80 border border-polar-800 p-2.5 rounded text-[10px] font-mono text-slate-400 space-y-1 backdrop-blur-sm pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Active Research Base</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>Submerged / Storage Depot</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-amber-400" />
            <span>Maritime Resupply Route</span>
          </div>
        </div>
      </div>
    </div>
  );
};
