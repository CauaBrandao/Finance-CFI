package com.cfi.finance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Resposta do Diagnóstico Financeiro emitido pela Inteligência Artificial")
public record DiagnosisResponseDTO(
        @Schema(description = "Classificação da situação orçamentária", allowableValues = {"EXCELENTE", "ESTAVEL", "BOM", "ATENCAO", "CRITICO"}, example = "ATENCAO")
        String situacao,

        @Schema(description = "Resumo analítico do panorama das finanças do usuário", example = "O fluxo de caixa está positivo com saldo de R$ 670,00, porém há pontos de atenção com alta concentração de gastos e proximidade do teto da meta mensal.")
        String resumo,

        @Schema(description = "Lista detalhada de problemas identificados com evidências empíricas extraídas dos dados")
        List<ProblemDTO> problemas,

        @Schema(description = "Recomendações e plano de ação imediato conectado aos problemas")
        List<ActionItemDTO> acoes
) {}
