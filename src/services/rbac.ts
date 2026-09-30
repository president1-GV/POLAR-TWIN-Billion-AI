// ============================================================================
// POLAR-TWIN: Centralized Role-Based & Attribute-Based Access Control (RBAC/ABAC)
// POLAR-TWIN — Indian Antarctic Research Stations (Bharati & Maitri)
// Standard: Zero-Trust Defense-in-Depth, Operational Authority != Platform Admin
// ============================================================================

export type CanonicalRole = 
  | 'DUTY_OPERATOR'
  | 'BASE_ENGINEER'
  | 'EXPEDITION_CMDR'
  | 'MISSION_CONTROL'
  | 'ADMIN';

export type PolarRole = 
  | CanonicalRole
  | 'OPERATOR'    // Alias for DUTY_OPERATOR
  | 'ENGINEER'    // Alias for BASE_ENGINEER
  | 'COMMANDER'   // Alias for EXPEDITION_CMDR
  | 'SUPERVISOR'  // Alias for EXPEDITION_CMDR
  | 'ANALYST'     // Science Analyst
  | 'VIEWER';     // Observer

export type OperationalAuthority = 
  | 'STATION_OPS'
  | 'TECHNICAL_OPS'
  | 'MISSION_OPS'
  | 'CROSS_STATION_OPS'
  | 'PLATFORM_GOVERNANCE'
  | 'SCIENCE_OPS'
  | 'OBSERVATION_ONLY';

export type OperationalDomain =
  | 'INFRASTRUCTURE'
  | 'ENERGY'
  | 'LOGISTICS'
  | 'ENVIRONMENT'
  | 'TELEMETRY'
  | 'MAINTENANCE'
  | 'SIMULATION'
  | 'AUTOMATION'
  | 'MISSION'
  | 'PERSONNEL'
  | 'AUDIT'
  | 'SYSTEM'
  | 'SECURITY';

export type ActionRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

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
  | 'automation:view'
  | 'automation:approve'
  | 'automation:execute'
  | 'security:view'
  | 'security:revoke_sessions'
  | 'admin:full';

export interface RoleMetadata {
  id: PolarRole;
  canonicalId: CanonicalRole;
  label: string;
  headerTitle: string;
  shortLabel: string;
  clearanceLevel: 1 | 2 | 3 | 4 | 5;
  clearanceBadge: string;
  primaryStationScope: 'ASSIGNED_STATION' | 'ALL_STATIONS';
  operationalAuthority: OperationalAuthority;
  description: string;
  badgeClass: string;
  borderClass: string;
  textClass: string;
  accentColor: string;
  permissions: PolarPermission[];
  accessibleScreens: string[];
}

export const CANONICAL_ROLES: CanonicalRole[] = [
  'DUTY_OPERATOR',
  'BASE_ENGINEER',
  'EXPEDITION_CMDR',
  'MISSION_CONTROL',
  'ADMIN'
];

export const ALL_ROLES: PolarRole[] = [
  'DUTY_OPERATOR',
  'BASE_ENGINEER',
  'EXPEDITION_CMDR',
  'MISSION_CONTROL',
  'ADMIN',
  'OPERATOR',
  'ENGINEER',
  'COMMANDER',
  'ANALYST',
  'VIEWER'
];

// Normalize role names to canonical operational roles
export function normalizeRole(role: string | null | undefined): PolarRole {
  if (!role) return 'DUTY_OPERATOR';
  const upper = role.toUpperCase().trim();
  if (upper === 'SUPERVISOR' || upper === 'COMMANDER' || upper === 'STATION_COMMANDER' || upper === 'EXPEDITION_CMDR') return 'EXPEDITION_CMDR';
  if (upper === 'ADMIN' || upper === 'MISSION_ADMIN' || upper === 'ROOT') return 'ADMIN';
  if (upper === 'MISSION_CONTROL' || upper === 'FLIGHT_CONTROLLER') return 'MISSION_CONTROL';
  if (upper === 'ENGINEER' || upper === 'BASE_ENGINEER') return 'BASE_ENGINEER';
  if (upper === 'OPERATOR' || upper === 'DUTY_OPERATOR' || upper === 'STATION_OPERATOR') return 'DUTY_OPERATOR';
  if (upper === 'ANALYST' || upper === 'SCIENCE_ANALYST') return 'ANALYST';
  if (upper === 'VIEWER' || upper === 'OBSERVER') return 'VIEWER';
  return 'DUTY_OPERATOR';
}

