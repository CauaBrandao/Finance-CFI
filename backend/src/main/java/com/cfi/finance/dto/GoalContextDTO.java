package com.cfi.finance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Situação da meta mensal de gastos (budget)")
public record GoalContextDTO(
        @Schema(description = "Teto orçamentário mensal definido", example = "2500.00")
        BigDecimal limite,

        @Schema(description = "Total consumido até o momento", example = "1800.00")
        BigDecimal gastoAtual,

        @Schema(description = "Percentual atingido da meta", example = "72.0")
        Double percentualAtingido,

        @Schema(description = "Saldo restante disponível antes de estourar a meta", example = "700.00")
        BigDecimal restante
) {}
