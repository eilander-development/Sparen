import React from "react";
import {
  Calendar,
  RefreshCw,
  Plus,
  ArrowDownCircle,
  Wifi,
  Menu,
} from "lucide-react";
import { MonthlyBudget, BankAccount } from "../types";

interface HeaderProps {
  currentMonth: MonthlyBudget;
  allMonths: MonthlyBudget[];
  onSelectMonth: (monthId: string) => void;
  bankAccount: BankAccount;
  onSync: () => void;
  isSyncing: boolean;
  onOpenAddTransaction: () => void;
  onOpenAddBudgetItem: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  allMonths,
  onSelectMonth,
  bankAccount,
  onSync,
  isSyncing,
  onOpenAddTransaction,
  onOpenAddBudgetItem,
  onOpenMobileMenu,
}) => {
  return (
    <header
      id="app-header"
      className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4"
    >
      {/* Left: Mobile Hamburger & Month Selector */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Open navigatiemenu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Month Selector Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-sm">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
          <select
            id="header-month-select"
            value={currentMonth.monthId}
            onChange={(e) => onSelectMonth(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer pr-1"
          >
            {allMonths.map((m) => (
              <option key={m.monthId} value={m.monthId} className="bg-slate-800 text-white">
                {m.monthName} {m.year}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Month Navigation Chips (Desktop/Tablet) */}
        <div className="hidden xl:flex items-center gap-1 bg-slate-800/40 p-1 rounded-xl border border-slate-800">
          {["mei", "jun", "jul", "aug", "sep", "okt"].map((mId) => {
            const m = allMonths.find((x) => x.monthId === mId);
            if (!m) return null;
            const isSelected = currentMonth.monthId === mId;
            return (
              <button
                key={mId}
                onClick={() => onSelectMonth(mId)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {m.monthName.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: PSD2 Status & Quick Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Real-time Status Badge (Tablet / Desktop) */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs text-slate-300">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline text-slate-400">PSD2:</span>
          <span className="font-mono text-emerald-400 font-medium">ING</span>
          <span className="text-[10px] text-slate-500 hidden lg:inline">• {bankAccount.lastSync}</span>
        </div>

        {/* Sync Button */}
        <button
          id="header-sync-btn"
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center gap-1 sm:gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          title="Haal laatste mutaties op via EnableBanking"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSyncing ? "animate-spin" : ""}`} />
          <span className="hidden lg:inline">{isSyncing ? "Ophalen..." : "Sync Bank"}</span>
        </button>

        {/* Add Transaction */}
        <button
          id="header-add-transaction-btn"
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1 sm:gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          title="Nieuwe transactie toevoegen"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Transactie</span>
        </button>

        {/* Add Budget Item */}
        <button
          id="header-add-budget-item-btn"
          onClick={onOpenAddBudgetItem}
          className="flex items-center gap-1 sm:gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition-all active:scale-95"
          title="Nieuwe begrotingspost toevoegen"
        >
          <ArrowDownCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Nieuwe Post</span>
        </button>
      </div>
    </header>
  );
};
