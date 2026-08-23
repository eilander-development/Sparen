import React, { useState } from "react";
import {
  Tags,
  TrendingUp,
  Building2,
  Car,
  ShoppingBag,
  Receipt,
  ShieldCheck,
  PiggyBank,
  Plus,
  Edit2,
  Trash2,
  ArrowDownCircle,
  FolderPlus,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  MonthlyBudget,
  BudgetItem,
  CategoryDefinition,
  BudgetType,
  BudgetCategoryGroup,
} from "../types";

interface CategoriesViewProps {
  currentMonth: MonthlyBudget;
  categories: CategoryDefinition[];
  onOpenAddBudgetItem: (defaultGroup?: BudgetCategoryGroup) => void;
  onOpenEditBudgetItem?: (item: BudgetItem) => void;
  onOpenAddCategory: () => void;
  onOpenEditCategory: (cat: CategoryDefinition) => void;
  onDeleteCategory: (catId: string) => void;
  onUpdateBudgetItem: (itemId: string, updates: Partial<BudgetItem>) => void;
  onDeleteBudgetItem?: (itemId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  currentMonth,
  categories,
  onOpenAddBudgetItem,
  onOpenEditBudgetItem,
  onOpenAddCategory,
  onOpenEditCategory,
  onDeleteCategory,
  onUpdateBudgetItem,
  onDeleteBudgetItem,
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"ALL" | BudgetType>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);

  // Icon mapping helper
  const getCategoryIcon = (name: string, type: BudgetType) => {
    const lower = name.toLowerCase();
    if (type === "inkomsten" || lower.includes("inkomst") || lower.includes("salaris")) return TrendingUp;
    if (type === "sparen" || lower.includes("spaar") || lower.includes("buffer")) return PiggyBank;
    if (lower.includes("woning") || lower.includes("huis") || lower.includes("huur")) return Building2;
    if (lower.includes("vervoer") || lower.includes("auto") || lower.includes("benzine")) return Car;
    if (lower.includes("dagelijks") || lower.includes("boodschappen") || lower.includes("winkel")) return ShoppingBag;
    if (lower.includes("verzekering") || lower.includes("zorg")) return ShieldCheck;
    if (lower.includes("lening") || lower.includes("schuld") || lower.includes("aflossing")) return Receipt;
    return Tags;
  };

