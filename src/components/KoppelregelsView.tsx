import React, { useState } from "react";
import {
  Sliders,
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Edit2,
  Search,
  Zap,
  ArrowRight,
  Filter,
  Sparkles,
  Tag
} from "lucide-react";
import { Rule, BudgetCategoryGroup, Transaction, BudgetItem } from "../types";

interface KoppelregelsViewProps {
  rules: Rule[];
  onAddRule: () => void;
  onToggleRule: (id: string, active: boolean) => void;
  onDeleteRule: (id: string) => void;
  onApplyRulesToAll: () => void;
  transactions: Transaction[];
  budgetItems?: BudgetItem[];
}

export const KoppelregelsView: React.FC<KoppelregelsViewProps> = ({
  rules,
  onAddRule,
  onToggleRule,
  onDeleteRule,
  onApplyRulesToAll,
  transactions,
  budgetItems = [],
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [testInput, setTestInput] = useState("AH 8732 APELDOORN NLD Google Pay");
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  const budgetItemMap = new Map<string, BudgetItem>();
  budgetItems.forEach((i) => budgetItemMap.set(i.id, i));

  const filteredRules = rules.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.targetBudgetItemId && budgetItemMap.get(r.targetBudgetItemId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Test match logic
  const matchedRule = rules.find((r) => r.isActive && testInput.toLowerCase().includes(r.keyword.toLowerCase()));
  const matchedItem = matchedRule?.targetBudgetItemId ? budgetItemMap.get(matchedRule.targetBudgetItemId) : undefined;

  const handleRunAll = () => {
    onApplyRulesToAll();
    setAppliedMessage(`Alle ${rules.length} koppelregels succesvol toegepast op ${transactions.length} transacties!`);
    setTimeout(() => setAppliedMessage(null), 4000);
  };

  return (
    <div id="koppelregels-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Automatische Koppelregels ({rules.length})
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Herken bankafschriften automatisch op basis van trefwoorden en ken direct de juiste categorie én begrotingspost toe
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="koppelregels-run-all-btn"
            onClick={handleRunAll}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Nu Toepassen op Alle Transacties</span>
          </button>

          <button
            id="koppelregels-add-rule-btn"
            onClick={onAddRule}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nieuwe Regel</span>
          </button>
        </div>
      </div>

      {/* Applied Success Alert Banner */}
      {appliedMessage && (
        <div className="bg-emerald-950/80 border border-emerald-700/80 p-4 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{appliedMessage}</span>
        </div>
      )}

      {/* Interactive Live Rule Tester Box */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Live Regel-Tester</h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Typ een bankafschrift-omschrijving in om direct te testen welke regel en post geactiveerd wordt:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Typ een omschrijving (bijv. Albert Heijn, Shell, Netflix)..."
            className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
            {matchedRule ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-bold">{matchedRule.name}</span>
                  <div className="text-slate-400 text-[10px] flex items-center gap-1.5 mt-0.5">
                    <span>Rubriek: <strong className="text-slate-300">{matchedRule.targetGroup}</strong></span>
                    {matchedItem && (
                      <>
                        <span>•</span>
                        <span>Post: <strong className="text-indigo-300">{matchedItem.name}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-slate-400 italic">Geen match gevonden voor deze tekst</span>
            )}
          </div>
        </div>
      </div>

      {/* Rules Search & Filter */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Zoek in regels op trefwoord, categorie, post of doel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Regelnaam</th>
                <th className="py-3 px-4">Trefwoord (Filter)</th>
                <th className="py-3 px-4">Doel Categorie & Post</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Gematcht</th>
                <th className="py-3 px-4 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRules.map((rule) => {
                const targetPost = rule.targetBudgetItemId ? budgetItemMap.get(rule.targetBudgetItemId) : undefined;

                return (
                  <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={rule.isActive}
                        onChange={(e) => onToggleRule(rule.id, e.target.checked)}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        title={rule.isActive ? "Regel is actief" : "Regel is gepauzeerd"}
                      />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">{rule.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
                        {rule.keyword}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700 font-medium text-xs">
                          {rule.targetGroup}
                        </span>
                        {targetPost && (
                          <div className="text-[11px] text-indigo-300 flex items-center gap-1 mt-0.5">
                            <Tag className="w-3 h-3 text-indigo-400" />
                            <span>Post: <strong>{targetPost.name}</strong></span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          rule.targetType === "inkomsten"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                            : rule.targetType === "sparen"
                            ? "bg-blue-950/60 text-blue-400 border border-blue-800/50"
                            : "bg-rose-950/60 text-rose-400 border border-rose-800/50"
                        }`}
                      >
                        {rule.targetType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300 font-semibold">
                      {rule.matchedCount}x
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onDeleteRule(rule.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Verwijder regel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
