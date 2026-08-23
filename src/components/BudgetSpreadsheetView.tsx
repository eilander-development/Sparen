import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Check,
  X,
  Plus,
  Calendar,
  Wallet,
  Utensils,
  Home,
  Car,
  Shield,
  PiggyBank,
  Landmark,
  Layers,
  ShoppingBag,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Eye,
} from "lucide-react";
import { MonthlyBudget, BudgetItem, BudgetCategoryGroup, Transaction, ActiveTab } from "../types";

interface BudgetSpreadsheetViewProps {
  currentMonth: MonthlyBudget;
  allMonths: MonthlyBudget[];
  transactions: Transaction[];
  onSelectMonth: (monthId: string) => void;
  onUpdateBudgetItem: (itemId: string, updates: Partial<BudgetItem>) => void;
  onOpenAddBudgetItem: () => void;
  onOpenEditBudgetItem?: (item: BudgetItem) => void;
  onOpenItemTransactions?: (item: BudgetItem) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

interface CategoryGroupDef {
  title: string;
  groupKey: BudgetCategoryGroup;
  type: "inkomsten" | "uitgaven" | "sparen";
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
}

const CATEGORY_GROUPS: CategoryGroupDef[] = [
  {
    title: "Inkomsten",
    groupKey: "Inkomsten",
    type: "inkomsten",
    icon: Wallet,
    iconBg: "bg-emerald-500/15 border-emerald-500/30",
    iconColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
    badgeText: "Inkomsten",
    badgeLabel: "Inkomsten",
  },
  {
    title: "Dagelijks Leven (Eten & Huishouden)",
    groupKey: "Dagelijks Leven",
    type: "uitgaven",
    icon: Utensils,
    iconBg: "bg-rose-500/15 border-rose-500/30",
    iconColor: "text-rose-400",
    badgeBg: "bg-rose-500/20 border-rose-500/40 text-rose-300",
    badgeText: "Uitgaven",
    badgeLabel: "Uitgaven",
  },
  {
    title: "Woning & Energie",
    groupKey: "Woning",
    type: "uitgaven",
    icon: Home,
    iconBg: "bg-indigo-500/15 border-indigo-500/30",
    iconColor: "text-indigo-400",
    badgeBg: "bg-rose-500/20 border-rose-500/40 text-rose-300",
    badgeText: "Uitgaven",
    badgeLabel: "Uitgaven",
  },
  {
    title: "Vervoersmiddelen & Brandstof",
    groupKey: "Vervoersmiddelen",
    type: "uitgaven",
    icon: Car,
    iconBg: "bg-amber-500/15 border-amber-500/30",
    iconColor: "text-amber-400",
    badgeBg: "bg-rose-500/20 border-rose-500/40 text-rose-300",
    badgeText: "Uitgaven",
    badgeLabel: "Uitgaven",
  },
  {
    title: "Verzekeringen",
    groupKey: "Verzekeringen",
    type: "uitgaven",
    icon: Shield,
    iconBg: "bg-purple-500/15 border-purple-500/30",
    iconColor: "text-purple-400",
    badgeBg: "bg-rose-500/20 border-rose-500/40 text-rose-300",
    badgeText: "Uitgaven",
    badgeLabel: "Uitgaven",
  },
  {
    title: "Spaargeld & Doelen",
    groupKey: "Spaargeld",
    type: "sparen",
    icon: PiggyBank,
    iconBg: "bg-blue-500/15 border-blue-500/30",
    iconColor: "text-blue-400",
    badgeBg: "bg-blue-500/20 border-blue-500/40 text-blue-300",
    badgeText: "Sparen",
    badgeLabel: "Sparen",
  },
  {
    title: "Leningen & Hypotheek",
    groupKey: "Leningen",
    type: "uitgaven",
    icon: Landmark,
    iconBg: "bg-cyan-500/15 border-cyan-500/30",
    iconColor: "text-cyan-400",
    badgeBg: "bg-rose-500/20 border-rose-500/40 text-rose-300",
    badgeText: "Uitgaven",
    badgeLabel: "Uitgaven",
  },
  {
    title: "Overige Vaste Kosten",
    groupKey: "Overige Vaste Kosten",
    type: "uitgaven",
    icon: Layers,
    iconBg: "bg-teal-500/15 border-teal-500/30",
    iconColor: "text-teal-400",
    badgeBg: "bg-rose-500/20 border-rose-500/40 text-rose-300",
    badgeText: "Uitgaven",
    badgeLabel: "Uitgaven",
  },
  {
    title: "Overige Kosten & Variabel",
    groupKey: "Overige Kosten",
    type: "uitgaven",
    icon: ShoppingBag,
    iconBg: "bg-slate-500/15 border-slate-500/30",
    iconColor: "text-slate-400",
    badgeBg: "bg-rose-500/20 border-rose-500/40 text-rose-300",
    badgeText: "Uitgaven",
    badgeLabel: "Uitgaven",
  },
];

export const BudgetSpreadsheetView: React.FC<BudgetSpreadsheetViewProps> = ({
  currentMonth,
  allMonths,
  transactions,
  onSelectMonth,
  onUpdateBudgetItem,
  onOpenAddBudgetItem,
  onOpenEditBudgetItem,
  onOpenItemTransactions,
  onNavigateTab,
}) => {
  const [selectedGroupModal, setSelectedGroupModal] = useState<CategoryGroupDef | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"alle" | "inkomsten" | "uitgaven" | "sparen">("alle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editActual, setEditActual] = useState<number>(0);

  // Month navigation
  const currentIndex = allMonths.findIndex((m) => m.monthId === currentMonth.monthId);
  const prevMonth = currentIndex > 0 ? allMonths[currentIndex - 1] : null;
  const nextMonth = currentIndex < allMonths.length - 1 ? allMonths[currentIndex + 1] : null;

  // Filter transactions for this specific month
  const monthPrefix = `2026-${(currentIndex + 1).toString().padStart(2, "0")}`;
  const monthTransactions = transactions.filter((t) => t.date.startsWith(monthPrefix));

  // Compute Overall Totals
  const incomeItems = currentMonth.items.filter((i) => i.type === "inkomsten");
  const expenseItems = currentMonth.items.filter((i) => i.type === "uitgaven");
  const savingsItems = currentMonth.items.filter((i) => i.type === "sparen");

  const totalIncomeBudget = incomeItems.reduce((s, i) => s + i.actual, 0);
  const totalIncomeReceived = incomeItems.reduce((s, i) => s + i.paidOrReceived, 0);
  const totalIncomeRemaining = incomeItems.reduce(
    (s, i) => s + (i.paidOrReceived < i.actual ? i.actual - i.paidOrReceived : 0),
    0
  );
  const totalIncomeSurplus = incomeItems.reduce(
    (s, i) => s + (i.paidOrReceived > i.actual ? i.paidOrReceived - i.actual : 0),
    0
  );

  const totalExpenseBudget = expenseItems.reduce((s, i) => s + i.actual, 0);
  const totalExpensePaid = expenseItems.reduce((s, i) => s + i.paidOrReceived, 0);
  const totalExpenseRemaining = expenseItems.reduce(
    (s, i) => s + (i.paidOrReceived < i.actual ? i.actual - i.paidOrReceived : 0),
    0
  );
  const totalExpenseOverpaid = expenseItems.reduce(
    (s, i) => s + (i.paidOrReceived > i.actual ? i.paidOrReceived - i.actual : 0),
    0
  );

  const totalSavingsBudget = savingsItems.reduce((s, i) => s + i.actual, 0);
  const totalSavingsPaid = savingsItems.reduce((s, i) => s + i.paidOrReceived, 0);

  const handleStartEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditActual(item.actual);
  };

  const handleSaveEdit = (itemId: string) => {
    onUpdateBudgetItem(itemId, { actual: editActual });
    setEditingId(null);
  };

  const handleExportCSV = () => {
    let csv = "Categoriegroep,Post,Betalingen,Budget,Ontvangen / Betaald,Nog openstaand\n";
    currentMonth.items.forEach((item) => {
      const pending =
        item.type === "inkomsten"
          ? item.paidOrReceived >= item.actual
            ? `+${(item.paidOrReceived - item.actual).toFixed(2)}`
            : (item.actual - item.paidOrReceived).toFixed(2)
          : item.paidOrReceived > item.actual
          ? `-${(item.paidOrReceived - item.actual).toFixed(2)}`
          : (item.actual - item.paidOrReceived).toFixed(2);

      csv += `"${item.group}","${item.name}",${item.paymentCount || 0},${item.actual.toFixed(2)},${item.paidOrReceived.toFixed(2)},"${pending}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Maandbegroting-${currentMonth.monthName}-${currentMonth.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredGroups = CATEGORY_GROUPS.filter((grp) => {
    if (filterType !== "alle" && grp.type !== filterType) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (grp.title.toLowerCase().includes(q)) return true;
    const items = currentMonth.items.filter((i) => i.group === grp.groupKey);
    return items.some((i) => i.name.toLowerCase().includes(q));
  });

  return (
    <div id="budget-cards-view" className="space-y-6">
      {/* Top Header & Month Selector Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Left: Month selection pills & navigation buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => prevMonth && onSelectMonth(prevMonth.monthId)}
              disabled={!prevMonth}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-lg"
              title="Vorige maand"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white text-sm font-sans tracking-wide">
                {currentMonth.monthName} {currentMonth.year}
              </span>
            </div>
            <button
              onClick={() => nextMonth && onSelectMonth(nextMonth.monthId)}
              disabled={!nextMonth}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-lg"
              title="Volgende maand"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Month Tabs */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto max-w-xl py-0.5">
            {allMonths.map((m) => {
              const isSelected = m.monthId === currentMonth.monthId;
              return (
                <button
                  key={m.monthId}
                  onClick={() => onSelectMonth(m.monthId)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {m.monthName.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Search & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Zoek budgetpost..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 w-36 sm:w-48 placeholder-slate-500"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="hidden sm:flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setFilterType("alle")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterType === "alle" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setFilterType("inkomsten")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterType === "inkomsten" ? "bg-emerald-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Inkomsten
            </button>
            <button
              onClick={() => setFilterType("uitgaven")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterType === "uitgaven" ? "bg-rose-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Uitgaven
            </button>
            <button
              onClick={() => setFilterType("sparen")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterType === "sparen" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Sparen
            </button>
          </div>

          <button
            onClick={onOpenAddBudgetItem}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nieuwe Post</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[#101726] border border-slate-800/80 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Totaal Inkomsten</span>
            <span className="text-emerald-400 font-semibold">{incomeItems.length} posten</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-white font-mono">
              € {totalIncomeBudget.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-medium">
              Ontvangen: €{totalIncomeReceived.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-[#101726] border border-slate-800/80 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Totaal Uitgaven</span>
            <span className="text-rose-400 font-semibold">{expenseItems.length} posten</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-white font-mono">
              € {totalExpenseBudget.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-rose-400 font-mono font-medium">
              Betaald: €{totalExpensePaid.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-[#101726] border border-slate-800/80 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Totaal Spaargeld</span>
            <span className="text-blue-400 font-semibold">{savingsItems.length} doelen</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-white font-mono">
              € {totalSavingsBudget.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-blue-400 font-mono font-medium">
              Ingelegd: €{totalSavingsPaid.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-[#101726] border border-slate-800/80 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Netto Overschot / Saldo</span>
            <span className="text-indigo-400 font-semibold">Begroot</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-lg font-bold font-mono ${
                totalIncomeBudget - totalExpenseBudget >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              € {(totalIncomeBudget - totalExpenseBudget).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Werkelijk: €{(totalIncomeReceived - totalExpensePaid).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Category Cards (Exact matching the user's design) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredGroups.map((grp) => {
          const Icon = grp.icon;
          const items = currentMonth.items.filter((i) => i.group === grp.groupKey);

          if (items.length === 0 && searchQuery) return null;

          const totalBudget = items.reduce((s, i) => s + i.actual, 0);
          const totalPaidOrReceived = items.reduce((s, i) => s + i.paidOrReceived, 0);
          const totalPaymentCount = items.reduce((s, i) => s + (i.paymentCount || 0), 0);

          // For Inkomsten:
          // If total received > total budget -> Teveel ontvangen (Surplus, green banner)
          const incomeSurplus = grp.type === "inkomsten" ? Math.max(0, totalPaidOrReceived - totalBudget) : 0;
          const incomeRemaining = grp.type === "inkomsten" ? Math.max(0, totalBudget - totalPaidOrReceived) : 0;

          // For Uitgaven / Sparen:
          // If total paid > total budget -> Teveel betaald (Over budget, red banner)
          const expenseOverpaid = grp.type !== "inkomsten" ? Math.max(0, totalPaidOrReceived - totalBudget) : 0;
          const expenseRemaining = grp.type !== "inkomsten" ? Math.max(0, totalBudget - totalPaidOrReceived) : 0;

          return (
            <div
              key={grp.groupKey}
              id={`card-budget-${grp.groupKey.toLowerCase().replace(/\s+/g, "-")}`}
              className="bg-[#101726] border border-slate-800/90 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between hover:border-slate-700/80 transition-all"
            >
              <div>
                {/* Card Header: Icon, Category Name, Subtitle, Openen link & Type badge */}
                <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${grp.iconBg}`}>
                      <Icon className={`w-4 h-4 ${grp.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm tracking-tight">{grp.title}</h3>
                      <p className="text-xs text-slate-400 font-normal">{items.length} budgetten</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setSelectedGroupModal(grp)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors flex items-center gap-1"
                    >
                      <span>Openen</span>
                    </button>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${grp.badgeBg}`}
                    >
                      {grp.badgeLabel}
                    </span>
                  </div>
                </div>

                {/* Table matching screenshot */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 font-sans font-medium text-[11px]">
                        <th className="py-2.5 px-4">Categorie</th>
                        <th className="py-2.5 px-3 text-center">Betalingen</th>
                        <th className="py-2.5 px-3 text-right">Budget</th>
                        <th className="py-2.5 px-3 text-right">
                          {grp.type === "inkomsten" ? "Ontvangen" : "Betaald"}
                        </th>
                        <th className="py-2.5 px-4 text-right">
                          {grp.type === "inkomsten" ? "Nog te ontvangen" : "Nog te betalen"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {items.map((item) => {
                        const isEditing = editingId === item.id;
                        const paymentCount = item.paymentCount ?? (item.paidOrReceived > 0 ? 1 : 0);

                        // Inkomsten logic
                        const isIncome = grp.type === "inkomsten";
                        const incomeDiff = item.paidOrReceived - item.actual;
                        const isIncomeSurplus = isIncome && incomeDiff > 0;
                        const isIncomePending = isIncome && item.paidOrReceived < item.actual && item.actual > 0;
                        const isIncomeExact = isIncome && item.paidOrReceived === item.actual;

                        // Uitgaven / Sparen logic
                        const expenseDiff = item.paidOrReceived - item.actual;
                        const isOverBudget = !isIncome && expenseDiff > 0;
                        const isExpensePending = !isIncome && item.paidOrReceived < item.actual;

                        if (isEditing) {
                          return (
                            <tr key={item.id} className="bg-indigo-950/40">
                              <td className="py-2 px-4 font-sans font-medium text-white">{item.name}</td>
                              <td className="py-2 px-3 text-center text-slate-400">{paymentCount}</td>
                              <td className="py-1 px-2 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editActual}
                                  onChange={(e) => setEditActual(parseFloat(e.target.value) || 0)}
                                  className="w-24 bg-slate-800 text-white text-right px-1.5 py-0.5 rounded border border-indigo-500 focus:outline-none font-mono text-xs"
                                  autoFocus
                                />
                              </td>
                              <td className="py-2 px-3 text-right text-slate-300">
                                € {item.paidOrReceived.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleSaveEdit(item.id)}
                                    className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                                    title="Opslaan"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                                    title="Annuleren"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-800/40 transition-colors group"
                          >
                            {/* Categorie */}
                            <td className="py-2.5 px-4 font-sans font-medium text-slate-200">
                              <div className="flex items-center justify-between">
                                <span
                                  className="truncate max-w-[180px] hover:text-indigo-300 cursor-pointer"
                                  onClick={() =>
                                    onOpenItemTransactions
                                      ? onOpenItemTransactions(item)
                                      : onOpenEditBudgetItem
                                      ? onOpenEditBudgetItem(item)
                                      : handleStartEdit(item)
                                  }
                                  title="Klik om gekoppelde transacties te bekijken"
                                >
                                  {item.name}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {onOpenItemTransactions && (
                                    <button
                                      onClick={() => onOpenItemTransactions(item)}
                                      className="p-1 hover:text-indigo-300 text-slate-400 rounded hover:bg-slate-700 transition-colors"
                                      title="Transactieoverzicht bekijken"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => (onOpenEditBudgetItem ? onOpenEditBudgetItem(item) : handleStartEdit(item))}
                                    className="p-1 hover:text-white text-slate-400 rounded hover:bg-slate-700 transition-colors"
                                    title="Post bewerken (bedrag, verdeling)"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Betalingen */}
                            <td className="py-2.5 px-3 text-center text-slate-400 font-sans">
                              {onOpenItemTransactions ? (
                                <button
                                  onClick={() => onOpenItemTransactions(item)}
                                  className={`px-2 py-0.5 rounded-full text-xs font-mono transition-all ${
                                    paymentCount > 0
                                      ? "bg-slate-800 text-indigo-300 hover:bg-indigo-900/60 hover:text-white border border-slate-700/80"
                                      : "text-slate-500 hover:text-slate-300"
                                  }`}
                                  title={`Bekijk ${paymentCount} gekoppelde transactie(s) voor ${item.name}`}
                                >
                                  {paymentCount}
                                </button>
                              ) : (
                                paymentCount
                              )}
                            </td>

                            {/* Budget */}
                            <td className="py-2.5 px-3 text-right text-slate-200">
                              € {item.actual.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                            </td>

                            {/* Ontvangen / Betaald */}
                            <td className="py-2.5 px-3 text-right text-slate-200">
                              {onOpenItemTransactions ? (
                                <button
                                  onClick={() => onOpenItemTransactions(item)}
                                  className="hover:text-indigo-300 hover:underline font-mono transition-colors"
                                  title="Klik om gekoppelde bankmutaties te inspecteren"
                                >
                                  € {item.paidOrReceived.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                                </button>
                              ) : (
                                `€ ${item.paidOrReceived.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}`
                              )}
                            </td>

                            {/* Nog te ontvangen / Nog te betalen */}
                            <td className="py-2.5 px-4 text-right font-medium">
                              {isIncome ? (
                                isIncomeSurplus ? (
                                  <span className="text-emerald-400 font-bold">
                                    +€ {incomeDiff.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                                  </span>
                                ) : isIncomePending ? (
                                  <span className="text-amber-400 font-bold">
                                    € {(item.actual - item.paidOrReceived).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">€ 0,00</span>
                                )
                              ) : (
                                isOverBudget ? (
                                  <span className="text-rose-400 font-bold">
                                    € -{expenseDiff.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                                  </span>
                                ) : isExpensePending && item.paidOrReceived > 0 ? (
                                  <span className="text-amber-400">
                                    € {(item.actual - item.paidOrReceived).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                                  </span>
                                ) : isExpensePending && item.paidOrReceived === 0 ? (
                                  <span className="text-slate-300">
                                    € {item.actual.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">€ 0,00</span>
                                )
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    {/* Totaal row */}
                    <tfoot>
                      <tr className="border-t border-slate-700/80 bg-slate-900/60 font-bold text-white text-xs">
                        <td className="py-3 px-4 font-sans">Totaal</td>
                        <td className="py-3 px-3 text-center text-slate-400 font-sans">
                          {totalPaymentCount > 0 ? totalPaymentCount : ""}
                        </td>
                        <td className="py-3 px-3 text-right">
                          € {totalBudget.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right">
                          € {totalPaidOrReceived.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {grp.type === "inkomsten" ? (
                            incomeRemaining > 0 ? (
                              <span className="text-amber-400">
                                € {incomeRemaining.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span>€ 0,00</span>
                            )
                          ) : (
                            expenseRemaining > 0 ? (
                              <span>
                                € {expenseRemaining.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span>€ 0,00</span>
                            )
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Solid Highlight Footer Banner (Exact matching the screenshot) */}
              {grp.type === "inkomsten" ? (
                incomeSurplus > 0 ? (
                  <div className="bg-emerald-600 text-white font-bold px-4 py-2.5 flex items-center justify-between text-xs tracking-wide">
                    <span>Teveel ontvangen</span>
                    <span className="font-mono text-sm font-extrabold">
                      +€ {incomeSurplus.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : incomeRemaining > 0 ? (
                  <div className="bg-amber-950/60 border-t border-amber-800/40 text-amber-300 font-medium px-4 py-2.5 flex items-center justify-between text-xs tracking-wide">
                    <span>Nog te ontvangen deze maand</span>
                    <span className="font-mono text-sm font-bold text-amber-400">
                      € {incomeRemaining.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : (
                  <div className="bg-slate-800/60 border-t border-slate-700/60 text-slate-300 font-medium px-4 py-2.5 flex items-center justify-between text-xs tracking-wide">
                    <span>Inkomsten volledig ontvangen</span>
                    <span className="text-emerald-400 font-bold font-mono">✓ Voldaan</span>
                  </div>
                )
              ) : (
                expenseOverpaid > 0 ? (
                  <div className="bg-red-600 text-white font-bold px-4 py-2.5 flex items-center justify-between text-xs tracking-wide">
                    <span>Teveel betaald</span>
                    <span className="font-mono text-sm font-extrabold">
                      € -{expenseOverpaid.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : expenseRemaining > 0 ? (
                  <div className="bg-slate-800/50 border-t border-slate-700/50 text-slate-300 font-medium px-4 py-2.5 flex items-center justify-between text-xs tracking-wide">
                    <span>Binnen budget (Nog te betalen)</span>
                    <span className="font-mono text-sm font-bold text-slate-200">
                      € {expenseRemaining.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : (
                  <div className="bg-emerald-950/40 border-t border-emerald-800/40 text-emerald-300 font-medium px-4 py-2.5 flex items-center justify-between text-xs tracking-wide">
                    <span>Alles voldaan binnen budget</span>
                    <span className="text-emerald-400 font-bold font-mono">✓ 100% Betaald</span>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Category Detail Modal (Triggered by clicking "Openen") */}
      {selectedGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${selectedGroupModal.iconBg}`}>
                  <selectedGroupModal.icon className={`w-5 h-5 ${selectedGroupModal.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedGroupModal.title}</h3>
                  <p className="text-xs text-slate-400">
                    Begrotingsposten en gekoppelde bankmutaties voor {currentMonth.monthName} {currentMonth.year}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGroupModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6 overflow-y-auto">
              {/* Category Line Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Begrotingsposten
                </h4>
                <div className="space-y-2">
                  {currentMonth.items
                    .filter((i) => i.group === selectedGroupModal.groupKey)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-white text-sm">{item.name}</p>
                          <p className="text-xs text-slate-400">
                            {item.paymentCount || 0} gekoppelde transacties
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-slate-400">Budget</p>
                            <p className="font-bold text-white font-mono text-sm">
                              € {item.actual.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="text-right pl-3 border-l border-slate-700">
                            <p className="text-xs text-slate-400">
                              {item.type === "inkomsten" ? "Ontvangen" : "Betaald"}
                            </p>
                            <p
                              className={`font-bold font-mono text-sm ${
                                item.paidOrReceived >= item.actual && item.actual > 0
                                  ? "text-emerald-400"
                                  : "text-amber-400"
                              }`}
                            >
                              € {item.paidOrReceived.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Transactions in this category this month */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Banktransacties ({selectedGroupModal.title})</span>
                  <span className="text-[11px] font-normal text-indigo-400">Live vanuit bank</span>
                </h4>

                {monthTransactions.filter((t) => t.categoryGroup === selectedGroupModal.groupKey).length === 0 ? (
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                    Nog geen banktransacties geregistreerd voor deze categorie in {currentMonth.monthName}.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {monthTransactions
                      .filter((t) => t.categoryGroup === selectedGroupModal.groupKey)
                      .map((tx) => (
                        <div
                          key={tx.id}
                          className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <span className="text-slate-500 text-[11px] shrink-0">{tx.date}</span>
                            <span className="font-sans font-medium text-slate-200 truncate max-w-[260px]">
                              {tx.counterparty || tx.description}
                            </span>
                          </div>
                          <span
                            className={`font-bold ${
                              tx.amount > 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {tx.amount > 0 ? "+" : ""}€ {Math.abs(tx.amount).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedGroupModal(null);
                  onOpenAddBudgetItem();
                }}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nieuwe post in deze groep toevoegen</span>
              </button>
              <button
                onClick={() => setSelectedGroupModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-xl text-xs font-medium transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
