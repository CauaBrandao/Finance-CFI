package com.cfi.finance.service;

import com.cfi.finance.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class FinancialAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(FinancialAnalysisService.class);
    private final FinancialCalculationService calculationService;
    private final GeminiService geminiService;

    public FinancialAnalysisService(FinancialCalculationService calculationService, GeminiService geminiService) {
        this.calculationService = calculationService;
        this.geminiService = geminiService;
    }

    /**
     * Executa análise integral: validação determinística + raciocínio contextual do Gemini
     */
    public FullAnalysisResponseDTO getFullAnalysis(FinancialContextDTO context) {
        log.info("Iniciando análise financeira integral para o período: {}", context.periodo());

        // 1. Validação estrita dos dados
        calculationService.validateFinancialContext(context);

        // 2. Cálculos determinísticos realizados no backend
        Map<String, Object> deterministicMetrics = calculationService.calculateDeterministicMetrics(context);

        // 3. Chamada contextual e estruturada à IA
        FullAnalysisResponseDTO aiResponse = geminiService.analyzeFinancialContext(context);

        // 4. Retorna a resposta completa acoplando as métricas determinísticas do backend
        return new FullAnalysisResponseDTO(
                aiResponse.diagnostico(),
                aiResponse.problemas(),
                aiResponse.acoes(),
                aiResponse.preparacaoInvestimento(),
                deterministicMetrics
        );
    }

    /**
     * Retorna apenas o Diagnóstico e Problemas
     */
    public DiagnosisResponseDTO getDiagnosis(FinancialContextDTO context) {
        FullAnalysisResponseDTO full = getFullAnalysis(context);
        return full.diagnostico();
    }

    /**
     * Retorna apenas o Plano de Ação
     */
    public ActionPlanResponseDTO getActionPlan(FinancialContextDTO context) {
        FullAnalysisResponseDTO full = getFullAnalysis(context);
        return new ActionPlanResponseDTO(
                full.acoes(),
                "Execute as ações de prioridade ALTA nos próximos 7 dias para garantir alívio orçamentário."
        );
    }

    /**
     * Retorna apenas a Preparação para Investir
     */
    public InvestmentReadinessResponseDTO getInvestmentReadiness(FinancialContextDTO context) {
        FullAnalysisResponseDTO full = getFullAnalysis(context);
        return full.preparacaoInvestimento();
    }
}
