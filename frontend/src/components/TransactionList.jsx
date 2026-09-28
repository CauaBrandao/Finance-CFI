import React, { useState, useMemo } from 'react';
import { CATEGORIES } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';

export const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((t) => {
        const catLabel = CATEGORIES[t.category]?.label?.toLowerCase() || '';
        return t.description.toLowerCase().includes(term) || catLabel.includes(term);
      });
    }

    if (filterType !== 'all') {
      list = list.filter((t) => t.type === filterType);
    }

    if (filterCategory !== 'all') {
      list = list.filter((t) => t.category === filterCategory);
    }

    list.sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      const amountA = Number(a.amount) || 0;
      const amountB = Number(b.amount) || 0;

      switch (sortBy) {
        case 'date-desc':
          return dateB - dateA;
        case 'date-asc':
          return dateA - dateB;
        case 'amount-desc':
          return amountB - amountA;
        case 'amount-asc':
          return amountA - amountB;
        default:
          return 0;
      }
    });

    return list;
  }, [transactions, searchTerm, filterType, filterCategory, sortBy]);

  return (
    <section className="transactions-section glass" aria-label="Histórico de Movimentações">
      <div className="transactions-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Transações
        </h2>

        <div className="transactions-controls">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              id="searchInput"
              placeholder="Buscar por descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar transações"
            />
          </div>

          <select
            id="filterType"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filtrar por tipo"
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </select>

          <select
            id="filterCategory"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filtrar por categoria"
          >
            <option value="all">Todas as categorias</option>
            {Object.entries(CATEGORIES).map(([key, item]) => (
              <option key={key} value={key}>
                {item.emoji} {item.label}
              </option>
            ))}
          </select>

          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Ordenar transações"
          >
            <option value="date-desc">Mais recente</option>
            <option value="date-asc">Mais antigo</option>
            <option value="amount-desc">Maior valor</option>
            <option value="amount-asc">Menor valor</option>
          </select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <p id="emptyMessage">Nenhuma transação registrada ou correspondente aos filtros.</p>
      ) : (
        <ul id="transactionList" aria-live="polite">
          {filteredTransactions.map((t) => {
            const cat = CATEGORIES[t.category] || CATEGORIES.other;
            const isIncome = t.type === 'income';

            return (
              <li key={t.id} data-id={t.id}>
                <div className="transaction-category">{cat.emoji}</div>
                <div className="transaction-info">
                  <span className="description">{t.description}</span>
                  <div className="meta">
                    <span className={`type-badge ${t.type}`}>
                      {isIncome ? 'Entrada' : 'Saída'}
                    </span>
                    <span>{cat.label}</span>
                    <span>{formatDate(t.date)}</span>
                  </div>
                </div>

                <span className={`transaction-amount ${t.type}`}>
                  {isIncome ? '+ ' : '- '}
                  {formatCurrency(t.amount)}
                </span>

                <div className="transaction-actions">
                  <button
                    className="edit-btn"
                    onClick={() => onEdit(t)}
                    title="Editar transação"
                    aria-label="Editar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => onDelete(t.id)}
                    title="Remover transação"
                    aria-label="Remover"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
