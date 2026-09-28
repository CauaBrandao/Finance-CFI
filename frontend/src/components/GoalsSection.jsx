import React, { useState, useEffect } from 'react';
import { formatCurrency, randomItem } from '../utils/formatters';
import { MOTIVATIONAL } from '../utils/constants';

export const GoalsSection = ({ monthlyGoal, totalSpent, onSetGoal }) => {
  const [goalInput, setGoalInput] = useState(monthlyGoal ? String(monthlyGoal) : '');

  useEffect(() => {
    if (monthlyGoal > 0) {
      setGoalInput(String(monthlyGoal));
    }
  }, [monthlyGoal]);

  const handleSet = () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val > 0) {
      onSetGoal(val);
    }
  };

  const hasGoal = monthlyGoal > 0;
  const percent = hasGoal ? Math.min((totalSpent / monthlyGoal) * 100, 100) : 0;
  const remaining = hasGoal ? Math.max(monthlyGoal - totalSpent, 0) : 0;

  let barGradient = 'linear-gradient(90deg, #00cec9, #6c5ce7)';
  let messageText = '';
  let messageBg = 'transparent';
  let messageColor = 'inherit';

  if (hasGoal) {
    if (percent >= 100) {
      barGradient = 'linear-gradient(90deg, #ff6b6b, #fd79a8)';
      messageText = randomItem(MOTIVATIONAL.overBudget);
      messageBg = 'rgba(255, 107, 107, 0.1)';
      messageColor = '#ff6b6b';
    } else if (percent >= 80) {
      barGradient = 'linear-gradient(90deg, #fdcb6e, #e17055)';
      messageText = '⚠️ Quase no limite! Cuidado.';
      messageBg = 'rgba(253, 203, 110, 0.1)';
      messageColor = '#fdcb6e';
    } else {
      barGradient = 'linear-gradient(90deg, #00cec9, #6c5ce7)';
      messageText = randomItem(MOTIVATIONAL.saving);
      messageBg = 'rgba(0, 206, 201, 0.1)';
      messageColor = '#00cec9';
    }
  }

  return (
    <div>
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
        Média de Gastos
      </h2>

      <div className="goal-input-group">
        <input
          type="number"
          id="monthlyGoal"
          placeholder="Defina seu limite (R$)"
          min="0"
          step="0.01"
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
        />
        <button id="setGoalBtn" className="btn-small" onClick={handleSet}>
          Definir
        </button>
      </div>

      <div className="goal-display" id="goalDisplay">
        <div className="goal-bar-container">
          <div
            className="goal-bar"
            id="goalBar"
            style={{ width: `${percent}%`, background: barGradient }}
          ></div>
        </div>
        <div className="goal-info">
          <span id="goalSpent">{formatCurrency(totalSpent)} gasto</span>
          <span id="goalRemaining">
            {hasGoal ? `${formatCurrency(remaining)} restante` : 'Defina seu limite'}
          </span>
        </div>
        {hasGoal && messageText && (
          <p className="goal-message" style={{ background: messageBg, color: messageColor }}>
            {messageText}
          </p>
        )}
      </div>
    </div>
  );
};
