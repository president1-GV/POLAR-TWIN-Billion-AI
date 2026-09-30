// ============================================================================
// POLAR-TWIN AI: Master Operational Landing Page & System Specification
// AI-Enabled Digital Twin & Remote Command Platform for Antarctic Stations
// National Centre for Polar and Ocean Research (NCPOR), MoES, Govt. of India
// ============================================================================

import React, { useState } from 'react';
import {
  Layers,
  Compass,
  Zap,
  Activity,
  ShieldCheck,
  Cpu,
  BarChart3,
  Radio,
  FileCheck2,
  Lock,
  ArrowRight,
  ChevronRight,
  Server,
  Database,
  CloudSnow,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Flame,
  Droplets,
  HardDrive,
  Eye,
  GitBranch,
  Workflow,
  Sparkles
} from 'lucide-react';
import polarTwinIcon from '../../assets/polar-twin-icon.png';
import { useAuth } from '../../context/AuthContext';

interface LandingPageProps {
  onSignIn: () => void;
  onEnterCommandCenter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onEnterCommandCenter }) => {
  const { isAuthenticated, user, role } = useAuth();
  const [activeStationPreview, setActiveStationPreview] = useState<'station_bharati' | 'station_maitri'>('station_bharati');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrimaryCta = () => {
    if (isAuthenticated) {
      onEnterCommandCenter();
    } else {
      onSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Background Technical Grid & Ambient Atmospheric Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} 
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-10%] w-[700px] h-[600px] bg-blue-600/5 blur-[160px] rounded-full" />
      </div>

      {/* ========================================================================
          3. TOP NAVIGATION (Sticky Header)
      ======================================================================== */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#030712]/85 border-b border-cyan-950/60 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-slate-900 border border-cyan-500/40 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:border-cyan-400 transition-all">
              <img src={polarTwinIcon} alt="POLAR-TWIN AI" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-wider text-white">
                  POLAR<span className="text-cyan-400">&#8209;TWIN</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono font-bold tracking-widest uppercase">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:inline">
                National Centre for Polar and Ocean Research • MoES
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-800/80 text-xs font-mono font-medium text-slate-300">
            <button 
              onClick={() => scrollToSection('features')} 
              className="px-3 py-1 rounded-full hover:text-cyan-300 hover:bg-slate-900 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="px-3 py-1 rounded-full hover:text-cyan-300 hover:bg-slate-900 transition-colors"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('architecture')} 
              className="px-3 py-1 rounded-full hover:text-cyan-300 hover:bg-slate-900 transition-colors"
            >
              Architecture
            </button>
            <button 
              onClick={() => scrollToSection('specifications')} 
              className="px-3 py-1 rounded-full hover:text-cyan-300 hover:bg-slate-900 transition-colors"
            >
              Specifications
            </button>
          </nav>

          {/* Right Action CTA Buttons */}
          <div className="flex items-center gap-3 font-mono">
            {isAuthenticated ? (
              <button
                onClick={onEnterCommandCenter}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer tracking-wider"
              >
                <span>ENTER COMMAND CENTER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={onSignIn}
                  className="text-xs sm:text-sm text-slate-300 hover:text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer font-semibold"
                >
                  Sign In
                </button>
                <button
                  onClick={handlePrimaryCta}
                  className="flex items-center gap-1.5 sm:gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="relative z-10">

        {/* ========================================================================
            4. HERO SECTION
        ======================================================================== */}
        <section className="relative pt-12 sm:pt-20 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase mb-6 sm:mb-8 shadow-inner animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span>AI-POWERED ANTARCTIC DIGITAL TWIN PLATFORM</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-5xl leading-[1.12]">
            SEE THE STATION.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
              UNDERSTAND THE STATE.
            </span>{' '}
            ACT WITH CONTEXT.
          </h1>

          {/* Supporting Statement */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl leading-relaxed font-normal">
            POLAR-TWIN AI unifies station infrastructure, environmental observations, energy microgrids,
            logistics runway, physical assets, AI predictions, and isolated what-if simulation into a
            single authoritative operational digital-twin environment.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 font-mono">
            <button
              onClick={handlePrimaryCta}
              className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm sm:text-base px-6 sm:px-8 py-3.5 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>ENTER COMMAND CENTER</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/40 text-sm sm:text-base px-6 sm:px-8 py-3.5 rounded-xl transition-all cursor-pointer font-semibold"
            >
              <span>HOW IT WORKS</span>
              <ChevronRight className="w-5 h-5 text-cyan-400" />
            </button>
          </div>

          {/* Trust Statement */}
          <div className="mt-6 inline-flex items-center gap-2 text-xs font-mono font-medium text-slate-400 tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>HUMAN-IN-THE-LOOP — AI SUPPORTS AUTHORIZED OPERATORS</span>
          </div>

          {/* Interactive Live Station Telemetry Preview Card */}
          <div className="mt-12 sm:mt-16 w-full max-w-5xl bg-slate-950/90 rounded-2xl border border-cyan-500/30 p-4 sm:p-6 shadow-2xl backdrop-blur-md text-left font-mono">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">OPERATIONAL DUAL-STATION STATE</span>
              </div>
              {/* Station Switcher Tabs */}
              <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveStationPreview('station_bharati')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                    activeStationPreview === 'station_bharati'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BHARATI STATION
                </button>
                <button
                  onClick={() => setActiveStationPreview('station_maitri')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                    activeStationPreview === 'station_maitri'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  MAITRI STATION
                </button>
              </div>
            </div>

            {/* Station Preview Specs */}
            {activeStationPreview === 'station_bharati' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>COORDINATES</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">69° 24.41′ S, 76° 11.72′ E</div>
                  <div className="text-[10px] text-cyan-400/80 mt-0.5">Larsemann Hills (35m ASL)</div>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CloudSnow className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ENVIRONMENT</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">-12.2°C • 2.0 m/s</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">NCPOR Live Verified</div>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>MICROGRID LOAD</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">185.0 kW • 3 Gensets</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">3-Tier Aerodynamic Habitat</div>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-cyan-400" />
                    <span>FUEL RUNWAY</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">186.3 Days (170.5 kL)</div>
                  <div className="text-[10px] text-cyan-400/80 mt-0.5">Jet A-1 / Polar Diesel</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>COORDINATES</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">70° 45′ 52″ S, 11° 44′ 03″ E</div>
                  <div className="text-[10px] text-cyan-400/80 mt-0.5">Schirmacher Oasis (50m ASL)</div>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CloudSnow className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ENVIRONMENT</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">-14.8°C • 5.4 m/s</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Lake Priyadarshini Basin</div>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>MICROGRID LOAD</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">160.0 kW • Hybrid Wind</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Steel-Stilt Modular Complex</div>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-cyan-400" />
                    <span>FUEL RUNWAY</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">142.5 Days (118.0 kL)</div>
                  <div className="text-[10px] text-cyan-400/80 mt-0.5">Polar Fuel Reserves</div>
                </div>
              </div>
            )}
          </div>
        </section>


        {/* ========================================================================
            5. PAIN POINT / PROBLEM SECTION
        ======================================================================== */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              CRITICAL OPERATIONAL REALITIES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              THE OPERATIONAL CHALLENGE
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              Antarctic scientific missions operate under extreme environmental constraints where lack of integrated
              context risks mission integrity, energy reliability, and personnel safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pain Point 01 */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-6 hover:border-cyan-500/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-1 bg-cyan-950/50 rounded border border-cyan-800/50">
                  PAIN POINT 01
                </span>
                <Radio className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">REMOTE ENVIRONMENT</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Antarctic research stations operate in geographically isolated, extreme environments where operational visibility and physical intervention are constrained by distance, sub-zero blizzard windows, rugged ice terrain, and intermittent satellite communications.
              </p>
            </div>

            {/* Pain Point 02 */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-6 hover:border-cyan-500/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-1 bg-cyan-950/50 rounded border border-cyan-800/50">
                  PAIN POINT 02
                </span>
                <Layers className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">FRAGMENTED INFORMATION</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Station telemetry exists across separate silos: meteorology, microgrids, diesel machinery, structural life support, supply-chain logistics, and spare inventories. Without a unified system of record, cross-system dependencies remain invisible.
              </p>
            </div>

            {/* Pain Point 03 */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-6 hover:border-cyan-500/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-1 bg-cyan-950/50 rounded border border-cyan-800/50">
                  PAIN POINT 03
                </span>
                <Activity className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">LIMITED SITUATIONAL AWARENESS</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Conventional tabular dashboards show disconnected numerical metrics without spatial relationships between station modules, building envelops, diesel generator housings, pipe trestle networks, and microgrid loads.
              </p>
            </div>

            {/* Pain Point 04 */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-6 hover:border-cyan-500/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-1 bg-cyan-950/50 rounded border border-cyan-800/50">
                  PAIN POINT 04
                </span>
                <RotateCcw className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">REACTIVE OPERATIONS</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Historical records alone do not answer what is currently deteriorating, what will happen in the next 24 hours, or how rapidly life support and thermal comfort degrade if ambient temperatures plunge or a generator trips.
              </p>
            </div>

            {/* Pain Point 05 */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-6 hover:border-cyan-500/40 transition-all group lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-1 bg-cyan-950/50 rounded border border-cyan-800/50">
                  PAIN POINT 05
                </span>
                <AlertTriangle className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">DECISION COMPLEXITY</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Every Antarctic operational decision involves tightly coupled constraints: shedding a microgrid load changes thermal heating balance, running auxiliary gensets accelerates fuel burn runway, and resupply vessel delays threaten critical survival margins. Operators require predictive decision support with verified human authority.
              </p>
            </div>
          </div>
        </section>


        {/* ========================================================================
            6. SOLUTION SECTION
        ======================================================================== */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              INTEGRATED ARCHITECTURAL PIPELINE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              THE POLAR-TWIN APPROACH
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              POLAR-TWIN converts fragmented operational information into a unified digital representation of the station.
            </p>
          </div>

          {/* Visual Solution Pipeline Diagram */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-6 sm:p-10 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3 text-center font-mono">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-center">
                <div className="text-[10px] text-cyan-400 font-bold mb-1">STAGE 01</div>
                <div className="text-xs font-bold text-white">REAL WORLD</div>
                <div className="text-[9px] text-slate-400 mt-1">Antarctica</div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-center">
                <div className="text-[10px] text-cyan-400 font-bold mb-1">STAGE 02</div>
                <div className="text-xs font-bold text-white">DATA SOURCES</div>
                <div className="text-[9px] text-slate-400 mt-1">NCPOR & SCADA</div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-center">
                <div className="text-[10px] text-cyan-400 font-bold mb-1">STAGE 03</div>
                <div className="text-xs font-bold text-white">VALIDATION</div>
                <div className="text-[9px] text-slate-400 mt-1">Pydantic Schemas</div>
              </div>

              <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/50 flex flex-col justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <div className="text-[10px] text-cyan-300 font-bold mb-1">STAGE 04</div>
                <div className="text-xs font-extrabold text-cyan-300">TWIN STATE</div>
                <div className="text-[9px] text-cyan-400/80 mt-1">Source of Truth</div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-center">
                <div className="text-[10px] text-cyan-400 font-bold mb-1">STAGE 05</div>
                <div className="text-xs font-bold text-white">3D + METRICS</div>
                <div className="text-[9px] text-slate-400 mt-1">Spatial Context</div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-center">
                <div className="text-[10px] text-cyan-400 font-bold mb-1">STAGE 06</div>
                <div className="text-xs font-bold text-white">AI FORECAST</div>
                <div className="text-[9px] text-slate-400 mt-1">XGBoost & ML</div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-center">
                <div className="text-[10px] text-cyan-400 font-bold mb-1">STAGE 07</div>
                <div className="text-xs font-bold text-white">SIMULATION</div>
                <div className="text-[9px] text-slate-400 mt-1">Cloned State</div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-center">
                <div className="text-[10px] text-cyan-400 font-bold mb-1">STAGE 08</div>
                <div className="text-xs font-bold text-white">DECISION AID</div>
                <div className="text-[9px] text-slate-400 mt-1">Action Engine</div>
              </div>

              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 flex flex-col justify-center">
                <div className="text-[10px] text-emerald-300 font-bold mb-1">STAGE 09</div>
                <div className="text-xs font-bold text-emerald-300">OPERATOR</div>
                <div className="text-[9px] text-emerald-400/80 mt-1">Human Authority</div>
              </div>
            </div>

            <div className="mt-8 text-center text-xs font-mono text-slate-400">
              Flow Direction: Continuous physical telemetry ingestion → Edge store-and-forward buffer → Immutable audit log
            </div>
          </div>
        </section>


        {/* ========================================================================
            7. FEATURES SECTION
        ======================================================================== */}
        <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              FULL-STACK CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              ONE DIGITAL TWIN. MULTIPLE OPERATIONAL DOMAINS.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              Ten integrated modules engineered specifically for remote Antarctic base command and survivability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 01 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">01 — 3D PHYSICAL DIGITAL TWIN</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                High-fidelity 3D spatial representation in Three.js and React Three Fiber. Accurately renders Bharati's aerodynamic envelope on 24 pilotis and Maitri's steel-stilt modular living blocks, Lake Priyadarshini water pumps, and fuel farms with verified geospatial coordinates.
              </p>
            </div>

            {/* Feature 02 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">02 — ENERGY INTELLIGENCE</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Full microgrid visibility: Generation (250 kVA / 125 kVA Kirloskar diesel gensets, solar PV array, wind rotors), distribution, battery energy storage systems (BESS), and load shedding prioritization (P1 Life Support vs P2 Science vs P3 Aux).
              </p>
            </div>

            {/* Feature 03 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
                <CloudSnow className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">03 — WEATHER & ENVIRONMENT</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Meteorological ingestion tagged with explicit provenance: ambient temperature, wind speeds, blizzard conditions, and atmospheric pressure. Explicitly categorizes data as OBSERVED, IMPORTED, PREDICTED, or SIMULATED.
              </p>
            </div>

            {/* Feature 04 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">04 — ASSET INTELLIGENCE</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Every physical asset (BHR-GEN-01, MAI-GEN-01, fuel pumps, RO water filtration) maintains an authoritative digital identity with real-time telemetry, thermal decay equations, maintenance cycles, and downstream causal relationships.
              </p>
            </div>

            {/* Feature 05 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">05 — LOGISTICS INTELLIGENCE</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Track Antarctic diesel/Jet A-1 fuel stock, food rations, medical provisions, and machinery spares. Simulates vessel voyage delays and calculates daily burn rate runway across all supply categories.
              </p>
            </div>

            {/* Feature 06 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">06 — AI FORECASTING</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Machine learning models (Mahalanobis Distance anomaly detection, XGBoost/LightGBM time-series forecasting) predict 24-hour microgrid peak loads, fuel surge rates, and component degradation without hallucinating synthetic data as live.
              </p>
            </div>

            {/* Feature 07 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">07 — WHAT-IF SIMULATION</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Isolated scenario engine evaluates emergency contingencies (extreme cold drop to -45°C, blizzard storm surges, generator trips) on cloned in-memory state, ensuring live operational telemetry is never contaminated.
              </p>
            </div>

            {/* Feature 08 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">08 — DECISION SUPPORT</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Cross-domain 10-link causal chain links environmental drops to thermal loss, microgrid deficits, and fuel spikes, recommending targeted operator mitigations while maintaining full human operational authority.
              </p>
            </div>

            {/* Feature 09 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">09 — DATA PROVENANCE</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Immutable lineage tracking for every telemetry packet. Verified data sources include NCPOR public meteorological gateways, station sensors, and edge forwarders with cryptographic verification.
              </p>
            </div>

            {/* Feature 10 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all lg:col-span-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">10 — SECURE ZERO-TRUST OPERATIONS</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Multi-layer operational security: Supabase Authentication, strict Role-Based Access Control (RBAC), station-scoping (BOLA/IDOR defense), database-level Row Level Security (RLS), and append-only audit trail logging.
              </p>
            </div>
          </div>
        </section>


        {/* ========================================================================
            8. HOW IT WORKS SECTION
        ======================================================================== */}
        <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              OPERATIONAL LIFECYCLE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              HOW IT WORKS
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              The continuous end-to-end data pipeline powering Antarctic digital twin operations.
            </p>
          </div>

          <div className="space-y-4 font-mono max-w-4xl mx-auto">
            {/* Step 01 */}
            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center text-sm shrink-0">
                  01
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">DATA SOURCES</h4>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Atmospheric observations, SCADA microgrid buses, fuel levels, logistics manifests, and GIS elevation grids.</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800 shrink-0">NCPOR / SCADA</span>
            </div>

            {/* Step 02 */}
            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center text-sm shrink-0">
                  02
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">INGESTION & EDGE BUFFERING</h4>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">FastAPI ingestion gateway with offline Industrial PC store-and-forward buffer for Antarctic satellite link outages.</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800 shrink-0">CRC32 / FASTAPI</span>
            </div>

            {/* Step 03 */}
            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center text-sm shrink-0">
                  03
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">PYDANTIC VALIDATION</h4>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Strict schema boundaries validate ranges (-80°C to +40°C), physical units (kW, lph, m/s), timestamps, and source provenance.</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800 shrink-0">ZERO-MALFORM</span>
            </div>

            {/* Step 04 */}
            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center text-sm shrink-0">
                  04
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">DIGITAL TWIN STATE</h4>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">PostgreSQL/Supabase maintains authoritative relational twin state linking stations, buildings, assets, and live telemetry.</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800 shrink-0">SYSTEM OF RECORD</span>
            </div>

            {/* Step 05 */}
            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center text-sm shrink-0">
                  05
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">AI INTELLIGENCE & CAUSAL CHAIN</h4>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Evaluates 10-link cross-domain causal chain; Mahalanobis distance detects anomalous machine vibration and thermal drifts.</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800 shrink-0">10-LINK CAUSAL</span>
            </div>

            {/* Step 06 */}
            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center text-sm shrink-0">
                  06
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">ISOLATED SIMULATION</h4>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Clones state to compute freeze window hours and microgrid deficits under what-if scenarios without altering live baseline.</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800 shrink-0">SANDBOX CLONE</span>
            </div>

            {/* Step 07 */}
            <div className="bg-slate-950/80 border border-cyan-500/40 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-cyan-950/20">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-sm shrink-0">
                  07
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">COMMAND CENTER DECISION SUPPORT</h4>
                  <p className="text-xs text-slate-300 font-sans mt-0.5">Delivers verified situational awareness, actionable recommendations, and role-scoped execution to authorized human officers.</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded bg-cyan-500 text-slate-950 font-bold shrink-0">HUMAN ACTION</span>
            </div>
          </div>
        </section>


        {/* ========================================================================
            9. ARCHITECTURE SECTION & 10. DIGITAL TWIN ARCHITECTURE VISUAL
        ======================================================================== */}
        <section id="architecture" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              TECHNICAL ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              ENGINEERED FOR EXTREME RESILIENCE
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              Ground truth inspection of the verified POLAR-TWIN full-stack codebase.
            </p>
          </div>

          {/* Architecture Layer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-left mb-12">
            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-cyan-400 font-bold mb-2">01. FRONTEND</div>
              <div className="text-sm font-bold text-white mb-2">React + TypeScript + Vite</div>
              <div className="text-xs text-slate-400 font-sans leading-relaxed">
                Tailwind CSS, shadcn-inspired components, Three.js WebGL rendering, React Three Fiber, Recharts operational dashboards.
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-cyan-400 font-bold mb-2">02. API & APPLICATION</div>
              <div className="text-sm font-bold text-white mb-2">Python + FastAPI + Pydantic</div>
              <div className="text-xs text-slate-400 font-sans leading-relaxed">
                Strict Pydantic schema validation, SQLAlchemy data models, cryptographic token inspection, and BOLA station scoping.
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-cyan-400 font-bold mb-2">03. DATABASE & PERSISTENCE</div>
              <div className="text-sm font-bold text-white mb-2">PostgreSQL (Supabase)</div>
              <div className="text-xs text-slate-400 font-sans leading-relaxed">
                Time-series telemetry storage, Row-Level Security (RLS), relational constraints linking stations, assets, and alerts.
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-cyan-400 font-bold mb-2">04. SECURITY & AUTH</div>
              <div className="text-sm font-bold text-white mb-2">Zero-Trust RBAC & Session</div>
              <div className="text-xs text-slate-400 font-sans leading-relaxed">
                HMAC-SHA256 session signatures, role-based permissions matrix, station-boundary isolation, and immutable audit logs.
              </div>
            </div>
          </div>

          {/* Technical Visual Architecture Graph */}
          <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 font-mono text-center">
            <div className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-6">
              DIGITAL TWIN DATA & PHYSICAL CONTEXT GRAPH
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">REAL ANTARCTICA</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">GEOGRAPHIC REFERENCE</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">TERRAIN (WGS84)</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold">STATION ENVELOPE</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">PHYSICAL ASSETS</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">TELEMETRY BUS</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold">DIGITAL TWIN STATE</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">AI / SIMULATION</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black">COMMAND CENTER</span>
            </div>
            <p className="mt-6 text-xs text-slate-400 font-sans max-w-2xl mx-auto">
              Every 3D object maps directly to an authoritative database asset ID. The 3D engine is a connected visualization layer, not an independent data universe.
            </p>
          </div>
        </section>


        {/* ========================================================================
            11. SPECIFICATIONS SECTION
        ======================================================================== */}
        <section id="specifications" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              BENCHMARKS & PLATFORM SPECIFICATIONS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              TECHNICAL SPECIFICATIONS
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              Verified operational specifications across infrastructure, models, and protocols.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Domain</th>
                    <th className="py-3.5 px-4 sm:px-6">Specification / Technology</th>
                    <th className="py-3.5 px-4 sm:px-6">Operational Scope & Constraints</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 sm:px-6 text-cyan-400 font-bold">PLATFORM</td>
                    <td className="py-3.5 px-4 sm:px-6 text-white font-semibold">POLAR-TWIN AI Core v2.0</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400 font-sans">Dual Antarctic Station Digital Twin (Bharati & Maitri)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 sm:px-6 text-cyan-400 font-bold">3D ENGINE</td>
                    <td className="py-3.5 px-4 sm:px-6 text-white font-semibold">Three.js + React Three Fiber</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400 font-sans">PBR Metallic-Roughness, dynamic camera presets, dependency flow overlays</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 sm:px-6 text-cyan-400 font-bold">FRONTEND</td>
                    <td className="py-3.5 px-4 sm:px-6 text-white font-semibold">React 18 + TypeScript + Vite</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400 font-sans">Tailwind CSS, high-contrast dark/light theme, Recharts operational charts</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 sm:px-6 text-cyan-400 font-bold">BACKEND</td>
                    <td className="py-3.5 px-4 sm:px-6 text-white font-semibold">Python + FastAPI</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400 font-sans">Pydantic validation, SQLAlchemy models, asynchronous non-blocking I/O</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 sm:px-6 text-cyan-400 font-bold">DATABASE</td>
                    <td className="py-3.5 px-4 sm:px-6 text-white font-semibold">PostgreSQL (Supabase)</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400 font-sans">Relational integrity, Time-series telemetry, Row Level Security (RLS)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 sm:px-6 text-cyan-400 font-bold">AUTH & RBAC</td>
                    <td className="py-3.5 px-4 sm:px-6 text-white font-semibold">Zero-Trust Session + BOLA Defense</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400 font-sans">5 clearance tiers, station boundary isolation, instant revocation audit</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 sm:px-6 text-cyan-400 font-bold">AI / ML</td>
                    <td className="py-3.5 px-4 sm:px-6 text-white font-semibold">Mahalanobis Distance + LightGBM</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400 font-sans">Unsupervised multi-variate anomaly detection, 24h demand peak regression</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 sm:px-6 text-cyan-400 font-bold">SIMULATION</td>
                    <td className="py-3.5 px-4 sm:px-6 text-white font-semibold">Cloned In-Memory Sandbox</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400 font-sans">First-principles thermodynamics, Newton cooling, generator loss contingencies</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 sm:px-6 text-cyan-400 font-bold">EDGE RESILIENCE</td>
                    <td className="py-3.5 px-4 sm:px-6 text-white font-semibold">Store-and-Forward Replay</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400 font-sans">Industrial PC offline buffer with CRC32 packet integrity validation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>


        {/* ========================================================================
            12. BENEFITS SECTION (OPERATIONAL VALUE)
        ======================================================================== */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              MEASURABLE ADVANTAGES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              OPERATIONAL VALUE
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              Concrete outcomes for scientific directors, expedition commanders, and base engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-left">
            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl hover:border-cyan-500/40 transition-colors">
              <div className="text-xs text-cyan-400 font-bold mb-2">01. UNIFIED SITUATION</div>
              <h4 className="text-sm font-bold text-white mb-2">Unified Awareness</h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Connects 15 operational domains into one live state snapshot, eliminating communication blindspots between energy, logistics, and scientific teams.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl hover:border-cyan-500/40 transition-colors">
              <div className="text-xs text-cyan-400 font-bold mb-2">02. SPATIAL CONTEXT</div>
              <h4 className="text-sm font-bold text-white mb-2">Physical Grounding</h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Pinpoints equipment anomalies directly within the 3D habitat, fuel pipeline trestles, and lake pump houses rather than an abstract table.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl hover:border-cyan-500/40 transition-colors">
              <div className="text-xs text-cyan-400 font-bold mb-2">03. PREDICTIVE VISIBILITY</div>
              <h4 className="text-sm font-bold text-white mb-2">Proactive Foresight</h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Identifies machine mechanical degradation and microgrid overload risks hours before equipment failure triggers mission alerts.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl hover:border-cyan-500/40 transition-colors">
              <div className="text-xs text-cyan-400 font-bold mb-2">04. SCENARIO ANALYSIS</div>
              <h4 className="text-sm font-bold text-white mb-2">Risk Sandbox</h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Tests emergency auxiliary heating, load shedding, and storm survival procedures in simulation without risking real station microgrids.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl hover:border-cyan-500/40 transition-colors">
              <div className="text-xs text-cyan-400 font-bold mb-2">05. RESOURCE RUNWAY</div>
              <h4 className="text-sm font-bold text-white mb-2">Resource Security</h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Live burn-rate tracking against remaining days of Antarctic winter prevents fuel starvation and rations depletion before relief voyages arrive.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl hover:border-cyan-500/40 transition-colors">
              <div className="text-xs text-cyan-400 font-bold mb-2">06. TRACEABLE AUDIT</div>
              <h4 className="text-sm font-bold text-white mb-2">Full Traceability</h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Maintains a cryptographic data lineage and append-only audit record of every alert acknowledgement, parameter tuning, and mitigation.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl hover:border-cyan-500/40 transition-colors">
              <div className="text-xs text-cyan-400 font-bold mb-2">07. ZERO-TRUST ACCESS</div>
              <h4 className="text-sm font-bold text-white mb-2">Scoped Authority</h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Guarantees station officers only manipulate their authorized station with BOLA defense, while Mission Control maintains dual-station oversight.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl hover:border-cyan-500/40 transition-colors">
              <div className="text-xs text-cyan-400 font-bold mb-2">08. HUMAN DECISION</div>
              <h4 className="text-sm font-bold text-white mb-2">Human-in-the-Loop</h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                AI and physics engines calculate impacts and propose mitigations, keeping final operational accountability firmly in human commander hands.
              </p>
            </div>
          </div>
        </section>


        {/* ========================================================================
            13. TECHNOLOGY TRUST SECTION
        ======================================================================== */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              ARCHITECTURAL INTEGRITY
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              WHY THE ARCHITECTURE MATTERS
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              Each architectural layer serves an uncompromising operational purpose in extreme polar environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-left">
            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-cyan-400 font-bold mb-1">FRONTEND & 3D</div>
              <div className="text-xs text-white font-bold mb-2">High-Performance Spatial Context</div>
              <p className="text-xs text-slate-300 font-sans">
                Real-time WebGL rendering delivers spatial intuition of building modules and microgrid buses without browser performance lag.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-cyan-400 font-bold mb-1">BACKEND & SCHEMAS</div>
              <div className="text-xs text-white font-bold mb-2">Zero-Tolerance Pydantic Guardrails</div>
              <p className="text-xs text-slate-300 font-sans">
                Every request and telemetry reading is strictly validated at API boundaries, rejecting malformed coordinates or fabricated payloads.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-cyan-400 font-bold mb-1">PERSISTENCE</div>
              <div className="text-xs text-white font-bold mb-2">PostgreSQL Relational Ground Truth</div>
              <p className="text-xs text-slate-300 font-sans">
                PostgreSQL with Row Level Security guarantees digital twin state persistence, relational integrity, and isolated audit logging.
              </p>
            </div>
          </div>
        </section>


        {/* ========================================================================
            14. LOGIN CTA (FINAL ACTION)
        ======================================================================== */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center border-t border-slate-900">
          <div className="bg-gradient-to-b from-cyan-950/40 via-slate-950 to-slate-950 border border-cyan-500/40 rounded-3xl p-8 sm:p-14 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                MISSION READY
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 tracking-tight">
                READY TO ENTER THE DIGITAL TWIN?
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
                Connect to the Indian Antarctic Station Command Center. Access verified physical models, live meteorology observations, and microgrid intelligence.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 font-mono">
                <button
                  onClick={handlePrimaryCta}
                  className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm sm:text-base px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
                >
                  <span>SIGN IN TO COMMAND CENTER</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="px-6 py-4 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-all cursor-pointer text-sm font-semibold"
                >
                  EXPLORE HOW IT WORKS
                </button>
              </div>

              {isAuthenticated && (
                <div className="mt-6 text-xs font-mono text-cyan-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authenticated as {user?.display_name || user?.name || user?.username} [{role}]</span>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* ========================================================================
          FOOTER
      ======================================================================== */}
      <footer className="border-t border-slate-900 bg-[#02050e] py-12 px-4 sm:px-6 lg:px-8 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 p-1 flex items-center justify-center">
              <img src={polarTwinIcon} alt="POLAR-TWIN" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-white font-bold">POLAR-TWIN AI • Version 2.0</div>
              <div className="text-[10px] text-slate-500 font-sans">
                National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, Govt. of India
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-400">
            <span>BHARATI: 69° 24.41′ S, 76° 11.72′ E</span>
            <span>•</span>
            <span>MAITRI: 70° 45′ 52″ S, 11° 44′ 03″ E</span>
          </div>

          <div className="text-center sm:text-right text-[11px]">
            <div>STRICT ZERO-TRUST ROLE-BASED ACCESS</div>
            <div className="text-slate-600 mt-0.5">Physical Telemetry & Satellite Ingestion Gateways</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
