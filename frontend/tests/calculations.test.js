import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotals, calculateStats, buildFinancialContext } from '../src/utils/calculations.js';
import { formatDate } from '../src/utils/formatters.js';

test('calculateTotals calcula entradas, saídas, saldo e taxa de poupança corretamente', () => {
  const txs = [
    { id: '1', description: 'Salário', amount: 4000, type: 'income', category: 'salary', date: '2026-09-01' },
    { id: '2', description: 'Aluguel', amount: 1500, type: 'expense', category: 'bills', date: '2026-09-05' },
    { id: '3', description: 'Mercado', amount: 500, type: 'expense', category: 'food', date: '2026-09-06' }
  ];

  const totals = calculateTotals(txs);
  assert.equal(totals.income, 4000);
  assert.equal(totals.expense, 2000);
  assert.equal(totals.balance, 2000);
  assert.equal(totals.savingsRate, '50.0');
});

test('calculateStats identifica maior despesa e média diária', () => {
  const txs = [
    { id: '1', description: 'Aluguel', amount: 1200, type: 'expense', category: 'bills', date: '2026-09-05' },
    { id: '2', description: 'Café', amount: 20, type: 'expense', category: 'food', date: '2026-09-06' }
  ];

  const stats = calculateStats(txs);
  assert.equal(stats.biggestExpense, 1200);
  assert.equal(stats.biggestExpenseDescription, 'Aluguel');
  assert.equal(stats.daysTracked, 2);
  assert.equal(stats.avgDailyExpense, 610);
});

test('buildFinancialContext limita a 30 transações mais recentes ordenadas por data', () => {
  const txs = Array.from({ length: 35 }, (_, idx) => {
    const day = String((idx % 28) + 1).padStart(2, '0');
    return {
      id: `tx_${idx}`,
      description: `Item ${idx}`,
      amount: 10,
      type: 'expense',
      category: 'food',
      date: `2026-09-${day}`
    };
  });

  const ctx = buildFinancialContext(txs, 1000, 200);
  assert.equal(ctx.ultimasTransacoes.length, 30);
  assert.equal(ctx.ultimasTransacoes[0].date, '2026-09-28');
});

test('formatDate preserva o dia exato de strings ISO YYYY-MM-DD', () => {
  const formatted = formatDate('2026-09-28');
  assert.match(formatted, /28/);
});
