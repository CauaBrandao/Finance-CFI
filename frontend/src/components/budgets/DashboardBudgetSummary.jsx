import React, { useMemo } from 'react';
import {
  calculatePeriodBudgetSummary,
  formatMonthYearLabel
} from '../../utils/budgetCalculations';
import { formatCurrency } from '../../utils/formatters';

export const DashboardBudgetSummary = ({ budgets = [], transactions = [], onOpenBudgets }) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const summary = useMemo(
    () => calculatePeriodBudgetSummary(budgets, transactions, currentMonth, currentYear),
    [budgets, transactions, currentMonth, currentYear]
  );

  const periodLabel = formatMonthYearLabel(currentMonth, currentYear);
  const topHighlightItems = summary.items.slice(0, 3);

  return (
    <section className="dashboard-budget-summary glass" aria-label="Resumo de Orçamentos do Mês">
      <div className="dashboard-budget-header">
        <div>
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Orçamentos por Categoria ({periodLabel})
          </h2>
          <p className="dashboard-budget-subtitle">
            {summary.budgetedCategoriesCount > 0
              ? `${summary.budgetedCategoriesCount} categoria${summary.budgetedCategoriesCount !== 1 ? 's' : ''} monitorada${summary.budgetedCategoriesCount !== 1 ? 's' : ''} • ${summary.overallUtilizationPercent}% do total orçado utilizado`
              : 'Defina limites individuais por categoria para acompanhar seus gastos com precisão.'}
          </p>
        </div>

        <button type="button" className="btn-secondary" onClick={onOpenBudgets}>
          Gerenciar Orçamentos
        </button>
      </div>

      {summary.budgetedCategoriesCount > 0 && (
        <>
          <div className="dashboard-budget-overview">
            <div className="dashboard-budget-overview-meta">
              <span>
                Gasto: <strong>{formatCurrency(summary.totalSpent)}</strong> de{' '}
                <strong>{formatCurrency(summary.totalBudgeted)}</strong>
              </span>
              {summary.exceededCategoriesCount > 0 && (
                <span className="budget-status-badge exceeded">
                  {summary.exceededCategoriesCount} ultrapassado{summary.exceededCategoriesCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="goal-bar-container">
              <div
                className={`goal-bar budget-bar-${
                  summary.overallUtilizationPercent > 100
                    ? 'exceeded'
                    : summary.overallUtilizationPercent > 70
                      ? 'warning'
                      : 'normal'
                }`}
                style={{ width: `${Math.min(summary.overallUtilizationPercent, 100)}%` }}
              />
            </div>
          </div>

          <div className="dashboard-budget-chips">
            {topHighlightItems.map((item) => (
              <div key={item.id} className={`dashboard-budget-chip status-${item.status}`}>
                <div className="dashboard-budget-chip-top">
                  <span>
                    {item.categoryInfo.emoji} {item.categoryInfo.label}
                  </span>
                  <strong className={`budget-percent-text ${item.status}`}>
                    {item.utilizationPercent}%
                  </strong>
                </div>
                <div className="goal-bar-container" style={{ height: '6px' }}>
                  <div
                    className={`goal-bar budget-bar-${item.status}`}
                    style={{ width: `${item.progressBarPercent}%` }}
                  />
                </div>
                <div className="dashboard-budget-chip-meta">
                  <span>{formatCurrency(item.spent)} / {formatCurrency(item.limit)}</span>
                  {item.exceededAmount > 0 && (
                    <span className="exceeded-inline">+{formatCurrency(item.exceededAmount)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
