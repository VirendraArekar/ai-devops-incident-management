import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Bot,
  FileText,
  Server,
  Layers,
  FileCode2,
  Activity,
  GitBranch,
  Wrench,
  BookOpen,
  BarChart3,
  Plug,
  Users,
  ShieldCheck,
  Settings,
  ShieldAlert,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeIncidentsCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeIncidentsCount = 1,
  isOpen = false,
  onClose
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle, badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined, badgeColor: 'bg-rose-500' },
    { id: 'ai-investigation', label: 'AI Investigation', icon: Bot, badge: 'Live', badgeColor: 'bg-indigo-500' },
    { id: 'rca-reports', label: 'RCA Reports', icon: FileText },
    { id: 'infrastructure', label: 'Infrastructure', icon: Server },
    { id: 'kubernetes', label: 'Kubernetes', icon: Layers },
    { id: 'logs', label: 'Logs Explorer', icon: FileCode2 },
    { id: 'metrics-traces', label: 'Metrics & Traces', icon: Activity },
    { id: 'deployments', label: 'Deployments', icon: GitBranch },
    { id: 'remediation', label: 'Remediation', icon: Wrench, badge: '1 Pending', badgeColor: 'bg-amber-500' },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    if (onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 h-full select-none transition-colors duration-200">
      {/* Brand Logo Header */}
      <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              SRE Agent <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">AI</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Autonomous Incident Ops</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Incident Response &amp; AI
        </div>
        {menuItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${item.badgeColor || 'bg-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Observability &amp; Infra
        </div>
        {menuItems.slice(4, 10).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${item.badgeColor || 'bg-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Governance &amp; Config
        </div>
        {menuItems.slice(10).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Cluster & Tenant Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-2.5 py-2 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate font-mono text-[11px] text-slate-700 dark:text-slate-300">prod-eks-us-east-1</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">99.92%</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer with Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
