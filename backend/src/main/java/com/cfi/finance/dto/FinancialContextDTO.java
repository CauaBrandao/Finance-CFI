package com.cfi.finance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Schema(description = "Contexto financeiro estruturado com métricas determinísticas e dados do usuário")
public record FinancialContextDTO(
        @Schema(description = "Período de referência da análise (Ano-Mês)", example = "2026-09")
        String periodo,

        @NotNull(message = "A receita total calculada é obrigatória")
        @Schema(description = "Total de receitas recebidas no período", example = "3500.00")
        BigDecimal receitaTotal,

        @NotNull(message = "A despesa total calculada é obrigatória")
        @Schema(description = "Total de despesas pagas no período", example = "2830.00")
        BigDecimal despesaTotal,

        @NotNull(message = "O saldo é obrigatório")
        @Schema(description = "Saldo final líquido (Receitas - Despesas)", example = "670.00")
        BigDecimal saldo,

        @Schema(description = "Taxa de poupança (Saldo / Receita * 100)", example = "19.1")
        Double taxaPoupancaPercentual,

        @Schema(description = "Média de gastos por dia ativo", example = "94.33")
        Double gastoMedioDiario,

        @Schema(description = "Número de dias distintos com movimentações", example = "30")
        Integer diasRastreados,

        @Schema(description = "Maior despesa registrada")
        Map<String, Object> maiorDespesa,

        @Schema(description = "Dados consolidados da meta de gastos mensal")
        GoalContextDTO metaGastosMensal,

        @Schema(description = "Dados consolidados da meta de investimentos mensal")
        InvestmentGoalContextDTO metaInvestimentoMensal,

        @Schema(description = "Distribuição percentual e absoluta das despesas por categoria")
        List<CategoryBreakdownDTO> categoriasDespesa,

        @Size(max = 100, message = "O lote de transações não pode exceder 100 registros")
        @Schema(description = "Amostra das movimentações mais recentes")
        List<TransactionDTO> ultimasTransacoes
) {}
