// ============================================================================
// POLAR-TWIN: Centralized Role-Based & Attribute-Based Access Control (RBAC/ABAC)
// SIH 26060 — Indian Antarctic Research Stations (Bharati & Maitri)
// Standard: Zero-Trust Defense-in-Depth, NCPOR Mission Control Security
// ============================================================================

export type PolarRole = 
  | 'OPERATOR'    // Operator (Duty)
  | 'ENGINEER'    // Engineer (Base)
  | 'COMMANDER'   // Commander (NCPOR) - (alias: SUPERVISOR)
  | 'ANALYST'     // Analyst (Science)
  | 'VIEWER'      // Viewer (Read-Only)
  | 'ADMIN';      // Admin (Mission Ctrl)

export type PolarPermission =
  | 'telemetry:read'
  | 'telemetry:write'
  | 'alerts:read'
  | 'alerts:ack'
  | 'alerts:resolve'
  | 'twin:view'
  | 'twin:inspect'
  | 'twin:control'
  | 'energy:view'
  | 'energy:control'
  | 'logistics:view'
  | 'logistics:write'
  | 'logistics:ration'
  | 'meteorology:view'
  | 'simulation:view'
  | 'simulation:run'
  | 'simulation:approve'
  | 'simulation:emergency'
  | 'edge:view'
  | 'edge:toggle_link'
  | 'edge:trigger_sync'
  | 'analytics:view'
  | 'analytics:export'
  | 'data_catalog:view'
  | 'data_catalog:export'
  | 'demo:access'
  | 'security:view'
  | 'security:revoke_sessions'
  | 'admin:full';

export interface RoleMetadata {
  id: PolarRole;
  label: string;
  shortLabel: string;
  clearanceLevel: 1 | 2 | 3 | 4 | 5;
  clearanceBadge: string;
  primaryStationScope: 'ASSIGNED_STATION' | 'ALL_STATIONS';
  description: string;
  badgeClass: string;
  borderClass: string;
  textClass: string;
  accentColor: string;
  permissions: PolarPermission[];
  accessibleScreens: string[];
}

// Canonical normalize function mapping legacy aliases (e.g. SUPERVISOR -> COMMANDER)
export function normalizeRole(role: string | null | undefined): PolarRole {
  if (!role) return 'OPERATOR';
  const upper = role.toUpperCase().trim();
  if (upper === 'SUPERVISOR') return 'COMMANDER';
  if (upper === 'ADMIN' || upper === 'MISSION_ADMIN') return 'ADMIN';
  if (upper === 'COMMANDER' || upper === 'STATION_COMMANDER') return 'COMMANDER';
  if (upper === 'ENGINEER' || upper === 'BASE_ENGINEER') return 'ENGINEER';
  if (upper === 'ANALYST' || upper === 'SCIENCE_ANALYST') return 'ANALYST';
  if (upper === 'VIEWER' || upper === 'OBSERVER') return 'VIEWER';
  return 'OPERATOR';
}

