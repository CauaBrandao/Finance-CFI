import { CATEGORIES, BUDGET_CATEGORY_KEYS, MONTH_NAMES_PT } from './constants.js';
import { formatCurrency } from './formatters.js';

export const BUDGET_THRESHOLDS = {
  WARNING_PERCENT: 70,
  EXCEEDED_PERCENT: 100
};

const MAX_LIMIT_AMOUNT = 999999999.99;
const MIN_LIMIT_AMOUNT = 0.01;

const roundCurrency = (value) => Number((Number(value) || 0).toFixed(2));

export function getTransactionYearMonth(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const dateOnly = dateStr.trim().split('T')[0];
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;

  return { year, month };
}

export function formatMonthYearLabel(month, year) {
  const monthName = MONTH_NAMES_PT[(Number(month) || 1) - 1] || '';
  return `${monthName} de ${year}`;
}

export function shiftPeriod(month, year, deltaMonths) {
  const date = new Date(year, month - 1 + deltaMonths, 1);
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear()
  };
}

export function calculateCategorySpentForPeriod(transactions = [], category, month, year) {
  if (!Array.isArray(transactions) || !category) return 0;

  const total = transactions.reduce((sum, tx) => {
    if (!tx || tx.type !== 'expense' || tx.category !== category) {
      return sum;
    }
    const ym = getTransactionYearMonth(tx.date);
    if (!ym || ym.month !== Number(month) || ym.year !== Number(year)) {
      return sum;
    }
    return sum + (Number(tx.amount) || 0);
  }, 0);

  return roundCurrency(total);
}

export function evaluateBudgetProgress(budget, transactions = [], thresholds = BUDGET_THRESHOLDS) {
  const limit = roundCurrency(budget.limitAmount);
  const spent = calculateCategorySpentForPeriod(transactions, budget.category, budget.month, budget.year);
  const remaining = roundCurrency(Math.max(limit - spent, 0));
  const exceededAmount = roundCurrency(Math.max(spent - limit, 0));
  const utilizationPercent = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;
  const progressBarPercent = Math.min(utilizationPercent, 100);

  const catInfo = CATEGORIES[budget.category] || CATEGORIES.other;

  let status = 'normal';
  let statusLabel = 'Dentro do limite';
  let alertMessage = null;

  if (spent > limit) {
    status = 'exceeded';
    statusLabel = 'Orçamento ultrapassado';
    alertMessage = `Você ultrapassou o orçamento de ${catInfo.label} em ${formatCurrency(exceededAmount)}.`;
  } else if (limit > 0 && utilizationPercent >= thresholds.EXCEEDED_PERCENT) {
    status = 'reached';
    statusLabel = 'Orçamento atingido';
    alertMessage = `Seu orçamento de ${catInfo.label} foi atingido.`;
  } else if (utilizationPercent > thresholds.WARNING_PERCENT) {
    status = 'warning';
    statusLabel = 'Atenção ao limite';
    alertMessage = `Você já utilizou ${utilizationPercent}% do orçamento de ${catInfo.label}.`;
  }

  return {
    ...budget,
    categoryInfo: catInfo,
    limit,
    spent,
    remaining,
    exceededAmount,
    utilizationPercent,
    progressBarPercent,
    status,
    statusLabel,
    alertMessage
  };
}

export function calculatePeriodBudgetSummary(budgets = [], transactions = [], month, year, thresholds = BUDGET_THRESHOLDS) {
  const periodBudgets = (budgets || []).filter(
    (b) => Number(b.month) === Number(month) && Number(b.year) === Number(year)
  );

  const items = periodBudgets
    .map((budget) => evaluateBudgetProgress(budget, transactions, thresholds))
    .sort((a, b) => b.utilizationPercent - a.utilizationPercent);

  const totalBudgeted = roundCurrency(items.reduce((sum, item) => sum + item.limit, 0));
  const totalSpent = roundCurrency(items.reduce((sum, item) => sum + item.spent, 0));
  const totalRemaining = roundCurrency(Math.max(totalBudgeted - totalSpent, 0));
  const totalExceeded = roundCurrency(Math.max(totalSpent - totalBudgeted, 0));
  const overallUtilizationPercent = totalBudgeted > 0
    ? Number(((totalSpent / totalBudgeted) * 100).toFixed(1))
    : 0;

  const exceededCategoriesCount = items.filter((item) => item.status === 'exceeded').length;
  const reachedOrExceededCount = items.filter((item) => item.status === 'exceeded' || item.status === 'reached').length;
  const warningCategoriesCount = items.filter((item) => item.status === 'warning').length;

  const alerts = items
    .filter((item) => Boolean(item.alertMessage))
    .map((item) => ({
      id: item.id,
      category: item.category,
      categoryLabel: item.categoryInfo.label,
      emoji: item.categoryInfo.emoji,
      status: item.status,
      message: item.alertMessage,
      utilizationPercent: item.utilizationPercent,
      exceededAmount: item.exceededAmount
    }));

  return {
    month: Number(month),
    year: Number(year),
    items,
    totalBudgeted,
    totalSpent,
    totalRemaining,
    totalExceeded,
    overallUtilizationPercent,
    budgetedCategoriesCount: items.length,
    exceededCategoriesCount,
    reachedOrExceededCount,
    warningCategoriesCount,
    alerts
  };
}

export function validateBudgetInput({ category, limitAmount, month, year }, existingBudgets = [], editingId = null) {
  const errors = {};
  const trimmedCategory = (category || '').trim();

  if (!trimmedCategory || !BUDGET_CATEGORY_KEYS.includes(trimmedCategory)) {
    errors.category = 'Selecione uma categoria de despesa válida.';
  }

  const numLimit = Number(limitAmount);
  if (limitAmount === '' || limitAmount === null || limitAmount === undefined || Number.isNaN(numLimit)) {
    errors.limitAmount = 'Informe um valor limite válido.';
  } else if (numLimit < MIN_LIMIT_AMOUNT) {
    errors.limitAmount = 'O limite deve ser maior que R$ 0,00.';
  } else if (numLimit > MAX_LIMIT_AMOUNT) {
    errors.limitAmount = 'O limite não pode exceder R$ 999.999.999,99.';
  }

  const numMonth = Number(month);
  const numYear = Number(year);
  if (!Number.isInteger(numMonth) || numMonth < 1 || numMonth > 12 || !Number.isInteger(numYear) || numYear < 2000 || numYear > 2100) {
    errors.period = 'Informe um período (mês e ano) válido.';
  }

  if (!errors.category && !errors.period && Array.isArray(existingBudgets)) {
    const duplicate = existingBudgets.find(
      (b) =>
        b.category === trimmedCategory &&
        Number(b.month) === numMonth &&
        Number(b.year) === numYear &&
        b.id !== editingId
    );
    if (duplicate) {
      errors.category = 'Já existe um orçamento para esta categoria neste período. Edite o existente.';
    }
  }

  return errors;
}