export function toCanonicalRole(role: string | null | undefined): CanonicalRole {
  const norm = normalizeRole(role);
  if (norm === 'DUTY_OPERATOR' || norm === 'OPERATOR') return 'DUTY_OPERATOR';
  if (norm === 'BASE_ENGINEER' || norm === 'ENGINEER') return 'BASE_ENGINEER';
  if (norm === 'EXPEDITION_CMDR' || norm === 'COMMANDER' || norm === 'SUPERVISOR') return 'EXPEDITION_CMDR';
  if (norm === 'MISSION_CONTROL') return 'MISSION_CONTROL';
  return 'ADMIN';
}

export const DOMAIN_SCOPES: Record<string, OperationalDomain[]> = {
  DUTY_OPERATOR: [
    'INFRASTRUCTURE', 'ENERGY', 'LOGISTICS', 'ENVIRONMENT', 'TELEMETRY', 'MAINTENANCE', 'SIMULATION'
  ],
  BASE_ENGINEER: [
    'INFRASTRUCTURE', 'ENERGY', 'LOGISTICS', 'ENVIRONMENT', 'TELEMETRY', 'MAINTENANCE', 'SIMULATION'
  ],
  EXPEDITION_CMDR: [
    'INFRASTRUCTURE', 'ENERGY', 'LOGISTICS', 'ENVIRONMENT', 'TELEMETRY', 'MAINTENANCE', 'SIMULATION', 'MISSION', 'PERSONNEL'
  ],
  MISSION_CONTROL: [
    'INFRASTRUCTURE', 'ENERGY', 'LOGISTICS', 'ENVIRONMENT', 'TELEMETRY', 'MAINTENANCE', 'SIMULATION', 'AUTOMATION', 'MISSION', 'AUDIT'
  ],
  ADMIN: [
    'INFRASTRUCTURE', 'ENERGY', 'LOGISTICS', 'ENVIRONMENT', 'TELEMETRY', 'MAINTENANCE', 'SIMULATION', 'AUTOMATION', 'MISSION', 'PERSONNEL', 'AUDIT', 'SYSTEM', 'SECURITY'
  ],
  OPERATOR: [
    'INFRASTRUCTURE', 'ENERGY', 'LOGISTICS', 'ENVIRONMENT', 'TELEMETRY', 'MAINTENANCE', 'SIMULATION'
  ],
  ENGINEER: [
    'INFRASTRUCTURE', 'ENERGY', 'LOGISTICS', 'ENVIRONMENT', 'TELEMETRY', 'MAINTENANCE', 'SIMULATION'
  ],
  COMMANDER: [
    'INFRASTRUCTURE', 'ENERGY', 'LOGISTICS', 'ENVIRONMENT', 'TELEMETRY', 'MAINTENANCE', 'SIMULATION', 'MISSION', 'PERSONNEL'
  ],
  SUPERVISOR: [
    'INFRASTRUCTURE', 'ENERGY', 'LOGISTICS', 'ENVIRONMENT', 'TELEMETRY', 'MAINTENANCE', 'SIMULATION', 'MISSION', 'PERSONNEL'
  ],
  ANALYST: [
    'INFRASTRUCTURE', 'ENERGY', 'ENVIRONMENT', 'TELEMETRY', 'SIMULATION'
  ],
  VIEWER: [
    'INFRASTRUCTURE', 'ENVIRONMENT', 'TELEMETRY'
  ]
};

export const OPERATIONAL_AUTHORITIES: Record<string, OperationalAuthority> = {
  DUTY_OPERATOR: 'STATION_OPS',
  BASE_ENGINEER: 'TECHNICAL_OPS',
  EXPEDITION_CMDR: 'MISSION_OPS',
  MISSION_CONTROL: 'CROSS_STATION_OPS',
  ADMIN: 'PLATFORM_GOVERNANCE',
  OPERATOR: 'STATION_OPS',
  ENGINEER: 'TECHNICAL_OPS',
  COMMANDER: 'MISSION_OPS',
  SUPERVISOR: 'MISSION_OPS',
  ANALYST: 'SCIENCE_OPS',
  VIEWER: 'OBSERVATION_ONLY'
};

const COMMON_DUTY_SCREENS = [
  'command-center',
  'digital-twin',
  'energy',
  'logistics',
  'meteorology',
  'simulation',
  'automation',
  'edge',
  'analytics',
  'data-catalog',
  'demo',
  'officers',
  'admin'
];

