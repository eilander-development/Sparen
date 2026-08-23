export type BudgetCategoryGroup =
  | "Inkomsten"
  | "Woning"
  | "Dagelijks Leven"
  | "Vervoersmiddelen"
  | "Verzekeringen"
  | "Spaargeld"
  | "Leningen"
  | "Overige Vaste Kosten"
  | "Overige Kosten"
  | string;

export type BudgetType = "inkomsten" | "uitgaven" | "sparen";

export interface CategoryDefinition {
  id: string;
  name: string;
  type: BudgetType;
  icon?: string;
  color?: string;
  description?: string;
  isDefault?: boolean;
}

export interface BudgetItem {
  id: string;
  name: string;
  group: BudgetCategoryGroup;
  type: BudgetType;
  estimated: number; // Geschat
  actual: number; // Werkelijk
  paidOrReceived: number; // Betaald of Ontvangen
  paymentCount?: number; // Aantal transacties / betalingen
  notes?: string;
  icon?: string;
  isPaid?: boolean;
}

export interface MonthlyBudget {
  monthId: string; // e.g. "jan", "feb", "mrt", etc.
  monthName: string; // "Januari", "Februari", etc.
  year: number;
  opRekening: number; // Saldo op rekening aan begin/eind van de maand
  items: BudgetItem[];
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  description: string;
  amount: number; // negative for expense, positive for income
  type: "Inkomsten" | "Uitgave" | "Sparen";
  categoryGroup: BudgetCategoryGroup | "Ongecategoriseerd";
  budgetItemId?: string;
  accountIban: string;
  counterparty?: string;
  isPending?: boolean;
  matchedRuleId?: string;
  source: "EnableBanking" | "Handmatig" | "CSV-import";
}

export interface Rule {
  id: string;
  name: string;
  keyword: string; // e.g. "GreenChoice", "Albert Heijn", "Aegon"
  matchField: "description" | "counterparty" | "both";
  targetGroup: BudgetCategoryGroup;
  targetBudgetItemId?: string;
  targetType: BudgetType;
  isActive: boolean;
  matchedCount: number;
}

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  iban: string;
  type: "checking" | "savings";
  balance: number;
  availableBalance: number;
  currency: string;
  lastSync: string;
  status: "connected" | "syncing" | "disconnected" | "error";
  syncCountToday: number;
}

export interface SavingsRow {
  month: string;
  monthId: string;
  opRekening: number;
  sparen: number;
  extra: number;
  opgenomen: number;
  totaal: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  accountIban: string;
  bankName: string;
  targetAmount: number;
  initialAmount: number;
  monthlyContribution: number;
  color: string;
  iconName: string;
  notes?: string;
  categoryBudgetItemId?: string;
}

export interface CategoryOverviewSummary {
  group: BudgetCategoryGroup;
  type: BudgetType;
  totalEstimated: number;
  totalActual: number;
  totalPaid: number;
  totalRemaining: number;
  difference: number;
  itemCount: number;
  items: BudgetItem[];
}

export type ActiveTab =
  | "dashboard"
  | "maandbegroting"
  | "uitgaven"
  | "inkomsten"
  | "sparen"
  | "transacties"
  | "enablebanking"
  | "categorieen"
  | "koppelregels"
  | "jaaroverzicht";
