// ============================================================================
// POLAR-TWIN: Mission Operations Authentication Screen
// POLAR-TWIN — Indian Antarctic Research Stations (Bharati & Maitri)
// NCPOR / Ministry of Earth Sciences • High-Security Antarctic Command
// Fully Accessible & High-Contrast Adaptive Theme (Light & Dark)
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
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_CREDENTIALS } from '../../services/api';
import { PolarRole, getRoleMeta } from '../../services/rbac';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import polarTwinIcon from '../../assets/polar-twin-icon.png';

interface LoginPageProps {
  onLoginSuccess?: () => void;
  onReturnHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onReturnHome }) => {
  const { login, isAirGapped } = useAuth();
  const [username, setUsername] = useState('operator.sharma');
  const [password, setPassword] = useState('PolarOps@2026!');
  const [mfaCode, setMfaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleQuickPreset = async (roleKey: string) => {
    const creds = ROLE_CREDENTIALS[roleKey];
    if (creds) {
      setUsername(creds.username);
      setPassword(creds.password || '');
      setMfaCode(creds.mfa_code || '');
      setErrorMessage(null);
      setIsSubmitting(true);

      try {
        const res = await login(creds.username, creds.password, creds.mfa_code || undefined);
        if (res.success) {
          setSuccessNotice(`Authentication token validated: ${creds.name}. Establishing telemetry uplink...`);
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
    <div className="min-h-screen bg-polar-base text-polar-text-primary flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors">
      {/* Top Bar / Government Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-polar-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-polar-surface border-2 border-polar-cyan/60 flex items-center justify-center shadow-md shadow-cyan-500/10 ring-1 ring-polar-cyan/25 overflow-hidden p-0.5 shrink-0">
            <img 
              src={polarTwinIcon} 
              alt="POLAR-TWIN Mission Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base text-polar-text-primary">
                POLAR<span className="text-polar-cyan">-TWIN</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 font-bold">
                MISSION OPS
              </span>
            </div>
            <p className="text-[11px] text-polar-text-muted">
              National Centre for Polar and Ocean Research (NCPOR) • MoES, Govt. of India
            </p>
          </div>
        </div>

        {/* Real-time System Status Pills, Navigation & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
          {onReturnHome && (
            <button
              type="button"
              onClick={onReturnHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-polar-surface hover:bg-polar-elevated border border-polar-border hover:border-polar-cyan/60 text-polar-text-secondary hover:text-polar-text-primary text-xs font-semibold transition-colors shadow-sm"
              title="Return to Executive Situational Command Center"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-polar-cyan" />
              <span>Return to Dashboard</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-polar-surface border border-polar-border shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-polar-text-muted text-[11px] font-medium">UPLINK:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">ACTIVE</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-polar-surface border border-polar-border shadow-sm">
            <Server className="w-3.5 h-3.5 text-polar-cyan" />
            <span className="text-polar-text-muted text-[11px] font-medium">HOST:</span>
            <span className="font-mono text-polar-text-secondary text-[11px] font-semibold">fpoxnocbznagepusczkk</span>
          </div>

          {/* Theme Switcher */}
          <div className="shrink-0">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Authentication Grid */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero / Operational Context (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>MISSION COMMAND CENTER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-polar-text-primary leading-tight">
                Autonomous Digital Twin & Telemetry Portal
              </h1>
              <p className="text-xs text-polar-text-muted leading-relaxed font-medium">
                Zero-Trust authenticated access for Indian Antarctic Expedition personnel at Bharati (Larsemann Hills) and Maitri (Schirmacher Oasis).
              </p>
            </div>

            {/* Station Status Cards */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-polar-card border border-polar-border flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-polar-text-primary">Bharati Station</p>
                    <p className="text-[10px] text-polar-text-muted font-mono">69°24'S, 76°11'E • Larsemann Hills</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-polar-card border border-polar-border flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-polar-text-primary">Maitri Station</p>
                    <p className="text-[10px] text-polar-text-muted font-mono">70°45'S, 11°44'E • Schirmacher Oasis</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
            </div>

            {/* Quick Evaluation Presets */}
            <div className="p-4 rounded-xl bg-polar-card border border-polar-border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-polar-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Quick Personnel Access Presets
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  ONE-CLICK
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickPreset('OPERATOR')}
                  className="p-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-left transition-colors group shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  <p className="font-bold text-cyan-700 dark:text-cyan-300 text-[11px] group-hover:text-cyan-600 dark:group-hover:text-cyan-200">Duty Operator</p>
                  <p className="text-[9px] text-polar-text-muted font-medium">V. Sharma (Bharati)</p>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickPreset('ENGINEER')}
                  className="p-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-left transition-colors group shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  <p className="font-bold text-amber-700 dark:text-amber-300 text-[11px] group-hover:text-amber-600 dark:group-hover:text-amber-200">Base Engineer</p>
                  <p className="text-[9px] text-polar-text-muted font-medium">A. Deshmukh (Bharati)</p>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickPreset('SUPERVISOR')}
                  className="p-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-left transition-colors group shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  <p className="font-bold text-purple-700 dark:text-purple-300 text-[11px] group-hover:text-purple-600 dark:group-hover:text-purple-200">Expedition Cmdr</p>
                  <p className="text-[9px] text-polar-text-muted font-medium">Col. R. Nair (MFA: 123456)</p>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickPreset('ADMIN')}
                  className="p-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-left transition-colors group shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  <p className="font-bold text-rose-700 dark:text-rose-300 text-[11px] group-hover:text-rose-600 dark:group-hover:text-rose-200">Mission Control</p>
                  <p className="text-[9px] text-polar-text-muted font-medium">NCPOR Admin (Root)</p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Form Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-polar-card border border-polar-border rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-cyan-950/40 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-polar-border pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-polar-text-primary flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-polar-cyan shrink-0" />
                    Station Identity Verification
                  </h2>
                  <p className="text-xs text-polar-text-muted mt-0.5">
                    Authenticate via Supabase Cloud IAM or Air-Gapped Station SCADA
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-polar-surface text-polar-text-muted border border-polar-border font-bold">
                    ZERO-TRUST v2.4
                  </span>
                </div>
              </div>

              {/* Error Callout */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Callout */}
              {successNotice && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{successNotice}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Station Officer ID / Username */}
                <div>
                  <label className="block text-xs font-bold text-polar-text-primary mb-1.5">
                    Officer Username / Station Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-polar-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. operator.sharma or commander@polar.gov.in"
                      className="w-full pl-9 pr-3 py-2.5 bg-polar-input border border-polar-border focus:border-polar-cyan rounded-lg text-xs text-polar-text-primary placeholder:text-polar-text-muted/60 focus:outline-none focus:ring-1 focus:ring-polar-cyan transition-colors shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-polar-text-primary mb-1.5">
                    Security Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-polar-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter operational passcode"
                      className="w-full pl-9 pr-10 py-2.5 bg-polar-input border border-polar-border focus:border-polar-cyan rounded-lg text-xs text-polar-text-primary placeholder:text-polar-text-muted/60 focus:outline-none focus:ring-1 focus:ring-polar-cyan transition-colors font-mono shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-polar-text-muted hover:text-polar-text-primary transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Optional MFA Token (for Commander and Admin) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-polar-text-primary">
                      TOTP 2FA Token (Commander / Admin)
                    </label>
                    <span className="text-[10px] text-polar-text-muted font-mono font-medium">Default: 123456</span>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-polar-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      maxLength={6}
                      placeholder="6-digit TOTP code"
                      className="w-full pl-9 pr-3 py-2.5 bg-polar-input border border-polar-border focus:border-polar-cyan rounded-lg text-xs text-polar-text-primary placeholder:text-polar-text-muted/60 focus:outline-none focus:ring-1 focus:ring-polar-cyan transition-colors font-mono tracking-widest shadow-sm"
                    />
                  </div>
                </div>

                {/* Session Persistence Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-polar-text-secondary select-none font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-polar-input border-polar-border text-polar-cyan focus:ring-polar-cyan/30"
                    />
                    <span>Persist encrypted session token</span>
                  </label>
                  <span className="text-[11px] text-polar-text-muted font-mono font-medium">TTL: 8 Hours</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full mt-3 py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg ${
                    isSubmitting
                      ? 'bg-polar-surface text-polar-text-muted cursor-wait'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/25 active:scale-[0.99]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
              <div className="mt-6 pt-4 border-t border-polar-border text-center text-[10px] text-polar-text-muted space-y-1">
                <p className="font-bold tracking-wider text-polar-text-secondary">
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
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-polar-border pt-4 text-[11px] text-polar-text-muted font-mono">
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
