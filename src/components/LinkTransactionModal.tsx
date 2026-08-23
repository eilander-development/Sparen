import React, { useState, useEffect } from "react";
import {
  X,
  Link2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Tag,
  FolderPlus,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import {
  Transaction,
  BudgetItem,
  BudgetCategoryGroup,
  CategoryDefinition,
  BudgetType,
} from "../types";

interface LinkTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  budgetItems: BudgetItem[];
  categories: CategoryDefinition[];
  onLink: (
    txId: string,
    group: BudgetCategoryGroup,
    budgetItemId: string,
    createRule?: {
      name: string;
      keyword: string;
      matchField: "description" | "counterparty" | "both";
      targetType: BudgetType;
    }
  ) => void;
  onOpenAddBudgetItemModal?: (group?: BudgetCategoryGroup) => void;
}

export const LinkTransactionModal: React.FC<LinkTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  budgetItems,
  categories,
  onLink,
  onOpenAddBudgetItemModal,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<BudgetCategoryGroup>("Dagelijks Leven");
  const [selectedBudgetItemId, setSelectedBudgetItemId] = useState<string>("");
  const [shouldCreateRule, setShouldCreateRule] = useState<boolean>(true);
  const [ruleName, setRuleName] = useState<string>("");
  const [ruleKeyword, setRuleKeyword] = useState<string>("");
  const [ruleMatchField, setRuleMatchField] = useState<"description" | "counterparty" | "both">("description");

  // Helper to extract a clean, concise keyword from transaction
  const extractSmartKeyword = (tx: Transaction): string => {
    if (tx.counterparty && tx.counterparty.trim().length > 2) {
      return tx.counterparty.trim();
    }
    const clean = tx.description
      .replace(/^(BCK\*|CCV\*|GEA\*|PIN\*|SEPA\s*)/i, "")
      .replace(/(NLD\s*Google\s*Pay|Google\s*Pay|Betaalpas|iDeal|via\s*.*|Incasso.*)/i, "")
      .replace(/\d{4,}/g, "")
      .trim();
    const words = clean.split(/\s+/).filter((w) => w.length > 1);
    return words.slice(0, 2).join(" ") || tx.description.slice(0, 15);
  };

  useEffect(() => {
    if (transaction) {
      // 1. Initial category group
      const initialGroup =
        transaction.categoryGroup && transaction.categoryGroup !== "Ongecategoriseerd"
          ? transaction.categoryGroup
          : transaction.type === "Inkomsten"
          ? "Inkomsten"
          : transaction.type === "Sparen"
          ? "Spaargeld"
          : "Dagelijks Leven";

      setSelectedGroup(initialGroup);

      // 2. Initial budget item
      if (transaction.budgetItemId) {
        setSelectedBudgetItemId(transaction.budgetItemId);
      } else {
        // find first item in initialGroup
        const firstInGroup = budgetItems.find((i) => i.group === initialGroup);
        setSelectedBudgetItemId(firstInGroup ? firstInGroup.id : "");
      }

      // 3. Smart rule defaults
      const smartKw = extractSmartKeyword(transaction);
      setRuleKeyword(smartKw);
      setRuleName(`Automatisch: ${smartKw}`);
      setRuleMatchField("description");
      setShouldCreateRule(true);
    }
  }, [transaction, budgetItems]);

  // When selected category group changes, select the first budget item in that group if current item is not in that group
  const handleGroupChange = (newGroup: BudgetCategoryGroup) => {
    setSelectedGroup(newGroup);
    const itemsInNewGroup = budgetItems.filter((i) => i.group === newGroup);
    if (itemsInNewGroup.length > 0) {
      const matchStill = itemsInNewGroup.find((i) => i.id === selectedBudgetItemId);
      if (!matchStill) {
        setSelectedBudgetItemId(itemsInNewGroup[0].id);
      }
    } else {
      setSelectedBudgetItemId("");
    }
  };

  if (!isOpen || !transaction) return null;

  // Filter budget items by selected group
  const itemsInSelectedGroup = budgetItems.filter((i) => i.group === selectedGroup);
  const selectedItemObj = budgetItems.find((i) => i.id === selectedBudgetItemId);
  const isIncome = transaction.amount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudgetItemId) return;

    const matchedCat = categories.find((c) => c.name === selectedGroup);
    const targetType: BudgetType =
      selectedGroup === "Inkomsten" || matchedCat?.type === "inkomsten"
        ? "inkomsten"
        : selectedGroup === "Spaargeld" || matchedCat?.type === "sparen"
        ? "sparen"
        : "uitgaven";

    const ruleData = shouldCreateRule && ruleKeyword.trim()
      ? {
          name: ruleName.trim() || `Regel: ${ruleKeyword.trim()}`,
          keyword: ruleKeyword.trim(),
          matchField: ruleMatchField,
          targetType,
        }
      : undefined;

    onLink(transaction.id, selectedGroup, selectedBudgetItemId, ruleData);
    onClose();
  };

  return (
    <div
      id="link-transaction-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-850 px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Transactie Koppelen aan Post</h3>
              <p className="text-xs text-slate-400">
                Wijs deze mutatie toe aan een begrotingspost en maak eventueel direct een herkenningsregel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Selected Transaction Summary Card */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-400">{transaction.date}</span>
                  {transaction.time && (
                    <span className="font-mono text-[10px] text-slate-500">{transaction.time}</span>
                  )}
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                    {transaction.source}
                  </span>
                </div>
                <h4 className="font-semibold text-white text-sm break-words">{transaction.description}</h4>
                {transaction.counterparty && (
                  <p className="text-slate-400 text-[11px]">
                    Tegenpartij: <span className="text-slate-300 font-medium">{transaction.counterparty}</span>
                  </p>
                )}
              </div>
              <div
                className={`font-mono font-bold text-base shrink-0 ${
                  isIncome ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isIncome ? "+" : ""}€ {Math.abs(transaction.amount).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Current Status Pill */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Huidige status:</span>
              {transaction.budgetItemId ? (
                <span className="text-indigo-300 flex items-center gap-1 font-medium bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                  Gekoppeld ({transaction.categoryGroup})
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 font-medium bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  Niet direct gekoppeld aan post
                </span>
              )}
            </div>
          </div>

          {/* Step 1: Select Category Group (Rubriek) */}
          <div className="space-y-1.5">
            <label className="block text-slate-200 font-semibold flex items-center justify-between">
              <span>1. Kies Categorie / Rubriek</span>
              <span className="text-[10px] text-slate-400 font-normal">Hoofdgroep in de begroting</span>
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => handleGroupChange(e.target.value as BudgetCategoryGroup)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} ({cat.type === "inkomsten" ? "Inkomsten" : cat.type === "sparen" ? "Sparen" : "Uitgaven"})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Specific Budget Item (Begrotingspost) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-slate-200 font-semibold">
                2. Kies Specifieke Begrotingspost
              </label>
              {onOpenAddBudgetItemModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddBudgetItemModal(selectedGroup);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium flex items-center gap-1"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>+ Nieuwe post toevoegen</span>
                </button>
              )}
            </div>

            {itemsInSelectedGroup.length === 0 ? (
              <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center text-slate-400 space-y-2">
                <p>Er zijn nog geen posten in categorie "{selectedGroup}".</p>
                {onOpenAddBudgetItemModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddBudgetItemModal(selectedGroup);
                    }}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Post Aanmaken in {selectedGroup}</span>
                  </button>
                )}
              </div>
            ) : (
              <select
                required
                value={selectedBudgetItemId}
                onChange={(e) => setSelectedBudgetItemId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
              >
                <option value="" disabled>
                  -- Selecteer een begrotingspost --
                </option>
                {itemsInSelectedGroup.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Budget: € {item.actual.toLocaleString("nl-NL", { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            )}

            {selectedItemObj && (
              <div className="p-2.5 bg-indigo-950/30 border border-indigo-800/40 rounded-xl flex items-center justify-between text-[11px] text-indigo-300">
                <span>Geselecteerde post: <strong>{selectedItemObj.name}</strong></span>
                <span>Huidig betaald/ontvangen: € {selectedItemObj.paidOrReceived.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          {/* Step 3: Option to Create an Automated Rule */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shouldCreateRule}
                  onChange={(e) => setShouldCreateRule(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-indigo-600 rounded cursor-pointer shrink-0"
                />
                <div>
                  <span className="font-bold text-white text-xs block flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    Maak hier direct een automatische koppelregel voor
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Toekomstige én bestaande transacties met ditzelfde trefwoord worden voortaan direct aan{" "}
                    <strong className="text-slate-200">{selectedItemObj?.name || "deze post"}</strong> gekoppeld.
                  </span>
                </div>
              </label>

              {shouldCreateRule && (
                <div className="pt-3 border-t border-slate-700/60 space-y-3 pl-7 animate-in fade-in">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Trefwoord om automatisch op te filteren
                    </label>
                    <input
                      type="text"
                      required={shouldCreateRule}
                      value={ruleKeyword}
                      onChange={(e) => setRuleKeyword(e.target.value)}
                      placeholder="Bijv. PLUS, Albert Heijn, Kruidvat, Shell..."
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Naam van de regel</label>
                      <input
                        type="text"
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        placeholder="Naam voor het overzicht"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Zoek in veld</label>
                      <select
                        value={ruleMatchField}
                        onChange={(e) => setRuleMatchField(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="description">Omschrijving</option>
                        <option value="counterparty">Tegenpartij</option>
                        <option value="both">Beide velden</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={!selectedBudgetItemId}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{shouldCreateRule ? "Koppelen & Regel Opslaan" : "Alleen Transactie Koppelen"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
