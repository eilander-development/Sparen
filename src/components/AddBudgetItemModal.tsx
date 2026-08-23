import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { BudgetItem, BudgetCategoryGroup, BudgetType, CategoryDefinition } from "../types";

interface AddBudgetItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<BudgetItem, "id">) => void;
  categories?: CategoryDefinition[];
  defaultGroup?: BudgetCategoryGroup;
}

export const AddBudgetItemModal: React.FC<AddBudgetItemModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories,
  defaultGroup,
}) => {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<BudgetCategoryGroup>(defaultGroup || "Dagelijks Leven");
  const [type, setType] = useState<BudgetType>("uitgaven");
  const [estimated, setEstimated] = useState("");
  const [actual, setActual] = useState("");
  const [paidOrReceived, setPaidOrReceived] = useState("0");

  useEffect(() => {
    if (isOpen) {
      const initialGrp = defaultGroup || (categories && categories.length > 0 ? categories[0].name : "Dagelijks Leven");
      setGroup(initialGrp);
      updateTypeForGroup(initialGrp);
      setName("");
      setEstimated("");
      setActual("");
      setPaidOrReceived("0");
    }
  }, [isOpen, defaultGroup, categories]);

  if (!isOpen) return null;

  const updateTypeForGroup = (selectedGroupName: string) => {
    const foundCat = categories?.find((c) => c.name === selectedGroupName);
    if (foundCat) {
      setType(foundCat.type);
    } else if (selectedGroupName === "Inkomsten") {
      setType("inkomsten");
    } else if (selectedGroupName === "Spaargeld") {
      setType("sparen");
    } else {
      setType("uitgaven");
    }
  };

  const handleGroupChange = (newGroup: BudgetCategoryGroup) => {
    setGroup(newGroup);
    updateTypeForGroup(newGroup);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const est = parseFloat(estimated) || 0;
    const act = parseFloat(actual) || est;
    const paid = parseFloat(paidOrReceived) || 0;

    onAdd({
      name: name.trim(),
      group,
      type,
      estimated: est,
      actual: act,
      paidOrReceived: paid,
      isPaid: paid >= act && act > 0,
    });

    onClose();
  };

  const categoryOptions = categories && categories.length > 0
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-850 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Nieuwe Begrotingspost Toevoegen</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Naam Begrotingspost</label>
            <input
              type="text"
              required
              placeholder="Bijv. Netflix, Schoolboeken of Cadeaus"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Rubriek / Categoriegroep</label>
            <select
              value={group}
              onChange={(e) => handleGroupChange(e.target.value as BudgetCategoryGroup)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {categoryOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Type van deze post:</span>
            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
              type === "inkomsten" ? "bg-emerald-950 text-emerald-400" : type === "sparen" ? "bg-indigo-950 text-indigo-400" : "bg-rose-950 text-rose-400"
            }`}>
              {type.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Budget Bedrag (€)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={estimated}
                onChange={(e) => {
                  setEstimated(e.target.value);
                  if (!actual) setActual(e.target.value);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Werkelijk Bedrag (€)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors shadow-md shadow-emerald-600/20"
            >
              Toevoegen aan Begroting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
