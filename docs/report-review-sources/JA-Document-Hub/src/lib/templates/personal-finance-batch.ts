import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br, fmtDate, divider, notice } from './html-helpers';

function mk(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'personal-finance', icon: 'PiggyBank', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}

const disclaimer = notice('This document is for personal planning and record-keeping only. It does not constitute financial advice. Consult a qualified financial adviser for personalised guidance.', 'warning');

export const personalBudgetPlanner = mk('personal-budget-planner', 'Personal Budget Planner', 'A monthly personal budget planner to track income and expenses.', ['budget', 'personal finance', 'planner'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'name', label: 'Your Name', type: 'text', required: false },
    { id: 'month', label: 'Month / Period', type: 'text', required: false },
    { id: 'totalIncome', label: 'Total Monthly Income', type: 'text', required: false },
    { id: 'housing', label: 'Housing (rent/mortgage)', type: 'text', required: false },
    { id: 'utilities', label: 'Utilities', type: 'text', required: false },
    { id: 'food', label: 'Food & Groceries', type: 'text', required: false },
    { id: 'transport', label: 'Transport', type: 'text', required: false },
    { id: 'insurance', label: 'Insurance', type: 'text', required: false },
    { id: 'subscriptions', label: 'Subscriptions', type: 'text', required: false },
    { id: 'entertainment', label: 'Entertainment / Leisure', type: 'text', required: false },
    { id: 'savings', label: 'Savings', type: 'text', required: false },
    { id: 'other', label: 'Other Expenses', type: 'text', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    disclaimer,
    section('Budget Overview', infoTable([['Name', d.name],['Period', d.month],['Total Income', d.totalIncome]])),
    section('Expenses', infoTable([['Housing', d.housing],['Utilities', d.utilities],['Food & Groceries', d.food],['Transport', d.transport],['Insurance', d.insurance],['Subscriptions', d.subscriptions],['Entertainment', d.entertainment],['Savings', d.savings],['Other', d.other]])),
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const debtRepaymentPlan = mk('debt-repayment-plan', 'Debt Repayment Plan', 'A personal debt repayment tracker and plan.', ['debt', 'repayment', 'plan', 'personal finance'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'name', label: 'Your Name', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'debts', label: 'Debts (Creditor, Balance, Interest Rate, Min Payment)', type: 'textarea', required: false },
    { id: 'totalDebt', label: 'Total Debt', type: 'text', required: false },
    { id: 'monthlyPayment', label: 'Total Monthly Payment', type: 'text', required: false },
    { id: 'strategy', label: 'Repayment Strategy', type: 'select', required: false, options: ['Avalanche (highest interest first)', 'Snowball (smallest balance first)', 'Custom'] },
    { id: 'targetDate', label: 'Target Debt-Free Date', type: 'date', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    disclaimer,
    section('Debt Repayment Plan', infoTable([['Name', d.name],['Date', fmtDate(d.date)],['Total Debt', d.totalDebt],['Monthly Payment', d.monthlyPayment],['Strategy', d.strategy],['Target Date', fmtDate(d.targetDate)]])),
    d.debts ? section('Debts', `<p>${nl2br(d.debts)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const savingsGoalTracker = mk('savings-goal-tracker', 'Savings Goal Tracker', 'Track progress towards a personal savings goal.', ['savings', 'goal', 'tracker', 'personal finance'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'name', label: 'Your Name', type: 'text', required: false },
    { id: 'goalName', label: 'Savings Goal', type: 'text', required: true, placeholder: 'e.g. House deposit, Emergency fund' },
    { id: 'targetAmount', label: 'Target Amount', type: 'text', required: false },
    { id: 'currentSaved', label: 'Amount Already Saved', type: 'text', required: false },
    { id: 'monthlyContribution', label: 'Monthly Contribution', type: 'text', required: false },
    { id: 'targetDate', label: 'Target Date', type: 'date', required: false },
    { id: 'savingsAccount', label: 'Savings Account / Method', type: 'text', required: false },
    { id: 'milestones', label: 'Milestones', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    disclaimer,
    section('Savings Goal', infoTable([['Name', d.name],['Goal', or(d.goalName,'[Goal]')],['Target Amount', d.targetAmount],['Already Saved', d.currentSaved],['Monthly Contribution', d.monthlyContribution],['Target Date', fmtDate(d.targetDate)],['Account / Method', d.savingsAccount]])),
    d.milestones ? section('Milestones', `<p>${nl2br(d.milestones)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const expenseTracker = mk('expense-tracker', 'Expense Tracker', 'A personal or business expense tracker.', ['expenses', 'tracker', 'personal finance'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'name', label: 'Name', type: 'text', required: false },
    { id: 'period', label: 'Period', type: 'text', required: false },
    { id: 'expenses', label: 'Expenses (Date, Description, Category, Amount)', type: 'textarea', required: false },
    { id: 'totalExpenses', label: 'Total Expenses', type: 'text', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Expense Tracker', infoTable([['Name', d.name],['Period', d.period],['Total', d.totalExpenses]])),
    d.expenses ? section('Expenses', `<p>${nl2br(d.expenses)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const loanAgreementPersonal = mk('personal-loan-agreement', 'Personal Loan Agreement', 'A simple personal loan agreement between two individuals.', ['loan', 'agreement', 'personal', 'money'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'lenderName', label: 'Lender Name', type: 'text', required: true },
    { id: 'borrowerName', label: 'Borrower Name', type: 'text', required: true },
    { id: 'loanAmount', label: 'Loan Amount', type: 'text', required: true },
    { id: 'agreementDate', label: 'Agreement Date', type: 'date', required: false },
    { id: 'repaymentDate', label: 'Repayment Date', type: 'date', required: false },
    { id: 'interestRate', label: 'Interest Rate (if any)', type: 'text', required: false, placeholder: 'e.g. 0% (interest-free) or 5% per annum' },
    { id: 'repaymentSchedule', label: 'Repayment Schedule', type: 'textarea', required: false },
    { id: 'purpose', label: 'Purpose of Loan (optional)', type: 'text', required: false },
  ]}],
  (d) => [
    notice('This is a simple record of a personal loan agreement. It is not a regulated financial product. Both parties should keep a signed copy.', 'info'),
    section('Loan Agreement', infoTable([['Lender', or(d.lenderName,'[Lender]')],['Borrower', or(d.borrowerName,'[Borrower]')],['Loan Amount', or(d.loanAmount,'[Amount]')],['Date', fmtDate(d.agreementDate)],['Repayment Date', fmtDate(d.repaymentDate)],['Interest Rate', d.interestRate || 'Interest-free'],['Purpose', d.purpose]])),
    d.repaymentSchedule ? section('Repayment Schedule', `<p>${nl2br(d.repaymentSchedule)}</p>`) : '',
    divider(),
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px;">
      <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Lender Signature</p></div>
      <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Borrower Signature</p></div>
    </div>`,
  ].filter(Boolean).join(''),
);

export const householdBudget = mk('household-budget', 'Household Budget', 'A household budget planner for families or shared households.', ['household', 'budget', 'family', 'planner'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'household', label: 'Household / Family Name', type: 'text', required: false },
    { id: 'month', label: 'Month / Period', type: 'text', required: false },
    { id: 'totalIncome', label: 'Total Household Income', type: 'text', required: false },
    { id: 'mortgage', label: 'Mortgage / Rent', type: 'text', required: false },
    { id: 'utilities', label: 'Utilities (gas, electric, water)', type: 'text', required: false },
    { id: 'council', label: 'Council Tax', type: 'text', required: false },
    { id: 'food', label: 'Food & Groceries', type: 'text', required: false },
    { id: 'childcare', label: 'Childcare / School', type: 'text', required: false },
    { id: 'transport', label: 'Transport', type: 'text', required: false },
    { id: 'insurance', label: 'Insurance', type: 'text', required: false },
    { id: 'entertainment', label: 'Entertainment / Leisure', type: 'text', required: false },
    { id: 'savings', label: 'Savings', type: 'text', required: false },
    { id: 'other', label: 'Other', type: 'text', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Household Budget', infoTable([['Household', d.household],['Period', d.month],['Total Income', d.totalIncome]])),
    section('Expenses', infoTable([['Mortgage / Rent', d.mortgage],['Utilities', d.utilities],['Council Tax', d.council],['Food & Groceries', d.food],['Childcare / School', d.childcare],['Transport', d.transport],['Insurance', d.insurance],['Entertainment', d.entertainment],['Savings', d.savings],['Other', d.other]])),
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const netWorthStatement = mk('net-worth-statement', 'Net Worth Statement', 'A personal net worth statement listing assets and liabilities.', ['net worth', 'assets', 'liabilities', 'personal finance'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'name', label: 'Your Name', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'assets', label: 'Assets (Item, Value)', type: 'textarea', required: false },
    { id: 'totalAssets', label: 'Total Assets', type: 'text', required: false },
    { id: 'liabilities', label: 'Liabilities (Item, Balance)', type: 'textarea', required: false },
    { id: 'totalLiabilities', label: 'Total Liabilities', type: 'text', required: false },
    { id: 'netWorth', label: 'Net Worth (Assets − Liabilities)', type: 'text', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    disclaimer,
    section('Net Worth Statement', infoTable([['Name', d.name],['Date', fmtDate(d.date)],['Total Assets', d.totalAssets],['Total Liabilities', d.totalLiabilities],['Net Worth', d.netWorth]])),
    d.assets ? section('Assets', `<p>${nl2br(d.assets)}</p>`) : '',
    d.liabilities ? section('Liabilities', `<p>${nl2br(d.liabilities)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const ALL_PERSONAL_FINANCE_TEMPLATES: DocumentTemplate[] = [
  personalBudgetPlanner, debtRepaymentPlan, savingsGoalTracker,
  expenseTracker, loanAgreementPersonal, householdBudget, netWorthStatement,
];
