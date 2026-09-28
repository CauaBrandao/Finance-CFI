import React from 'react';
import { formatCurrency } from '../utils/formatters';

export const StatsSection = ({ stats }) => {
  const {
    biggestExpense = 0,
    biggestExpenseDescription = '',
    avgDailyExpense = 0,
    totalTransactions = 0,
    daysTracked = 0
  } = stats || {};

  const biggestDisplay = biggestExpense > 0
    ? `${biggestExpenseDescription ? `${biggestExpenseDescription} ` : ''}(${formatCurrency(biggestExpense)})`
    : '-';

  return (
    <div style={{ marginTop: '25px' }}>
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        Estatísticas
      </h2>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Maior gasto</span>
          <span className="stat-value" id="biggestExpense">{biggestDisplay}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Gasto médio/dia</span>
          <span className="stat-value" id="avgDaily">
            {avgDailyExpense > 0 ? formatCurrency(avgDailyExpense) : '-'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total transações</span>
          <span className="stat-value" id="totalTransactions">{totalTransactions}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Dias registrados</span>
          <span className="stat-value" id="daysTracked">{daysTracked}</span>
        </div>
      </div>
    </div>
  );
};
