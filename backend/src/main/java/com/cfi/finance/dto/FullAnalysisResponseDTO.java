package com.cfi.finance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Map;

@Schema(description = "Resposta unificada contendo Diagnóstico, Problemas, Ações, Preparação para Investir e Métricas")
public record FullAnalysisResponseDTO(
        @Schema(description = "Diagnóstico geral da situação financeira")
        DiagnosisResponseDTO diagnostico,

        @Schema(description = "Lista detalhada de problemas identificados")
        List<ProblemDTO> problemas,

        @Schema(description = "Plano de ação prioritário recomendado")
        List<ActionItemDTO> acoes,

        @Schema(description = "Módulo de preparação para investir")
        InvestmentReadinessResponseDTO preparacaoInvestimento,

        @Schema(description = "Métricas determinísticas consolidadas pelo backend")
        Map<String, Object> metricasDeterministas
) {}
