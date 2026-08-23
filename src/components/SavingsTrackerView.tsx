import React, { useState } from "react";
import {
  PiggyBank,
  TrendingUp,
  Target,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Heart,
  Car,
  Home,
  Palmtree,
  Cat,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Landmark,
} from "lucide-react";
import { SavingsRow, BudgetItem, SavingsGoal, Transaction } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface SavingsTrackerViewProps {
  savingsHistory: SavingsRow[];
  savingsItems: BudgetItem[];
  savingsGoals: SavingsGoal[];
  transactions: Transaction[];
  onOpenAddGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (goalId: string) => void;
  onUpdateSavingsRow: (monthId: string, updates: Partial<SavingsRow>) => void;
}

export const SavingsTrackerView: React.FC<SavingsTrackerViewProps> = ({
  savingsHistory,
  savingsItems,
  savingsGoals,
  transactions,
  onOpenAddGoal,
  onEditGoal,
  onDeleteGoal,
  onUpdateSavingsRow,
}) => {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // Map icon name to Lucide component
  const getGoalIcon = (iconName: string) => {
    switch (iconName) {
      case "ShieldCheck":
        return ShieldCheck;
      case "Home":
        return Home;
      case "Palmtree":
        return Palmtree;
      case "Cat":
        return Cat;
      case "Car":
        return Car;
      case "Heart":
        return Heart;
      default:
        return PiggyBank;
    }
  };

  // Calculate goal balances dynamically based on transactions and initial amounts
  const goalsWithCalculations = savingsGoals.map((goal) => {
    // Find all matching transactions for this goal
    const goalTxs = transactions.filter((tx) => {
      if (tx.type !== "Sparen" && tx.categoryGroup !== "Spaargeld") return false;
      const cleanIban = goal.accountIban.replace(/\s+/g, "").toUpperCase();
      const inDesc = cleanIban && tx.description.toUpperCase().includes(cleanIban);
      const inCounter = cleanIban && (tx.counterparty?.toUpperCase().includes(cleanIban) || false);
      const inName = tx.description.toLowerCase().includes(goal.name.toLowerCase().split(" ")[0]);
      const isLinkedBudget = goal.categoryBudgetItemId && tx.budgetItemId === goal.categoryBudgetItemId;
      return inDesc || inCounter || inName || isLinkedBudget;
    });

    const totalFromTxs = goalTxs.reduce((sum, tx) => {
      // Inflow to savings is negative on checking account or explicit amount
      return sum + Math.abs(tx.amount);
    }, 0);

    const currentBalance = goal.initialAmount + totalFromTxs;
    const progressPercent =
      goal.targetAmount > 0
        ? Math.min(100, Math.round((currentBalance / goal.targetAmount) * 100))
        : 0;

    return {
      ...goal,
      currentBalance,
      progressPercent,
      transactions: goalTxs,
    };
  });

  const totalCalculatedSavings = goalsWithCalculations.reduce(
    (sum, g) => sum + g.currentBalance,
    0
  );
  const totalTargetSavings = goalsWithCalculations.reduce(
    (sum, g) => sum + g.targetAmount,
    0
  );
  const overallProgress =
    totalTargetSavings > 0
      ? Math.min(100, Math.round((totalCalculatedSavings / totalTargetSavings) * 100))
      : 0;

  return (
    <div id="savings-tracker-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Spaarrekeningen & Spaardoelen
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Beheer meerdere spaarrekeningen met automatische IBAN-mutatietoewijzing vanuit de betaalrekening
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Totaal Spaarsaldo:</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              € {totalCalculatedSavings.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            id="savings-add-goal-btn"
            onClick={onOpenAddGoal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Spaarrekening Toevoegen</span>
          </button>
        </div>
      </div>

      {/* Info Callout explaining the multi-account mapping solution */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-900/50 p-4 rounded-2xl flex items-start gap-3 text-xs">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-white">
            Slimme Mapping voor Meerdere Spaarrekeningen (EnableBanking Beperking Opgelost)
          </h4>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Omdat de gratis licentie van EnableBanking beperkt is tot de hoofdbetaalrekening, koppel je hieronder
            je externe spaarrekeningen met hun IBAN-nummer. Zodra er een overboeking plaatsvindt vanaf je ING betaalrekening
            naar één van deze spaarrekeningen, wordt de mutatie <strong className="text-slate-200">volledig automatisch</strong> herkend,
            bijgeteld bij het betreffende spaardoel en direct verwerkt in de maandbegroting!
          </p>
        </div>
      </div>

      {/* Spaardoelen & Rekeningen Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goalsWithCalculations.map((goal) => {
          const IconComp = getGoalIcon(goal.iconName);
          const isExpanded = expandedGoalId === goal.id;

          return (
            <div
              key={goal.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{goal.name}</h4>
                      <span className="text-[11px] text-slate-400 block">{goal.bankName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditGoal(goal)}
                      className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                      title="Bewerken"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      title="Verwijderen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* IBAN Badge */}
                <div className="bg-slate-800/80 border border-slate-700/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[11px] font-mono text-slate-300 mb-3">
                  <span className="text-slate-400 text-[10px]">IBAN:</span>
                  <span className="font-bold text-slate-200">{goal.accountIban || "Niet ingesteld"}</span>
                </div>

                {/* Balance & Target */}
                <div className="mt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Huidig Saldo:</span>
                    <span className="text-xl font-black font-mono text-emerald-400">
                      € {goal.currentBalance.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2.5">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${goal.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Doel: €{goal.targetAmount.toLocaleString("nl-NL")}</span>
                    <span className="font-bold text-slate-300">{goal.progressPercent}%</span>
                  </div>
                </div>

                {/* Inleg details */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Maandelijkse inleg:</span>
                  <span className="font-mono font-semibold text-slate-200">
                    € {goal.monthlyContribution.toFixed(2)} / mnd
                  </span>
                </div>

                {goal.notes && (
                  <p className="mt-2 text-[10px] text-slate-400 italic truncate">{goal.notes}</p>
                )}
              </div>

              {/* Transactions toggle */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                  className="w-full flex items-center justify-between text-[11px] text-indigo-400 hover:text-indigo-300 font-medium py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{goal.transactions.length} gekoppelde mutaties</span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {goal.transactions.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic py-1 text-center">
                        Nog geen transacties gematcht met deze IBAN.
                      </p>
                    ) : (
                      goal.transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="bg-slate-800/60 p-2 rounded-lg text-[10px] flex items-center justify-between font-mono"
                        >
                          <div className="truncate max-w-[150px]">
                            <span className="text-slate-400 block text-[9px]">{tx.date}</span>
                            <span className="text-slate-200 truncate">{tx.description}</span>
                          </div>
                          <span className="font-bold text-emerald-400 shrink-0 ml-2">
                            +€ {Math.abs(tx.amount).toFixed(2)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main KPI & Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Savings Chart & Overview */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Spaarsaldo Groeicurve 2026</h3>
              <p className="text-xs text-slate-400">Cumulatief verloop van alle gekoppelde spaarrekeningen</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800 font-bold">
              Totaal Doel € {totalTargetSavings.toLocaleString("nl-NL")} ({overallProgress}%)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => val.slice(0, 3)} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `€${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`€ ${Number(val).toLocaleString("nl-NL")}`, "Totaal Spaarsaldo"]}
                />
                <Area type="monotone" dataKey="totaal" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#savingsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Summary overview */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base mb-1">Spaarplan Samenvatting</h3>
            <p className="text-xs text-slate-400 mb-4">Verdeling over de {savingsGoals.length} actieve spaarrekeningen</p>

            <div className="space-y-3">
              {goalsWithCalculations.map((goal) => {
                const Icon = getGoalIcon(goal.iconName);
                return (
                  <div key={goal.id} className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs font-semibold text-white truncate max-w-[130px]">{goal.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        €{goal.currentBalance.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden my-1">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${goal.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Doel: €{goal.targetAmount}</span>
                      <span>{goal.progressPercent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onOpenAddGoal}
            className="mt-4 w-full bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nieuw Spaardoel Toevoegen</span>
          </button>
        </div>
      </div>

      {/* Complete Annual Savings Table (Directly from Page 2 of user's PDF) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-850 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="font-bold text-white text-sm tracking-wider uppercase">
              JAAROVERZICHT SPAARREKENING 2026 (PDF PAGINA 2)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">12 Maanden Overzicht</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-sans font-semibold">
                <th className="py-3 px-4">Maand</th>
                <th className="py-3 px-4 text-right">Op rekening</th>
                <th className="py-3 px-4 text-right">Sparen (Maandelijks)</th>
                <th className="py-3 px-4 text-right">Extra (Inleg)</th>
                <th className="py-3 px-4 text-right">Opgenomen</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-400">Totaal Spaarsaldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {savingsHistory.map((row) => (
                <tr key={row.monthId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-white">{row.month}</td>
                  <td className="py-3 px-4 text-right text-slate-300">
                    € {row.opRekening.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">
                    € {row.sparen.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                    {row.extra > 0 ? `+€ ${row.extra.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}` : "€ 0,00"}
                  </td>
                  <td className="py-3 px-4 text-right text-rose-400 font-semibold">
                    {row.opgenomen > 0 ? `-€ ${row.opgenomen.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}` : "€ 0,00"}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400 text-sm">
                    € {row.totaal.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
