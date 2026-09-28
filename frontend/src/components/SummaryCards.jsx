import React from 'react';
import { formatCurrency, pluralize } from '../utils/formatters';

export const SummaryCards = ({ totals }) => {
  const { income = 0, expense = 0, balance = 0, incomeCount = 0, expenseCount = 0, balancePercent = 0 } = totals || {};

  return (
    <section className="summary" aria-label="Resumo Financeiro">
      {/* Card de Total de Entradas */}
      <div className="summary-card income">
        <div className="card-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <h3>Entradas</h3>
        <p id="totalIncome">{formatCurrency(income)}</p>
        <span className="card-count" id="incomeCount">{pluralize(incomeCount)}</span>
      </div>

      {/* Card de Total de Saídas */}
      <div className="summary-card expense">
        <div className="card-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
          </svg>
        </div>
        <h3>Saídas</h3>
        <p id="totalExpense">{formatCurrency(expense)}</p>
        <span className="card-count" id="expenseCount">{pluralize(expenseCount)}</span>
      </div>

      {/* Card de Saldo Atual (Entradas - Saídas) */}
      <div className="summary-card balance">
        <div className="card-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <h3>Saldo</h3>
        <p id="totalBalance">{formatCurrency(balance)}</p>
        <span className="card-count" id="balancePercent">{balancePercent}% do total</span>
      </div>
    </section>
  );
};
