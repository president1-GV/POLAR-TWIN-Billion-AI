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
import { SmartAutomationCenter } from './features/automation/SmartAutomationCenter';
import { AlertsDrawer } from './features/alerts/AlertsDrawer';
import { AdminMissionControl } from './features/admin/AdminMissionControl';
import { StationOfficersPortal } from './features/officers/StationOfficersPortal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoginPage } from './components/auth/LoginPage';
import { LandingPage } from './features/landing/LandingPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LinkStatus, Alert } from './types';
import { api } from './services/api';
import { useAuth } from './context/AuthContext';
import { PolarRole } from './services/rbac';

export const App: React.FC = () => {
  const { role, switchRole, isAuthenticated, user } = useAuth();
  const [currentStationId, setCurrentStationId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('polar_twin_selected_station');
      if (saved === 'station_bharati' || saved === 'station_maitri') {
        return saved;
      }
    }
    return 'station_bharati';
  });

  const handleStationChange = (stationId: string) => {
    const validStationId = stationId === 'station_maitri' ? 'station_maitri' : 'station_bharati';
    setCurrentStationId(validStationId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('polar_twin_selected_station', validStationId);
    }
  };

  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const requestedScreen = params.get('screen');
      if (requestedScreen && requestedScreen !== 'landing') {
        return requestedScreen as ScreenId;
      }
    }
    return 'landing';
  });
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

  const handleAcknowledgeAlert = async (alertId: string, customNotes?: string) => {
    const nowIso = new Date().toISOString();
    const dutyOfficer = user?.display_name || user?.name || user?.username || `operator.${(role || 'operator').toLowerCase()}`;
    const notes = customNotes || `Acknowledged by ${dutyOfficer}`;

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
      await api.acknowledgeAlert(alertId, notes);
      await loadAlerts();
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
      await loadAlerts();
    }
  };

  const handleResolveAlert = async (alertId: string, customNotes?: string) => {
    const nowIso = new Date().toISOString();
    const resolver = user?.display_name || user?.name || user?.username || `operator.${(role || 'operator').toLowerCase()}`;
    const notes = customNotes || `Resolved by ${resolver}`;

    // 1. Instant optimistic state update for zero-latency UI reaction
    setAlerts((prev) =>
      prev.map((al) =>
        al.id === alertId
          ? {
              ...al,
              status: 'RESOLVED',
              resolved_at: nowIso,
              resolved_by: resolver,
            }
          : al
      )
    );

    // 2. Dispatch to backend/Supabase and reconcile
    try {
      await api.resolveAlert(alertId, notes);
      await loadAlerts();
    } catch (e) {
      console.error('Failed to resolve alert:', e);
      await loadAlerts();
    }
  };

  const handleReopenAlert = async (alertId: string) => {
    // 1. Instant optimistic state update
    setAlerts((prev) =>
      prev.map((al) =>
        al.id === alertId
          ? {
              ...al,
              status: 'ACTIVE',
              resolved_at: null,
              resolved_by: null,
            }
          : al
      )
    );

    // 2. Dispatch to backend/Supabase and reconcile
    try {
      await api.reopenAlert(alertId);
      await loadAlerts();
    } catch (e) {
      console.error('Failed to reopen alert:', e);
      await loadAlerts();
    }
  };


  const unreadCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  if (currentScreen === 'landing') {
    return (
      <LandingPage 
        onSignIn={() => setCurrentScreen('login')} 
        onEnterCommandCenter={() => setCurrentScreen('login')}
      />
    );
  }

  if (currentScreen === 'login') {
    return (
      <LoginPage 
        onLoginSuccess={() => setCurrentScreen('command-center')} 
        onReturnHome={() => setCurrentScreen('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-polar-base text-polar-text-primary flex flex-col font-sans select-none">
      {/* Header */}
      <Header
        currentStationId={currentStationId}
        onStationChange={handleStationChange}
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
                onSelectStation={handleStationChange}
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
                onSelectStation={handleStationChange}
                onNavigateToAdmin={() => setCurrentScreen('admin')}
                onNavigateToScreen={setCurrentScreen}
              />
            )}

            {currentScreen === 'command-center' && (
              <ExecutiveCommandCenter
                currentStationId={currentStationId}
                onNavigate={setCurrentScreen}
                onSelectStation={handleStationChange}
              />
            )}

            {currentScreen === 'digital-twin' && (
              <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
                <Station3DViewer 
                  key={currentStationId}
                  stationId={currentStationId} 
                  onSelectStation={handleStationChange}
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

            {currentScreen === 'automation' && (
              <ProtectedRoute screenId="automation" onNavigateHome={() => setCurrentScreen('command-center')}>
                <SmartAutomationCenter
                  currentStationId={currentStationId}
                  onNavigateToDigitalTwin={() => setCurrentScreen('digital-twin')}
                  onNavigateToEnergy={() => setCurrentScreen('energy')}
                />
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
        onReopen={handleReopenAlert}
        currentStationId={currentStationId}
        currentRole={role}
        currentUser={user}
      />

    </div>
  );
};
