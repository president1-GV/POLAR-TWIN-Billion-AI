// ============================================================================
// POLAR-TWIN: Zero-Trust Protected Route & Clearance Guard
// POLAR-TWIN — Indian Antarctic Research Stations (Bharati & Maitri)
// Enforces Server-Side and Client-Side Role & Permission Enclosure
// ============================================================================

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  ArrowLeft, 
  KeyRound, 
  CheckCircle, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PolarPermission, PolarRole, getRoleMeta } from '../../services/rbac';
import { LoginPage } from './LoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: PolarPermission;
  screenId?: string;
  onNavigateHome?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  screenId,
  onNavigateHome,
}) => {
  const { isAuthenticated, role, roleMeta, hasPermission, canAccessScreen, switchRole, requestClearanceEscalation } = useAuth();
  const [escalationRequested, setEscalationRequested] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  // If not authenticated, prompt login
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={onNavigateHome} />;
  }

  // Check screen-level access
  const isScreenAllowed = screenId ? canAccessScreen(screenId) : true;

  // Check permission-level access
  const isPermissionAllowed = requiredPermission ? hasPermission(requiredPermission) : true;

  // If both pass, render protected child view
  if (isScreenAllowed && isPermissionAllowed) {
    return <>{children}</>;
  }

  // Otherwise, render Access Denied Mission Screen
  const handleQuickEscalate = async (targetRole: PolarRole) => {
    setIsEscalating(true);
    try {
      await requestClearanceEscalation(targetRole, `Operational override for screen: ${screenId || 'subsystem'}`);
      await switchRole(targetRole);
      setEscalationRequested(true);
    } finally {
      setIsEscalating(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-polar-text-primary">
      <div className="max-w-md w-full bg-polar-card/95 backdrop-blur-md border border-amber-500/30 rounded-xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

        <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider">
            Clearance Restitution Required
          </span>
          <h2 className="text-xl font-bold text-white">
            Operational Access Restricted
          </h2>
          <p className="text-xs text-polar-text-muted leading-relaxed">
            Your active operational identity <span className="font-bold text-polar-cyan">{roleMeta.label}</span> ({roleMeta.clearanceBadge}) does not possess clearance for the requested subsystem:
          </p>
          <div className="mt-2 py-1 px-3 rounded bg-polar-base border border-polar-border text-xs font-mono text-amber-300">
            {screenId ? `SUBSYSTEM: ${screenId.toUpperCase()}` : `PERMISSION: ${requiredPermission}`}
          </div>
        </div>

        {/* Escalation Options */}
        <div className="pt-2 border-t border-polar-border space-y-3 text-left">
          <p className="text-[11px] font-semibold text-polar-text-secondary uppercase tracking-wider">
            Authorize Emergency Escalation:
          </p>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickEscalate('ENGINEER')}
              disabled={isEscalating}
              className="px-3 py-2 rounded-lg bg-polar-surface hover:bg-polar-surface/80 border border-polar-border hover:border-amber-500/50 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-amber-400 text-xs">Base Engineer</p>
                <p className="text-[10px] text-polar-text-muted">LVL-3 TECH</p>
              </div>
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              onClick={() => handleQuickEscalate('COMMANDER')}
              disabled={isEscalating}
              className="px-3 py-2 rounded-lg bg-polar-surface hover:bg-polar-surface/80 border border-polar-border hover:border-purple-500/50 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-purple-400 text-xs">Expedition Cmdr</p>
                <p className="text-[10px] text-polar-text-muted">LVL-4 CMDR</p>
              </div>
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            </button>
          </div>
        </div>

        {/* Navigation Action */}
        <div className="pt-2 flex items-center justify-center gap-3">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="px-4 py-2 rounded-lg bg-polar-base hover:bg-polar-surface border border-polar-border text-xs font-medium text-polar-text-secondary hover:text-polar-text-primary transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Command Center</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
