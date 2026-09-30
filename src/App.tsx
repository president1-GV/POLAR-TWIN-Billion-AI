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
import { AdminMissionControl } from './features/admin/AdminMissionControl';
import { StationOfficersPortal } from './features/officers/StationOfficersPortal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LinkStatus, Alert } from './types';
import { api } from './services/api';
import { useAuth } from './context/AuthContext';
import { PolarRole } from './services/rbac';

export const App: React.FC = () => {
  const { role, switchRole, isAuthenticated, user } = useAuth();
  const [currentStationId, setCurrentStationId] = useState<string>('station_bharati');
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('command-center');
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('commander');
  const [linkStatus, setLinkStatus] = useState<LinkStatus>('ONLINE');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);

  const handleNavigate = (screen: ScreenId, officerId?: string) => {
    if (officerId) {
      setSelectedOfficerId(officerId);
    }
    setCurrentScreen(screen);
  };

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
    try {
      await switchRole(newRole as PolarRole);
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
    const nowIso = new Date().toISOString();
    const dutyOfficer = user?.username || `operator.${role.toLowerCase()}`;

    // 1. Instant optimistic state update for zero-latency UI reaction
    setAlerts((prev) =>
      prev.map((al) =>
        al.id === alertId
          ? {
              ...al,
              status: 'ACKNOWLEDGED',
              acknowledged_by: dutyOfficer,
              acknowledged_at: nowIso,
            }
          : al
      )
    );

    // 2. Dispatch to backend/Supabase and reconcile
    try {
      await api.acknowledgeAlert(alertId, `Acknowledged by ${dutyOfficer}`);
      await loadAlerts();
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
      await loadAlerts();
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    const nowIso = new Date().toISOString();

    // 1. Instant optimistic state update for zero-latency UI reaction
    setAlerts((prev) =>
      prev.map((al) =>
        al.id === alertId
          ? {
              ...al,
              status: 'RESOLVED',
              resolved_at: nowIso,
            }
          : al
      )
    );

    // 2. Dispatch to backend/Supabase and reconcile
    try {
      await api.resolveAlert(alertId, `Resolved by ${role}`);
      await loadAlerts();
    } catch (e) {
      console.error('Failed to resolve alert:', e);
      await loadAlerts();
    }
  };

  const unreadCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  if (currentScreen === 'login') {
    return (
      <LoginPage 
        onLoginSuccess={() => setCurrentScreen('command-center')} 
        onReturnHome={() => setCurrentScreen('command-center')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-polar-base text-polar-text-primary flex flex-col font-sans select-none">
      {/* Header */}
      <Header
        currentStationId={currentStationId}
        onStationChange={setCurrentStationId}
        linkStatus={linkStatus}
        onLinkToggle={handleLinkToggle}
        unreadAlertsCount={unreadCount}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        activeRole={role}
        onRoleChange={handleRoleChange}
        onNavigate={handleNavigate}
        onOpenLogin={() => setCurrentScreen('login')}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentScreen={currentScreen} onScreenChange={setCurrentScreen} />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto bg-polar-base polar-grid">
          <ErrorBoundary key={currentScreen} fallbackTitle={`MISSION VIEW SUBSYSTEM: ${currentScreen.toUpperCase()}`}>
            {currentScreen === 'admin' && (
              <AdminMissionControl
                currentStationId={currentStationId}
                onSelectStation={setCurrentStationId}
                onNavigateToOfficers={(officerId) => {
                  if (officerId) setSelectedOfficerId(officerId);
                  setCurrentScreen('officers');
                }}
                onNavigateToScreen={setCurrentScreen}
              />
            )}

            {currentScreen === 'officers' && (
              <StationOfficersPortal
                initialOfficerId={selectedOfficerId}
                currentStationId={currentStationId}
                onSelectStation={setCurrentStationId}
                onNavigateToAdmin={() => setCurrentScreen('admin')}
                onNavigateToScreen={setCurrentScreen}
              />
            )}

            {currentScreen === 'command-center' && (
              <ExecutiveCommandCenter
                currentStationId={currentStationId}
                onNavigate={setCurrentScreen}
                onSelectStation={setCurrentStationId}
              />
            )}

            {currentScreen === 'digital-twin' && (
              <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
                <Station3DViewer 
                  stationId={currentStationId} 
                  onNavigateToSimulation={(_scenarioKey) => setCurrentScreen('simulation')}
                />
              </div>
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
              <ProtectedRoute screenId="simulation" onNavigateHome={() => setCurrentScreen('command-center')}>
                <EmergencySimulator stationId={currentStationId} />
              </ProtectedRoute>
            )}

            {currentScreen === 'edge' && (
              <ProtectedRoute screenId="edge" onNavigateHome={() => setCurrentScreen('command-center')}>
                <EdgeMonitor />
              </ProtectedRoute>
            )}

            {currentScreen === 'analytics' && <AnalyticsDashboard />}

            {currentScreen === 'data-catalog' && <DataCatalogDashboard />}

            {currentScreen === 'demo' && (
              <KillerDemoPanel
                onNavigateToTwin={() => setCurrentScreen('digital-twin')}
              />
            )}
          </ErrorBoundary>
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
