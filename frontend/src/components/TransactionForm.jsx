import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../utils/constants';

export const TransactionForm = ({ onSubmit, editingTransaction, onCancelEdit }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description || '');
      setAmount(editingTransaction.amount ? String(editingTransaction.amount) : '');
      setType(editingTransaction.type || 'expense');
      setCategory(editingTransaction.category || 'food');
      setDate(editingTransaction.date ? editingTransaction.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    } else {
      resetForm();
    }
  }, [editingTransaction]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('food');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onSubmit({
      description: description.trim(),
      amount: numAmount,
      type,
      category,
      date: date ? new Date(date + 'T12:00:00').toISOString() : new Date().toISOString()
    });

    if (!editingTransaction) {
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

      <form id="transactionForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Descrição</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Salário, Almoço..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Valor (R$)</label>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Tipo</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)} required>
              <option value="income">📈 Entrada</option>
              <option value="expense">📉 Saída</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoria</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
              {Object.entries(CATEGORIES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.emoji} {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="transactionDate">Data</label>
          <input
            type="date"
            id="transactionDate"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-buttons">
          <button type="submit" id="submitBtn" className="btn-primary">
            {isEditing ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Salvar
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Adicionar
              </>
            )}
          </button>
          {isEditing && (
            <button type="button" id="cancelBtn" className="btn-secondary" onClick={onCancelEdit}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
};
