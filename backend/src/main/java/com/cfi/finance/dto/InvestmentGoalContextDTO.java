package com.cfi.finance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Situação da meta mensal de aportes de investimento")
public record InvestmentGoalContextDTO(
        @Schema(description = "Objetivo monetário de aportes para o mês", example = "500.00")
        BigDecimal meta,

        @Schema(description = "Total efetivamente aportado", example = "350.00")
        BigDecimal totalAportado,

        @Schema(description = "Quantidade de aportes realizados", example = "2")
        Integer quantidadeAportes,

        @Schema(description = "Percentual atingido da meta de investimento", example = "70.0")
        Double percentualAtingido,

        @Schema(description = "Valor restante para conclusão da meta", example = "150.00")
        BigDecimal restante
) {}