export const ROLE_DEFINITIONS: Record<PolarRole, RoleMetadata> = {
  DUTY_OPERATOR: {
    id: 'DUTY_OPERATOR',
    canonicalId: 'DUTY_OPERATOR',
    label: 'Duty Operator (Station Operations)',
    headerTitle: 'POLAR-TWIN DUTY OPERATIONS',
    shortLabel: 'DUTY OPS',
    clearanceLevel: 2,
    clearanceBadge: 'LVL-2 DUTY',
    primaryStationScope: 'ASSIGNED_STATION',
    operationalAuthority: 'STATION_OPS',
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
      'automation:view',
      'automation:approve',
      'security:view'
    ],
    accessibleScreens: COMMON_DUTY_SCREENS
  },

  OPERATOR: {
    id: 'OPERATOR',
    canonicalId: 'DUTY_OPERATOR',
    label: 'Duty Operator (Station Operations)',
    headerTitle: 'POLAR-TWIN DUTY OPERATIONS',
    shortLabel: 'OPERATOR',
    clearanceLevel: 2,
    clearanceBadge: 'LVL-2 DUTY',
    primaryStationScope: 'ASSIGNED_STATION',
    operationalAuthority: 'STATION_OPS',
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
      'automation:view',
      'automation:approve',
      'security:view'
    ],
    accessibleScreens: COMMON_DUTY_SCREENS
  },

  BASE_ENGINEER: {
    id: 'BASE_ENGINEER',
    canonicalId: 'BASE_ENGINEER',
    label: 'Base Engineer (Technical Operations)',
    headerTitle: 'POLAR-TWIN ENGINEERING OPERATIONS',
    shortLabel: 'BASE ENG',
    clearanceLevel: 3,
    clearanceBadge: 'LVL-3 TECH',
    primaryStationScope: 'ASSIGNED_STATION',
    operationalAuthority: 'TECHNICAL_OPS',
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
      'automation:view',
      'automation:approve',
      'automation:execute',
      'security:view'
    ],
    accessibleScreens: COMMON_DUTY_SCREENS
  },

  ENGINEER: {
    id: 'ENGINEER',
    canonicalId: 'BASE_ENGINEER',
    label: 'Base Engineer (Technical Operations)',
    headerTitle: 'POLAR-TWIN ENGINEERING OPERATIONS',
    shortLabel: 'ENGINEER',
    clearanceLevel: 3,
    clearanceBadge: 'LVL-3 TECH',
    primaryStationScope: 'ASSIGNED_STATION',
    operationalAuthority: 'TECHNICAL_OPS',
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
      'automation:view',
      'automation:approve',
      'automation:execute',
      'security:view'
    ],
    accessibleScreens: COMMON_DUTY_SCREENS
  },

  EXPEDITION_CMDR: {
    id: 'EXPEDITION_CMDR',
    canonicalId: 'EXPEDITION_CMDR',
    label: 'Expedition Commander (Mission Command)',
    headerTitle: 'POLAR-TWIN EXPEDITION COMMAND',
    shortLabel: 'EXP CMDR',
    clearanceLevel: 4,
    clearanceBadge: 'LVL-4 CMDR',
    primaryStationScope: 'ASSIGNED_STATION',
    operationalAuthority: 'MISSION_OPS',
    description: 'Antarctic Expedition Leader with station operational command authority: mission readiness, emergency protocols, logistics rationing, and personnel oversight.',
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
      'automation:view',
      'automation:approve',
      'automation:execute',
      'security:view'
    ],
    accessibleScreens: COMMON_DUTY_SCREENS
  },

  COMMANDER: {
    id: 'COMMANDER',
    canonicalId: 'EXPEDITION_CMDR',
    label: 'Expedition Commander (Mission Command)',
    headerTitle: 'POLAR-TWIN EXPEDITION COMMAND',
    shortLabel: 'COMMANDER',
    clearanceLevel: 4,
    clearanceBadge: 'LVL-4 CMDR',
    primaryStationScope: 'ASSIGNED_STATION',
    operationalAuthority: 'MISSION_OPS',
    description: 'Antarctic Expedition Leader with station operational command authority: mission readiness, emergency protocols, logistics rationing, and personnel oversight.',
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
      'automation:view',
      'automation:approve',
      'automation:execute',
      'security:view'
    ],
    accessibleScreens: COMMON_DUTY_SCREENS
  },

  SUPERVISOR: {
    id: 'SUPERVISOR',
    canonicalId: 'EXPEDITION_CMDR',
    label: 'Expedition Commander (Mission Command)',
    headerTitle: 'POLAR-TWIN EXPEDITION COMMAND',
    shortLabel: 'SUPERVISOR',
    clearanceLevel: 4,
    clearanceBadge: 'LVL-4 CMDR',
    primaryStationScope: 'ASSIGNED_STATION',
    operationalAuthority: 'MISSION_OPS',
    description: 'Antarctic Expedition Leader with station operational command authority.',
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
      'automation:view',
      'automation:approve',
      'automation:execute',
      'security:view'
    ],
    accessibleScreens: COMMON_DUTY_SCREENS
  },

  MISSION_CONTROL: {
    id: 'MISSION_CONTROL',
    canonicalId: 'MISSION_CONTROL',
    label: 'Mission Control (Cross-Station Operations)',
    headerTitle: 'POLAR-TWIN MISSION CONTROL',
    shortLabel: 'MISSION CTRL',
    clearanceLevel: 4,
    clearanceBadge: 'LVL-4 FLIGHT',
    primaryStationScope: 'ALL_STATIONS',
    operationalAuthority: 'CROSS_STATION_OPS',
    description: 'NCPOR Headquarters Continental Flight Controller with dual-station oversight across Bharati and Maitri, satellite synchronization, and cross-station simulations.',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    borderClass: 'border-blue-500/40',
    textClass: 'text-blue-400',
    accentColor: '#3B82F6',
    permissions: [
      'telemetry:read',
      'telemetry:write',
      'alerts:read',
      'alerts:ack',
      'alerts:resolve',
      'twin:view',
      'twin:inspect',
      'energy:view',
      'logistics:view',
      'meteorology:view',
      'simulation:view',
      'simulation:run',
      'simulation:approve',
      'edge:view',
      'edge:toggle_link',
      'edge:trigger_sync',
      'analytics:view',
      'analytics:export',
      'data_catalog:view',
      'data_catalog:export',
      'demo:access',
      'automation:view',
      'automation:approve',
      'security:view'
    ],
    accessibleScreens: COMMON_DUTY_SCREENS
  },

  ADMIN: {
    id: 'ADMIN',
    canonicalId: 'ADMIN',
    label: 'Platform Administrator (Governance & Security)',
    headerTitle: 'POLAR-TWIN PLATFORM ADMINISTRATION',
    shortLabel: 'ADMIN',
    clearanceLevel: 5,
    clearanceBadge: 'LVL-5 ROOT',
    primaryStationScope: 'ALL_STATIONS',
    operationalAuthority: 'PLATFORM_GOVERNANCE',
    description: 'NCPOR Platform Administrator responsible for system governance, user credentials, RBAC policy enforcement, audit logs, and authorized role impersonation.',
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
      'automation:view',
      'automation:approve',
      'automation:execute',
      'security:view',
      'security:revoke_sessions',
      'admin:full'
    ],
    accessibleScreens: COMMON_DUTY_SCREENS
  },

  ANALYST: {
    id: 'ANALYST',
    canonicalId: 'DUTY_OPERATOR',
    label: 'Analyst (Science Operations)',
    headerTitle: 'POLAR-TWIN SCIENCE OPERATIONS',
    shortLabel: 'ANALYST',
    clearanceLevel: 2,
    clearanceBadge: 'LVL-2 SCI',
    primaryStationScope: 'ALL_STATIONS',
    operationalAuthority: 'SCIENCE_OPS',
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
      'automation:view',
      'security:view'
    ],
    accessibleScreens: COMMON_DUTY_SCREENS
  },

  VIEWER: {
    id: 'VIEWER',
    canonicalId: 'DUTY_OPERATOR',
    label: 'Viewer (Read-Only Observer)',
    headerTitle: 'POLAR-TWIN OBSERVATION CENTER',
    shortLabel: 'VIEWER',
    clearanceLevel: 1,
    clearanceBadge: 'LVL-1 OBS',
    primaryStationScope: 'ALL_STATIONS',
    operationalAuthority: 'OBSERVATION_ONLY',
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
      'automation:view',
      'edge:view',
      'analytics:view',
      'data_catalog:view'
    ],
    accessibleScreens: [
      'command-center',
      'digital-twin',
      'energy',
      'logistics',
      'meteorology',
      'automation',
      'analytics',
      'data-catalog',
      'officers',
      'admin'
    ]
  }
};

export function getRoleMeta(role: string | null | undefined): RoleMetadata {
  const norm = normalizeRole(role);
  return ROLE_DEFINITIONS[norm] || ROLE_DEFINITIONS.DUTY_OPERATOR;
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

export function hasDomainAccess(role: string | null | undefined, domain: OperationalDomain | string): boolean {
  const norm = normalizeRole(role);
  const domains = DOMAIN_SCOPES[norm] || [];
  return domains.includes(domain.toUpperCase() as OperationalDomain);
}

export function getStationScope(role: string | null | undefined, assignedStation: string = 'station_bharati'): string[] {
  // Both Bharati and Maitri are observable across all operational roles for Antarctic situational awareness
  return ['station_bharati', 'station_maitri'];
}

export function isStationAllowed(_role: string | null | undefined, _targetStationId: string, _assignedStation: string = 'station_bharati'): boolean {
  // Viewing digital twins, telemetry observations, and 3D stations is accessible across stations
  return true;
}
