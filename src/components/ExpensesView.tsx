import React, { useState } from "react";
import {
  ArrowDownCircle,
  Search,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  HelpCircle,
  TrendingDown,
  Eye,
  Receipt,
} from "lucide-react";
import { MonthlyBudget, BudgetItem, BudgetCategoryGroup, Transaction } from "../types";

interface ExpensesViewProps {
  currentMonth: MonthlyBudget;
  allMonths?: MonthlyBudget[];
  transactions?: Transaction[];
  onUpdateBudgetItem: (itemId: string, updates: Partial<BudgetItem>) => void;
  onOpenAddBudgetItem: () => void;
  onOpenEditBudgetItem?: (item: BudgetItem) => void;
  onOpenItemTransactions?: (item: BudgetItem) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  currentMonth,
  allMonths,
  transactions = [],
  onUpdateBudgetItem,
  onOpenAddBudgetItem,
  onOpenEditBudgetItem,
  onOpenItemTransactions,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [showExplanation, setShowExplanation] = useState(false);

  const expenseItems = currentMonth.items.filter((i) => i.type === "uitgaven");

  const filteredItems = expenseItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "ALL" || item.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const totalExpenseBudget = expenseItems.reduce((s, i) => s + i.actual, 0);
  const totalExpensePaid = expenseItems.reduce((s, i) => s + i.paidOrReceived, 0);
  const totalExpenseRemaining = expenseItems.reduce(
    (s, i) => s + Math.max(0, i.actual - i.paidOrReceived),
    0
  );
  const totalExpenseOverpaid = expenseItems.reduce(
    (s, i) => s + (i.paidOrReceived > i.actual ? i.paidOrReceived - i.actual : 0),
    0
  );

  const expenseGroups: BudgetCategoryGroup[] = [
    "Woning",
    "Dagelijks Leven",
    "Vervoersmiddelen",
    "Verzekeringen",
    "Leningen",
    "Overige Vaste Kosten",
    "Overige Kosten",
  ];

