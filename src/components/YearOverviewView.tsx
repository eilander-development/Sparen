import React from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";
import { MonthlyBudget } from "../types";

interface YearOverviewViewProps {
  allMonths: MonthlyBudget[];
  onSelectMonth: (monthId: string) => void;
}

export const YearOverviewView: React.FC<YearOverviewViewProps> = ({
  allMonths,
  onSelectMonth,
}) => {
  const monthData = allMonths.map((m) => {
    const income = m.items.filter((i) => i.type === "inkomsten").reduce((s, i) => s + i.actual, 0);
    const expense = m.items.filter((i) => i.type === "uitgaven").reduce((s, i) => s + i.actual, 0);
    const savings = m.items.filter((i) => i.type === "sparen").reduce((s, i) => s + i.actual, 0);
    const net = income - expense;
    return {
      monthId: m.monthId,
      name: m.monthName,
      opRekening: m.opRekening,
      income,
      expense,
      savings,
      net,
    };
  });

  const totalYearIncome = monthData.reduce((s, m) => s + m.income, 0);
  const totalYearExpense = monthData.reduce((s, m) => s + m.expense, 0);
  const totalYearSavings = monthData.reduce((s, m) => s + m.savings, 0);
  const totalYearNet = totalYearIncome - totalYearExpense;

  return (
    <div id="year-overview-view" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Jaaroverzicht Begroting 2026 (12 Maanden Matrix)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Volledige jaarplanning met inkomsten, vaste lasten, spaarreserveringen en maandoverschotten
          </p>
        </div>
      </div>

      {/* Annual Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Jaar Inkomsten</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            € {totalYearIncome.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Jaar Uitgaven</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-2">
            € {totalYearExpense.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Jaar Spaarreservering</span>
          <div className="text-2xl font-black text-blue-400 font-mono mt-2">
            € {totalYearSavings.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Netto Jaaroverschot</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            € {totalYearNet.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-sans font-semibold">
                <th className="py-3 px-4">Maand</th>
                <th className="py-3 px-4 text-right">Op rekening</th>
                <th className="py-3 px-4 text-right text-emerald-400">Inkomsten</th>
                <th className="py-3 px-4 text-right text-rose-400">Uitgaven</th>
                <th className="py-3 px-4 text-right text-blue-400">Sparen</th>
                <th className="py-3 px-4 text-right font-bold text-white">Netto Saldo</th>
                <th className="py-3 px-4 text-center font-sans">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {monthData.map((m) => (
                <tr key={m.monthId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-white">{m.name}</td>
                  <td className="py-3 px-4 text-right text-slate-300">
                    € {m.opRekening.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                    € {m.income.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-rose-400 font-semibold">
                    € {m.expense.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-blue-400">
                    € {m.savings.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${m.net >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {m.net >= 0 ? "+" : ""}€ {m.net.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <button
                      onClick={() => onSelectMonth(m.monthId)}
                      className="text-xs bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                    >
                      Bekijk Maand
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-950/60 border-t-2 border-slate-700 font-bold text-white">
                <td className="py-3.5 px-4 font-sans text-sm">JAARTOTAAL 2026</td>
                <td className="py-3.5 px-4 text-right text-slate-400">-</td>
                <td className="py-3.5 px-4 text-right text-emerald-400 text-sm">
                  € {totalYearIncome.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-right text-rose-400 text-sm">
                  € {totalYearExpense.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-right text-blue-400 text-sm">
                  € {totalYearSavings.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-right text-emerald-400 text-sm">
                  € {totalYearNet.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
