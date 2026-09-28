package com.cfi.finance.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Avaliação da maturidade e preparação orçamentária do usuário para investir")
public record InvestmentReadinessResponseDTO(
        @Schema(description = "Classificação da preparação (PREPARADO, PRECISA_DE_AJUSTES, PRIORIDADE_ORGANIZACAO)", example = "PRECISA_DE_AJUSTES")
        String status,

        @Schema(description = "Justificativa analítica pautada exclusivamente nas evidências do contexto financeiro", example = "O usuário mantém saldo positivo de R$ 670,00 e já realizou aportes totalizando R$ 350,00, mas a concentração de despesas essenciais ainda exige ajustes orçamentários antes de elevar o volume mensal de investimentos.")
        String justificativa,

        @Schema(description = "Aviso legal e educacional", example = "Esta avaliação tem caráter estritamente educacional e organizacional. Não constitui aconselhamento, consultoria financeira ou recomendação de investimentos.")
        String avisoEducacional
) {}
