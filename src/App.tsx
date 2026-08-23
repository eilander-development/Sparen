import React, { useState, useMemo } from "react";
import {
  ActiveTab,
  MonthlyBudget,
  Transaction,
  Rule,
  BankAccount,
  SavingsRow,
  BudgetItem,
  BudgetCategoryGroup,
  SavingsGoal,
  CategoryDefinition,
  BudgetType,
} from "./types";
import {
  INITIAL_MONTHLY_BUDGETS,
  INITIAL_TRANSACTIONS,
  INITIAL_RULES,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_SAVINGS_HISTORY,
  INITIAL_SAVINGS_GOALS,
  DEFAULT_CATEGORY_DEFINITIONS,
} from "./data/mockBudgetData";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { DashboardView } from "./components/DashboardView";
import { BudgetSpreadsheetView } from "./components/BudgetSpreadsheetView";
import { ExpensesView } from "./components/ExpensesView";
import { IncomeView } from "./components/IncomeView";
import { SavingsTrackerView } from "./components/SavingsTrackerView";
import { TransactionsView } from "./components/TransactionsView";
import { EnableBankingView } from "./components/EnableBankingView";
import { CategoriesView } from "./components/CategoriesView";
import { KoppelregelsView } from "./components/KoppelregelsView";
import { YearOverviewView } from "./components/YearOverviewView";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { AddBudgetItemModal } from "./components/AddBudgetItemModal";
import { EditBudgetItemModal } from "./components/EditBudgetItemModal";
import { ManageCategoryModal } from "./components/ManageCategoryModal";
import { AddRuleModal } from "./components/AddRuleModal";
import { AddSavingsGoalModal } from "./components/AddSavingsGoalModal";
import { ItemTransactionsModal } from "./components/ItemTransactionsModal";

const MONTH_ID_TO_PREFIX: Record<string, string> = {
  jan: "2026-01",
  feb: "2026-02",
  mrt: "2026-03",
  apr: "2026-04",
  mei: "2026-05",
  jun: "2026-06",
  jul: "2026-07",
  aug: "2026-08",
  sep: "2026-09",
  okt: "2026-10",
  nov: "2026-11",
  dec: "2026-12",
};

