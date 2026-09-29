package com.cfi.finance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Schema(description = "Contexto financeiro estruturado com métricas determinísticas e dados do usuário para submissão à análise")
public record FinancialContextDTO(
        @Schema(description = "Período de referência da análise (Ano-Mês no formato AAAA-MM)", example = "2026-09", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
        String periodo,

        @NotNull(message = "A receita total calculada é obrigatória")
        @Schema(description = "Total de receitas recebidas no período (mínimo 0.00)", example = "3500.00", minimum = "0.00", requiredMode = Schema.RequiredMode.REQUIRED)
        BigDecimal receitaTotal,

        @NotNull(message = "A despesa total calculada é obrigatória")
        @Schema(description = "Total de despesas pagas no período (mínimo 0.00)", example = "2830.00", minimum = "0.00", requiredMode = Schema.RequiredMode.REQUIRED)
        BigDecimal despesaTotal,

        @NotNull(message = "O saldo é obrigatório")
        @Schema(description = "Saldo líquido final do período (Receitas - Despesas)", example = "670.00", requiredMode = Schema.RequiredMode.REQUIRED)
        BigDecimal saldo,

        @Schema(description = "Taxa de poupança percentual ((Saldo / Receita) * 100)", example = "19.1", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
        Double taxaPoupancaPercentual,

        @Schema(description = "Média de gastos diários calculada no período", example = "94.33", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
        Double gastoMedioDiario,

        @Schema(description = "Número de dias distintos com movimentações rastreadas", example = "30", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
        Integer diasRastreados,

        @Schema(description = "Dados da maior despesa individual registrada no período", example = "{\"descricao\": \"Aluguel\", \"valor\": 1200.00, \"categoria\": \"housing\"}", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
        Map<String, Object> maiorDespesa,

        @Schema(description = "Dados consolidados da meta de gastos mensal (budget)", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
        GoalContextDTO metaGastosMensal,

        @Schema(description = "Dados consolidados da meta de investimentos mensal", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
        InvestmentGoalContextDTO metaInvestimentoMensal,

        @Schema(description = "Distribuição percentual e absoluta das despesas agrupadas por categoria", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
        List<CategoryBreakdownDTO> categoriasDespesa,

        @Size(max = 100, message = "O lote de transações não pode exceder 100 registros")
        @Schema(description = "Amostra das movimentações mais recentes (máximo 100 itens no payload)", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
        List<TransactionDTO> ultimasTransacoes
) {}
