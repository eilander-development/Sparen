import React, { useState } from "react";
import {
  ArrowUpCircle,
  TrendingUp,
  Briefcase,
  Baby,
  Receipt,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Eye,
} from "lucide-react";
import { MonthlyBudget, BudgetItem, Transaction } from "../types";

interface IncomeViewProps {
  currentMonth: MonthlyBudget;
  allMonths?: MonthlyBudget[];
  transactions?: Transaction[];
  onUpdateBudgetItem: (itemId: string, updates: Partial<BudgetItem>) => void;
  onOpenAddBudgetItem: () => void;
  onOpenEditBudgetItem?: (item: BudgetItem) => void;
  onOpenItemTransactions?: (item: BudgetItem) => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  currentMonth,
  allMonths,
  transactions = [],
  onUpdateBudgetItem,
  onOpenAddBudgetItem,
  onOpenEditBudgetItem,
  onOpenItemTransactions,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const incomeItems = currentMonth.items.filter((i) => i.type === "inkomsten");

  const totalIncomeBudget = incomeItems.reduce((s, i) => s + i.actual, 0);
  const totalIncomeReceived = incomeItems.reduce((s, i) => s + i.paidOrReceived, 0);
  const totalIncomePending = incomeItems.reduce(
    (s, i) => s + Math.max(0, i.actual - i.paidOrReceived),
    0
  );
  const totalIncomeSurplus = incomeItems.reduce(
    (s, i) => s + (i.paidOrReceived > i.actual ? i.paidOrReceived - i.actual : 0),
    0
  );

  return (
    <div id="income-view" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Inkomsten & Toeslagen • {currentMonth.monthName} {currentMonth.year}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Overzicht van salaris, kindgebonden budget, kinderbijslag en belastingteruggave met automatische bankherkenning
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
            title="Uitleg over Budget vs Betaald/Ontvangen"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Waarom Budget vs Bank?</span>
          </button>

          <button
            onClick={onOpenAddBudgetItem}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Inkomstenbron Toevoegen</span>
          </button>
        </div>
      </div>

      {/* Info Callout explaining Budget vs Live Bank */}
      {showExplanation && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl text-xs text-slate-300 space-y-2 animate-fade-in">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Het verschil tussen "Budget" en "Ontvangen via rekening":</span>
          </h4>
          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
            <li>
              <strong className="text-white">Budget:</strong> Het bedrag dat je voor deze specifieke maand verwacht (bijv. € 0,00 voor Kinderbijslag in augustus, of € 299,97 in juli/oktober).
            </li>
            <li>
              <strong className="text-white">Ontvangen via bank:</strong> Het realtime bedrag dat via je gekoppelde bankrekening (PSD2) daadwerkelijk is bijgeschreven.
            </li>
            <li>
              <strong className="text-white">Waarom beide nuttig zijn:</strong> Zo zie je vóórdat een maand begint wat je cashflow zal zijn, en zie je tijdens de maand direct of alles tijdig en correct is binnengekomen.
            </li>
          </ul>
        </div>
      )}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#101726] border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Totaal Begroot ({currentMonth.monthName}):</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            € {totalIncomeBudget.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{incomeItems.length} inkomstenbronnen</span>
        </div>

        <div className="bg-[#101726] border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Reeds Bijgeschreven (Bank):</span>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            € {totalIncomeReceived.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-500 mt-0.5 block">
            {totalIncomeBudget > 0 ? `${Math.round((totalIncomeReceived / totalIncomeBudget) * 100)}% ontvangen` : "100% voldaan"}
          </span>
        </div>

        <div className="bg-[#101726] border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Nog te Ontvangen:</span>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">
            € {totalIncomePending.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Openstaande posten</span>
        </div>

        <div className="bg-[#101726] border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Extra / Meervallers:</span>
          <div className="text-xl font-bold text-indigo-400 font-mono mt-1">
            € {totalIncomeSurplus.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Boven begroting</span>
        </div>
      </div>

      {/* Income Stream Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incomeItems.map((item) => {
          const isZeroBudget = item.actual === 0;
          const isZeroPaid = item.paidOrReceived === 0;
          const isZeroNotApplicable = isZeroBudget && isZeroPaid;

          const isReceived = !isZeroBudget && item.paidOrReceived >= item.actual;
          const isPartiallyReceived = !isZeroBudget && item.paidOrReceived > 0 && item.paidOrReceived < item.actual;
          const isPending = !isZeroBudget && item.paidOrReceived === 0;
          const isSurplus = item.paidOrReceived > item.actual;

          const pendingAmount = Math.max(0, item.actual - item.paidOrReceived);
          const surplusAmount = Math.max(0, item.paidOrReceived - item.actual);

          return (
            <div
              key={item.id}
              className="bg-[#101726] border border-slate-800/90 hover:border-slate-700/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all"
            >
              <div>
                {/* Header of card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      {item.name.toLowerCase().includes("salaris") || item.name.toLowerCase().includes("mark") ? (
                        <Briefcase className="w-5 h-5" />
                      ) : item.name.toLowerCase().includes("kind") ? (
                        <Baby className="w-5 h-5" />
                      ) : (
                        <Receipt className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{item.name}</h4>
                      <span className="text-xs text-slate-400">
                        {item.name.toLowerCase().includes("kinderbijslag")
                          ? "Kwartaalpost (Jan, Apr, Jul, Okt)"
                          : "Maandelijkse inkomstenbron"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {isZeroNotApplicable ? (
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700/80 flex items-center gap-1.5">
                        <span>Geen uitkering deze maand (€0)</span>
                      </span>
                    ) : isReceived ? (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Bijgeschreven via Bank</span>
                      </span>
                    ) : isPartiallyReceived ? (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/80 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Deels ontvangen</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/80 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>In afwachting</span>
                      </span>
                    )}

                    {/* Edit Button */}
                    {onOpenEditBudgetItem && (
                      <button
                        onClick={() => onOpenEditBudgetItem(item)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Post en maandbedragen aanpassen"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Clear 2-column breakdown */}
                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-sans font-medium text-slate-400">Begroot voor {currentMonth.monthName}:</span>
                    <span className="font-bold text-white text-sm">
                      € {item.actual.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300 pt-1.5 border-t border-slate-800">
                    <span className="font-sans font-medium text-slate-400">Ontvangen op rekening (Live bank):</span>
                    <span className={`font-bold text-sm ${item.paidOrReceived > 0 ? "text-emerald-400" : "text-slate-400"}`}>
                      € {item.paidOrReceived.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {pendingAmount > 0 && (
                    <div className="flex justify-between items-center text-amber-400 pt-1.5 border-t border-slate-800">
                      <span className="font-sans font-medium">Nog te ontvangen:</span>
                      <span className="font-bold">
                        € {pendingAmount.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {surplusAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-400 pt-1.5 border-t border-slate-800">
                      <span className="font-sans font-medium">Teveel / Extra ontvangen:</span>
                      <span className="font-bold">
                        +€ {surplusAmount.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action row at bottom */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  {item.paymentCount || (item.paidOrReceived > 0 ? 1 : 0)} bankmutatie(s)
                </span>
                {onOpenItemTransactions ? (
                  <button
                    onClick={() => onOpenItemTransactions(item)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 hover:underline py-0.5 px-1 rounded transition-colors"
                    title={`Bekijk alle gekoppelde bankmutaties voor ${item.name}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Bekijk transacties</span>
                  </button>
                ) : onOpenEditBudgetItem ? (
                  <button
                    onClick={() => onOpenEditBudgetItem(item)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span>Budget/Maanden bewerken</span>
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
