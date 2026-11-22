import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  Zap,
  Globe2,
  ChevronDown,
  UserCheck,
  Sun,
  Moon,
  Menu,
  Check,
  LogOut,
  Settings as SettingsIcon,
  Shield,
  Building2,
  AlertTriangle,
  X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

interface NavbarProps {
  currentTabTitle: string;
  onOpenSimulator: () => void;
  activeIncidentsCount?: number;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTabTitle,
  onOpenSimulator,
  activeIncidentsCount = 1,
  onToggleMobileMenu,
  isMobileMenuOpen = false
}) => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  // Dropdown states
  const [isEnvOpen, setIsEnvOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentEnv, setCurrentEnv] = useState('prod-us-east');

  const envRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const environments = [
    { id: 'prod-us-east', label: 'prod-us-east', region: 'AWS EKS us-east-1', status: 'Healthy' },
    { id: 'prod-eu-central', label: 'prod-eu-central', region: 'AWS EKS eu-central-1', status: 'Healthy' },
    { id: 'staging-us-east', label: 'staging-us-east', region: 'Staging Cluster', status: 'Degraded' },
    { id: 'dev-sandbox', label: 'dev-sandbox', region: 'Local Compose Stack', status: 'Healthy' }
  ];

  const notifications = [
    {
      id: 'notif-1',
      title: 'SEV_1: Payment Gateway HTTP 500 Outage',
      service: 'payment-service',
      time: '2m ago',
      unread: true
    },
    {
      id: 'notif-2',
      title: 'HikariCP connection pool exhausted',
      service: 'payment-service',
      time: '6m ago',
      unread: true
    },
    {
      id: 'notif-3',
      title: 'Rollback authorized for payment-service v4.0.2',
      service: 'ArgoCD / SRE Runner',
      time: '14m ago',
      unread: false
    },
    {
      id: 'notif-4',
      title: 'Kafka Consumer Lag spike on orders-topic',
      service: 'order-service',
      time: '28m ago',
      unread: false
    }
  ];

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (envRef.current && !envRef.current.contains(event.target as Node)) {
        setIsEnvOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-4 md:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 sticky top-0 z-30 transition-colors duration-200">
      {/* Left: Mobile Menu Button & Tab Title */}
      <div className="flex items-center gap-3 md:gap-6 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="min-w-0">
          <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white capitalize truncate">
            {currentTabTitle.replace('-', ' ')}
          </h2>
        </div>

        {/* Global Search Input */}
        <div className="relative w-64 lg:w-80 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incidents, logs, trace IDs..."
            className="w-full bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Dropdowns & Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Environment Selector Dropdown */}
        <div className="relative" ref={envRef}>
          <button
            onClick={() => setIsEnvOpen(!isEnvOpen)}
            className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950/70 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Globe2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline">{currentEnv}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isEnvOpen ? 'rotate-180' : ''}`} />
          </button>

          {isEnvOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Target Environment
              </div>
              {environments.map((env) => (
                <button
                  key={env.id}
                  onClick={() => {
                    setCurrentEnv(env.id);
                    setIsEnvOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
                    currentEnv === env.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>{env.label}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-[10px] text-slate-400">{env.region}</div>
                  </div>
                  {currentEnv === env.id && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Demo Incident Trigger Button */}
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-rose-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Simulate Incident</span>
          <span className="sm:hidden">Simulate</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {activeIncidentsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {activeIncidentsCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">Active Notifications</span>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/40">
                  {notifications.filter((n) => n.unread).length} Unread
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/40">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`pt-2 p-2 rounded-xl transition-colors cursor-pointer ${
                      notif.unread
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white leading-tight truncate">
                          {notif.title}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{notif.service}</span>
                          <span>{notif.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                >
                  Mark all as read
                </button>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline">
                  View Alert Center
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all transform active:scale-95"
          aria-label="Toggle Light and Dark Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-180 duration-300" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800 text-left transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-300 dark:border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-sm">
              AV
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-white">{user?.fullName || 'Alex Vance'}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span>{user?.role || 'Lead SRE'}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">{user?.fullName || 'Alex Vance'}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">alex.vance@acme.com</div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40">
                    Lead SRE
                  </span>
                  <span className="text-[10px] text-slate-400">Acme Cloud</span>
                </div>
              </div>

              <div className="pt-1 space-y-0.5">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Account &amp; Security</span>
                </button>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Organization Switcher</span>
                </button>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  <span>Platform Preferences</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
