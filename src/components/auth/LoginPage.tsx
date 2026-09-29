// ============================================================================
// POLAR-TWIN: Mission Operations Authentication Screen
// SIH 26060 — Indian Antarctic Research Stations (Bharati & Maitri)
// NCPOR / Ministry of Earth Sciences • High-Security Antarctic Command
// ============================================================================

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Key, 
  Radio, 
  Compass, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Server,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_CREDENTIALS } from '../../services/api';
import { PolarRole, getRoleMeta } from '../../services/rbac';
import polarTwinIcon from '../../assets/polar-twin-icon.png';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, isAirGapped } = useAuth();
  const [username, setUsername] = useState('operator.sharma');
  const [password, setPassword] = useState('PolarOps@2026!');
  const [mfaCode, setMfaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleQuickPreset = (roleKey: string) => {
    const creds = ROLE_CREDENTIALS[roleKey];
    if (creds) {
      setUsername(creds.username);
      setPassword(creds.password || '');
      setMfaCode(creds.mfa_code || '');
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Station username or officer email is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await login(username, password, mfaCode || undefined);
      if (res.success) {
        setSuccessNotice('Authentication token validated. Establishing telemetry uplink...');
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }, 600);
      } else {
        setErrorMessage(res.error || 'Authentication denied. Verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error encountered.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-polar-950 bg-gradient-to-b from-polar-950 via-[#07111D] to-[#040810] text-polar-text-primary flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar / Government Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-polar-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-polar-bg/80 border-2 border-polar-cyan/60 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-2 ring-polar-cyan/25 overflow-hidden p-0.5">
            <img 
              src={polarTwinIcon} 
              alt="POLAR-TWIN Mission Logo" 
              className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base text-polar-text-primary">
                POLAR<span className="text-polar-cyan">-TWIN</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                MISSION OPS
              </span>
            </div>
            <p className="text-[11px] text-polar-text-muted">
              National Centre for Polar and Ocean Research (NCPOR) • MoES, Govt. of India
            </p>
          </div>
        </div>

        {/* Real-time System Status Pills */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-polar-surface/80 border border-polar-border">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-polar-text-muted text-[11px]">SUPABASE UPLINK:</span>
            <span className="font-mono text-emerald-400 font-semibold text-[11px]">ACTIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md bg-polar-surface/80 border border-polar-border">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-polar-text-muted text-[11px]">DB HOST:</span>
            <span className="font-mono text-polar-text-secondary text-[11px]">fpoxnocbznagepusczkk</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Grid */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero / Operational Context (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>MISSION COMMAND CENTER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                Autonomous Digital Twin & Telemetry Portal
              </h1>
              <p className="text-xs text-polar-text-muted leading-relaxed">
                Zero-Trust authenticated access for Indian Antarctic Expedition personnel at Bharati (Larsemann Hills) and Maitri (Schirmacher Oasis).
              </p>
            </div>

            {/* Station Status Cards */}
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-polar-card/60 border border-polar-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <div>
                    <p className="text-xs font-bold text-polar-text-primary">Bharati Station</p>
                    <p className="text-[10px] text-polar-text-muted font-mono">69°24'S, 76°11'E • Larsemann Hills</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  ONLINE
                </span>
              </div>

              <div className="p-3 rounded-lg bg-polar-card/60 border border-polar-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <div>
                    <p className="text-xs font-bold text-polar-text-primary">Maitri Station</p>
                    <p className="text-[10px] text-polar-text-muted font-mono">70°45'S, 11°44'E • Schirmacher Oasis</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  ONLINE
                </span>
              </div>
            </div>

            {/* Quick Evaluation Presets */}
            <div className="p-3.5 rounded-lg bg-polar-surface/50 border border-polar-border/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-polar-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Quick Personnel Access Presets
                </span>
                <span className="text-[9px] font-mono text-cyan-400">ONE-CLICK</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('OPERATOR')}
                  className="px-2.5 py-1.5 rounded bg-polar-card hover:bg-polar-card/80 border border-cyan-500/30 text-left hover:border-cyan-400 transition-colors"
                >
                  <p className="font-bold text-cyan-300 text-[11px]">Duty Operator</p>
                  <p className="text-[9px] text-polar-text-muted">V. Sharma (Bharati)</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('ENGINEER')}
                  className="px-2.5 py-1.5 rounded bg-polar-card hover:bg-polar-card/80 border border-amber-500/30 text-left hover:border-amber-400 transition-colors"
                >
                  <p className="font-bold text-amber-300 text-[11px]">Base Engineer</p>
                  <p className="text-[9px] text-polar-text-muted">A. Deshmukh (Bharati)</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('SUPERVISOR')}
                  className="px-2.5 py-1.5 rounded bg-polar-card hover:bg-polar-card/80 border border-purple-500/30 text-left hover:border-purple-400 transition-colors"
                >
                  <p className="font-bold text-purple-300 text-[11px]">Expedition Cmdr</p>
                  <p className="text-[9px] text-polar-text-muted">Col. R. Nair (MFA: 123456)</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('ADMIN')}
                  className="px-2.5 py-1.5 rounded bg-polar-card hover:bg-polar-card/80 border border-rose-500/30 text-left hover:border-rose-400 transition-colors"
                >
                  <p className="font-bold text-rose-300 text-[11px]">Mission Control</p>
                  <p className="text-[9px] text-polar-text-muted">NCPOR Admin (Root)</p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Form Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-polar-card/90 backdrop-blur-xl border border-polar-border rounded-xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-polar-border/80 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-polar-cyan" />
                    Station Identity Verification
                  </h2>
                  <p className="text-xs text-polar-text-muted">
                    Authenticate via Supabase Cloud IAM or Air-Gapped Station SCADA
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-polar-surface text-polar-text-muted border border-polar-border">
                    ZERO-TRUST v2.4
                  </span>
                </div>
              </div>

              {/* Error Callout */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Callout */}
              {successNotice && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Station Officer ID / Username */}
                <div>
                  <label className="block text-xs font-semibold text-polar-text-secondary mb-1.5">
                    Officer Username / Station Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-polar-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. operator.sharma or commander@polar.gov.in"
                      className="w-full pl-9 pr-3 py-2 bg-polar-base border border-polar-border rounded-lg text-xs text-polar-text-primary placeholder:text-polar-text-muted/60 focus:outline-none focus:border-polar-cyan focus:ring-1 focus:ring-polar-cyan transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-polar-text-secondary mb-1.5">
                    Security Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-polar-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter operational passcode"
                      className="w-full pl-9 pr-10 py-2 bg-polar-base border border-polar-border rounded-lg text-xs text-polar-text-primary placeholder:text-polar-text-muted/60 focus:outline-none focus:border-polar-cyan focus:ring-1 focus:ring-polar-cyan transition-colors font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-polar-text-muted hover:text-polar-text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Optional MFA Token (for Commander and Admin) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-polar-text-secondary">
                      TOTP 2FA Token (Commander / Admin)
                    </label>
                    <span className="text-[10px] text-polar-text-muted">Default: 123456</span>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-polar-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      maxLength={6}
                      placeholder="6-digit TOTP code"
                      className="w-full pl-9 pr-3 py-2 bg-polar-base border border-polar-border rounded-lg text-xs text-polar-text-primary placeholder:text-polar-text-muted/60 focus:outline-none focus:border-polar-cyan focus:ring-1 focus:ring-polar-cyan transition-colors font-mono tracking-widest"
                    />
                  </div>
                </div>

                {/* Session Persistence Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-polar-text-secondary select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-polar-base border-polar-border text-polar-cyan focus:ring-polar-cyan/30"
                    />
                    <span>Persist encrypted session token</span>
                  </label>
                  <span className="text-[11px] text-polar-text-muted font-mono">TTL: 8 Hours</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full mt-2 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-polar-surface text-polar-text-muted cursor-wait'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-polar-950 font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.99]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                      <span>AUTHENTICATING STATION UPLINK...</span>
                    </>
                  ) : (
                    <>
                      <span>ESTABLISH SECURE MISSION SESSION</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Security Classification Banner */}
              <div className="mt-6 pt-4 border-t border-polar-border/60 text-center text-[10px] text-polar-text-muted space-y-1">
                <p className="font-semibold tracking-wider text-polar-text-secondary">
                  GOVERNMENT OF INDIA • MINISTRY OF EARTH SCIENCES
                </p>
                <p>
                  Official Antarctic Research Management System. Unauthorized access is strictly prohibited and audited under Section 66 of the Information Technology Act.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer System Line */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-polar-border/60 pt-4 text-[11px] text-polar-text-muted font-mono">
        <div>
          POLAR-TWIN DIGITAL TWIN ARCHITECTURE • NCPOR • MoES, GOI
        </div>
        <div className="flex items-center gap-4">
          <span>LATENCY: 42ms</span>
          <span>CRYPTO: AES-256-GCM / PBKDF2</span>
          <span>SESSION: STRICT ISOLATION</span>
        </div>
      </footer>
    </div>
  );
};
