import React from 'react';

export const DiagnosisCard = ({ diagnosis }) => {
  if (!diagnosis) return null;

  const situacao = (diagnosis.situacao || 'ESTAVEL').toUpperCase();
  const resumo = diagnosis.resumo || 'Análise financeira concluída.';

  const statusMap = {
    EXCELENTE: { label: 'Excelente', icon: '🌟' },
    OTIMO: { label: 'Ótimo', icon: '🚀' },
    ESTAVEL: { label: 'Estável', icon: '✅' },
    BOM: { label: 'Bom', icon: '👍' },
    ATENCAO: { label: 'Atenção Necessária', icon: '⚠️' },
    CRITICO: { label: 'Crítico', icon: '🚨' }
  };

  const currentStatus = statusMap[situacao] || { label: situacao, icon: '📊' };

  return (
    <div className="glass diagnosis-banner">
      <div className="diagnosis-header">
        <div className="diagnosis-title">
          <span>{currentStatus.icon}</span>
          <span>Diagnóstico Geral da Situação</span>
        </div>
        <span className={`status-badge ${situacao}`}>
          {currentStatus.label}
        </span>
      </div>

      <p className="diagnosis-summary">{resumo}</p>
    </div>
  );
};