  return (
    <div id="expenses-view" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Uitgaven & Vaste Lasten • {currentMonth.monthName} {currentMonth.year}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gedetailleerd beheer van alle woonlasten, abonnementen, leningen en dagelijkse uitgaven met automatische incassoherkenning
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
            title="Uitleg over Budget vs Betaald"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Waarom Budget vs Bank?</span>
          </button>

          <button
            onClick={onOpenAddBudgetItem}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nieuwe Uitgave Post</span>
          </button>
        </div>
      </div>

      {/* Info Callout */}
      {showExplanation && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl text-xs text-slate-300 space-y-2 animate-fade-in">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span>Het verschil tussen "Budget" en "Betaald via rekening":</span>
          </h4>
          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
            <li>
              <strong className="text-white">Budget:</strong> Het bedrag dat je voor deze post in deze maand hebt gereserveerd (bijv. € 500 voor Boodschappen of € 150 voor Verwarming).
            </li>
            <li>
              <strong className="text-white">Betaald via rekening:</strong> De som van alle echte bankafschrijvingen van deze maand die aan deze post zijn gekoppeld.
            </li>
            <li>
              <strong className="text-white">Inzicht:</strong> Zo zie je meteen of een automatische incasso al is afgeschreven, of je nog budget over hebt, of dat je over budget gaat.
            </li>
          </ul>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#101726] border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Totaal Begroot ({currentMonth.monthName}):</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            € {totalExpenseBudget.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{expenseItems.length} begrotingsposten</span>
        </div>

        <div className="bg-[#101726] border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Reeds Afgeschreven (Bank):</span>
          <div className="text-xl font-bold text-rose-400 font-mono mt-1">
            € {totalExpensePaid.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-rose-400/80 mt-0.5 block">
            {totalExpenseBudget > 0 ? `${Math.round((totalExpensePaid / totalExpenseBudget) * 100)}% voldaan` : "0%"}
          </span>
        </div>

        <div className="bg-[#101726] border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Nog te Betalen (Binnen budget):</span>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">
            € {totalExpenseRemaining.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Verwachte incasso's</span>
        </div>

        <div className="bg-[#101726] border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Budgetoverschrijdingen:</span>
          <div className="text-xl font-bold text-rose-500 font-mono mt-1">
            € {totalExpenseOverpaid.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Boven begroting betaald</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#101726] border border-slate-800 p-4 rounded-2xl shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Zoek in uitgavenposten (bv. Hypotheek, GreenChoice, Benzine)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setSelectedGroup("ALL")}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
              selectedGroup === "ALL"
                ? "bg-indigo-600 text-white font-semibold"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Alle Rubrieken
          </button>
          {expenseGroups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                selectedGroup === grp
                  ? "bg-indigo-600 text-white font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Expense Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isZeroBudget = item.actual === 0;
          const isZeroPaid = item.paidOrReceived === 0;
          const isZeroNotApplicable = isZeroBudget && isZeroPaid;

          const isPaid = !isZeroBudget && item.paidOrReceived >= item.actual;
          const isPartiallyPaid = !isZeroBudget && item.paidOrReceived > 0 && item.paidOrReceived < item.actual;
          const isOverBudget = !isZeroBudget && item.paidOrReceived > item.actual;
          const pending = Math.max(0, item.actual - item.paidOrReceived);
          const percent = item.actual > 0 ? Math.min(100, Math.round((item.paidOrReceived / item.actual) * 100)) : 0;

          return (
            <div
              key={item.id}
              className="bg-[#101726] border border-slate-800 hover:border-slate-700 p-4 rounded-2xl shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <span className="text-[11px] text-slate-400">{item.group}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Status Badge */}
                    {isZeroNotApplicable ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Niet van toepassing (€0)
                      </span>
                    ) : isOverBudget ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800 flex items-center gap-1">
                        Teveel betaald
                      </span>
                    ) : isPaid ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Voldaan via Bank</span>
                      </span>
                    ) : isPartiallyPaid ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Deels voldaan</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Openstaand</span>
                      </span>
                    )}

                    {onOpenEditBudgetItem && (
                      <button
                        onClick={() => onOpenEditBudgetItem(item)}
                        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Budget en frequentie aanpassen"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar if applicable */}
                {!isZeroNotApplicable && (
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-3">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverBudget
                          ? "bg-rose-500"
                          : isPaid
                          ? "bg-emerald-500"
                          : isPartiallyPaid
                          ? "bg-amber-500"
                          : "bg-slate-700"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}

                <div className="space-y-1 text-xs font-mono mt-3">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-sans text-slate-400">Budget ({currentMonth.monthName}):</span>
                    <span className="font-semibold text-white">
                      € {item.actual.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                    <span className="font-sans text-slate-400">Betaald via rekening (Auto):</span>
                    <span className={`font-semibold ${item.paidOrReceived > 0 ? "text-rose-400" : "text-slate-400"}`}>
                      € {item.paidOrReceived.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {pending > 0 && (
                    <div className="flex justify-between text-amber-400 font-semibold pt-1 border-t border-slate-800">
                      <span className="font-sans">Nog te betalen:</span>
                      <span>€ {pending.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {isOverBudget && (
                    <div className="flex justify-between text-rose-400 font-semibold pt-1 border-t border-slate-800">
                      <span className="font-sans">Overschrijding:</span>
                      <span>€ -{(item.paidOrReceived - item.actual).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom footer button */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] font-mono">
                  {item.paymentCount || (item.paidOrReceived > 0 ? 1 : 0)} afschrijving(en)
                </span>
                {onOpenItemTransactions ? (
                  <button
                    onClick={() => onOpenItemTransactions(item)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs flex items-center gap-1.5 hover:underline py-0.5 px-1 rounded transition-colors"
                    title={`Bekijk alle gekoppelde bankmutaties voor ${item.name}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Bekijk transacties</span>
                  </button>
                ) : onOpenEditBudgetItem ? (
                  <button
                    onClick={() => onOpenEditBudgetItem(item)}
                    className="text-indigo-400 hover:text-indigo-300 font-medium text-xs hover:underline"
                  >
                    Aanpassen
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
