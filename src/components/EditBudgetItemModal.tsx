import React, { useState, useEffect } from "react";
import { X, Check, Calendar, Repeat, Sliders, Trash2 } from "lucide-react";
import { BudgetItem, BudgetCategoryGroup, MonthlyBudget, CategoryDefinition, BudgetType } from "../types";

interface EditBudgetItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BudgetItem | null;
  currentMonthId: string;
  allMonths: MonthlyBudget[];
  categories?: CategoryDefinition[];
  onSave: (
    itemId: string,
    updatedData: {
      name: string;
      group: BudgetCategoryGroup;
      type?: BudgetType;
      monthlyAmounts: Record<string, number>; // monthId -> amount
    }
  ) => void;
  onDelete?: (itemId: string) => void;
}

export const EditBudgetItemModal: React.FC<EditBudgetItemModalProps> = ({
  isOpen,
  onClose,
  item,
  currentMonthId,
  allMonths,
  categories,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<BudgetCategoryGroup>("Dagelijks Leven");
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [frequencyMode, setFrequencyMode] = useState<"current_only" | "all_months" | "quarterly" | "custom">("current_only");
  
  // Custom amounts per month
  const [monthlyValues, setMonthlyValues] = useState<Record<string, number>>({});

  useEffect(() => {
    if (item && isOpen) {
      setName(item.name);
      setGroup(item.group);
      setCurrentAmount(item.actual);

      // Build initial monthly values from allMonths
      const initialMap: Record<string, number> = {};
      allMonths.forEach((m) => {
        const found = m.items.find((i) => i.id === item.id);
        initialMap[m.monthId] = found ? found.actual : (m.monthId === currentMonthId ? item.actual : 0);
      });
      setMonthlyValues(initialMap);

      // Detect if quarterly pattern (jan, apr, jul, okt) or all same
      const nonZeroMonths = Object.entries(initialMap).filter(([_, v]) => v > 0);
      const isQuarterly =
        nonZeroMonths.length === 4 &&
        ["jan", "apr", "jul", "okt"].every((m) => (initialMap[m] || 0) > 0);

      if (isQuarterly) {
        setFrequencyMode("quarterly");
      } else {
        setFrequencyMode("current_only");
      }
    }
  }, [item, isOpen, currentMonthId, allMonths]);

  if (!isOpen || !item) return null;

  const handleFrequencyChange = (mode: "current_only" | "all_months" | "quarterly" | "custom") => {
    setFrequencyMode(mode);
    const updated = { ...monthlyValues };

    if (mode === "all_months") {
      allMonths.forEach((m) => {
        updated[m.monthId] = currentAmount;
      });
    } else if (mode === "quarterly") {
      // Jan, Apr, Jul, Okt have the amount; other months €0
      allMonths.forEach((m) => {
        if (["jan", "apr", "jul", "okt"].includes(m.monthId)) {
          updated[m.monthId] = currentAmount > 0 ? currentAmount : (item.actual || 299.97);
        } else {
          updated[m.monthId] = 0;
        }
      });
    } else if (mode === "current_only") {
      updated[currentMonthId] = currentAmount;
    }
    setMonthlyValues(updated);
  };

  const handleCurrentAmountChange = (val: number) => {
    setCurrentAmount(val);
    const updated = { ...monthlyValues };

    if (frequencyMode === "current_only") {
      updated[currentMonthId] = val;
    } else if (frequencyMode === "all_months") {
      allMonths.forEach((m) => {
        updated[m.monthId] = val;
      });
    } else if (frequencyMode === "quarterly") {
      allMonths.forEach((m) => {
        if (["jan", "apr", "jul", "okt"].includes(m.monthId)) {
          updated[m.monthId] = val;
        } else {
          updated[m.monthId] = 0;
        }
      });
    }
    setMonthlyValues(updated);
  };

  const handleMonthAmountChange = (monthId: string, val: number) => {
    setMonthlyValues((prev) => ({
      ...prev,
      [monthId]: val,
    }));
    if (monthId === currentMonthId) {
      setCurrentAmount(val);
    }
    setFrequencyMode("custom");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalAmounts: Record<string, number> = { ...monthlyValues };

    if (frequencyMode === "current_only") {
      finalAmounts[currentMonthId] = currentAmount;
    } else if (frequencyMode === "all_months") {
      allMonths.forEach((m) => {
        finalAmounts[m.monthId] = currentAmount;
      });
    } else if (frequencyMode === "quarterly") {
      allMonths.forEach((m) => {
        finalAmounts[m.monthId] = ["jan", "apr", "jul", "okt"].includes(m.monthId) ? currentAmount : 0;
      });
    }

    let matchedType: BudgetType = item.type;
    const foundCat = categories?.find((c) => c.name === group);
    if (foundCat) {
      matchedType = foundCat.type;
    } else if (group === "Inkomsten") {
      matchedType = "inkomsten";
    } else if (group === "Spaargeld") {
      matchedType = "sparen";
    } else {
      matchedType = "uitgaven";
    }

    onSave(item.id, {
      name: name.trim(),
      group,
      type: matchedType,
      monthlyAmounts: finalAmounts,
    });

    onClose();
  };

  const groupOptions = categories && categories.length > 0
    ? categories.map((c) => c.name)
    : [
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div>
            <h3 className="font-bold text-white text-base">Begrotingspost Aanpassen</h3>
            <p className="text-xs text-slate-400">
              Stel het budgetbedrag in en bepaal in welke maanden deze post actief is
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto">
          {/* Name and Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1">
                Naam Begrotingspost
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1">
                Categoriegroep
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value as BudgetCategoryGroup)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {groupOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget Bedrag */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                Budget Bedrag (€)
              </label>
              <span className="text-[11px] text-indigo-400 font-mono">
                Live gekoppeld aan bank
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                €
              </span>
              <input
                type="number"
                step="0.01"
                required
                value={currentAmount}
                onChange={(e) => handleCurrentAmountChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-indigo-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Frequentie / Maandverdeling (Speciaal voor Kinderbijslag per kwartaal etc.) */}
          <div className="space-y-2.5">
            <label className="block text-slate-300 text-xs font-semibold flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-indigo-400" />
              <span>Uitkeringsschema & Frequentie</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleFrequencyChange("current_only")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  frequencyMode === "current_only"
                    ? "bg-indigo-600/20 border-indigo-500 text-white font-semibold"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="block font-medium">Alleen deze maand</span>
                <span className="text-[10px] text-slate-400">Enkele aanpassing</span>
              </button>

              <button
                type="button"
                onClick={() => handleFrequencyChange("all_months")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  frequencyMode === "all_months"
                    ? "bg-indigo-600/20 border-indigo-500 text-white font-semibold"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="block font-medium">Elke maand</span>
                <span className="text-[10px] text-slate-400">12x per jaar hetzelfde</span>
              </button>

              <button
                type="button"
                onClick={() => handleFrequencyChange("quarterly")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  frequencyMode === "quarterly"
                    ? "bg-indigo-600/20 border-indigo-500 text-white font-semibold"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="block font-medium">Per kwartaal (4x)</span>
                <span className="text-[10px] text-slate-400">Jan, Apr, Jul, Okt (Kinderbijslag)</span>
              </button>

              <button
                type="button"
                onClick={() => handleFrequencyChange("custom")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  frequencyMode === "custom"
                    ? "bg-indigo-600/20 border-indigo-500 text-white font-semibold"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="block font-medium">Handmatig / Maatwerk</span>
                <span className="text-[10px] text-slate-400">Per maand instellen</span>
              </button>
            </div>
          </div>

          {/* 12-Month Matrix Overview */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Begroot bedrag over 2026 per maand
              </span>
              <span className="text-[11px] text-slate-500">
                In maanden met € 0,00 staat de post niet op "In afwachting"
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 font-mono">
              {allMonths.map((m) => {
                const val = monthlyValues[m.monthId] || 0;
                const isCurrent = m.monthId === currentMonthId;
                const isZero = val === 0;

                return (
                  <div
                    key={m.monthId}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      isCurrent
                        ? "bg-indigo-950/40 border-indigo-500/50"
                        : "bg-slate-900 border-slate-800"
                    }`}
                  >
                    <span className="block text-[10px] font-sans font-semibold text-slate-400 mb-1">
                      {m.monthName.slice(0, 3)} {isCurrent && "★"}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={val}
                      onChange={(e) => handleMonthAmountChange(m.monthId, parseFloat(e.target.value) || 0)}
                      className={`w-full bg-slate-800 border rounded text-center text-xs py-1 px-1 focus:outline-none focus:border-indigo-500 ${
                        isZero ? "text-slate-500 border-slate-700/40" : "text-white font-bold border-slate-700"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Weet je zeker dat je "${name}" wilt verwijderen?`)) {
                    onDelete(item.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Post Verwijderen</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Wijzigingen Opslaan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
