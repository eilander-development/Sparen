import React, { useState, useEffect } from "react";
import { X, Sliders, Tag } from "lucide-react";
import { Rule, BudgetCategoryGroup, BudgetType, BudgetItem, CategoryDefinition } from "../types";

interface AddRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (rule: Omit<Rule, "id" | "matchedCount">) => void;
  initialKeyword?: string;
  initialGroup?: BudgetCategoryGroup;
  initialBudgetItemId?: string;
  budgetItems?: BudgetItem[];
  categories?: CategoryDefinition[];
}

export const AddRuleModal: React.FC<AddRuleModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  initialKeyword = "",
  initialGroup = "Dagelijks Leven",
  initialBudgetItemId = "",
  budgetItems = [],
  categories = [],
}) => {
  const [name, setName] = useState(initialKeyword ? `Regel: ${initialKeyword}` : "");
  const [keyword, setKeyword] = useState(initialKeyword);
  const [targetGroup, setTargetGroup] = useState<BudgetCategoryGroup>(initialGroup);
  const [targetBudgetItemId, setTargetBudgetItemId] = useState<string>(initialBudgetItemId);
  const [targetType, setTargetType] = useState<BudgetType>("uitgaven");
  const [matchField, setMatchField] = useState<"description" | "counterparty" | "both">("description");

  useEffect(() => {
    if (isOpen) {
      setName(initialKeyword ? `Regel: ${initialKeyword}` : "");
      setKeyword(initialKeyword);
      setTargetGroup(initialGroup);
      setTargetBudgetItemId(initialBudgetItemId);

      const catMatch = categories.find((c) => c.name === initialGroup);
      if (catMatch) {
        setTargetType(catMatch.type);
      } else if (initialGroup === "Inkomsten") {
        setTargetType("inkomsten");
      } else if (initialGroup === "Spaargeld") {
        setTargetType("sparen");
      } else {
        setTargetType("uitgaven");
      }
    }
  }, [isOpen, initialKeyword, initialGroup, initialBudgetItemId, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !keyword.trim()) return;

    onAdd({
      name: name.trim(),
      keyword: keyword.trim(),
      matchField,
      targetGroup,
      targetBudgetItemId: targetBudgetItemId || undefined,
      targetType,
      isActive: true,
    });

    onClose();
  };

  const handleGroupChange = (grp: BudgetCategoryGroup) => {
    setTargetGroup(grp);
    const catMatch = categories.find((c) => c.name === grp);
    if (catMatch) {
      setTargetType(catMatch.type);
    } else if (grp === "Inkomsten") {
      setTargetType("inkomsten");
    } else if (grp === "Spaargeld") {
      setTargetType("sparen");
    } else {
      setTargetType("uitgaven");
    }

    // Pick first item in new group
    const itemsInGrp = budgetItems.filter((i) => i.group === grp);
    if (itemsInGrp.length > 0) {
      setTargetBudgetItemId(itemsInGrp[0].id);
    } else {
      setTargetBudgetItemId("");
    }
  };

  const availableGroups: BudgetCategoryGroup[] = categories.length > 0
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

  const itemsInSelectedGroup = budgetItems.filter((i) => i.group === targetGroup);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-850 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Nieuwe Koppelregel Aanmaken</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Naam van de Regel</label>
            <input
              type="text"
              required
              placeholder="Bijv. Jumbo Supermarkt of Spotify"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Trefwoord om op te filteren</label>
            <input
              type="text"
              required
              placeholder="Bijv. JUMBO, Spotify, Dirk, Kruidvat..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Wanneer dit woord voorkomt in een bankmutatie, wordt automatisch de categorie én post toegewezen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Doel Categorie (Rubriek)</label>
              <select
                value={targetGroup}
                onChange={(e) => handleGroupChange(e.target.value as BudgetCategoryGroup)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {availableGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Specifieke Begrotingspost</label>
              <select
                value={targetBudgetItemId}
                onChange={(e) => setTargetBudgetItemId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">(Geen specifieke post)</option>
                {itemsInSelectedGroup.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Zoekveld</label>
            <select
              value={matchField}
              onChange={(e) => setMatchField(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="description">Omschrijving van transactie</option>
              <option value="counterparty">Naam van tegenpartij</option>
              <option value="both">Zowel omschrijving als tegenpartij</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-md shadow-indigo-600/20"
            >
              Koppelregel Opslaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