export const ROLE_DEFINITIONS: Record<PolarRole, RoleMetadata> = {
  OPERATOR: {
    id: 'OPERATOR',
    label: 'Operator (Duty)',
    shortLabel: 'OPERATOR',
    clearanceLevel: 2,
    clearanceBadge: 'LVL-2 DUTY',
    primaryStationScope: 'ASSIGNED_STATION',
    description: 'Station duty officer managing live systems, acknowledging operational alerts, and monitoring edge link state.',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    borderClass: 'border-cyan-500/40',
    textClass: 'text-cyan-400',
    accentColor: '#38BDF8',
    permissions: [
      'telemetry:read',
      'alerts:read',
      'alerts:ack',
      'twin:view',
      'twin:inspect',
      'energy:view',
      'logistics:view',
      'meteorology:view',
      'simulation:view',
      'edge:view',
      'edge:toggle_link',
      'edge:trigger_sync',
      'analytics:view',
      'data_catalog:view',
      'demo:access',
      'security:view',
    ],
    accessibleScreens: [
      'command-center',
      'digital-twin',
      'energy',
      'logistics',
      'meteorology',
      'simulation',
      'edge',
      'analytics',
      'data-catalog',
      'demo',
    ],
  },

  ENGINEER: {
    id: 'ENGINEER',
    label: 'Engineer (Base)',
    shortLabel: 'ENGINEER',
    clearanceLevel: 3,
    clearanceBadge: 'LVL-3 TECH',
    primaryStationScope: 'ASSIGNED_STATION',
    description: 'Station engineering specialist with authority to tune power microgrids, adjust HVAC loop temperatures, and perform maintenance overrides.',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    borderClass: 'border-amber-500/40',
    textClass: 'text-amber-400',
    accentColor: '#F59E0B',
    permissions: [
      'telemetry:read',
      'telemetry:write',
      'alerts:read',
      'alerts:ack',
      'alerts:resolve',
      'twin:view',
      'twin:inspect',
      'twin:control',
      'energy:view',
      'energy:control',
      'logistics:view',
      'logistics:write',
      'meteorology:view',
      'simulation:view',
      'simulation:run',
      'edge:view',
      'edge:toggle_link',
      'edge:trigger_sync',
      'analytics:view',
      'analytics:export',
      'data_catalog:view',
      'demo:access',
      'security:view',
    ],
    accessibleScreens: [
      'command-center',
      'digital-twin',
      'energy',
      'logistics',
      'meteorology',
      'simulation',
      'edge',
      'analytics',
      'data-catalog',
      'demo',
    ],
  },

  COMMANDER: {
    id: 'COMMANDER',
    label: 'Commander (NCPOR)',
    shortLabel: 'COMMANDER',
    clearanceLevel: 4,
    clearanceBadge: 'LVL-4 CMDR',
    primaryStationScope: 'ALL_STATIONS',
    description: 'Antarctic Expedition Leader with station-wide and inter-station command authority: emergency protocols, supply reallocations, and scenario authorizations.',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    borderClass: 'border-purple-500/40',
    textClass: 'text-purple-400',
    accentColor: '#A855F7',
    permissions: [
      'telemetry:read',
      'telemetry:write',
      'alerts:read',
      'alerts:ack',
      'alerts:resolve',
      'twin:view',
      'twin:inspect',
      'twin:control',
      'energy:view',
      'energy:control',
      'logistics:view',
      'logistics:write',
      'logistics:ration',
      'meteorology:view',
      'simulation:view',
      'simulation:run',
      'simulation:approve',
      'simulation:emergency',
      'edge:view',
      'edge:toggle_link',
      'edge:trigger_sync',
      'analytics:view',
      'analytics:export',
      'data_catalog:view',
      'data_catalog:export',
      'demo:access',
      'security:view',
    ],
    accessibleScreens: [
      'command-center',
      'digital-twin',
      'energy',
      'logistics',
      'meteorology',
      'simulation',
      'edge',
      'analytics',
      'data-catalog',
      'demo',
    ],
  },

  ANALYST: {
    id: 'ANALYST',
    label: 'Analyst (Science)',
    shortLabel: 'ANALYST',
    clearanceLevel: 2,
    clearanceBadge: 'LVL-2 SCI',
    primaryStationScope: 'ALL_STATIONS',
    description: 'Scientific and meteorology investigator analyzing multi-station dataset provenance, anomaly models, and climate observations.',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    borderClass: 'border-emerald-500/40',
    textClass: 'text-emerald-400',
    accentColor: '#10B981',
    permissions: [
      'telemetry:read',
      'alerts:read',
      'twin:view',
      'twin:inspect',
      'energy:view',
      'logistics:view',
      'meteorology:view',
      'simulation:view',
      'edge:view',
      'analytics:view',
      'analytics:export',
      'data_catalog:view',
      'data_catalog:export',
      'demo:access',
      'security:view',
    ],
    accessibleScreens: [
      'command-center',
      'digital-twin',
      'energy',
      'logistics',
      'meteorology',
      'simulation',
      'edge',
      'analytics',
      'data-catalog',
      'demo',
    ],
  },

  VIEWER: {
    id: 'VIEWER',
    label: 'Viewer (Read-Only)',
    shortLabel: 'VIEWER',
    clearanceLevel: 1,
    clearanceBadge: 'LVL-1 OBS',
    primaryStationScope: 'ALL_STATIONS',
    description: 'Observer or external delegate with read-only view access. Controls and system state modifications are strictly disabled.',
    badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    borderClass: 'border-slate-500/40',
    textClass: 'text-slate-400',
    accentColor: '#94A3B8',
    permissions: [
      'telemetry:read',
      'alerts:read',
      'twin:view',
      'energy:view',
      'logistics:view',
      'meteorology:view',
      'simulation:view',
      'edge:view',
      'analytics:view',
      'data_catalog:view',
    ],
    accessibleScreens: [
      'command-center',
      'digital-twin',
      'energy',
      'logistics',
      'meteorology',
      'analytics',
      'data-catalog',
    ],
  },

  ADMIN: {
    id: 'ADMIN',
    label: 'Admin (Mission Ctrl)',
    shortLabel: 'ADMIN',
    clearanceLevel: 5,
    clearanceBadge: 'LVL-5 ROOT',
    primaryStationScope: 'ALL_STATIONS',
    description: 'NCPOR Headquarters Mission Operations root administrator with unconditional system access, audit logs, and session controls.',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    borderClass: 'border-rose-500/40',
    textClass: 'text-rose-400',
    accentColor: '#F43F5E',
    permissions: [
      'telemetry:read',
      'telemetry:write',
      'alerts:read',
      'alerts:ack',
      'alerts:resolve',
      'twin:view',
      'twin:inspect',
      'twin:control',
      'energy:view',
      'energy:control',
      'logistics:view',
      'logistics:write',
      'logistics:ration',
      'meteorology:view',
      'simulation:view',
      'simulation:run',
      'simulation:approve',
      'simulation:emergency',
      'edge:view',
      'edge:toggle_link',
      'edge:trigger_sync',
      'analytics:view',
      'analytics:export',
      'data_catalog:view',
      'data_catalog:export',
      'demo:access',
      'security:view',
      'security:revoke_sessions',
      'admin:full',
    ],
    accessibleScreens: [
      'command-center',
      'digital-twin',
      'energy',
      'logistics',
      'meteorology',
      'simulation',
      'edge',
      'analytics',
      'data-catalog',
      'demo',
    ],
  },
};

export const ALL_ROLES: PolarRole[] = ['OPERATOR', 'ENGINEER', 'COMMANDER', 'ANALYST', 'VIEWER', 'ADMIN'];

export function getRoleMeta(role: string | null | undefined): RoleMetadata {
  const norm = normalizeRole(role);
  return ROLE_DEFINITIONS[norm] || ROLE_DEFINITIONS.OPERATOR;
}

export function hasPermission(role: string | null | undefined, permission: PolarPermission): boolean {
  const meta = getRoleMeta(role);
  if (meta.permissions.includes('admin:full')) return true;
  return meta.permissions.includes(permission);
}

export function canAccessScreen(role: string | null | undefined, screenId: string): boolean {
  const meta = getRoleMeta(role);
  if (meta.id === 'ADMIN') return true;
  return meta.accessibleScreens.includes(screenId);
}
