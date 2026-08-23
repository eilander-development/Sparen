import React, { useState } from "react";
import { X, Plus, Sparkles } from "lucide-react";
import { Transaction, BudgetCategoryGroup } from "../types";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Omit<Transaction, "id">) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"Uitgave" | "Inkomsten" | "Sparen">("Uitgave");
  const [categoryGroup, setCategoryGroup] = useState<BudgetCategoryGroup>("Dagelijks Leven");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [counterparty, setCounterparty] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount === 0 || !description.trim()) return;

    // Negate if expense
    const finalAmount = type === "Uitgave" ? -Math.abs(numAmount) : Math.abs(numAmount);

    onAdd({
      date,
      time: new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
      description: description.trim(),
      amount: finalAmount,
      type,
      categoryGroup,
      accountIban: "NL83INGB0004565868",
      counterparty: counterparty.trim() || undefined,
      source: "Handmatig",
    });

    onClose();
  };

  const categories: BudgetCategoryGroup[] = [
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-850 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Nieuwe Transactie Toevoegen</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Omschrijving / Bedrijf</label>
            <input
              type="text"
              required
              placeholder="Bijv. AH 8732 Apeldoorn of Salaris"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Type Transactie</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Uitgave">Uitgave (Afschrijving)</option>
                <option value="Inkomsten">Inkomsten (Bijschrijving)</option>
                <option value="Sparen">Sparen (Naar buffer)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bedrag (€)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Categorie</label>
              <select
                value={categoryGroup}
                onChange={(e) => setCategoryGroup(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Datum</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tegenpartij (Optioneel)</label>
            <input
              type="text"
              placeholder="Bijv. Albert Heijn, GreenChoice, etc."
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
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
              Transactie Opslaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
