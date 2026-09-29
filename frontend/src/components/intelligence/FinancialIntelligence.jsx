import React, { useState } from 'react';
import { analysisService } from '../../services/analysisService';
import { buildFinancialContext, calculateTotals, calculateStats } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { AiLoadingState } from './AiLoadingState';
import { DiagnosisCard } from './DiagnosisCard';
import { ProblemCard } from './ProblemCard';
import { ActionPlanCard } from './ActionPlanCard';
import { InvestmentReadinessCard } from './InvestmentReadinessCard';

export const FinancialIntelligence = ({ transactions, monthlyGoal, investmentGoal, cachedAnalysis, onSaveAnalysis, onLoadDemoData, showToast }) => {
  const [analysis, setAnalysis] = useState(cachedAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totals = calculateTotals(transactions);
  const stats = calculateStats(transactions);

  const handleRequestAnalysis = async () => {
    if (transactions.length === 0) {
      showToast('Adicione pelo menos uma transação antes de solicitar a análise.', 'warning');
      return;
    }

    setLoading(true);
    setError(null);

    const contextPayload = buildFinancialContext(transactions, monthlyGoal, investmentGoal);

    try {
      const result = await analysisService.getFullAnalysis(contextPayload);
      setAnalysis(result);
      if (onSaveAnalysis) {
        onSaveAnalysis(result);
      }
      showToast('Análise de Inteligência Financeira concluída com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao consultar análise de IA:', err);
      let errorMsg = 'Não foi possível completar a análise no momento.';
      let errorDetails = err.message;

      if (err.status === 400) {
        errorMsg = 'Dados financeiros inválidos ou vazios enviados para análise.';
      } else if (err.status === 429) {
        errorMsg = 'Limite temporário de requisições da IA atingido. Aguarde alguns instantes.';
      } else if (err.status === 503) {
        errorMsg = 'O serviço de Inteligência Artificial do Google Gemini está temporariamente indisponível.';
      } else if (err.status === 504) {
        errorMsg = 'Tempo limite de resposta excedido. O processamento demorou mais que o esperado.';
      } else if (!err.status || err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch') || err.message?.includes('fetch')) {
        errorMsg = 'Não foi possível conectar ao servidor backend (Spring Boot na porta 8080). Certifique-se de que o backend está iniciado com mvn spring-boot:run.';
      }

      setError({
        status: err.status || 500,
        message: errorMsg,
        details: errorDetails
      });
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-section" aria-label="Módulo de Inteligência Financeira">
      {/* Cabeçalho do Módulo de IA */}
      <div className="glass ai-header-card">
        <div className="ai-header-info">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
              <path d="M12 6v6l4 2" />
            </svg>
            Inteligência Financeira Pessoal
          </h2>
          <p>
            Diagnóstico analítico contextual com Google Gemini, identificação de padrões, detecção de problemas,
            plano de ação prático e maturidade para investimentos.
          </p>
        </div>

        <button
          className="btn-ai-analyze"
          onClick={handleRequestAnalysis}
          disabled={loading || transactions.length === 0}
          title={transactions.length === 0 ? 'Cadastre transações para analisar' : 'Solicitar Diagnóstico com IA'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          {loading ? 'Analisando...' : 'Solicitar Análise com IA'}
        </button>
      </div>

      {/* Métricas Determinísticas Consolidadas (Base do Backend) */}
      <div className="metrics-row">
        <div className="metric-chip">
          <span className="metric-chip-label">Saldo em Caixa</span>
          <span className="metric-chip-value" style={{ color: totals.balance >= 0 ? '#00b894' : '#ff6b6b' }}>
            {formatCurrency(totals.balance)}
          </span>
        </div>

        <div className="metric-chip">
          <span className="metric-chip-label">Taxa de Poupança</span>
          <span className="metric-chip-value" style={{ color: Number(totals.savingsRate) > 20 ? '#00cec9' : '#fdcb6e' }}>
            {totals.savingsRate}%
          </span>
        </div>

        <div className="metric-chip">
          <span className="metric-chip-label">Gasto Médio Diário</span>
          <span className="metric-chip-value">
            {stats.avgDailyExpense > 0 ? formatCurrency(stats.avgDailyExpense) : '-'}
          </span>
        </div>

        <div className="metric-chip">
          <span className="metric-chip-label">Total Transações</span>
          <span className="metric-chip-value">
            {transactions.length} registros
          </span>
        </div>
      </div>

      {/* Estado de Carregamento */}
      {loading && <AiLoadingState />}

      {/* Tratamento de Erros e Resiliência */}
      {error && !loading && (
        <div className="ai-error-box">
          <div className="error-header">
            <span>⚠️</span>
            <span>Falha na Análise (HTTP {error.status})</span>
          </div>
          <p>{error.message}</p>
          {error.details && <span className="error-details">Detalhes técnicos: {error.details}</span>}
          <div style={{ marginTop: '8px' }}>
            <button className="btn-secondary" onClick={handleRequestAnalysis}>
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Resultados da Análise da IA */}
      {!loading && analysis && (
        <>
          {/* 1. Diagnóstico Geral */}
          <DiagnosisCard diagnosis={analysis.diagnostico || analysis} />

          {/* 2. Problemas Identificados */}
          <ProblemCard problems={analysis.problemas} />

          {/* 3. Plano de Ação */}
          <ActionPlanCard actions={analysis.acoes} />

          {/* 4. Preparação para Investir */}
          <InvestmentReadinessCard readiness={analysis.preparacaoInvestimento} />
        </>
      )}

      {/* Estado Vazio (Antes da primeira análise) */}
      {!loading && !analysis && !error && (
        <div className="glass" style={{ padding: '36px', textAlign: 'center', borderRadius: '16px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✨</div>
          <h3 style={{ marginBottom: '8px' }}>Nenhuma análise gerada nesta sessão</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 20px auto' }}>
            Clique no botão <strong>"Solicitar Análise com IA"</strong> acima para que o Google Gemini interprete seu
            histórico financeiro, aponte pontos de atenção com evidências e trace um plano de ação personalizado.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={handleRequestAnalysis}
              disabled={transactions.length === 0}
            >
              Começar Análise Agora
            </button>

            {transactions.length === 0 && onLoadDemoData && (
              <button
                className="btn-secondary"
                onClick={onLoadDemoData}
                style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
              >
                📊 Carregar Cenário de Teste / Apresentação
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
