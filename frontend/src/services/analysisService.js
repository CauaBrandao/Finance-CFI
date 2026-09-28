import { api } from './api';

export const analysisService = {
  /**
   * Solicita análise completa: Diagnóstico, Problemas, Ações e Preparação para Investir
   */
  async getFullAnalysis(financialContext) {
    return api.post('/financial-analysis/full', financialContext);
  },

  /**
   * Solicita apenas Diagnóstico e Problemas Identificados
   */
  async getDiagnosis(financialContext) {
    return api.post('/financial-analysis/diagnosis', financialContext);
  },

  /**
   * Solicita apenas Plano de Ação
   */
  async getActionPlan(financialContext) {
    return api.post('/financial-analysis/action-plan', financialContext);
  },

  /**
   * Solicita apenas Preparação para Investir
   */
  async getInvestmentReadiness(financialContext) {
    return api.post('/investments/readiness', financialContext);
  }
};
