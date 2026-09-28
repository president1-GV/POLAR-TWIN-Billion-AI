import { Station, StationAsset, EnvironmentObservation, Alert, LogisticsItem, Shipment, EdgeStatus } from '../types';

const API_BASE = '/api';

export const api = {
  // Stations & Digital Twin
  async getStations(): Promise<Station[]> {
    const res = await fetch(`${API_BASE}/stations`);
    if (!res.ok) throw new Error('Failed to fetch stations');
    return res.json();
  },

  async getStationTwin(stationId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/stations/${stationId}/digital-twin`);
    if (!res.ok) throw new Error('Failed to fetch station digital twin');
    return res.json();
  },

  // Assets
  async getStationAssets(stationId: string): Promise<StationAsset[]> {
    const res = await fetch(`${API_BASE}/assets/station/${stationId}`);
    if (!res.ok) throw new Error('Failed to fetch assets');
    return res.json();
  },

  async getAssetDetail(assetId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/assets/${assetId}`);
    if (!res.ok) throw new Error('Failed to fetch asset detail');
    return res.json();
  },

  async getAssetConsequences(assetId: string, ambientTempC: number = -20): Promise<any> {
    const res = await fetch(`${API_BASE}/assets/${assetId}/consequences?ambient_temp_c=${ambientTempC}`);
    if (!res.ok) throw new Error('Failed to calculate asset consequences');
    return res.json();
  },

  async updateAssetTelemetry(assetId: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/assets/${assetId}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update telemetry');
    return res.json();
  },

  // Environment
  async getEnvironment(stationId: string): Promise<EnvironmentObservation> {
    const res = await fetch(`${API_BASE}/environment/${stationId}`);
    if (!res.ok) throw new Error('Failed to fetch environment data');
    return res.json();
  },

  // Energy
  async getEnergyStatus(stationId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/energy/${stationId}`);
    if (!res.ok) throw new Error('Failed to fetch energy status');
    return res.json();
  },

  async getEnergyForecast(stationId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/energy/${stationId}/forecast`);
    if (!res.ok) throw new Error('Failed to fetch energy forecast');
    return res.json();
  },

  // Logistics
  async getInventory(stationId: string): Promise<LogisticsItem[]> {
    const res = await fetch(`${API_BASE}/logistics/${stationId}/inventory`);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  async getShipments(stationId: string): Promise<Shipment[]> {
    const res = await fetch(`${API_BASE}/logistics/${stationId}/shipments`);
    if (!res.ok) throw new Error('Failed to fetch shipments');
    return res.json();
  },

  async simulateLogisticsDelay(stationId: string, delayDays: number): Promise<any> {
    const res = await fetch(`${API_BASE}/logistics/simulate-delay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ station_id: stationId, delay_days: delayDays }),
    });
    if (!res.ok) throw new Error('Failed to simulate logistics delay');
    return res.json();
  },

  // Alerts
  async getAlerts(stationId?: string, status?: string): Promise<Alert[]> {
    const params = new URLSearchParams();
    if (stationId) params.append('station_id', stationId);
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE}/alerts?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async acknowledgeAlert(alertId: string, userId: string = 'operator.current'): Promise<any> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error('Failed to acknowledge alert');
    return res.json();
  },

  async resolveAlert(alertId: string, userId: string = 'operator.current'): Promise<any> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error('Failed to resolve alert');
    return res.json();
  },

  // Emergency Simulations
  async getScenarios(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/simulation/scenarios`);
    if (!res.ok) throw new Error('Failed to fetch scenarios');
    return res.json();
  },

  async runSimulation(scenarioKey: string, stationId: string = 'station_bharati', customParams?: any): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario_key: scenarioKey,
        station_id: stationId,
        custom_params: customParams,
      }),
    });
    if (!res.ok) throw new Error('Failed to execute simulation');
    return res.json();
  },

  async reviewSimulation(simulationId: string, action: string, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/${simulationId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes }),
    });
    if (!res.ok) throw new Error('Failed to review simulation');
    return res.json();
  },

  // Edge & Store-and-Forward
  async getEdgeStatus(): Promise<EdgeStatus> {
    const res = await fetch(`${API_BASE}/edge/status`);
    if (!res.ok) throw new Error('Failed to fetch edge status');
    return res.json();
  },

  async toggleEdgeLink(status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/edge/link-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to toggle edge link');
    return res.json();
  },

  async triggerEdgeSync(): Promise<any> {
    const res = await fetch(`${API_BASE}/edge/sync`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger edge sync');
    return res.json();
  },

  // Killer Demo Runner
  async getDemoSteps(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/demo/steps`);
    if (!res.ok) throw new Error('Failed to fetch demo steps');
    return res.json();
  },

  async executeDemoStep(stepNumber: number): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/step/${stepNumber}`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to execute demo step ${stepNumber}`);
    return res.json();
  },

  async resetDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo');
    return res.json();
  },

  // Analytics & Health
  async getSystemHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics/system-health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  async getProvenanceRegistry(): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics/provenance-registry`);
    if (!res.ok) throw new Error('Failed to fetch provenance registry');
    return res.json();
  },

  async getAuditLogs(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/audit`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },
};
