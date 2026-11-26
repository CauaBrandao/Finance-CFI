import React, { useState, useEffect } from 'react';
import { CATEGORIES, BUDGET_CATEGORY_KEYS, MONTH_NAMES_PT } from '../../utils/constants';
import { validateBudgetInput, formatMonthYearLabel } from '../../utils/budgetCalculations';

export const BudgetForm = ({
  selectedMonth,
  selectedYear,
  existingBudgets = [],
  editingBudget = null,
  onSave,
  onCancelEdit,
  onStartEditExisting
}) => {
  const [category, setCategory] = useState(BUDGET_CATEGORY_KEYS[0] || 'food');
  const [limitAmount, setLimitAmount] = useState('');
  const [month, setMonth] = useState(selectedMonth);
  const [year, setYear] = useState(selectedYear);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.category);
      setLimitAmount(String(editingBudget.limitAmount));
      setMonth(Number(editingBudget.month));
      setYear(Number(editingBudget.year));
      setErrors({});
    } else {
      setMonth(selectedMonth);
      setYear(selectedYear);
      // Sugerir primeira categoria ainda sem orçamento no período
      const usedInPeriod = new Set(
        existingBudgets
          .filter((b) => Number(b.month) === Number(selectedMonth) && Number(b.year) === Number(selectedYear))
          .map((b) => b.category)
      );
      const firstAvailable = BUDGET_CATEGORY_KEYS.find((key) => !usedInPeriod.has(key));
      setCategory(firstAvailable || BUDGET_CATEGORY_KEYS[0] || 'food');
      setLimitAmount('');
      setErrors({});
    }
  }, [editingBudget, selectedMonth, selectedYear, existingBudgets]);

  const existingMatchForSelected = !editingBudget
    ? existingBudgets.find(
        (b) =>
          b.category === category &&
          Number(b.month) === Number(month) &&
          Number(b.year) === Number(year)
      )
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateBudgetInput(
      { category, limitAmount, month, year },
      existingBudgets,
      editingBudget ? editingBudget.id : null
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const ok = onSave({
      id: editingBudget ? editingBudget.id : null,
      category,
      limitAmount: Number(parseFloat(limitAmount).toFixed(2)),
      month: Number(month),
      year: Number(year)
    });

    if (ok && !editingBudget) {
      setLimitAmount('');
    }
  };

  const isEditing = Boolean(editingBudget);

  return (
    <section className="form-section glass budget-form-card" aria-label={isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}>
      <h2>
        {isEditing ? (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar Orçamento
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Definir Orçamento
          </>
        )}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="budgetCategory">Categoria de Despesa</label>
          <select
            id="budgetCategory"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
            }}
            aria-invalid={Boolean(errors.category)}
          >
            {BUDGET_CATEGORY_KEYS.map((key) => {
              const item = CATEGORIES[key];
              const alreadyExists = !isEditing && existingBudgets.some(
                (b) => b.category === key && Number(b.month) === Number(month) && Number(b.year) === Number(year)
              );
              return (
                <option key={key} value={key}>
                  {item.emoji} {item.label}{alreadyExists ? ' (já definido)' : ''}
                </option>
              );
            })}
          </select>
          {errors.category && <span className="field-error">{errors.category}</span>}
          {existingMatchForSelected && !errors.category && (
            <div className="budget-duplicate-hint">
              <span>
                Já existe um orçamento para {CATEGORIES[category]?.label} em {formatMonthYearLabel(month, year)}.
              </span>
              {onStartEditExisting && (
                <button
                  type="button"
                  className="budget-inline-link"
                  onClick={() => onStartEditExisting(existingMatchForSelected)}
                >
                  Editar existente
                </button>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="budgetLimitAmount">Valor Máximo (R$)</label>
          <input
            type="number"
            id="budgetLimitAmount"
            step="0.01"
            min="0.01"
            max="999999999.99"
            placeholder="Ex: 600,00"
            value={limitAmount}
            onChange={(e) => {
              setLimitAmount(e.target.value);
              if (errors.limitAmount) setErrors((prev) => ({ ...prev, limitAmount: undefined }));
            }}
            aria-invalid={Boolean(errors.limitAmount)}
          />
          {errors.limitAmount && <span className="field-error">{errors.limitAmount}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="budgetMonth">Mês</label>
            <select
              id="budgetMonth"
              value={month}
              onChange={(e) => {
                setMonth(Number(e.target.value));
                if (errors.period || errors.category) {
                  setErrors((prev) => ({ ...prev, period: undefined, category: undefined }));
                }
              }}
            >
              {MONTH_NAMES_PT.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="budgetYear">Ano</label>
            <input
              type="number"
              id="budgetYear"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => {
                setYear(Number(e.target.value));
                if (errors.period || errors.category) {
                  setErrors((prev) => ({ ...prev, period: undefined, category: undefined }));
                }
              }}
            />
          </div>
        </div>
        {errors.period && <span className="field-error" style={{ marginBottom: '12px' }}>{errors.period}</span>}

        <div className="form-buttons">
          <button type="submit" className="btn-primary">
            {isEditing ? 'Salvar Alterações' : 'Criar Orçamento'}
          </button>
          {isEditing && (
            <button type="button" className="btn-secondary" onClick={onCancelEdit}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
};

