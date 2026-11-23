import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { IncidentSimulatorModal } from './components/IncidentSimulatorModal';

import { Overview } from './pages/Overview';
import { Incidents } from './pages/Incidents';
import { IncidentDetail } from './pages/IncidentDetail';
import { AiInvestigation } from './pages/AiInvestigation';
import { RcaReports } from './pages/RcaReports';
import { Infrastructure } from './pages/Infrastructure';
import { Kubernetes } from './pages/Kubernetes';
import { LogsExplorer } from './pages/LogsExplorer';
import { MetricsTraces } from './pages/MetricsTraces';
import { Deployments } from './pages/Deployments';
import { Remediation } from './pages/Remediation';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Analytics } from './pages/Analytics';
import { Integrations } from './pages/Integrations';
import { TeamManagement } from './pages/TeamManagement';
import { AuditLogs } from './pages/AuditLogs';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash;
    }
    return 'overview';
  };

  const [currentTab, setCurrentTab] = useState<string>(getInitialTab());
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('a0000000-0000-0000-0000-000000000001');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [activeIncidentsCount, setActiveIncidentsCount] = useState<number>(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentTab(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavigate = (tab: string, incidentId?: string) => {
    if (incidentId) {
      setSelectedIncidentId(incidentId);
    }
    setCurrentTab(tab);
    window.location.hash = tab;
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <Overview
            onNavigate={handleNavigate}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />
        );
      case 'incidents':
        return (
          <Incidents
            onSelectIncident={(id) => {
              setSelectedIncidentId(id);
              setCurrentTab('incident-detail');
              window.location.hash = 'incident-detail';
            }}
            onNavigateAi={(id) => {
              setSelectedIncidentId(id);
              setCurrentTab('ai-investigation');
              window.location.hash = 'ai-investigation';
            }}
          />
        );
      case 'incident-detail':
        return (
          <IncidentDetail
            incidentId={selectedIncidentId}
            onBack={() => {
              setCurrentTab('incidents');
              window.location.hash = 'incidents';
            }}
            onNavigateAi={(id) => {
              setSelectedIncidentId(id);
              setCurrentTab('ai-investigation');
              window.location.hash = 'ai-investigation';
            }}
            onNavigateRemediation={() => {
              setCurrentTab('remediation');
              window.location.hash = 'remediation';
            }}
          />
        );
      case 'ai-investigation':
        return (
          <AiInvestigation
            incidentId={selectedIncidentId}
            onNavigateRemediation={() => {
              setCurrentTab('remediation');
              window.location.hash = 'remediation';
            }}
          />
        );
      case 'rca-reports':
        return <RcaReports />;
      case 'infrastructure':
        return <Infrastructure />;
      case 'kubernetes':
        return <Kubernetes />;
      case 'logs':
        return <LogsExplorer />;
      case 'metrics-traces':
        return <MetricsTraces />;
      case 'deployments':
        return <Deployments />;
      case 'remediation':
        return <Remediation />;
      case 'knowledge-base':
        return <KnowledgeBase />;
      case 'analytics':
        return <Analytics />;
      case 'integrations':
        return <Integrations />;
      case 'team':
        return <TeamManagement />;
      case 'audit-logs':
        return <AuditLogs />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview onNavigate={handleNavigate} onOpenSimulator={() => setIsSimulatorOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* 16-Tab Navigation Sidebar (Responsive Drawer on Mobile) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          handleNavigate(tab);
        }}
        activeIncidentsCount={activeIncidentsCount}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          currentTabTitle={currentTab}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          activeIncidentsCount={activeIncidentsCount}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>

      {/* 8-Scenario Demo Incident Simulator Modal */}
      <IncidentSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onTriggered={(result) => {
          setActiveIncidentsCount((prev) => prev + 1);
          if (result?.incidentId) {
            setSelectedIncidentId(result.incidentId);
          }
          handleNavigate('overview');
        }}
      />
    </div>
  );
};

export default App;
