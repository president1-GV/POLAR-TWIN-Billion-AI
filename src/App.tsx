import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar, ScreenId } from './components/common/Sidebar';
import { ExecutiveCommandCenter } from './features/command-center/ExecutiveCommandCenter';
import { Station3DViewer } from './features/digital-twin/Station3DViewer';
import { EnergyDashboard } from './features/energy/EnergyDashboard';
import { LogisticsDashboard } from './features/logistics/LogisticsDashboard';
import { MeteorologyView } from './features/meteorology/MeteorologyView';
import { EmergencySimulator } from './features/simulation/EmergencySimulator';
import { EdgeMonitor } from './features/edge/EdgeMonitor';
import { AnalyticsDashboard } from './features/analytics/AnalyticsDashboard';
import { DataCatalogDashboard } from './features/data-catalog/DataCatalogDashboard';
import { KillerDemoPanel } from './features/demo/KillerDemoPanel';
import { AlertsDrawer } from './features/alerts/AlertsDrawer';
import { LinkStatus, Alert } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentStationId, setCurrentStationId] = useState<string>('station_bharati');
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('command-center');
  const [linkStatus, setLinkStatus] = useState<LinkStatus>('ONLINE');
  const [activeRole, setActiveRole] = useState<string>('OPERATOR');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);

  useEffect(() => {
    // Initialize authenticated Zero-Trust session for initial duty role
    api.switchRole(activeRole).catch(console.error);
  }, []);

  useEffect(() => {
    loadAlerts();
    loadEdgeStatus();
    const interval = setInterval(() => {
      loadAlerts();
      loadEdgeStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentStationId]);

  const handleRoleChange = async (newRole: string) => {
    setActiveRole(newRole);
    try {
      await api.switchRole(newRole);
    } catch (e) {
      console.error('Failed to switch role authentication:', e);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts(currentStationId);
      setAlerts(data);
    } catch (e) {
      console.error('Failed to load alerts:', e);
    }
  };

  const loadEdgeStatus = async () => {
    try {
      const data = await api.getEdgeStatus();
      setLinkStatus(data.link_status);
    } catch (e) {
      console.error('Failed to load edge status:', e);
    }
  };

  const handleLinkToggle = async () => {
    const nextStatus: Record<LinkStatus, LinkStatus> = {
      ONLINE: 'OFFLINE',
      OFFLINE: 'SYNCING',
      SYNCING: 'ONLINE',
      DEGRADED: 'ONLINE',
    };
    const target = nextStatus[linkStatus] || 'ONLINE';
    try {
      if (target === 'SYNCING') {
        await api.triggerEdgeSync();
      } else {
        await api.toggleEdgeLink(target);
      }
      loadEdgeStatus();
    } catch (e) {
      console.error('Failed to toggle link:', e);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId, `Acknowledged by ${activeRole}`);
      loadAlerts();
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId, `Resolved by ${activeRole}`);
      loadAlerts();
    } catch (e) {
      console.error('Failed to resolve alert:', e);
    }
  };

  const unreadCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-polar-950 flex flex-col font-sans select-none">
      {/* Header */}
      <Header
        currentStationId={currentStationId}
        onStationChange={setCurrentStationId}
        linkStatus={linkStatus}
        onLinkToggle={handleLinkToggle}
        unreadAlertsCount={unreadCount}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentScreen={currentScreen} onScreenChange={setCurrentScreen} />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto bg-polar-950 polar-grid">
          {currentScreen === 'command-center' && (
            <ExecutiveCommandCenter
              onNavigate={setCurrentScreen}
              onSelectStation={setCurrentStationId}
            />
          )}

          {currentScreen === 'digital-twin' && (
            <Station3DViewer stationId={currentStationId} />
          )}

          {currentScreen === 'energy' && (
            <EnergyDashboard stationId={currentStationId} />
          )}

          {currentScreen === 'logistics' && (
            <LogisticsDashboard stationId={currentStationId} />
          )}

          {currentScreen === 'meteorology' && (
            <MeteorologyView stationId={currentStationId} />
          )}

          {currentScreen === 'simulation' && (
            <EmergencySimulator stationId={currentStationId} />
          )}

          {currentScreen === 'edge' && <EdgeMonitor />}

          {currentScreen === 'analytics' && <AnalyticsDashboard />}

          {currentScreen === 'data-catalog' && <DataCatalogDashboard />}

          {currentScreen === 'demo' && (
            <KillerDemoPanel
              onNavigateToTwin={() => setCurrentScreen('digital-twin')}
            />
          )}
        </main>
      </div>

      {/* Operational Alerts Drawer */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onAcknowledge={handleAcknowledgeAlert}
        onResolve={handleResolveAlert}
      />
    </div>
  );
};
