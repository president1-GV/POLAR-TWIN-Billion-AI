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
  ExternalLink,
  Radio,
  Plane
} from 'lucide-react';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { useTheme } from '../../context/ThemeContext';

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [showSeaIce, setShowSeaIce] = useState(true);
  const [showWinds, setShowWinds] = useState(true);
  const [showLogistics, setShowLogistics] = useState(true);
  const [showSatellite, setShowSatellite] = useState(true);
  const [showInfrastructure, setShowInfrastructure] = useState(false);
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
      name: 'Dakshin Gangotri (Historical / Submerged Depot)',
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

  const activeSt = stations.find(s => s.id === selectedStationId) || stations[0];

  return (
    <div className="bg-polar-base border-t border-polar-border overflow-hidden font-mono select-none">
      {/* GIS Header Toolbar */}
      <div className="bg-polar-surface border-b border-polar-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Compass className="w-4 h-4 text-polar-cyan" />
          <span className="font-bold text-polar-text-primary uppercase tracking-wider text-[11px]">
            POLAR GEOSPATIAL INTELLIGENCE PLATFORM
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-polar-card text-polar-text-secondary border border-polar-border">
            EPSG:3031 Polar Stereographic
          </span>
        </div>

        {/* Layer Toggles & Zoom Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
            <button
              onClick={() => setShowSeaIce(!showSeaIce)}
              className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 text-[10px] ${
                showSeaIce 
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-600 dark:text-sky-300 font-semibold' 
                  : 'bg-polar-card border-polar-border text-polar-text-muted hover:text-polar-text-primary'
              }`}
            >
              <Layers className="w-2.5 h-2.5" />
              <span>SEA ICE</span>
            </button>
            <button
              onClick={() => setShowWinds(!showWinds)}
              className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 text-[10px] ${
                showWinds 
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-600 dark:text-blue-300 font-semibold' 
                  : 'bg-polar-card border-polar-border text-polar-text-muted hover:text-polar-text-primary'
              }`}
            >
              <Wind className="w-2.5 h-2.5" />
              <span>KATABATIC</span>
            </button>
            <button
              onClick={() => setShowLogistics(!showLogistics)}
              className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 text-[10px] ${
                showLogistics 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-300 font-semibold' 
                  : 'bg-polar-card border-polar-border text-polar-text-muted hover:text-polar-text-primary'
              }`}
            >
              <Ship className="w-2.5 h-2.5" />
              <span>SUPPLY</span>
            </button>
            <button
              onClick={() => setShowSatellite(!showSatellite)}
              className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 text-[10px] ${
                showSatellite 
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-600 dark:text-purple-300 font-semibold' 
                  : 'bg-polar-card border-polar-border text-polar-text-muted hover:text-polar-text-primary'
              }`}
            >
              <Radio className="w-2.5 h-2.5" />
              <span>SATELLITE</span>
            </button>
            <button
              onClick={() => setShowInfrastructure(!showInfrastructure)}
              className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 text-[10px] ${
                showInfrastructure 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-semibold' 
                  : 'bg-polar-card border-polar-border text-polar-text-muted hover:text-polar-text-primary'
              }`}
            >
              <Plane className="w-2.5 h-2.5" />
              <span>AIR / SKIWAY</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-polar-card rounded border border-polar-border p-0.5">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 text-polar-text-muted hover:text-polar-text-primary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 text-polar-text-muted hover:text-polar-text-primary transition-colors border-l border-r border-polar-border"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="p-1 text-polar-text-muted hover:text-polar-text-primary transition-colors text-[10px] px-1.5"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <ProvenanceBadge type="PUBLIC_EXTERNAL" provider="NCPOR / PostGIS" />
        </div>
      </div>

      {/* Map Canvas / SVG Viewport */}
      <div className="relative w-full h-[400px] bg-polar-base flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 800 460"
          className="w-full h-full select-none transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Scientific Continent Shader */}
            <radialGradient id="continentGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isDark ? "#0B1A2F" : "#FFFFFF"} stopOpacity={isDark ? "0.9" : "0.95"} />
              <stop offset="60%" stopColor={isDark ? "#07111D" : "#F8FAFC"} stopOpacity={isDark ? "0.8" : "0.9"} />
              <stop offset="100%" stopColor={isDark ? "#050A12" : "#E2E8F0"} stopOpacity={isDark ? "0.4" : "0.6"} />
            </radialGradient>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.75" />
              <stop offset="100%" stopColor={isDark ? "#38BDF8" : "#0284C7"} stopOpacity="0.75" />
            </linearGradient>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDark ? "#1E293B" : "#CBD5E1"} strokeWidth="0.5" strokeOpacity={isDark ? "0.3" : "0.5"} />
            </pattern>
          </defs>

          {/* Coordinate Grid Background */}
          <rect width="800" height="460" fill="url(#gridPattern)" />

          {/* Latitude Concentric Rings (60°S, 70°S, 80°S) */}
          <circle cx="400" cy="270" r="230" fill="none" stroke={isDark ? "#26354A" : "#CBD5E1"} strokeWidth="0.75" strokeDasharray="3 4" strokeOpacity="0.5" />
          <circle cx="400" cy="270" r="160" fill="none" stroke={isDark ? "#26354A" : "#CBD5E1"} strokeWidth="0.75" strokeDasharray="3 4" strokeOpacity="0.6" />
          <circle cx="400" cy="270" r="90" fill="none" stroke={isDark ? "#26354A" : "#CBD5E1"} strokeWidth="0.75" strokeDasharray="3 4" strokeOpacity="0.7" />
          <circle cx="400" cy="270" r="3" fill={isDark ? "#38BDF8" : "#0284C7"} opacity="0.6" />
          <text x="408" y="274" fill={isDark ? "#94A3B8" : "#64748B"} fontSize="8" fontFamily="monospace" opacity="0.8">90°S SOUTH POLE</text>
          <text x="565" y="274" fill={isDark ? "#64748B" : "#94A3B8"} fontSize="8" fontFamily="monospace" opacity="0.7">80°S</text>
          <text x="635" y="274" fill={isDark ? "#64748B" : "#94A3B8"} fontSize="8" fontFamily="monospace" opacity="0.7">70°S</text>

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
            stroke={isDark ? "#38BDF8" : "#0284C7"}
            strokeWidth="1.2"
            strokeOpacity={isDark ? "0.45" : "0.75"}
          />

          {/* Antarctic Peninsula Extension */}
          <path
            d="M 230 180 Q 190 120, 180 80 Q 195 90, 220 130 Q 245 160, 250 180 Z"
            fill={isDark ? "#07111D" : "#E2E8F0"}
            stroke={isDark ? "#38BDF8" : "#0284C7"}
            strokeWidth="1"
            strokeOpacity={isDark ? "0.35" : "0.6"}
          />
          <text x="130" y="85" fill={isDark ? "#64748B" : "#475569"} fontSize="8" fontFamily="monospace">ANTARCTIC PENINSULA</text>

          {/* Ice Shelves */}
          <path d="M 330 360 Q 400 380, 450 360" fill="none" stroke="#60A5FA" strokeWidth="1" strokeDasharray="2 3" strokeOpacity="0.3" />
          <text x="350" y="395" fill={isDark ? "#64748B" : "#475569"} fontSize="8" fontFamily="monospace" opacity="0.7">ROSS ICE SHELF</text>

          {/* Katabatic Wind Vectors */}
          {showWinds && (
            <g stroke={isDark ? "#38BDF8" : "#0284C7"} strokeWidth="0.8" strokeOpacity="0.35" fill="none">
              <path d="M 400 270 Q 470 250, 540 240" strokeDasharray="3 3" />
              <path d="M 400 270 Q 330 240, 280 225" strokeDasharray="3 3" />
              <path d="M 400 270 Q 410 320, 420 360" strokeDasharray="3 3" />
              <path d="M 400 270 Q 360 310, 300 350" strokeDasharray="3 3" />
              <text x="470" y="240" fill={isDark ? "#38BDF8" : "#0284C7"} fontSize="8" fontFamily="monospace" opacity="0.6">KATABATIC DRAINAGE →</text>
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

          {/* Satellite Footprint Cones */}
          {showSatellite && (
            <g stroke="#A855F7" strokeWidth="0.8" strokeDasharray="2 3" strokeOpacity="0.35" fill="none">
              <circle cx="560" cy="230" r="45" />
              <circle cx="260" cy="215" r="45" />
              <text x="520" y="290" fill="#A855F7" fontSize="7" fontFamily="monospace" opacity="0.6">
                GSAT-11 / INMARSAT FOOTPRINT
              </text>
            </g>
          )}

          {/* Infrastructure Airfields / Skiways */}
          {showInfrastructure && (
            <g stroke="#10B981" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.6" fill="none">
              {/* Maitri Blue-Ice Runway */}
              <line x1="240" y1="225" x2="255" y2="235" />
              <text x="215" y="245" fill="#10B981" fontSize="7" fontFamily="monospace">RWY 09/27 (BLUE-ICE)</text>
              {/* Bharati Helipad / Skiway */}
              <line x1="575" y1="220" x2="590" y2="230" />
              <text x="575" y="240" fill="#10B981" fontSize="7" fontFamily="monospace">HELI-01 SKIWAY</text>
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
                    stroke={isDark ? "#38BDF8" : "#0284C7"}
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
                  fill={isDG ? '#64748B' : isSelected ? (isDark ? '#38BDF8' : '#0284C7') : '#10B981'}
                  stroke={isDark ? "#050A12" : "#FFFFFF"}
                  strokeWidth="1.5"
                />

                {/* Pulse halo for active stations */}
                {!isDG && (
                  <circle
                    cx={st.cx}
                    cy={st.cy}
                    r="9"
                    fill="none"
                    stroke={isSelected ? (isDark ? '#38BDF8' : '#0284C7') : '#10B981'}
                    strokeWidth="0.8"
                    opacity="0.4"
                  />
                )}

                {/* Station Label */}
                <text
                  x={st.cx + (st.cx > 400 ? 12 : -12)}
                  y={st.cy + 4}
                  textAnchor={st.cx > 400 ? 'start' : 'end'}
                  fill={isSelected ? (isDark ? '#FFFFFF' : '#0F172A') : (isDark ? '#94A3B8' : '#475569')}
                  fontSize={isSelected ? '10' : '9'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fontFamily="monospace"
                >
                  {st.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Quick Inspection Card */}
        {activeSt && (
          <div className="absolute bottom-3 left-3 bg-polar-surface/95 border border-polar-border rounded-md p-3 shadow-xl backdrop-blur-sm max-w-xs text-xs space-y-1.5 z-20">
            <div className="flex items-center justify-between border-b border-polar-border pb-1.5">
              <span className="font-bold text-polar-text-primary uppercase text-[11px]">{activeSt.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-semibold">
                {activeSt.status}
              </span>
            </div>
            <div className="text-[10px] text-polar-text-muted space-y-0.5">
              <div>Coords: <strong className="text-polar-text-primary">{activeSt.coords}</strong></div>
              <div>Elevation: <strong className="text-polar-text-primary">{activeSt.elevation}</strong></div>
              <div>Air Temp: <strong className="text-sky-600 dark:text-sky-300">{activeSt.temp}°C</strong> | Wind: <strong className="text-sky-600 dark:text-sky-300">{activeSt.wind}</strong></div>
              <div>Microgrid: <strong className="text-amber-600 dark:text-amber-300">{activeSt.power}</strong> | Health: <strong className="text-emerald-600 dark:text-emerald-400">{activeSt.health}%</strong></div>
            </div>
            <div className="pt-1.5 border-t border-polar-border flex items-center justify-between">
              <button
                onClick={() => onNavigateToTwin(activeSt.id)}
                className="text-[10px] text-polar-cyan hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Launch 3D Digital Twin</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
