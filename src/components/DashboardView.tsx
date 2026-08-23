import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Building2,
  Car,
  Receipt,
  ShoppingBag,
  ExternalLink,
  Filter
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { MonthlyBudget, Transaction, BankAccount, ActiveTab } from "../types";

interface DashboardViewProps {
  currentMonth: MonthlyBudget;
  allMonths: MonthlyBudget[];
  transactions: Transaction[];
  bankAccount: BankAccount;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentMonth,
  allMonths,
  transactions,
  bankAccount,
  onNavigateTab,
}) => {
  const [chartView, setChartView] = useState<"incomeExpense" | "netCashflow">("incomeExpense");

  // Calculate Monthly Totals
  const incomeItems = currentMonth.items.filter((i) => i.type === "inkomsten");
  const expenseItems = currentMonth.items.filter((i) => i.type === "uitgaven");
  const savingsItems = currentMonth.items.filter((i) => i.type === "sparen");

  const totalIncomeEstimated = incomeItems.reduce((sum, i) => sum + i.estimated, 0);
  const totalIncomeActual = incomeItems.reduce((sum, i) => sum + i.actual, 0);
  const totalIncomeReceived = incomeItems.reduce((sum, i) => sum + i.paidOrReceived, 0);

  const totalExpenseEstimated = expenseItems.reduce((sum, i) => sum + i.estimated, 0);
  const totalExpenseActual = expenseItems.reduce((sum, i) => sum + i.actual, 0);
  const totalExpensePaid = expenseItems.reduce((sum, i) => sum + i.paidOrReceived, 0);
  const totalExpenseRemaining = expenseItems.reduce((sum, i) => sum + Math.max(0, i.actual - i.paidOrReceived), 0);

  const totalSavingsEstimated = savingsItems.reduce((sum, i) => sum + i.estimated, 0);
  const totalSavingsActual = savingsItems.reduce((sum, i) => sum + i.actual, 0);

  const netEstimated = totalIncomeEstimated - totalExpenseEstimated;
  const netActual = totalIncomeActual - totalExpenseActual;

  // Unpaid items for current month
  const unpaidExpenses = expenseItems.filter((i) => i.actual > i.paidOrReceived && i.actual > 0);

  // Group items by category for breakdown
  const categoryGroups = [
    { name: "Inkomsten", type: "inkomsten" as const, items: incomeItems, icon: TrendingUp, color: "emerald" },
    { name: "Woning", type: "uitgaven" as const, items: currentMonth.items.filter((i) => i.group === "Woning"), icon: Building2, color: "blue" },
    { name: "Dagelijks Leven", type: "uitgaven" as const, items: currentMonth.items.filter((i) => i.group === "Dagelijks Leven"), icon: ShoppingBag, color: "purple" },
    { name: "Leningen & Hypotheek", type: "uitgaven" as const, items: currentMonth.items.filter((i) => i.group === "Leningen"), icon: Receipt, color: "amber" },
    { name: "Vervoersmiddelen", type: "uitgaven" as const, items: currentMonth.items.filter((i) => i.group === "Vervoersmiddelen"), icon: Car, color: "cyan" },
    { name: "Verzekeringen", type: "uitgaven" as const, items: currentMonth.items.filter((i) => i.group === "Verzekeringen"), icon: ShieldCheck, color: "indigo" },
    { name: "Sparen & Buffer", type: "sparen" as const, items: savingsItems, icon: PiggyBank, color: "emerald" },
  ];

  // Annual Chart Data Preparation
  const annualChartData = allMonths.map((m) => {
    const inc = m.items.filter((i) => i.type === "inkomsten").reduce((acc, x) => acc + x.actual, 0);
    const exp = m.items.filter((i) => i.type === "uitgaven").reduce((acc, x) => acc + x.actual, 0);
    const sav = m.items.filter((i) => i.type === "sparen").reduce((acc, x) => acc + x.actual, 0);
    return {
      month: m.monthName.slice(0, 3),
      fullName: m.monthName,
      Inkomsten: Math.round(inc),
      Uitgaven: Math.round(exp),
      Sparen: Math.round(sav),
      Netto: Math.round(inc - exp),
    };
  });

  // Calculate free-to-spend balance (Bank balance minus upcoming unpaid bills)
  const freeToSpend = bankAccount.balance - totalExpenseRemaining;

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Top Welcome & Notification Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Financieel Overzicht • {currentMonth.monthName} {currentMonth.year}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Realtime status gesynchroniseerd met ING Bank (IBAN: <span className="font-mono text-slate-300">NL83 INGB 0004 5658 68</span>)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Vrij Besteedbaar Saldo:</span>
            <span className={`text-base font-bold font-mono ${freeToSpend >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              € {freeToSpend.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button
            id="dashboard-view-full-budget-btn"
            onClick={() => onNavigateTab("maandbegroting")}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>PDF Begroting</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Huidig Saldo */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl shadow-sm transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Huidig Saldo (ING)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            € {bankAccount.balance.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Nog te betalen:</span>
            <span className="font-mono font-semibold text-amber-400">
              -€ {totalExpenseRemaining.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Card 2: Totale Inkomsten */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Inkomsten ({currentMonth.monthName})</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            € {totalIncomeReceived.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Begroot / Geschat:</span>
            <span className="font-mono font-medium text-slate-300">
              € {totalIncomeEstimated.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Card 3: Totale Uitgaven */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Uitgaven ({currentMonth.monthName})</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">
            € {totalExpensePaid.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Totaal Geschat:</span>
            <span className="font-mono font-medium text-slate-300">
              € {totalExpenseEstimated.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Card 4: Netto Maandresultaat */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Netto Resultaat</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black font-mono tracking-tight ${netActual >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {netActual >= 0 ? "+" : ""}€ {netActual.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Geschat Netto:</span>
            <span className="font-mono font-medium text-slate-300">
              € {netEstimated.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Main Chart & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Inkomsten vs Uitgaven Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-bold text-white text-base">Jaarlijkse Cashflow & Begroting 2026</h3>
              <p className="text-xs text-slate-400">Vergelijking van maandelijkse inkomsten, vaste lasten en spaarreserveringen</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setChartView("incomeExpense")}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                  chartView === "incomeExpense" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Inkomsten vs Uitgaven
              </button>
              <button
                onClick={() => setChartView("netCashflow")}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                  chartView === "netCashflow" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Netto Verloop
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === "incomeExpense" ? (
                <BarChart data={annualChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `€${val}`} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [`€ ${Number(value).toLocaleString("nl-NL")}`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="Inkomsten" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="Uitgaven" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="Sparen" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              ) : (
                <LineChart data={annualChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `€${val}`} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [`€ ${Number(value).toLocaleString("nl-NL")}`, "Netto Resultaat"]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Line type="monotone" dataKey="Netto" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#6366f1" }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Openstaande Rekeningen & Actie Center */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-base">Nog te Betalen ({currentMonth.monthName})</h3>
              </div>
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
                {unpaidExpenses.length} posten
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Overzicht van geplande vaste lasten die deze maand nog afgeschreven moeten worden.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {unpaidExpenses.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-800/40 rounded-xl border border-slate-800">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Alle rekeningen zijn voldaan!</p>
                  <p className="text-xs text-slate-400 mt-1">Geen openstaande posten voor {currentMonth.monthName}.</p>
                </div>
              ) : (
                unpaidExpenses.map((item) => {
                  const remaining = item.actual - item.paidOrReceived;
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                        <span className="text-[10px] text-slate-400">{item.group}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold font-mono text-amber-400">
                          € {remaining.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] font-medium bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-lg">
                          In afwachting
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Totaal openstaand:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              € {totalExpenseRemaining.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Category Budget Breakdown Progress Grid */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base">Budget vs Werkelijk per Hoofdcategorie</h3>
            <p className="text-xs text-slate-400">Bekijk de bestedingen per rubriek voor {currentMonth.monthName}</p>
          </div>
          <button
            onClick={() => onNavigateTab("categorieen")}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>Alle Categorieën</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryGroups.map((cat) => {
            const Icon = cat.icon;
            const groupEstimated = cat.items.reduce((s, i) => s + i.estimated, 0);
            const groupPaid = cat.items.reduce((s, i) => s + i.paidOrReceived, 0);
            const percentage = groupEstimated > 0 ? Math.min(100, Math.round((groupPaid / groupEstimated) * 100)) : 0;
            const isOverBudget = groupPaid > groupEstimated && groupEstimated > 0;

            return (
              <div
                key={cat.name}
                className="p-4 bg-slate-800/50 hover:bg-slate-800/80 rounded-xl border border-slate-700/60 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-700/80 flex items-center justify-center text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{cat.name}</h4>
                      <p className="text-[10px] text-slate-400">{cat.items.length} posten</p>
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold ${isOverBudget ? "text-rose-400" : "text-slate-300"}`}>
                    {percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden my-2.5">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverBudget
                        ? "bg-rose-500"
                        : cat.type === "inkomsten"
                        ? "bg-emerald-500"
                        : cat.type === "sparen"
                        ? "bg-blue-500"
                        : "bg-indigo-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Betaald: €{groupPaid.toFixed(2)}</span>
                  <span>Begroot: €{groupEstimated.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Recent Live Bank Transactions */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base">Laatste Live Banktransacties (ING Bank)</h3>
            <p className="text-xs text-slate-400">Realtime mutaties automatisch gekoppeld via EnableBanking PSD2</p>
          </div>
          <button
            id="dashboard-all-transactions-btn"
            onClick={() => onNavigateTab("transacties")}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 font-medium transition-colors"
          >
            Bekijk alle transacties ({transactions.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Datum & Tijd</th>
                <th className="py-2.5 px-3">Omschrijving</th>
                <th className="py-2.5 px-3">Categorie</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Bedrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.slice(0, 6).map((tx) => {
                const isIncome = tx.amount > 0;
                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {tx.date} {tx.time && <span className="text-slate-500 text-[10px]">{tx.time}</span>}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-white max-w-md truncate">{tx.description}</p>
                      {tx.counterparty && <span className="text-[10px] text-slate-400">{tx.counterparty}</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 text-[11px] font-medium">
                        {tx.categoryGroup}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isIncome
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                            : tx.type === "Sparen"
                            ? "bg-blue-950/60 text-blue-400 border border-blue-800/50"
                            : "bg-rose-950/60 text-rose-400 border border-rose-800/50"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-bold text-sm whitespace-nowrap ${
                        isIncome ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : ""}€ {Math.abs(tx.amount).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
