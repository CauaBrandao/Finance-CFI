import React from 'react';

export const ProblemCard = ({ problems = [] }) => {
  if (!problems || problems.length === 0) {
    return (
      <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
        <h3 style={{ marginBottom: '8px' }}>🔍 Problemas Identificados</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Nenhum ponto crítico ou desvio significativo foi detectado nos dados fornecidos. Parabéns pela organização!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Problemas e Pontos de Atenção Identificados ({problems.length})
      </h3>

      <div className="problems-grid">
        {problems.map((p, index) => {
          const prioridade = (p.prioridade || 'MEDIA').toUpperCase();
          const evidencias = Array.isArray(p.evidencias) ? p.evidencias : [];

          return (
            <div key={index} className="problem-card">
              <div className="problem-card-header">
                <span className="problem-title">{p.titulo}</span>
                <span className={`priority-badge ${prioridade}`}>{prioridade}</span>
              </div>

              <p className="problem-desc">{p.descricao}</p>

              {evidencias.length > 0 && (
                <div className="evidence-box">
                  <div className="evidence-label">Evidências nos Dados:</div>
                  <ul className="evidence-list">
                    {evidencias.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