  const getColorClasses = (colorName?: string) => {
    switch (colorName) {
      case "emerald":
        return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60" };
      case "blue":
        return { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-950/60 text-blue-300 border-blue-800/60" };
      case "cyan":
        return { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", badge: "bg-cyan-950/60 text-cyan-300 border-cyan-800/60" };
      case "purple":
        return { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", badge: "bg-purple-950/60 text-purple-300 border-purple-800/60" };
      case "amber":
        return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-950/60 text-amber-300 border-amber-800/60" };
      case "pink":
        return { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400", badge: "bg-pink-950/60 text-pink-300 border-pink-800/60" };
      case "rose":
        return { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", badge: "bg-rose-950/60 text-rose-300 border-rose-800/60" };
      case "indigo":
      default:
        return { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400", badge: "bg-indigo-950/60 text-indigo-300 border-indigo-800/60" };
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesType = selectedTypeFilter === "ALL" || cat.type === selectedTypeFilter;
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const incomeCategories = categories.filter((c) => c.type === "inkomsten");
  const expenseCategories = categories.filter((c) => c.type === "uitgaven");
  const savingsCategories = categories.filter((c) => c.type === "sparen");

  return (
    <div id="categories-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Categorieën & Rubrieken Beheer
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Bepaal zelf welke categorieën horen bij Inkomsten, Uitgaven of Sparen en beheer onderliggende posten
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Hoe werkt dit?</span>
          </button>

          <button
            onClick={onOpenAddCategory}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Nieuwe Categorie</span>
          </button>

          <button
            onClick={() => onOpenAddBudgetItem()}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nieuwe Post</span>
          </button>
        </div>
      </div>

      {/* Explanation Box */}
      {showExplanation && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl text-xs text-slate-300 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-white font-bold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Aanpasbare Categorieën & Begrotingsposten</span>
          </div>
          <p>
            Elke hoofdcategorie is toegewezen aan een <strong className="text-white">Type (Inkomsten, Uitgaven of Sparen)</strong>.
            Je kunt op elk moment een categorie toevoegen, hernoemen of het type wijzigen:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
            <li>
              <strong className="text-emerald-400">Inkomsten rubrieken:</strong> Worden getoond in het Inkomstenoverzicht (zoals Salaris, Toeslagen, Teruggaven).
            </li>
            <li>
              <strong className="text-rose-400">Uitgaven rubrieken:</strong> Worden gegroepeerd in de Uitgavenoverzichten (zoals Woning, Verzekeringen, Dagelijks Leven).
            </li>
            <li>
              <strong className="text-indigo-400">Sparen rubrieken:</strong> Gekoppeld aan je spaardoelen en bufferreserveringen.
            </li>
          </ul>
        </div>
      )}

      {/* KPI Counters & Fast Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedTypeFilter("ALL")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedTypeFilter === "ALL"
              ? "bg-slate-800 border-indigo-500 shadow-md text-white"
              : "bg-[#101726] border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Alle Rubrieken</span>
            <Tags className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold font-mono mt-1 text-white">{categories.length}</div>
          <span className="text-[10px] text-slate-500">Totaal actief</span>
        </button>

        <button
          onClick={() => setSelectedTypeFilter("uitgaven")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedTypeFilter === "uitgaven"
              ? "bg-rose-950/40 border-rose-500 shadow-md text-white"
              : "bg-[#101726] border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Uitgaven</span>
            <ArrowDownCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold font-mono mt-1 text-rose-400">{expenseCategories.length}</div>
          <span className="text-[10px] text-slate-500">Kostenrubrieken</span>
        </button>

        <button
          onClick={() => setSelectedTypeFilter("inkomsten")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedTypeFilter === "inkomsten"
              ? "bg-emerald-950/40 border-emerald-500 shadow-md text-white"
              : "bg-[#101726] border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Inkomsten</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono mt-1 text-emerald-400">{incomeCategories.length}</div>
          <span className="text-[10px] text-slate-500">Inkomstenbronnen</span>
        </button>

        <button
          onClick={() => setSelectedTypeFilter("sparen")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedTypeFilter === "sparen"
              ? "bg-indigo-950/40 border-indigo-500 shadow-md text-white"
              : "bg-[#101726] border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Sparen & Buffer</span>
            <PiggyBank className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold font-mono mt-1 text-indigo-400">{savingsCategories.length}</div>
          <span className="text-[10px] text-slate-500">Spaarpotten</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((cat) => {
          const Icon = getCategoryIcon(cat.name, cat.type);
          const colorStyles = getColorClasses(cat.color);
          const items = currentMonth.items.filter((i) => i.group === cat.name);
          const totalActual = items.reduce((s, i) => s + i.actual, 0);
          const totalPaid = items.reduce((s, i) => s + i.paidOrReceived, 0);

          return (
            <div
              key={cat.id || cat.name}
              className="bg-[#101726] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${colorStyles.bg} border ${colorStyles.border} flex items-center justify-center ${colorStyles.text} shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">{cat.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            cat.type === "inkomsten"
                              ? "bg-emerald-950/70 text-emerald-400 border-emerald-800/70"
                              : cat.type === "sparen"
                              ? "bg-indigo-950/70 text-indigo-400 border-indigo-800/70"
                              : "bg-rose-950/70 text-rose-400 border-rose-800/70"
                          }`}
                        >
                          {cat.type}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {items.length} post{items.length !== 1 ? "en" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditCategory(cat)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Categorie bewerken (naam, type, kleur)"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description if any */}
                {cat.description && (
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}

                {/* Budget Items list inside category */}
                <div className="space-y-1.5 mt-3 max-h-56 overflow-y-auto pr-1">
                  {items.length === 0 ? (
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-center text-xs text-slate-500">
                      Nog geen posten in deze categorie
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onOpenEditBudgetItem && onOpenEditBudgetItem(item)}
                        className="p-2.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group"
                        title="Klik om deze post aan te passen"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-indigo-400 transition-colors" />
                          <span className="font-medium text-slate-200 group-hover:text-white truncate">
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-mono">
                          <span className="font-bold text-white text-xs">
                            € {item.actual.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                          </span>
                          <Edit2 className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Card Footer: Monthly total + Quick Add button */}
              <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 font-sans block text-[11px]">
                    {currentMonth.monthName} Begroting:
                  </span>
                  <span className="font-bold text-white text-sm">
                    € {totalActual.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={() => onOpenAddBudgetItem(cat.name)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-sans font-semibold hover:bg-indigo-600/10 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post toevoegen</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
