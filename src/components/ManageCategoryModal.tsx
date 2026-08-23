import React, { useState, useEffect } from "react";
import { X, Check, Trash2, Tag, TrendingUp, ArrowDownCircle, PiggyBank } from "lucide-react";
import { CategoryDefinition, BudgetType } from "../types";

interface ManageCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryDefinition | null; // null means creating a new one
  onSave: (cat: CategoryDefinition) => void;
  onDelete?: (catId: string) => void;
}

export const ManageCategoryModal: React.FC<ManageCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<BudgetType>("uitgaven");
  const [color, setColor] = useState("indigo");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (category && isOpen) {
      setName(category.name);
      setType(category.type);
      setColor(category.color || "indigo");
      setDescription(category.description || "");
    } else if (isOpen) {
      setName("");
      setType("uitgaven");
      setColor("indigo");
      setDescription("");
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: category ? category.id : `cat-${Date.now()}`,
      name: name.trim(),
      type,
      color,
      description: description.trim(),
      isDefault: category?.isDefault,
    });

    onClose();
  };

  const colors = [
    { name: "indigo", bg: "bg-indigo-500", border: "border-indigo-400" },
    { name: "emerald", bg: "bg-emerald-500", border: "border-emerald-400" },
    { name: "blue", bg: "bg-blue-500", border: "border-blue-400" },
    { name: "cyan", bg: "bg-cyan-500", border: "border-cyan-400" },
    { name: "purple", bg: "bg-purple-500", border: "border-purple-400" },
    { name: "amber", bg: "bg-amber-500", border: "border-amber-400" },
    { name: "pink", bg: "bg-pink-500", border: "border-pink-400" },
    { name: "rose", bg: "bg-rose-500", border: "border-rose-400" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {category ? "Categoriegroep Bewerken" : "Nieuwe Categoriegroep"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Stel de naam en het type (inkomsten / uitgaven / sparen) in
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1">
              Naam Categoriegroep / Rubriek
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. Vrije Tijd & Hobby of Kinderen"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />
          </div>

          {/* Type Selector: Inkomsten vs Uitgaven vs Sparen */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1.5">
              Type Begrotingsrubriek
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType("uitgaven")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === "uitgaven"
                    ? "bg-rose-950/40 border-rose-500 text-rose-300 font-bold"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <ArrowDownCircle className={`w-4 h-4 ${type === "uitgaven" ? "text-rose-400" : "text-slate-500"}`} />
                <span className="text-xs">Uitgaven</span>
              </button>

              <button
                type="button"
                onClick={() => setType("inkomsten")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === "inkomsten"
                    ? "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <TrendingUp className={`w-4 h-4 ${type === "inkomsten" ? "text-emerald-400" : "text-slate-500"}`} />
                <span className="text-xs">Inkomsten</span>
              </button>

              <button
                type="button"
                onClick={() => setType("sparen")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === "sparen"
                    ? "bg-indigo-950/40 border-indigo-500 text-indigo-300 font-bold"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <PiggyBank className={`w-4 h-4 ${type === "sparen" ? "text-indigo-400" : "text-slate-500"}`} />
                <span className="text-xs">Sparen</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {type === "inkomsten" && "Posten in deze categorie tellen mee als inkomende geldstromen."}
              {type === "uitgaven" && "Posten in deze categorie worden verwerkt als maandelijkse kosten/vaste lasten."}
              {type === "sparen" && "Posten in deze categorie worden verwerkt als overboeking naar spaardoelen/buffer."}
            </p>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1.5">
              Kleuraccent
            </label>
            <div className="flex items-center gap-2.5">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all flex items-center justify-center ${
                    color === c.name ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {color === c.name && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1">
              Toelichting / Omschrijving (Optioneel)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bijv. Abonnementen, uitstapjes en cadeaus"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {category && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Weet je zeker dat je de categorie "${category.name}" wilt verwijderen?`)) {
                    onDelete(category.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Categorie Verwijderen</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>{category ? "Opslaan" : "Categorie Aanmaken"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
