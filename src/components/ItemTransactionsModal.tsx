import React, { useState, useMemo } from "react";
import {
  X,
  Receipt,
  Calendar,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  Unlink,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Link2,
  ExternalLink,
  ChevronRight,
  Filter
} from "lucide-react";
import {
  BudgetItem,
  MonthlyBudget,
  Transaction,
  BudgetCategoryGroup,
} from "../types";

interface ItemTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetItem: BudgetItem | null;
  currentMonth: MonthlyBudget;
  allMonths?: MonthlyBudget[];
  transactions: Transaction[];
  onUnlinkTransaction?: (txId: string) => void;
  onLinkTransaction?: (txId: string, group: BudgetCategoryGroup, itemId: string) => void;
  onOpenEditBudgetItem?: (item: BudgetItem) => void;
  onAddTransactionToItem?: (itemId: string, itemGroup: BudgetCategoryGroup) => void;
}

export const ItemTransactionsModal: React.FC<ItemTransactionsModalProps> = ({
  isOpen,
  onClose,
  budgetItem,
  currentMonth,
  allMonths = [],
  transactions,
  onUnlinkTransaction,
  onLinkTransaction,
  onOpenEditBudgetItem,
  onAddTransactionToItem,
}) => {
  const [filterScope, setFilterScope] = useState<"current_month" | "all_history">("current_month");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter linked transactions
  const linkedTransactions = useMemo(() => {
    if (!budgetItem) return [];
    return transactions.filter((t) => {
      // Direct budget item id match OR fallback to name keyword if explicitly linked
      const matchesItem = t.budgetItemId === budgetItem.id;
      if (!matchesItem) return false;

      if (filterScope === "current_month") {
        // Match current month (e.g. 2026-08)
        return t.date.startsWith(currentMonth.id);
      }
      return true;
    });
  }, [transactions, budgetItem, filterScope, currentMonth.id]);

  // Search filtered
  const filteredList = useMemo(() => {
    return linkedTransactions.filter((t) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        t.description.toLowerCase().includes(term) ||
        (t.counterparty && t.counterparty.toLowerCase().includes(term)) ||
        t.amount.toString().includes(term) ||
        t.date.includes(term)
      );
    });
  }, [linkedTransactions, searchTerm]);

  // Potential suggestions: unlinked transactions that contain words of this post name
  const suggestedUnlinkedTransactions = useMemo(() => {
    if (!budgetItem) return [];
    const keywords = budgetItem.name
      .replace(/[()]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    if (keywords.length === 0) return [];

    return transactions.filter((t) => {
      // Must not already be linked to this post
      if (t.budgetItemId === budgetItem.id) return false;
      // If already linked to another post, skip unless uncategorized
      if (t.budgetItemId && t.categoryGroup !== "Ongecategoriseerd") return false;

      const desc = (t.description + " " + (t.counterparty || "")).toLowerCase();
      return keywords.some((kw) => desc.includes(kw.toLowerCase()));
    }).slice(0, 3);
  }, [transactions, budgetItem]);

  if (!isOpen || !budgetItem) return null;

  // Calculate sum of linked transactions for this post
  const totalPaidInView = linkedTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const isIncome = budgetItem.type === "inkomsten";
  const isSaving = budgetItem.type === "sparen";

  const budgetAmount = budgetItem.actual;
  const difference = isIncome
    ? totalPaidInView - budgetAmount
    : budgetAmount - totalPaidInView;

  return (
    <div
      id="item-transactions-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-850 px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isIncome
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : isSaving
                  ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-400"
              }`}
            >
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">{budgetItem.name}</h3>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-medium">
                  {budgetItem.group}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Transactieoverzicht & gekoppelde bankmutaties voor deze begrotingspost
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenEditBudgetItem && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEditBudgetItem(budgetItem);
                }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                title="Begroot bedrag of frequentie aanpassen"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Post Bewerken</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Post Financial Summary Header Card */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40 space-y-3 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-slate-400 text-[11px] block font-medium">Begroot ({currentMonth.monthName}):</span>
              <span className="text-sm sm:text-base font-bold text-white font-mono mt-0.5 block">
                € {budgetAmount.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-slate-400 text-[11px] block font-medium">
                {isIncome ? "Ontvangen (Bank):" : "Betaald via Bank:"}
              </span>
              <span
                className={`text-sm sm:text-base font-bold font-mono mt-0.5 block ${
                  isIncome ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                € {totalPaidInView.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-slate-400 text-[11px] block font-medium">
                {isIncome ? "Verschil:" : "Resterend / Verschil:"}
              </span>
              <span
                className={`text-sm sm:text-base font-bold font-mono mt-0.5 block ${
                  difference >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {difference >= 0 ? "€ " : "€ -"}
                {Math.abs(difference).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-slate-400 text-[11px] block font-medium">Mutaties gekoppeld:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm sm:text-base font-bold text-white font-mono">
                  {linkedTransactions.length}
                </span>
                {linkedTransactions.length > 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
            </div>
          </div>

          {/* Scope switch & Search Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
              <button
                onClick={() => setFilterScope("current_month")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterScope === "current_month"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {currentMonth.monthName} {currentMonth.year}
              </button>
              <button
                onClick={() => setFilterScope("all_history")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterScope === "all_history"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Alle Historie
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Zoek in mutaties..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Transactions List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Smart Suggestions Callout (if any matching unlinked mutaties found) */}
          {suggestedUnlinkedTransactions.length > 0 && onLinkTransaction && (
            <div className="bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 p-3.5 rounded-xl space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Gevonden bankmutaties die mogelijk bij deze post horen:</span>
              </div>

              <div className="space-y-2">
                {suggestedUnlinkedTransactions.map((suggestedTx) => (
                  <div
                    key={suggestedTx.id}
                    className="bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-lg flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 text-[10px]">{suggestedTx.date}</span>
                        <span className="text-white font-medium truncate">{suggestedTx.description}</span>
                      </div>
                      {suggestedTx.counterparty && (
                        <p className="text-[10px] text-slate-400 truncate">
                          Tegenpartij: {suggestedTx.counterparty}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-rose-400 text-xs">
                        € {Math.abs(suggestedTx.amount).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() =>
                          onLinkTransaction(suggestedTx.id, budgetItem.group, budgetItem.id)
                        }
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                      >
                        <Link2 className="w-3 h-3" />
                        <span>Koppel nu</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actual List of Matched Transactions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Gekoppelde Mutaties ({filteredList.length})
            </h4>

            {filteredList.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 p-6 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                  <Receipt className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-white text-sm">Geen transacties gekoppeld</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Er zijn in {filterScope === "current_month" ? `${currentMonth.monthName} ${currentMonth.year}` : "de historie"} nog geen banktransacties direct aan <strong>{budgetItem.name}</strong> toegewezen.
                  </p>
                </div>

                {onAddTransactionToItem && (
                  <button
                    onClick={() => {
                      onClose();
                      onAddTransactionToItem(budgetItem.id, budgetItem.group);
                    }}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Boeking handmatig toevoegen</span>
                  </button>
                )}
              </div>
            ) : (
              filteredList.map((tx) => {
                const txIncome = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 p-3.5 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-400">{tx.date}</span>
                        {tx.time && <span className="font-mono text-[10px] text-slate-500">{tx.time}</span>}
                        <span className="text-[10px] bg-slate-700/80 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                          {tx.source}
                        </span>
                        {tx.matchedRuleId && (
                          <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.2 rounded font-mono">
                            Auto-regel
                          </span>
                        )}
                      </div>
                      <h5 className="font-semibold text-white text-sm break-words">{tx.description}</h5>
                      {tx.counterparty && (
                        <p className="text-[11px] text-slate-400">
                          Tegenpartij: <span className="text-slate-300 font-medium">{tx.counterparty}</span>
                          {tx.accountIban && (
                            <span className="font-mono text-slate-500 ml-1.5">({tx.accountIban})</span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50">
                      <div
                        className={`font-mono font-bold text-sm sm:text-base ${
                          txIncome ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {txIncome ? "+" : ""}€ {Math.abs(tx.amount).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                      </div>

                      {onUnlinkTransaction && (
                        <button
                          onClick={() => onUnlinkTransaction(tx.id)}
                          className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700/60 transition-colors"
                          title="Ontkoppel deze transactie van deze post"
                        >
                          <Unlink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-850 px-5 py-3.5 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2">
            {onAddTransactionToItem && (
              <button
                onClick={() => {
                  onClose();
                  onAddTransactionToItem(budgetItem.id, budgetItem.group);
                }}
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>+ Mutatie handmatig toevoegen</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
