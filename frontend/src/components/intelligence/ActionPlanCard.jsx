import React from 'react';

export const ActionPlanCard = ({ actions = [] }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <div>
      <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        Plano de Ação Recomendado ({actions.length} ações práticas)
      </h3>

      <div className="action-plan-list">
        {actions.map((item, index) => {
          const prioridade = (item.prioridade || 'MEDIA').toUpperCase();

          return (
            <div key={index} className="action-card">
              <div className="action-step-num">{index + 1}</div>
              <div className="action-content">
                <div className="action-content-header">
                  <span className="action-name">{item.acao}</span>
                  <span className={`priority-badge ${prioridade}`}>{prioridade}</span>
                </div>
                <p className="action-reason">
                  <strong>Por que realizar: </strong>
                  {item.motivo}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
