import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Table,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  ArrowLeftRight,
  Landmark,
  Tags,
  Sliders,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { ActiveTab, BankAccount } from "../types";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bankAccount: BankAccount;
  onSync: () => void;
  isSyncing: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  bankAccount,
  onSync,
  isSyncing,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("financien_sidebar_collapsed") === "true";
  });

  const isCollapsed =
    controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      const nextVal = !internalCollapsed;
      setInternalCollapsed(nextVal);
      localStorage.setItem("financien_sidebar_collapsed", String(nextVal));
    }
  };

  const menuItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: "maandbegroting", label: "Maandbegroting", icon: Table, badge: "Hoofd" },
    { id: "dashboard", label: "Dashboard (Analyse)", icon: LayoutDashboard },
    { id: "uitgaven", label: "Uitgaven", icon: ArrowDownCircle },
    { id: "inkomsten", label: "Inkomsten", icon: ArrowUpCircle },
    { id: "sparen", label: "Sparen & Buffer", icon: PiggyBank },
    { id: "transacties", label: "Transacties", icon: ArrowLeftRight, badge: "Live" },
    { id: "enablebanking", label: "Bankkoppeling", icon: Landmark, badge: "PSD2" },
    { id: "categorieen", label: "Categorieën & Rubrieken", icon: Tags },
    { id: "koppelregels", label: "Koppelregels", icon: Sliders },
    { id: "jaaroverzicht", label: "Jaaroverzicht", icon: Calendar },
  ];

  const handleSelectTab = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderContent = (collapsed: boolean) => (
    <div className="flex flex-col justify-between h-full text-slate-300 select-none overflow-y-auto overflow-x-hidden">
      {/* App Logo & Branding */}
      <div>
        <div
          className={`p-3 sm:p-4 border-b border-slate-800 flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold text-lg shrink-0 cursor-pointer"
              title="Financiën Realtime Gezinsbudget"
              onClick={() => handleSelectTab("maandbegroting")}
            >
              €
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-white tracking-tight text-base flex items-center gap-1.5">
                  Financiën{" "}
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-medium">
                    Realtime
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Gezinsbudget & PSD2</p>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && !collapsed && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Live Bank Status Indicator Pill */}
        {!collapsed ? (
          <div className="p-3 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-white">ING Bank Koppeling</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                Actief
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-slate-400">Saldo:</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                € {bankAccount.balance.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              id="sidebar-quick-sync-btn"
              onClick={onSync}
              disabled={isSyncing}
              className="w-full mt-2 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-700/70 hover:bg-slate-700 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
            >
              {isSyncing ? (
                <span className="inline-block animate-spin text-xs">⟳</span>
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {isSyncing ? "Synchroniseren..." : "Nu bank synchroniseren"}
            </button>
          </div>
        ) : (
          <div className="p-2 mx-2 my-3 flex flex-col items-center gap-2">
            <div
              className="relative group cursor-pointer"
              title={`ING Actief: € ${bankAccount.balance.toLocaleString("nl-NL", {
                minimumFractionDigits: 2,
              })}`}
            >
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
              >
                {isSyncing ? (
                  <span className="inline-block animate-spin text-xs">⟳</span>
                ) : (
                  <Landmark className="w-4 h-4" />
                )}
              </button>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className={`${collapsed ? "px-2" : "px-3"} space-y-1.5 mt-2`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                title={collapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ""}` : undefined}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center p-2.5" : "justify-between px-3 py-2.5"
                } rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? "bg-indigo-700 text-white"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Mini dot for badge when collapsed */}
                {collapsed && item.badge && !isActive && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-400"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Collapse Toggle & Profile */}
      <div className="mt-4 border-t border-slate-800 bg-slate-900/50">
        {/* Toggle Collapse Button (Desktop Only) */}
        <div className={`p-2 hidden md:flex ${collapsed ? "justify-center" : "justify-between items-center"} border-b border-slate-800/60`}>
          {!collapsed && (
            <span className="text-[11px] text-slate-400 pl-2">Menu inklappen</span>
          )}
          <button
            id="sidebar-toggle-collapse-btn"
            onClick={handleToggle}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
            title={collapsed ? "Menu uitklappen (voor meer details)" : "Menu inklappen naar iconen (voor meer schermruimte)"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-indigo-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* User Account / Profile */}
        <div className={`p-3 ${collapsed ? "flex justify-center" : "p-4"}`}>
          <div
            className="flex items-center gap-3 cursor-pointer"
            title="Mark Eilander (NL83 INGB 0004 5658 68)"
          >
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-xs shrink-0">
              ME
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">Mark Eilander</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  NL83 INGB 0004 5658 68
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="app-sidebar-desktop"
        className={`hidden md:flex ${
          isCollapsed ? "w-18" : "w-64"
        } bg-slate-900 border-r border-slate-800 flex-col shrink-0 h-screen sticky top-0 z-30 transition-[width] duration-200 ease-in-out`}
      >
        {renderContent(isCollapsed)}
      </aside>

      {/* Mobile Drawer Backdrop & Modal */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 h-full shadow-2xl z-10 animate-fade-in flex flex-col">
            {renderContent(false)}
          </div>
        </div>
      )}
    </>
  );
};

