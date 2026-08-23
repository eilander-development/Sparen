import React from "react";
import {
  Table,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Menu,
  PiggyBank,
  LayoutDashboard,
} from "lucide-react";
import { ActiveTab } from "../types";

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMobileMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
}) => {
  const isMoreActive = [
    "dashboard",
    "sparen",
    "enablebanking",
    "categorieen",
    "koppelregels",
    "jaaroverzicht",
  ].includes(activeTab);

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobiele navigatie"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-1.5 shadow-2xl flex items-center justify-around"
    >
      {/* 1. Maandbegroting */}
      <button
        onClick={() => setActiveTab("maandbegroting")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeTab === "maandbegroting"
            ? "text-indigo-400 font-bold scale-105"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Table className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Begroting</span>
      </button>

      {/* 2. Uitgaven */}
      <button
        onClick={() => setActiveTab("uitgaven")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeTab === "uitgaven"
            ? "text-rose-400 font-bold scale-105"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <ArrowDownCircle className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Uitgaven</span>
      </button>

      {/* 3. Inkomsten */}
      <button
        onClick={() => setActiveTab("inkomsten")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeTab === "inkomsten"
            ? "text-emerald-400 font-bold scale-105"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <ArrowUpCircle className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Inkomsten</span>
      </button>

      {/* 4. Transacties */}
      <button
        onClick={() => setActiveTab("transacties")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
          activeTab === "transacties"
            ? "text-indigo-400 font-bold scale-105"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <ArrowLeftRight className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Transacties</span>
      </button>

      {/* 5. Menu / Meer */}
      <button
        onClick={onOpenMobileMenu}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          isMoreActive
            ? "text-indigo-400 font-bold scale-105"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Menu</span>
      </button>
    </nav>
  );
};
