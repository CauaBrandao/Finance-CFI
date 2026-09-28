import React from 'react';

export const AiLoadingState = () => {
  return (
    <div className="glass ai-loading-box">
      <div className="ai-spinner" aria-hidden="true"></div>
      <h3>Analisando suas finanças...</h3>
      <p>
        O backend está consolidando métricas determinísticas e o Google Gemini está interpretando padrões,
        priorizando problemas e elaborando seu plano de ação prático.
      </p>
    </div>
  );
};
