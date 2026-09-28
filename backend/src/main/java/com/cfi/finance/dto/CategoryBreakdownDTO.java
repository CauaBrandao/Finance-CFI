package com.cfi.finance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Detalhamento e concentração de despesas por categoria")
public record CategoryBreakdownDTO(
        @Schema(description = "Nome legível da categoria", example = "Alimentação")
        String categoria,

        @Schema(description = "Chave identificadora da categoria", example = "food")
        String chave,

        @Schema(description = "Total monetário gasto na categoria", example = "920.00")
        BigDecimal totalGasto,

        @Schema(description = "Percentual em relação ao total de despesas", example = "32.5")
        Double percentualDasDespesas,

        @Schema(description = "Percentual de comprometimento da receita total", example = "26.3")
        Double percentualDaReceita
) {}
