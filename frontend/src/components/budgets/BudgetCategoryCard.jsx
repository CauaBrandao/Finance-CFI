import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export const BudgetCategoryCard = ({ budget, onEdit, onDelete }) => {
  const {
    categoryInfo,
    limit,
    spent,
    remaining,
    exceededAmount,
    utilizationPercent,
    progressBarPercent,
    status,
    statusLabel,
    alertMessage
  } = budget;

  return (
    <article className={`budget-card glass budget-status-${status}`} aria-label={`Orçamento de ${categoryInfo.label}`}>
      <div className="budget-card-header">
        <div className="budget-category-title">
          <span className="budget-category-emoji" aria-hidden="true">{categoryInfo.emoji}</span>
          <div>
            <h3>{categoryInfo.label}</h3>
            <span className={`budget-status-badge ${status}`}>{statusLabel}</span>
          </div>
        </div>

        <div className="transaction-actions">
          <button
            type="button"
            className="edit-btn"
            onClick={() => onEdit(budget)}
            title={`Editar orçamento de ${categoryInfo.label}`}
            aria-label={`Editar orçamento de ${categoryInfo.label}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            className="delete-btn"
            onClick={() => onDelete(budget)}
            title={`Excluir orçamento de ${categoryInfo.label}`}
            aria-label={`Excluir orçamento de ${categoryInfo.label}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="budget-progress-wrapper">
        <div className="budget-progress-meta">
          <span>Utilização</span>
          <strong className={`budget-percent-text ${status}`}>{utilizationPercent}%</strong>
        </div>
        <div
          className="goal-bar-container"
          role="progressbar"
          aria-valuenow={Math.round(utilizationPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso do orçamento de ${categoryInfo.label}`}
        >
          <div
            className={`goal-bar budget-bar-${status}`}
            style={{ width: `${progressBarPercent}%` }}
          />
        </div>
      </div>

      <div className="budget-comparison-grid">
        <div className="budget-metric">
          <span className="budget-metric-label">Limite</span>
          <span className="budget-metric-value">{formatCurrency(limit)}</span>
        </div>
        <div className="budget-metric">
          <span className="budget-metric-label">Gasto</span>
          <span className="budget-metric-value">{formatCurrency(spent)}</span>
        </div>
        {exceededAmount > 0 ? (
          <div className="budget-metric">
            <span className="budget-metric-label">Excedido</span>
            <span className="budget-metric-value exceeded">{formatCurrency(exceededAmount)}</span>
          </div>
        ) : (
          <div className="budget-metric">
            <span className="budget-metric-label">Restante</span>
            <span className="budget-metric-value remaining">{formatCurrency(remaining)}</span>
          </div>
        )}
      </div>

      {alertMessage && (
        <div className={`budget-alert ${status}`} role="status">
          <span aria-hidden="true">{status === 'warning' ? '⚠️' : '🚨'}</span>
          <span>{alertMessage}</span>
        </div>
      )}
    </article>
  );
};
