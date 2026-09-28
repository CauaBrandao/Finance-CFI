package com.cfi.finance.service;

import com.cfi.finance.dto.CategoryBreakdownDTO;
import com.cfi.finance.dto.FinancialContextDTO;
import com.cfi.finance.dto.TransactionDTO;
import com.cfi.finance.exception.InvalidFinancialDataException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class FinancialCalculationService {

    public void validateFinancialContext(FinancialContextDTO context) {
        if (context == null) {
            throw new InvalidFinancialDataException("O contexto financeiro não pode ser nulo.");
        }

        if (context.receitaTotal() == null || context.receitaTotal().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidFinancialDataException("A receita total informada é inválida ou negativa.");
        }

        if (context.despesaTotal() == null || context.despesaTotal().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidFinancialDataException("A despesa total informada é inválida ou negativa.");
        }

        if (context.saldo() == null) {
            throw new InvalidFinancialDataException("O saldo financeiro é obrigatório.");
        }

        // Validação de limites para prevenir Denial of Service por payloads gigantes
        if (context.ultimasTransacoes() != null && context.ultimasTransacoes().size() > 500) {
            throw new InvalidFinancialDataException("O limite máximo de transações por análise é de 500 registros.");
        }
    }

    /**
     * Calcula métricas determinísticas consolidadas a partir das transações brutas
     */
    public Map<String, Object> calculateDeterministicMetrics(FinancialContextDTO context) {
        Map<String, Object> metrics = new LinkedHashMap<>();

        BigDecimal receita = context.receitaTotal();
        BigDecimal despesa = context.despesaTotal();
        BigDecimal saldo = receita.subtract(despesa);

        metrics.put("receitaTotal", receita);
        metrics.put("despesaTotal", despesa);
        metrics.put("saldoCalculado", saldo);

        // Taxa de Poupança = (Saldo / Receita) * 100
        double taxaPoupanca = 0.0;
        if (receita.compareTo(BigDecimal.ZERO) > 0 && saldo.compareTo(BigDecimal.ZERO) > 0) {
            taxaPoupanca = saldo.divide(receita, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }
        metrics.put("taxaPoupancaPercentual", taxaPoupanca);

        // Comprometimento da Renda = (Despesa / Receita) * 100
        double comprometimento = 0.0;
        if (receita.compareTo(BigDecimal.ZERO) > 0) {
            comprometimento = despesa.divide(receita, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }
        metrics.put("comprometimentoRendaPercentual", comprometimento);

        // Dias rastreados
        int dias = context.diasRastreados() != null && context.diasRastreados() > 0 ? context.diasRastreados() : 1;
        metrics.put("diasRastreados", dias);

        // Média de despesas diária
        BigDecimal gastoDiario = despesa.divide(BigDecimal.valueOf(dias), 2, RoundingMode.HALF_UP);
        metrics.put("gastoMedioDiario", gastoDiario);

        // Categoria com maior concentração
        if (context.categoriasDespesa() != null && !context.categoriasDespesa().isEmpty()) {
            CategoryBreakdownDTO topCategory = context.categoriasDespesa().stream()
                    .max(Comparator.comparing(CategoryBreakdownDTO::totalGasto))
                    .orElse(null);
            if (topCategory != null) {
                metrics.put("categoriaMaiorGasto", topCategory.categoria());
                metrics.put("categoriaMaiorGastoValor", topCategory.totalGasto());
                metrics.put("categoriaMaiorGastoPercentualDespesas", topCategory.percentualDasDespesas());
            }
        }

        return metrics;
    }
}
