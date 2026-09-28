import React from 'react';

export const InvestmentReadinessCard = ({ readiness }) => {
  if (!readiness) return null;

  const status = (readiness.status || 'PRECISA_DE_AJUSTES').toUpperCase();
  const justificativa = readiness.justificativa || 'Avaliação da estrutura financeira organizacional.';

  const statusLabels = {
    PREPARADO: {
      label: 'Preparado para Investir',
      icon: '🚀',
      desc: 'Sua estrutura financeira apresenta fluxo de caixa positivo e margem organizacional favorável.'
    },
    PRECISA_DE_AJUSTES: {
      label: 'Precisa de Pequenos Ajustes',
      icon: '⚙️',
      desc: 'Você tem potencial de investimento, mas alguns pontos orçamentários precisam ser alinhados antes de aumentar alocações.'
    },
    PRIORIDADE_ORGANIZACAO: {
      label: 'Prioridade: Organização Orçamentária',
      icon: '🛡️',
      desc: 'Foque primeiro no equilíbrio entre receitas e despesas e na formação de uma reserva antes de buscar aplicações.'
    }
  };

  const current = statusLabels[status] || {
    label: status,
    icon: '📊',
    desc: 'Análise de maturidade orçamentária para investimentos.'
  };

  return (
    <div className="glass readiness-card">
      <div className="readiness-header">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            Preparação Financeira para Investir
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            {current.desc}
          </p>
        </div>

        <span className={`readiness-status ${status}`}>
          <span>{current.icon}</span>
          <span>{current.label}</span>
        </span>
      </div>

      <div className="readiness-disclaimer">
        <span>ℹ️</span>
        <span>
          <strong>Aviso Educacional:</strong> Esta funcionalidade tem caráter estritamente educativo e de
          organização orçamentária pessoal. Não constitui consultoria, recomendação de compra ou aconselhamento
          financeiro profissional.
        </span>
      </div>

      <div className="readiness-justification">
        <strong>Diagnóstico de Maturidade:</strong>
        <p style={{ marginTop: '6px', lineHeight: '1.6' }}>{justificativa}</p>
      </div>
    </div>
  );
};