export function App() {
  // Main State: Maandbegroting as the default start page
  const [activeTab, setActiveTab] = useState<ActiveTab>("maandbegroting");
  const [selectedMonthId, setSelectedMonthId] = useState<string>("aug");
  const [baseMonthlyBudgets, setBaseMonthlyBudgets] = useState<MonthlyBudget[]>(INITIAL_MONTHLY_BUDGETS);
  const [categories, setCategories] = useState<CategoryDefinition[]>(DEFAULT_CATEGORY_DEFINITIONS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(INITIAL_SAVINGS_GOALS);
  const [savingsHistory, setSavingsHistory] = useState<SavingsRow[]>(INITIAL_SAVINGS_HISTORY);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Modals state
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAddBudgetItemModalOpen, setIsAddBudgetItemModalOpen] = useState(false);
  const [addBudgetItemDefaultGroup, setAddBudgetItemDefaultGroup] = useState<BudgetCategoryGroup | undefined>(undefined);
  const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDefinition | null>(null);
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [isAddSavingsGoalModalOpen, setIsAddSavingsGoalModalOpen] = useState(false);
  const [editingSavingsGoal, setEditingSavingsGoal] = useState<SavingsGoal | null>(null);
  const [itemTransactionsModalItem, setItemTransactionsModalItem] = useState<BudgetItem | null>(null);

  const [initialRuleKeyword, setInitialRuleKeyword] = useState<string>("");
  const [initialRuleGroup, setInitialRuleGroup] = useState<BudgetCategoryGroup>("Dagelijks Leven");
  const [initialRuleBudgetItemId, setInitialRuleBudgetItemId] = useState<string>("");

  // Apply auto-categorization rules & savings goal mappings to transactions
  const applyRulesToTransactions = (txs: Transaction[], rls: Rule[], sGoals: SavingsGoal[]) => {
    return txs.map((tx) => {
      // 1. Check if transaction is an outgoing transfer to any registered savings goal IBAN
      for (const goal of sGoals) {
        const cleanIban = goal.accountIban.replace(/\s+/g, "").toUpperCase();
        const inDesc = cleanIban && tx.description.toUpperCase().includes(cleanIban);
        const inCounter = cleanIban && (tx.counterparty?.toUpperCase().includes(cleanIban) || false);
        const inName = tx.description.toLowerCase().includes(goal.name.toLowerCase().split(" ")[0]);

        if (inDesc || inCounter || inName) {
          return {
            ...tx,
            type: "Sparen" as const,
            categoryGroup: "Spaargeld" as const,
            budgetItemId: goal.categoryBudgetItemId || tx.budgetItemId || "spaar-1",
            counterparty: goal.bankName || goal.name,
          };
        }
      }

      // 2. Find matching rule from rules table
      const match = rls.find((r) => {
        if (!r.isActive) return false;
        const kw = r.keyword.toLowerCase();
        const inDesc = tx.description.toLowerCase().includes(kw);
        const inCounterparty = tx.counterparty?.toLowerCase().includes(kw) || false;
        if (r.matchField === "description") return inDesc;
        if (r.matchField === "counterparty") return inCounterparty;
        return inDesc || inCounterparty;
      });

      if (match) {
        return {
          ...tx,
          categoryGroup: match.targetGroup,
          type:
            match.targetType === "inkomsten"
              ? ("Inkomsten" as const)
              : match.targetType === "sparen"
              ? ("Sparen" as const)
              : ("Uitgave" as const),
          budgetItemId: match.targetBudgetItemId || tx.budgetItemId,
          matchedRuleId: match.id,
        };
      }

      return tx;
    });
  };

  // Re-calculate live paid/received from transactions
  const monthlyBudgets = useMemo(() => {
    return baseMonthlyBudgets.map((mb) => {
      const monthPrefix = MONTH_ID_TO_PREFIX[mb.monthId] || `2026-${(baseMonthlyBudgets.indexOf(mb) + 1).toString().padStart(2, "0")}`;
      const txsInMonth = transactions.filter((t) => t.date.startsWith(monthPrefix));

      const updatedItems = mb.items.map((item) => {
        const matchingTxs = txsInMonth.filter((t) => {
          if (t.budgetItemId && t.budgetItemId === item.id) return true;
          if (t.categoryGroup === item.group && !t.budgetItemId) {
            const desc = t.description.toLowerCase();
            const itemNameLower = item.name.toLowerCase();
            if (desc.includes(itemNameLower) || itemNameLower.includes(desc)) return true;
          }
          return false;
        });

        const totalFromTxs = matchingTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const paymentCount = matchingTxs.length;
        const finalPaid = Math.max(item.paidOrReceived, totalFromTxs);

        return {
          ...item,
          paidOrReceived: finalPaid,
          paymentCount: paymentCount > 0 ? paymentCount : item.paymentCount,
          isPaid: finalPaid >= item.actual && item.actual > 0,
        };
      });

      return {
        ...mb,
        items: updatedItems,
      };
    });
  }, [baseMonthlyBudgets, transactions]);

  const currentMonth = useMemo(() => {
    return monthlyBudgets.find((m) => m.monthId === selectedMonthId) || monthlyBudgets[0];
  }, [monthlyBudgets, selectedMonthId]);

  const primaryBankAccount = bankAccounts[0] || INITIAL_BANK_ACCOUNTS[0];

  // Bank Sync simulation
  const handleBankSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

      setBankAccounts((prev) =>
        prev.map((acc) => ({
          ...acc,
          lastSync: timeStr,
          syncCountToday: acc.syncCountToday + 1,
        }))
      );

      // Simulate a small mutation if syncing in August
      if (selectedMonthId === "aug") {
        const sampleIncoming: Transaction = {
          id: `tx-sync-${Date.now()}`,
          date: "2026-08-23",
          time: timeStr,
          description: "Albert Heijn 1422 Zaandam",
          amount: -34.85,
          type: "Uitgave",
          categoryGroup: "Dagelijks Leven",
          accountIban: "NL83INGB0004565868",
          counterparty: "Albert Heijn B.V.",
          source: "EnableBanking",
        };

        const processed = applyRulesToTransactions([sampleIncoming], rules, savingsGoals)[0];
        setTransactions((prev) => [processed, ...prev]);
      }

      setIsSyncing(false);
    }, 900);
  };

  // Add Transaction
  const handleAddTransaction = (txData: Omit<Transaction, "id">) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
    };
    const processed = applyRulesToTransactions([newTx], rules, savingsGoals)[0];
    setTransactions((prev) => [processed, ...prev]);

    // Update account balance
    setBankAccounts((prev) =>
      prev.map((acc) =>
        acc.iban === newTx.accountIban || acc.id === "acc-ing-1"
          ? {
              ...acc,
              balance: acc.balance + newTx.amount,
              availableBalance: acc.availableBalance + newTx.amount,
            }
          : acc
      )
    );
  };

  // Delete Transaction
  const handleDeleteTransaction = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    setTransactions((prev) => prev.filter((t) => t.id !== txId));

    // Revert balance
    setBankAccounts((prev) =>
      prev.map((acc) =>
        acc.iban === tx.accountIban || acc.id === "acc-ing-1"
          ? {
              ...acc,
              balance: acc.balance - tx.amount,
              availableBalance: acc.availableBalance - tx.amount,
            }
          : acc
      )
    );
  };

  // Bulk update category & post for transactions
  const handleBulkUpdateCategory = (
    txIds: string[],
    newCategory: BudgetCategoryGroup,
    newBudgetItemId?: string
  ) => {
    const catMatch = categories.find((c) => c.name === newCategory);
    const targetType: "Inkomsten" | "Uitgave" | "Sparen" =
      newCategory === "Inkomsten" || catMatch?.type === "inkomsten"
        ? "Inkomsten"
        : newCategory === "Spaargeld" || catMatch?.type === "sparen"
        ? "Sparen"
        : "Uitgave";

    setTransactions((prev) =>
      prev.map((tx) =>
        txIds.includes(tx.id)
          ? {
              ...tx,
              categoryGroup: newCategory,
              ...(newBudgetItemId ? { budgetItemId: newBudgetItemId } : {}),
              type: targetType,
            }
          : tx
      )
    );
  };

  // Direct link transaction to budget item with option to create automated rule
  const handleLinkTransaction = (
    txId: string,
    categoryGroup: BudgetCategoryGroup,
    budgetItemId: string,
    createRule?: {
      name: string;
      keyword: string;
      matchField: "description" | "counterparty" | "both";
      targetType: BudgetType;
    }
  ) => {
    const catMatch = categories.find((c) => c.name === categoryGroup);
    const targetType: "Inkomsten" | "Uitgave" | "Sparen" =
      categoryGroup === "Inkomsten" || catMatch?.type === "inkomsten"
        ? "Inkomsten"
        : categoryGroup === "Spaargeld" || catMatch?.type === "sparen"
        ? "Sparen"
        : "Uitgave";

    let updatedRules = rules;
    if (createRule && createRule.keyword.trim()) {
      const newRule: Rule = {
        id: `rule-${Date.now()}`,
        name: createRule.name.trim() || `Regel: ${createRule.keyword.trim()}`,
        keyword: createRule.keyword.trim(),
        matchField: createRule.matchField,
        targetGroup: categoryGroup,
        targetBudgetItemId: budgetItemId,
        targetType: createRule.targetType,
        isActive: true,
        matchedCount: 1,
      };
      updatedRules = [...rules, newRule];
      setRules(updatedRules);
    }

    setTransactions((prev) => {
      const updatedTxs = prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              categoryGroup,
              budgetItemId,
              type: targetType,
            }
          : t
      );
      return applyRulesToTransactions(updatedTxs, updatedRules, savingsGoals);
    });
  };

  // Create rule from transaction
  const handleCreateRuleFromTransaction = (
    keyword: string,
    targetGroup: BudgetCategoryGroup,
    targetType: "inkomsten" | "uitgaven" | "sparen",
    budgetItemId?: string
  ) => {
    setInitialRuleKeyword(keyword);
    setInitialRuleGroup(targetGroup);
    setInitialRuleBudgetItemId(budgetItemId || "");
    setIsAddRuleModalOpen(true);
  };

  // Add rule
  const handleAddRule = (ruleData: Omit<Rule, "id" | "matchedCount">) => {
    const newRule: Rule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      matchedCount: 0,
    };
    const updatedRules = [...rules, newRule];
    setRules(updatedRules);
    setTransactions((prev) => applyRulesToTransactions(prev, updatedRules, savingsGoals));
  };

  // Toggle rule
  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r));
    setRules(updated);
    setTransactions((prev) => applyRulesToTransactions(prev, updated, savingsGoals));
  };

  // Delete rule
  const handleDeleteRule = (ruleId: string) => {
    const updated = rules.filter((r) => r.id !== ruleId);
    setRules(updated);
    setTransactions((prev) => applyRulesToTransactions(prev, updated, savingsGoals));
  };

  // Apply rules to all past transactions
  const handleApplyRulesToAll = () => {
    setTransactions((prev) => applyRulesToTransactions(prev, rules, savingsGoals));
  };

  // Update budget item in active month
  const handleUpdateBudgetItem = (itemId: string, updates: Partial<BudgetItem>) => {
    setBaseMonthlyBudgets((prev) =>
      prev.map((m) =>
        m.monthId === selectedMonthId
          ? {
              ...m,
              items: m.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
            }
          : m
      )
    );
  };

  // Comprehensive update from EditBudgetItemModal (across months)
  const handleSaveBudgetItemDetails = (
    itemId: string,
    updatedData: {
      name: string;
      group: BudgetCategoryGroup;
      type?: "inkomsten" | "uitgaven" | "sparen";
      monthlyAmounts: Record<string, number>;
    }
  ) => {
    setBaseMonthlyBudgets((prev) =>
      prev.map((m) => {
        const monthAmount = updatedData.monthlyAmounts[m.monthId];
        return {
          ...m,
          items: m.items.map((item) => {
            if (item.id === itemId) {
              const newAmount = monthAmount !== undefined ? monthAmount : item.actual;
              return {
                ...item,
                name: updatedData.name,
                group: updatedData.group,
                type: updatedData.type || item.type,
                estimated: newAmount,
                actual: newAmount,
              };
            }
            return item;
          }),
        };
      })
    );
  };

  // Delete budget item
  const handleDeleteBudgetItem = (itemId: string) => {
    setBaseMonthlyBudgets((prev) =>
      prev.map((m) => ({
        ...m,
        items: m.items.filter((item) => item.id !== itemId),
      }))
    );
  };

  const handleOpenEditBudgetItem = (item: BudgetItem) => {
    setEditingBudgetItem(item);
  };

  // Add budget line item
  const handleAddBudgetItem = (itemData: Omit<BudgetItem, "id">) => {
    const id = `item-${Date.now()}`;
    const newItem: BudgetItem = { ...itemData, id };
    setBaseMonthlyBudgets((prev) =>
      prev.map((m) =>
        m.monthId === selectedMonthId
          ? {
              ...m,
              items: [...m.items, newItem],
            }
          : m
      )
    );
  };

  // Category Management Handlers
  const handleSaveCategory = (cat: CategoryDefinition) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === cat.id);
      if (idx >= 0) {
        const oldCat = prev[idx];
        if (oldCat.name !== cat.name || oldCat.type !== cat.type) {
          setBaseMonthlyBudgets((mPrev) =>
            mPrev.map((m) => ({
              ...m,
              items: m.items.map((i) =>
                i.group === oldCat.name ? { ...i, group: cat.name, type: cat.type } : i
              ),
            }))
          );
        }
        const copy = [...prev];
        copy[idx] = cat;
        return copy;
      } else {
        return [...prev, cat];
      }
    });
  };

  const handleDeleteCategory = (catId: string) => {
    const catToDelete = categories.find((c) => c.id === catId);
    if (!catToDelete) return;

    setBaseMonthlyBudgets((mPrev) =>
      mPrev.map((m) => ({
        ...m,
        items: m.items.map((i) =>
          i.group === catToDelete.name ? { ...i, group: "Overige Kosten", type: "uitgaven" } : i
        ),
      }))
    );

    setCategories((prev) => prev.filter((c) => c.id !== catId));
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryDefinition) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleOpenAddBudgetItemModal = (defaultGroup?: BudgetCategoryGroup) => {
    setAddBudgetItemDefaultGroup(defaultGroup);
    setIsAddBudgetItemModalOpen(true);
  };

  // Savings Goals Management
  const handleSaveSavingsGoal = (goalData: Omit<SavingsGoal, "id">, editId?: string) => {
    if (editId) {
      setSavingsGoals((prev) =>
        prev.map((g) => (g.id === editId ? { ...g, ...goalData } : g))
      );
    } else {
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `goal-${Date.now()}`,
      };
      setSavingsGoals((prev) => [...prev, newGoal]);
    }

    setTimeout(() => {
      setTransactions((prev) =>
        applyRulesToTransactions(prev, rules, [
          ...savingsGoals,
          ...(editId ? [] : [{ ...goalData, id: "temp" }]),
        ])
      );
    }, 50);
  };

  const handleDeleteSavingsGoal = (goalId: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const handleOpenEditSavingsGoal = (goal: SavingsGoal) => {
    setEditingSavingsGoal(goal);
    setIsAddSavingsGoalModalOpen(true);
  };

  const handleOpenAddSavingsGoal = () => {
    setEditingSavingsGoal(null);
    setIsAddSavingsGoalModalOpen(true);
  };

  // Simulate incoming bank transaction
  const handleSimulateIncomingTransaction = (txData: Partial<Transaction>) => {
    const fullTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
      description: txData.description || "Inkomende banktransactie",
      amount: txData.amount || -25.0,
      type: txData.type || "Uitgave",
      categoryGroup: txData.categoryGroup || "Dagelijks Leven",
      accountIban: "NL83INGB0004565868",
      counterparty: txData.counterparty || "Tegenpartij",
      source: "EnableBanking",
    };

    const matched = applyRulesToTransactions([fullTx], rules, savingsGoals)[0];
    setTransactions((prev) => [matched, ...prev]);

    setBankAccounts((prev) =>
      prev.map((acc) =>
        acc.id === "acc-ing-1"
          ? {
              ...acc,
              balance: acc.balance + matched.amount,
              availableBalance: acc.availableBalance + matched.amount,
            }
          : acc
      )
    );
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bankAccount={primaryBankAccount}
        onSync={handleBankSync}
        isSyncing={isSyncing}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Sticky Header */}
        <Header
          currentMonth={currentMonth}
          allMonths={monthlyBudgets}
          onSelectMonth={setSelectedMonthId}
          bankAccount={primaryBankAccount}
          onSync={handleBankSync}
          isSyncing={isSyncing}
          onOpenAddTransaction={() => setIsAddTxModalOpen(true)}
          onOpenAddBudgetItem={() => handleOpenAddBudgetItemModal()}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
        />

        {/* View Router with mobile bottom padding */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 pb-24 md:pb-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === "dashboard" && (
            <DashboardView
              currentMonth={currentMonth}
              allMonths={monthlyBudgets}
              transactions={transactions}
              bankAccount={primaryBankAccount}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === "maandbegroting" && (
            <BudgetSpreadsheetView
              currentMonth={currentMonth}
              allMonths={monthlyBudgets}
              transactions={transactions}
              onSelectMonth={setSelectedMonthId}
              onUpdateBudgetItem={handleUpdateBudgetItem}
              onOpenAddBudgetItem={() => handleOpenAddBudgetItemModal()}
              onOpenEditBudgetItem={handleOpenEditBudgetItem}
              onOpenItemTransactions={(item) => setItemTransactionsModalItem(item)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === "uitgaven" && (
            <ExpensesView
              currentMonth={currentMonth}
              allMonths={monthlyBudgets}
              transactions={transactions}
              onUpdateBudgetItem={handleUpdateBudgetItem}
              onOpenAddBudgetItem={() => handleOpenAddBudgetItemModal()}
              onOpenEditBudgetItem={handleOpenEditBudgetItem}
              onOpenItemTransactions={(item) => setItemTransactionsModalItem(item)}
            />
          )}

          {activeTab === "inkomsten" && (
            <IncomeView
              currentMonth={currentMonth}
              allMonths={monthlyBudgets}
              transactions={transactions}
              onUpdateBudgetItem={handleUpdateBudgetItem}
              onOpenAddBudgetItem={() => handleOpenAddBudgetItemModal("Inkomsten")}
              onOpenEditBudgetItem={handleOpenEditBudgetItem}
              onOpenItemTransactions={(item) => setItemTransactionsModalItem(item)}
            />
          )}

          {activeTab === "sparen" && (
            <SavingsTrackerView
              savingsHistory={savingsHistory}
              savingsItems={currentMonth.items.filter((i) => i.type === "sparen")}
              savingsGoals={savingsGoals}
              transactions={transactions}
              onOpenAddGoal={handleOpenAddSavingsGoal}
              onEditGoal={handleOpenEditSavingsGoal}
              onDeleteGoal={handleDeleteSavingsGoal}
              onUpdateSavingsRow={(mId, updates) => {
                setSavingsHistory((prev) =>
                  prev.map((r) => (r.monthId === mId ? { ...r, ...updates } : r))
                );
              }}
            />
          )}

          {activeTab === "transacties" && (
            <TransactionsView
              transactions={transactions}
              onAddTransaction={() => setIsAddTxModalOpen(true)}
              onDeleteTransaction={handleDeleteTransaction}
              onLinkTransaction={handleLinkTransaction}
              onCreateRuleFromTransaction={handleCreateRuleFromTransaction}
              onBulkUpdateCategory={handleBulkUpdateCategory}
              rules={rules}
              budgetItems={currentMonth.items}
              categories={categories}
              onOpenAddBudgetItemModal={handleOpenAddBudgetItemModal}
            />
          )}

          {activeTab === "enablebanking" && (
            <EnableBankingView
              bankAccount={primaryBankAccount}
              savingsGoals={savingsGoals}
              onSync={handleBankSync}
              isSyncing={isSyncing}
              onOpenAddGoal={handleOpenAddSavingsGoal}
              onSimulateIncomingTransaction={handleSimulateIncomingTransaction}
            />
          )}

          {activeTab === "categorieen" && (
            <CategoriesView
              currentMonth={currentMonth}
              categories={categories}
              onOpenAddBudgetItem={(grp) => handleOpenAddBudgetItemModal(grp)}
              onOpenEditBudgetItem={handleOpenEditBudgetItem}
              onOpenAddCategory={handleOpenAddCategory}
              onOpenEditCategory={handleOpenEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onUpdateBudgetItem={handleUpdateBudgetItem}
              onDeleteBudgetItem={handleDeleteBudgetItem}
            />
          )}

          {activeTab === "koppelregels" && (
            <KoppelregelsView
              rules={rules}
              onAddRule={() => {
                setInitialRuleKeyword("");
                setInitialRuleGroup("Dagelijks Leven");
                setInitialRuleBudgetItemId("");
                setIsAddRuleModalOpen(true);
              }}
              onToggleRule={handleToggleRule}
              onDeleteRule={handleDeleteRule}
              onApplyRulesToAll={handleApplyRulesToAll}
              transactions={transactions}
              budgetItems={currentMonth.items}
            />
          )}

          {activeTab === "jaaroverzicht" && (
            <YearOverviewView
              allMonths={monthlyBudgets}
              onSelectMonth={(mId) => {
                setSelectedMonthId(mId);
                setActiveTab("maandbegroting");
              }}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
      />

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
        onAdd={handleAddTransaction}
      />

      <AddBudgetItemModal
        isOpen={isAddBudgetItemModalOpen}
        onClose={() => setIsAddBudgetItemModalOpen(false)}
        onAdd={handleAddBudgetItem}
        categories={categories}
        defaultGroup={addBudgetItemDefaultGroup}
      />

      <EditBudgetItemModal
        isOpen={!!editingBudgetItem}
        onClose={() => setEditingBudgetItem(null)}
        item={editingBudgetItem}
        currentMonthId={selectedMonthId}
        allMonths={monthlyBudgets}
        categories={categories}
        onSave={handleSaveBudgetItemDetails}
        onDelete={handleDeleteBudgetItem}
      />

      <ManageCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />

      <AddRuleModal
        isOpen={isAddRuleModalOpen}
        onClose={() => setIsAddRuleModalOpen(false)}
        onAdd={handleAddRule}
        initialKeyword={initialRuleKeyword}
        initialGroup={initialRuleGroup}
        initialBudgetItemId={initialRuleBudgetItemId}
        budgetItems={currentMonth.items}
        categories={categories}
      />

      <AddSavingsGoalModal
        isOpen={isAddSavingsGoalModalOpen}
        onClose={() => {
          setIsAddSavingsGoalModalOpen(false);
          setEditingSavingsGoal(null);
        }}
        onSave={handleSaveSavingsGoal}
        editingGoal={editingSavingsGoal}
      />

      <ItemTransactionsModal
        isOpen={!!itemTransactionsModalItem}
        onClose={() => setItemTransactionsModalItem(null)}
        budgetItem={itemTransactionsModalItem}
        currentMonth={currentMonth}
        allMonths={monthlyBudgets}
        transactions={transactions}
        onUnlinkTransaction={(txId) => {
          setTransactions((prev) =>
            prev.map((t) => (t.id === txId ? { ...t, budgetItemId: undefined } : t))
          );
        }}
        onLinkTransaction={(txId, group, itemId) => {
          handleLinkTransaction(txId, group, itemId);
        }}
        onOpenEditBudgetItem={(item) => handleOpenEditBudgetItem(item)}
        onAddTransactionToItem={(itemId, itemGroup) => {
          setIsAddTxModalOpen(true);
        }}
      />
    </div>
  );
}

export default App;
