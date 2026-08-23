import React, { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  Search,
  Filter,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  PiggyBank,
  Sliders,
  CheckSquare,
  Square,
  Trash2,
  Tag,
  Check,
  AlertCircle,
  Link2,
  CheckCircle2,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import {
  Transaction,
  BudgetCategoryGroup,
  Rule,
  BudgetItem,
  CategoryDefinition,
  BudgetType
} from "../types";
import { LinkTransactionModal } from "./LinkTransactionModal";

interface TransactionsViewProps {
  transactions: Transaction[];
  onAddTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
  onLinkTransaction: (
    txId: string,
    categoryGroup: BudgetCategoryGroup,
    budgetItemId: string,
    createRule?: {
      name: string;
      keyword: string;
      matchField: "description" | "counterparty" | "both";
      targetType: BudgetType;
    }
  ) => void;
  onCreateRuleFromTransaction: (
    keyword: string,
    targetGroup: BudgetCategoryGroup,
    targetType: "inkomsten" | "uitgaven" | "sparen"
  ) => void;
  onBulkUpdateCategory: (ids: string[], newCategory: BudgetCategoryGroup, newBudgetItemId?: string) => void;
  rules: Rule[];
  budgetItems: BudgetItem[];
  categories: CategoryDefinition[];
  onOpenAddBudgetItemModal?: (group?: BudgetCategoryGroup) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onLinkTransaction,
  onCreateRuleFromTransaction,
  onBulkUpdateCategory,
  rules,
  budgetItems,
  categories,
  onOpenAddBudgetItemModal,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "UNLINKED" | "LINKED" | "Inkomsten" | "Uitgave" | "Sparen">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState<BudgetCategoryGroup>("Dagelijks Leven");
  const [bulkBudgetItemId, setBulkBudgetItemId] = useState<string>("");

  // Modal state for linking transaction
  const [selectedTxForLinking, setSelectedTxForLinking] = useState<Transaction | null>(null);

  // Map budget items by ID for quick lookup
  const budgetItemMap = useMemo(() => {
    const map = new Map<string, BudgetItem>();
    budgetItems.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [budgetItems]);

  // Count unlinked vs linked
  const unlinkedCount = useMemo(() => {
    return transactions.filter((t) => !t.budgetItemId || t.categoryGroup === "Ongecategoriseerd").length;
  }, [transactions]);

  const linkedCount = transactions.length - unlinkedCount;

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    const isUnlinked = !tx.budgetItemId || tx.categoryGroup === "Ongecategoriseerd";

    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.counterparty && tx.counterparty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.budgetItemId && budgetItemMap.get(tx.budgetItemId)?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tx.amount.toString().includes(searchTerm);

    if (!matchesSearch) return false;

    if (filterType === "UNLINKED" && !isUnlinked) return false;
    if (filterType === "LINKED" && isUnlinked) return false;
    if (filterType === "Inkomsten" && tx.type !== "Inkomsten") return false;
    if (filterType === "Uitgave" && tx.type !== "Uitgave") return false;
    if (filterType === "Sparen" && tx.type !== "Sparen") return false;

    if (selectedCategory !== "ALL" && tx.categoryGroup !== selectedCategory) return false;

    return true;
  });

  const handleSelectAll = () => {
    if (selectedTxIds.length === filtered.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(filtered.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedTxIds.includes(id)) {
      setSelectedTxIds(selectedTxIds.filter((x) => x !== id));
    } else {
      setSelectedTxIds([...selectedTxIds, id]);
    }
  };

  const handleApplyBulkCategory = () => {
    if (selectedTxIds.length === 0) return;
    onBulkUpdateCategory(selectedTxIds, bulkCategory, bulkBudgetItemId || undefined);
    setSelectedTxIds([]);
  };

  // Categories list
  const categoryOptions = useMemo(() => {
    if (categories.length > 0) return categories.map((c) => c.name);
    return [
      "Inkomsten",
      "Woning",
      "Dagelijks Leven",
      "Vervoersmiddelen",
      "Verzekeringen",
      "Spaargeld",
      "Leningen",
      "Overige Vaste Kosten",
      "Overige Kosten",
    ];
  }, [categories]);

  const bulkItemsInSelectedGroup = budgetItems.filter((i) => i.group === bulkCategory);

  return (
    <div id="transactions-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Banktransacties & Mutaties ({transactions.length})
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Realtime feed afkomstig van ING Bankrekening • Koppel transacties direct aan begrotingsposten en automatiseer met koppelregels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAddTransaction}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Transactie Toevoegen</span>
          </button>
        </div>
      </div>

      {/* Unlinked Transactions Attention Alert Banner */}
      {unlinkedCount > 0 && filterType !== "UNLINKED" && (
        <div className="bg-gradient-to-r from-amber-950/70 to-slate-900 border border-amber-600/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                {unlinkedCount} {unlinkedCount === 1 ? "transactie is" : "transacties zijn"} nog niet direct gekoppeld aan een begrotingspost
              </p>
              <p className="text-amber-200/80 text-xs mt-0.5">
                Koppel deze mutaties aan een specifieke post zodat je werkelijke maanduitgaven 1-op-1 kloppen met je begroting.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterType("UNLINKED")}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <span>Toon {unlinkedCount} ongekoppelde</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Zoek op omschrijving, bedrijf, begrotingspost of bedrag (bv. Albert Heijn, Boodschappen, € 45,80)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">Alle Categorieën</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type & Linking Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          {[
            { id: "ALL", label: `Alle (${transactions.length})`, count: transactions.length },
            {
              id: "UNLINKED",
              label: `Niet direct gekoppeld (${unlinkedCount})`,
              count: unlinkedCount,
              isWarning: unlinkedCount > 0,
            },
            { id: "LINKED", label: `Gekoppeld (${linkedCount})`, count: linkedCount },
            { id: "Uitgave", label: `Uitgaven (${transactions.filter((t) => t.type === "Uitgave").length})` },
            { id: "Inkomsten", label: `Inkomsten (${transactions.filter((t) => t.type === "Inkomsten").length})` },
            { id: "Sparen", label: `Sparen (${transactions.filter((t) => t.type === "Sparen").length})` },
          ].map((tab) => {
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? tab.id === "UNLINKED" && tab.isWarning
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                      : "bg-indigo-600 text-white font-semibold shadow-sm"
                    : tab.id === "UNLINKED" && tab.isWarning
                    ? "bg-amber-950/50 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60 font-semibold"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750"
                }`}
              >
                {tab.id === "UNLINKED" && tab.isWarning && <AlertCircle className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk Action Bar (when rows selected) */}
      {selectedTxIds.length > 0 && (
        <div className="bg-indigo-950/90 border border-indigo-700/80 p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-white shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 px-2.5 py-1 rounded-lg font-bold text-xs shadow-sm">
              {selectedTxIds.length}
            </span>
            <span className="font-medium">transacties geselecteerd voor bulkactie</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bulk Category Selector */}
            <select
              value={bulkCategory}
              onChange={(e) => {
                const grp = e.target.value as BudgetCategoryGroup;
                setBulkCategory(grp);
                const itemsInGrp = budgetItems.filter((i) => i.group === grp);
                setBulkBudgetItemId(itemsInGrp.length > 0 ? itemsInGrp[0].id : "");
              }}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Bulk Post Selector */}
            <select
              value={bulkBudgetItemId}
              onChange={(e) => setBulkBudgetItemId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="">(Optioneel: kies post)</option>
              {bulkItemsInSelectedGroup.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleApplyBulkCategory}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Toewijzen aan {selectedTxIds.length} transacties</span>
            </button>

            <button
              onClick={() => setSelectedTxIds([])}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Deselecteer
            </button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-3 w-10 text-center">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-white">
                    {selectedTxIds.length === filtered.length && filtered.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">Datum & Tijd</th>
                <th className="py-3.5 px-3">Omschrijving / Tegenpartij</th>
                <th className="py-3.5 px-3">Rubriek & Begrotingspost</th>
                <th className="py-3.5 px-3">Bron</th>
                <th className="py-3.5 px-3 text-right">Bedrag</th>
                <th className="py-3.5 px-3 text-center">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
                    <p className="font-semibold text-sm text-slate-300">Geen transacties gevonden</p>
                    <p className="text-xs text-slate-500">Pas de filters of zoekterm aan om resultaten te tonen.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isSelected = selectedTxIds.includes(tx.id);
                  const isIncome = tx.amount > 0;
                  const hasMatchedRule = !!tx.matchedRuleId;
                  const matchedPost = tx.budgetItemId ? budgetItemMap.get(tx.budgetItemId) : undefined;
                  const isDirectlyLinked = !!tx.budgetItemId && tx.categoryGroup !== "Ongecategoriseerd";

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected
                          ? "bg-indigo-950/30"
                          : !isDirectlyLinked
                          ? "bg-amber-950/10 hover:bg-amber-950/20"
                          : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button onClick={() => toggleSelectOne(tx.id)} className="text-slate-400 hover:text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                        <div className="text-slate-200">{tx.date}</div>
                        {tx.time && <div className="text-[10px] text-slate-500">{tx.time}</div>}
                      </td>

                      {/* Description & Counterparty */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white max-w-sm sm:max-w-md truncate">
                          {tx.description}
                        </div>
                        {tx.counterparty && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-300">Tegenpartij: {tx.counterparty}</span>
                            {tx.accountIban && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="font-mono text-[10px] text-slate-500">{tx.accountIban}</span>
                              </>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Category & Budget Item / Post */}
                      <td className="py-3 px-3">
                        {isDirectlyLinked ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Specific Post Name Badge */}
                              <button
                                onClick={() => setSelectedTxForLinking(tx)}
                                className="inline-flex items-center gap-1 font-semibold text-white bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 px-2 py-0.5 rounded-lg text-xs transition-colors group"
                                title="Klik om de gekoppelde begrotingspost te wijzigen"
                              >
                                <Tag className="w-3 h-3 text-indigo-400 group-hover:scale-110 transition-transform" />
                                <span>{matchedPost ? matchedPost.name : tx.budgetItemId}</span>
                              </button>

                              {/* Rule Badge */}
                              {hasMatchedRule && (
                                <span
                                  className="text-[9px] bg-slate-800 text-indigo-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono"
                                  title="Automatisch gematcht via koppelregel"
                                >
                                  Regel
                                </span>
                              )}
                            </div>

                            {/* Category Group Label */}
                            <div className="text-[10px] text-slate-400 font-medium">
                              Rubriek: <span className="text-slate-300">{tx.categoryGroup}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {/* Prominent Unlinked Warning Badge & Quick Link Button */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg font-medium text-[11px]">
                                <AlertCircle className="w-3 h-3 text-amber-400" />
                                Niet direct gekoppeld
                              </span>

                              <button
                                onClick={() => setSelectedTxForLinking(tx)}
                                className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all shadow-sm active:scale-95"
                                title="Koppel deze transactie aan een begrotingspost en maak eventueel een regel"
                              >
                                <Link2 className="w-3 h-3" />
                                <span>Koppel aan post...</span>
                              </button>
                            </div>

                            {tx.categoryGroup && tx.categoryGroup !== "Ongecategoriseerd" && (
                              <div className="text-[10px] text-slate-500">
                                Voorlopige groep: {tx.categoryGroup}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3">
                        <span className="text-[10px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
                          {tx.source}
                        </span>
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-3 px-3 text-right font-mono font-bold text-sm whitespace-nowrap ${
                          isIncome ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isIncome ? "+" : ""}€ {Math.abs(tx.amount).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Link / Change Post Button */}
                          <button
                            onClick={() => setSelectedTxForLinking(tx)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDirectlyLinked
                                ? "text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                                : "text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30"
                            }`}
                            title={isDirectlyLinked ? "Wijzig gekoppelde post" : "Koppel aan begrotingspost"}
                          >
                            <Link2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Create Rule */}
                          <button
                            onClick={() => {
                              const kw = tx.counterparty || tx.description.split(" ")[0];
                              const grp = tx.categoryGroup !== "Ongecategoriseerd" ? tx.categoryGroup : "Dagelijks Leven";
                              const type = tx.type === "Inkomsten" ? "inkomsten" : tx.type === "Sparen" ? "sparen" : "uitgaven";
                              onCreateRuleFromTransaction(kw, grp, type);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Maak automatische koppelregel voor dit trefwoord"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Transaction */}
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Verwijder transactie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Link Transaction & Create Rule */}
      <LinkTransactionModal
        isOpen={!!selectedTxForLinking}
        onClose={() => setSelectedTxForLinking(null)}
        transaction={selectedTxForLinking}
        budgetItems={budgetItems}
        categories={categories}
        onLink={onLinkTransaction}
        onOpenAddBudgetItemModal={onOpenAddBudgetItemModal}
      />
    </div>
  );
};
