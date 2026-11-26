import test from 'node:test';
import assert from 'node:assert/strict';
import { createBudgetService } from '../src/services/budgetService.js';
import {
  calculateCategorySpentForPeriod,
  evaluateBudgetProgress,
  calculatePeriodBudgetSummary,
  validateBudgetInput,
  shiftPeriod,
  formatMonthYearLabel
} from '../src/utils/budgetCalculations.js';

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

test('budgetService cria, lista, edita, remove e persiste orçamentos no storage', () => {
  const storage = createMemoryStorage();
  const service = createBudgetService(storage);

  const created = service.create({
    category: 'food',
    limitAmount: 600,
    month: 11,
    year: 2026
  });

  assert.ok(created.id);
  assert.equal(created.category, 'food');
  assert.equal(created.limitAmount, 600);
  assert.equal(created.month, 11);
  assert.equal(created.year, 2026);

  // Recuperação em nova instância simulando reload da página
  const reloadedService = createBudgetService(storage);
  assert.equal(reloadedService.getByPeriod(11, 2026).length, 1);

  const updated = reloadedService.update(created.id, {
    category: 'food',
    limitAmount: 750.5,
    month: 11,
    year: 2026
  });
  assert.equal(updated.limitAmount, 750.5);

  reloadedService.remove(created.id);
  assert.equal(reloadedService.getAll().length, 0);
});

test('budgetService impede duplicidade de categoria e período e valida campos', () => {
  const service = createBudgetService(createMemoryStorage());
  service.create({ category: 'transport', limitAmount: 300, month: 11, year: 2026 });

  assert.throws(
    () => service.create({ category: 'transport', limitAmount: 400, month: 11, year: 2026 }),
    /Já existe um orçamento/
  );

  // Mesmo categoria em mês diferente deve ser permitido
  const dec = service.create({ category: 'transport', limitAmount: 350, month: 12, year: 2026 });
  assert.equal(dec.month, 12);

  // Validação de campos inválidos
  const errors = validateBudgetInput({ category: 'salary', limitAmount: 0, month: 13, year: 2026 }, []);
  assert.ok(errors.category);
  assert.ok(errors.limitAmount);
  assert.ok(errors.period);
});

test('calculateCategorySpentForPeriod considera apenas despesas da categoria e do período selecionado', () => {
  const transactions = [
    { id: '1', amount: 250, type: 'expense', category: 'food', date: '2026-11-05' },
    { id: '2', amount: 170, type: 'expense', category: 'food', date: '2026-11-20T14:00:00' },
    { id: '3', amount: 500, type: 'income', category: 'food', date: '2026-11-10' }, // receita não conta
    { id: '4', amount: 300, type: 'expense', category: 'food', date: '2026-10-25' }, // outro mês não conta
    { id: '5', amount: 120, type: 'expense', category: 'transport', date: '2026-11-12' } // outra categoria
  ];

  const spentNov = calculateCategorySpentForPeriod(transactions, 'food', 11, 2026);
  assert.equal(spentNov, 420);

  const spentOct = calculateCategorySpentForPeriod(transactions, 'food', 10, 2026);
  assert.equal(spentOct, 300);
});

test('evaluateBudgetProgress calcula percentual, restante, excedido e alertas corretamente', () => {
  const normalBudget = { id: 'b1', category: 'food', limitAmount: 600, month: 11, year: 2026 };
  const warningBudget = { id: 'b2', category: 'health', limitAmount: 250, month: 11, year: 2026 };
  const reachedBudget = { id: 'b3', category: 'leisure', limitAmount: 200, month: 11, year: 2026 };
  const exceededBudget = { id: 'b4', category: 'transport', limitAmount: 300, month: 11, year: 2026 };

  const transactions = [
    { id: 't1', amount: 420, type: 'expense', category: 'food', date: '2026-11-05' },      // 70% -> normal
    { id: 't2', amount: 200, type: 'expense', category: 'health', date: '2026-11-08' },    // 80% -> warning
    { id: 't3', amount: 200, type: 'expense', category: 'leisure', date: '2026-11-10' },   // 100% -> reached
    { id: 't4', amount: 345, type: 'expense', category: 'transport', date: '2026-11-12' }  // 115% -> exceeded
  ];

  const resNormal = evaluateBudgetProgress(normalBudget, transactions);
  assert.equal(resNormal.status, 'normal');
  assert.equal(resNormal.remaining, 180);
  assert.equal(resNormal.utilizationPercent, 70);
  assert.equal(resNormal.alertMessage, null);

  const resWarning = evaluateBudgetProgress(warningBudget, transactions);
  assert.equal(resWarning.status, 'warning');
  assert.equal(resWarning.utilizationPercent, 80);
  assert.match(resWarning.alertMessage, /80%/);

  const resReached = evaluateBudgetProgress(reachedBudget, transactions);
  assert.equal(resReached.status, 'reached');
  assert.equal(resReached.remaining, 0);
  assert.match(resReached.alertMessage, /foi atingido/);

  const resExceeded = evaluateBudgetProgress(exceededBudget, transactions);
  assert.equal(resExceeded.status, 'exceeded');
  assert.equal(resExceeded.exceededAmount, 45);
  assert.equal(resExceeded.progressBarPercent, 100);
  assert.match(resExceeded.alertMessage, /ultrapassou/);
});

test('calculatePeriodBudgetSummary consolida totais e reflete edição e exclusão de transações', () => {
  const budgets = [
    { id: 'b1', category: 'food', limitAmount: 600, month: 11, year: 2026 },
    { id: 'b2', category: 'transport', limitAmount: 300, month: 11, year: 2026 }
  ];

  let transactions = [
    { id: 't1', amount: 400, type: 'expense', category: 'food', date: '2026-11-05' },
    { id: 't2', amount: 350, type: 'expense', category: 'transport', date: '2026-11-06' }
  ];

  let summary = calculatePeriodBudgetSummary(budgets, transactions, 11, 2026);
  assert.equal(summary.totalBudgeted, 900);
  assert.equal(summary.totalSpent, 750);
  assert.equal(summary.totalRemaining, 150);
  assert.equal(summary.budgetedCategoriesCount, 2);
  assert.equal(summary.exceededCategoriesCount, 1);
  assert.equal(summary.alerts.length, 1);

  // Edição de transação: reduz transporte de 350 para 200
  transactions = transactions.map((t) => (t.id === 't2' ? { ...t, amount: 200 } : t));
  summary = calculatePeriodBudgetSummary(budgets, transactions, 11, 2026);
  assert.equal(summary.totalSpent, 600);
  assert.equal(summary.exceededCategoriesCount, 0);

  // Exclusão de transação: remove alimentação
  transactions = transactions.filter((t) => t.id !== 't1');
  summary = calculatePeriodBudgetSummary(budgets, transactions, 11, 2026);
  assert.equal(summary.totalSpent, 200);
  assert.equal(summary.totalRemaining, 700);
});

test('shiftPeriod e formatMonthYearLabel navegam corretamente entre meses e anos', () => {
  assert.deepEqual(shiftPeriod(1, 2026, -1), { month: 12, year: 2025 });
  assert.deepEqual(shiftPeriod(12, 2026, 1), { month: 1, year: 2027 });
  assert.equal(formatMonthYearLabel(11, 2026), 'Novembro de 2026');
});
