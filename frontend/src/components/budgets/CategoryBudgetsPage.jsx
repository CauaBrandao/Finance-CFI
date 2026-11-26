import React, { useState, useMemo } from 'react';
import { BudgetPeriodSelector } from './BudgetPeriodSelector';
import { BudgetSummaryCards } from './BudgetSummaryCards';
import { BudgetForm } from './BudgetForm';
import { BudgetCategoryCard } from './BudgetCategoryCard';
import { DeleteModal } from '../DeleteModal';
import {
  calculatePeriodBudgetSummary,
  formatMonthYearLabel
} from '../../utils/budgetCalculations';

export const CategoryBudgetsPage = ({
  budgets = [],
  transactions = [],
  transactionsLoading = false,
  transactionsError = null,
  onRetryTransactions,
  onCreateBudget,
  onUpdateBudget,
  onDeleteBudget
}) => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const summary = useMemo(
    () => calculatePeriodBudgetSummary(budgets, transactions, selectedMonth, selectedYear),
    [budgets, transactions, selectedMonth, selectedYear]
  );

  const handleChangePeriod = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setEditingBudget(null);
  };

  const handleSaveBudget = (payload) => {
    if (payload.id) {
      const ok = onUpdateBudget(payload.id, payload);
      if (ok) {
        setEditingBudget(null);
      }
      return ok;
    }
    const ok = onCreateBudget(payload);
    if (ok) {
      // Se o usuário cadastrou para outro mês no formulário, sincroniza a visualização para esse mês
      if (payload.month !== selectedMonth || payload.year !== selectedYear) {
        setSelectedMonth(payload.month);
        setSelectedYear(payload.year);
      }
    }
    return ok;
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    onDeleteBudget(deleteTarget.id);
    if (editingBudget?.id === deleteTarget.id) {
      setEditingBudget(null);
    }
    setDeleteTarget(null);
  };

  const periodLabel = formatMonthYearLabel(selectedMonth, selectedYear);

  return (
    <div className="ai-module-container">
      {/* Cabeçalho da Seção */}
      <div className="ai-header-card glass">
        <div className="ai-header-info">
          <h2>🎯 Orçamento por Categoria</h2>
          <p>
            Defina limites mensais por categoria de despesa para <strong>{periodLabel}</strong> e acompanhe o consumo em tempo real a partir das suas transações.
          </p>
        </div>

        <BudgetPeriodSelector
          month={selectedMonth}
          year={selectedYear}
          onChangePeriod={handleChangePeriod}
        />
      </div>

      {/* Erro ao carregar transações da API */}
      {transactionsError && (
        <div className="ai-error-box" role="alert">
          <div className="error-header">
            <span>⚠️</span>
            <span>Não foi possível atualizar os gastos das transações</span>
          </div>
          <p>{transactionsError}</p>
          {onRetryTransactions && (
            <div>
              <button type="button" className="btn-secondary" onClick={onRetryTransactions}>
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Alertas Contextuais do Período */}
      {summary.alerts.length > 0 && (
        <div className="budget-alerts-banner glass" role="region" aria-label="Alertas de orçamento">
          <div className="budget-alerts-banner-header">
            <span>🔔 Alertas de Consumo ({summary.alerts.length})</span>
          </div>
          <ul className="budget-alerts-list">
            {summary.alerts.map((alert) => (
              <li key={alert.id} className={`budget-alert-item ${alert.status}`}>
                <span>{alert.emoji}</span>
                <span>{alert.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resumo Geral do Período */}
      <BudgetSummaryCards summary={summary} />

      {/* Formulário + Lista de Orçamentos */}
      <div className="budget-layout-grid">
        <BudgetForm
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          existingBudgets={budgets}
          editingBudget={editingBudget}
          onSave={handleSaveBudget}
          onCancelEdit={() => setEditingBudget(null)}
          onStartEditExisting={(existing) => setEditingBudget(existing)}
        />

        <section className="budget-list-panel" aria-label="Orçamentos cadastrados">
          {transactionsLoading ? (
            <div className="glass tx-loading-state">
              <div className="ai-spinner" />
              <p>Carregando transações para calcular os gastos...</p>
            </div>
          ) : summary.items.length === 0 ? (
            <div className="glass budget-empty-state">
              <div className="budget-empty-icon" aria-hidden="true">📊</div>
              <h3>Nenhum orçamento para {periodLabel}</h3>
              <p>
                Use o formulário ao lado para definir limites por categoria (ex: Alimentação, Transporte, Lazer) e acompanhar seus gastos automaticamente.
              </p>
            </div>
          ) : (
            <div className="budget-cards-grid">
              {summary.items.map((item) => (
                <BudgetCategoryCard
                  key={item.id}
                  budget={item}
                  onEdit={(b) => setEditingBudget(b)}
                  onDelete={(b) => setDeleteTarget(b)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <DeleteModal
        isOpen={Boolean(deleteTarget)}
        transactionDescription={
          deleteTarget
            ? `o orçamento de ${deleteTarget.categoryInfo.label} (${formatMonthYearLabel(deleteTarget.month, deleteTarget.year)})`
            : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

