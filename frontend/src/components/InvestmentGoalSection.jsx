import React, { useState, useEffect } from 'react';
import { formatCurrency, randomItem } from '../utils/formatters';
import { MOTIVATIONAL } from '../utils/constants';

export const InvestmentGoalSection = ({ investmentGoal, totalInvested, investmentCount, onSetGoal }) => {
  const [goalInput, setGoalInput] = useState(investmentGoal ? String(investmentGoal) : '');

  useEffect(() => {
    if (investmentGoal > 0) {
      setGoalInput(String(investmentGoal));
    }
  }, [investmentGoal]);

  const handleSet = () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val > 0) {
      onSetGoal(val);
    }
  };

  const hasGoal = investmentGoal > 0;
  const percent = hasGoal ? Math.min((totalInvested / investmentGoal) * 100, 100) : 0;
  const remaining = hasGoal ? Math.max(investmentGoal - totalInvested, 0) : 0;

  let barGradient = 'linear-gradient(90deg, #00b894, #55efc4)';
  let messageText = '';
  let messageBg = 'transparent';
  let messageColor = 'inherit';

  if (hasGoal) {
    if (percent >= 100) {
      barGradient = 'linear-gradient(90deg, #55efc4, #00b894)';
      messageText = randomItem(MOTIVATIONAL.investmentGoal);
      messageBg = 'rgba(85, 239, 196, 0.1)';
      messageColor = '#55efc4';
    } else if (percent >= 50) {
      barGradient = 'linear-gradient(90deg, #55efc4, #00cec9)';
      messageText = '🚀 Mais da metade! Continue assim!';
      messageBg = 'rgba(85, 239, 196, 0.05)';
      messageColor = '#00cec9';
    } else {
      barGradient = 'linear-gradient(90deg, #00b894, #55efc4)';
      messageText = randomItem(MOTIVATIONAL.investment);
      messageBg = 'rgba(0, 184, 148, 0.1)';
      messageColor = '#00b894';
    }
  }

  return (
    <div style={{ marginTop: '25px' }}>
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        Investimento
      </h2>

      <div className="goal-input-group">
        <input
          type="number"
          id="investmentGoal"
          placeholder="Meta mensal investimento (R$)"
          min="0"
          step="0.01"
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
        />
        <button id="setInvestmentBtn" className="btn-small btn-investment" onClick={handleSet}>
          Definir
        </button>
      </div>

      <div className="investment-display" id="investmentDisplay">
        <div className="goal-bar-container">
          <div
            className="goal-bar investment-bar"
            id="investmentBar"
            style={{ width: `${percent}%`, background: barGradient }}
          ></div>
        </div>
        <div className="goal-info">
          <span id="investedAmount">{formatCurrency(totalInvested)} investido</span>
          <span id="investmentRemaining">
            {hasGoal ? `${formatCurrency(remaining)} restante` : 'Defina sua meta de investimento'}
          </span>
        </div>

        <div className="investment-stats">
          <div className="invest-stat">
            <span className="invest-stat-label">% da Meta</span>
            <span className="invest-stat-value" id="investmentPercent">{percent.toFixed(1)}%</span>
          </div>
          <div className="invest-stat">
            <span className="invest-stat-label">Total Investido</span>
            <span className="invest-stat-value" id="investmentTotal">{formatCurrency(totalInvested)}</span>
          </div>
          <div className="invest-stat">
            <span className="invest-stat-label">Transações</span>
            <span className="invest-stat-value" id="investmentCount">{investmentCount}</span>
          </div>
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
