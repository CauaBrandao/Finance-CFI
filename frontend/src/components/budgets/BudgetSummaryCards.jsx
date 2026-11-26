import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export const BudgetSummaryCards = ({ summary }) => {
  const {
    totalBudgeted = 0,
    totalSpent = 0,
    totalRemaining = 0,
    totalExceeded = 0,
    overallUtilizationPercent = 0,
    budgetedCategoriesCount = 0,
    exceededCategoriesCount = 0,
    reachedOrExceededCount = 0
  } = summary || {};

  return (
    <section className="metrics-row" aria-label="Resumo geral dos orçamentos">
      <div className="metric-chip">
        <span className="metric-chip-label">Total Orçado</span>
        <span className="metric-chip-value">{formatCurrency(totalBudgeted)}</span>
      </div>

      <div className="metric-chip">
        <span className="metric-chip-label">Total Gasto</span>
        <span
          className="metric-chip-value"
          style={{
            color:
              overallUtilizationPercent >= 100
                ? 'var(--expense-color)'
                : overallUtilizationPercent > 70
                  ? '#fdcb6e'
                  : 'var(--accent-2)'
          }}
        >
          {formatCurrency(totalSpent)} ({overallUtilizationPercent}%)
        </span>
      </div>

      <div className="metric-chip">
        <span className="metric-chip-label">
          {totalExceeded > 0 ? 'Total Excedido' : 'Total Restante'}
        </span>
        <span
          className="metric-chip-value"
          style={{ color: totalExceeded > 0 ? 'var(--expense-color)' : 'var(--income-color)' }}
        >
          {totalExceeded > 0 ? formatCurrency(totalExceeded) : formatCurrency(totalRemaining)}
        </span>
      </div>

      <div className="metric-chip">
        <span className="metric-chip-label">Categorias Orçadas</span>
        <span className="metric-chip-value">{budgetedCategoriesCount}</span>
      </div>

      <div className="metric-chip">
        <span className="metric-chip-label">Ultrapassadas / Atingidas</span>
        <span
          className="metric-chip-value"
          style={{
            color:
              exceededCategoriesCount > 0
                ? 'var(--expense-color)'
                : reachedOrExceededCount > 0
                  ? '#fdcb6e'
                  : 'var(--text-primary)'
          }}
        >
          {exceededCategoriesCount} excedida{exceededCategoriesCount !== 1 ? 's' : ''}
          {reachedOrExceededCount > exceededCategoriesCount
            ? ` (${reachedOrExceededCount} no limite)`
            : ''}
        </span>
      </div>
    </section>
  );
};
