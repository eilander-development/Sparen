import React, { useState, useEffect } from "react";
import {
  X,
  PiggyBank,
  ShieldCheck,
  Home,
  Palmtree,
  Cat,
  Car,
  Heart,
  Landmark,
  Layers,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { SavingsGoal } from "../types";

interface AddSavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Omit<SavingsGoal, "id">, editId?: string) => void;
  editingGoal?: SavingsGoal | null;
}

export const AddSavingsGoalModal: React.FC<AddSavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGoal,
}) => {
  const [name, setName] = useState("");
  const [accountIban, setAccountIban] = useState("");
  const [bankName, setBankName] = useState("ING Oranje Spaarrekening");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [color, setColor] = useState("emerald");
  const [iconName, setIconName] = useState("ShieldCheck");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setAccountIban(editingGoal.accountIban);
      setBankName(editingGoal.bankName || "Spaarrekening");
      setTargetAmount(editingGoal.targetAmount ? editingGoal.targetAmount.toString() : "");
      setInitialAmount(editingGoal.initialAmount ? editingGoal.initialAmount.toString() : "");
      setMonthlyContribution(editingGoal.monthlyContribution ? editingGoal.monthlyContribution.toString() : "");
      setColor(editingGoal.color || "emerald");
      setIconName(editingGoal.iconName || "ShieldCheck");
      setNotes(editingGoal.notes || "");
    } else {
      setName("");
      setAccountIban("");
      setBankName("ING Oranje Spaarrekening");
      setTargetAmount("2000");
      setInitialAmount("500");
      setMonthlyContribution("100");
      setColor("emerald");
      setIconName("PiggyBank");
      setNotes("");
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name: name.trim(),
        accountIban: accountIban.trim().toUpperCase().replace(/\s+/g, ""),
        bankName: bankName.trim(),
        targetAmount: parseFloat(targetAmount) || 0,
        initialAmount: parseFloat(initialAmount) || 0,
        monthlyContribution: parseFloat(monthlyContribution) || 0,
        color,
        iconName,
        notes: notes.trim(),
      },
      editingGoal ? editingGoal.id : undefined
    );

    onClose();
  };

  const iconOptions = [
    { id: "ShieldCheck", label: "Buffer / Noodfonds", icon: ShieldCheck },
    { id: "PiggyBank", label: "Spaarvarken / Algemeen", icon: PiggyBank },
    { id: "Home", label: "Woning & Tuin", icon: Home },
    { id: "Palmtree", label: "Vakantie & Reizen", icon: Palmtree },
    { id: "Cat", label: "Huisdier / Kat", icon: Cat },
    { id: "Car", label: "Auto & Vervoer", icon: Car },
    { id: "Heart", label: "Gezin & Cadeaus", icon: Heart },
  ];

  const colorOptions = [
    { id: "emerald", label: "Groen", bg: "bg-emerald-500" },
    { id: "indigo", label: "Indigo", bg: "bg-indigo-500" },
    { id: "amber", label: "Goud", bg: "bg-amber-500" },
    { id: "purple", label: "Paars", bg: "bg-purple-500" },
    { id: "cyan", label: "Cyaan", bg: "bg-cyan-500" },
    { id: "rose", label: "Roze", bg: "bg-rose-500" },
  ];

  const bankSuggestions = [
    "ING Oranje Spaarrekening",
    "Rabobank Doelsparen",
    "Knab Spaarrekening",
    "Bunq Spaarpot",
    "Trade Republic Spaarrekening",
    "Nationale-Nederlanden",
    "ABN AMRO Spaargemak",
    "Overige Bank",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-850 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {editingGoal ? "Spaarrekening & Doel Bewerken" : "Nieuwe Spaarrekening & Doel Koppelen"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Automatische transactie-mapping via tegenrekening IBAN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Info Banner on PSD2 Auto Mapping */}
          <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-slate-300 space-y-1">
            <span className="font-semibold text-indigo-300 block text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Automatische Sparen-Mapping
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Omdat EnableBanking in de gratis versie alleen je hoofdbetaalrekening synchroniseert,
              worden overboekingen naar het ingevoerde IBAN-nummer hieronder automatisch gekoppeld aan dit doel!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Goal Name */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Naam Spaardoel / Spaarpot <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Bijv. Vakantie & Uitjes of Noodbuffer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Account IBAN */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Gekoppeld Spaarrekening IBAN <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="NL.. INGB / RABO / KNAB 0123456789"
                  value={accountIban}
                  onChange={(e) => setAccountIban(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Transacties naar deze IBAN worden direct als inleg voor dit spaardoel herkend.
              </span>
            </div>

            {/* Bank Name */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Bankinstelling</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Bijv. Knab, Rabobank, Bunq of ING"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <select
                  onChange={(e) => {
                    if (e.target.value) setBankName(e.target.value);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 text-xs focus:outline-none"
                  value=""
                >
                  <option value="" disabled>
                    Snelle selectie...
                  </option>
                  {bankSuggestions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Doelbedrag (€)</label>
              <input
                type="number"
                step="10"
                min="0"
                placeholder="Bijv. 4500"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Initial Amount */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Huidig / Startsaldo (€)</label>
              <input
                type="number"
                step="10"
                min="0"
                placeholder="Bijv. 1200"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Monthly Contribution */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Maandelijkse Inleg (€/mnd)</label>
              <input
                type="number"
                step="5"
                min="0"
                placeholder="Bijv. 100"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Color Accent */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kleur Accent</label>
              <div className="flex items-center gap-2 pt-1">
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`w-6 h-6 rounded-full ${c.bg} transition-all ${
                      color === c.id ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-100"
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1.5">Icoon & Thema</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {iconOptions.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = iconName === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setIconName(opt.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-indigo-950/60 border-indigo-500 text-white font-semibold"
                          : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <IconComp className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-[11px] truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Toelichting / Notities</label>
              <input
                type="text"
                placeholder="Bijv. Reservering voor vakantie Frankrijk 2026"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <PiggyBank className="w-4 h-4" />
              <span>{editingGoal ? "Wijzigingen Opslaan" : "Spaarrekening Koppelen"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
