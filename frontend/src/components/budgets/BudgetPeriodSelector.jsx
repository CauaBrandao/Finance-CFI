import React from 'react';
import { MONTH_NAMES_PT } from '../../utils/constants';
import { shiftPeriod } from '../../utils/budgetCalculations';

export const BudgetPeriodSelector = ({ month, year, onChangePeriod }) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const years = [];
  for (let y = currentYear - 2; y <= currentYear + 2; y++) {
    years.push(y);
  }
  if (!years.includes(Number(year))) {
    years.push(Number(year));
    years.sort((a, b) => a - b);
  }

  const isCurrentMonth = Number(month) === currentMonth && Number(year) === currentYear;

  const handleShift = (delta) => {
    const next = shiftPeriod(Number(month), Number(year), delta);
    onChangePeriod(next.month, next.year);
  };

  return (
    <div className="budget-period-selector" role="group" aria-label="Selecionar período do orçamento">
      <button
        type="button"
        className="icon-btn budget-period-nav-btn"
        onClick={() => handleShift(-1)}
        title="Mês anterior"
        aria-label="Mês anterior"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <select
        className="budget-period-select"
        aria-label="Mês de referência"
        value={month}
        onChange={(e) => onChangePeriod(Number(e.target.value), Number(year))}
      >
        {MONTH_NAMES_PT.map((name, idx) => (
          <option key={name} value={idx + 1}>
            {name}
          </option>
        ))}
      </select>

      <select
        className="budget-period-select budget-year-select"
        aria-label="Ano de referência"
        value={year}
        onChange={(e) => onChangePeriod(Number(month), Number(e.target.value))}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="icon-btn budget-period-nav-btn"
        onClick={() => handleShift(1)}
        title="Próximo mês"
        aria-label="Próximo mês"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {!isCurrentMonth && (
        <button
          type="button"
          className="btn-secondary budget-today-btn"
          onClick={() => onChangePeriod(currentMonth, currentYear)}
        >
          Mês Atual
        </button>
      )}
    </div>
  );
};
