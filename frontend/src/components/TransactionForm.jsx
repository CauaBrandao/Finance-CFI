import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../utils/constants';

const MAX_DESCRIPTION_LENGTH = 120;
const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 999999999.99;

export function validateTransactionInput({ description, amount, type, category, date }) {
  const errors = {};
  const trimmedDesc = (description || '').trim();

  if (!trimmedDesc) {
    errors.description = 'A descrição é obrigatória.';
  } else if (trimmedDesc.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `A descrição deve ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres.`;
  }

  const numAmount = Number(amount);
  if (amount === '' || amount === null || amount === undefined || Number.isNaN(numAmount)) {
    errors.amount = 'Informe um valor numérico válido.';
  } else if (numAmount < MIN_AMOUNT) {
    errors.amount = 'O valor deve ser de no mínimo R$ 0,01.';
  } else if (numAmount > MAX_AMOUNT) {
    errors.amount = 'O valor não pode exceder R$ 999.999.999,99.';
  }

  if (type !== 'income' && type !== 'expense') {
    errors.type = 'Selecione um tipo válido (Entrada ou Saída).';
  }

  const trimmedCat = (category || '').trim();
  if (!trimmedCat || trimmedCat.length > 40) {
    errors.category = 'Selecione uma categoria válida.';
  }

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.date = 'Informe uma data válida no formato AAAA-MM-DD.';
  }

  return errors;
}

export const TransactionForm = ({
  onSubmit,
  editingTransaction,
  onCancelEdit,
  isSubmitting = false,
  submitError = ''
}) => {
  const todayIso = () => new Date().toISOString().split('T')[0];

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(todayIso);
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('food');
    setDate(todayIso());
    setErrors({});
  };

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description || '');
      setAmount(editingTransaction.amount !== undefined && editingTransaction.amount !== null ? String(editingTransaction.amount) : '');
      setType(editingTransaction.type || 'expense');
      setCategory(editingTransaction.category || 'food');
      setDate(editingTransaction.date ? editingTransaction.date.split('T')[0] : todayIso());
      setErrors({});
    } else {
      resetForm();
    }
  }, [editingTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateTransactionInput({ description, amount, type, category, date });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const payload = {
      description: description.trim(),
      amount: Number(parseFloat(amount).toFixed(2)),
      type,
      category,
      date: date || todayIso()
    };

    const succeeded = await onSubmit(payload);
    if (succeeded && !editingTransaction) {
      resetForm();
    }
  };

  const isEditing = Boolean(editingTransaction);

  return (
    <section className="form-section glass">
      <h2 id="formTitle">
        {isEditing ? (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar Transação
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nova Transação
          </>
        )}
      </h2>

      {submitError && (
        <div className="form-error-banner" role="alert">
          <span>⚠️ {submitError}</span>
        </div>
      )}

      <form id="transactionForm" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="description">
            Descrição <span className="char-counter">({description.trim().length}/{MAX_DESCRIPTION_LENGTH})</span>
          </label>
          <input
            type="text"
            id="description"
            maxLength={MAX_DESCRIPTION_LENGTH}
            value={description}
            disabled={isSubmitting}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            placeholder="Ex: Salário, Almoço..."
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="amount">Valor (R$)</label>
          <input
            type="number"
            id="amount"
            step="0.01"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            value={amount}
            disabled={isSubmitting}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            placeholder="0,00"
            aria-invalid={Boolean(errors.amount)}
          />
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              value={type}
              disabled={isSubmitting}
              onChange={(e) => {
                setType(e.target.value);
                if (errors.type) setErrors((prev) => ({ ...prev, type: undefined }));
              }}
            >
              <option value="income">📈 Entrada</option>
              <option value="expense">📉 Saída</option>
            </select>
            {errors.type && <span className="field-error">{errors.type}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoria</label>
            <select
              id="category"
              value={category}
              disabled={isSubmitting}
              onChange={(e) => {
                setCategory(e.target.value);
                if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
              }}
            >
              {Object.entries(CATEGORIES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.emoji} {item.label}
                </option>
              ))}
            </select>
            {errors.category && <span className="field-error">{errors.category}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="transactionDate">Data</label>
          <input
            type="date"
            id="transactionDate"
            value={date}
            disabled={isSubmitting}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
            }}
            aria-invalid={Boolean(errors.date)}
          />
          {errors.date && <span className="field-error">{errors.date}</span>}
        </div>

        <div className="form-buttons">
          <button type="submit" id="submitBtn" className="btn-primary" disabled={isSubmitting}>
            {isEditing ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {isSubmitting ? 'Adicionando...' : 'Adicionar'}
              </>
            )}
          </button>
          {isEditing && (
            <button type="button" id="cancelBtn" className="btn-secondary" onClick={onCancelEdit} disabled={isSubmitting}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
};
