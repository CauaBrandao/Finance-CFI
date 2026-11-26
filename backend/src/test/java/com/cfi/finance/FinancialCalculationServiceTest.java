package com.cfi.finance;

import com.cfi.finance.dto.CategoryBreakdownDTO;
import com.cfi.finance.dto.FinancialContextDTO;
import com.cfi.finance.exception.InvalidFinancialDataException;
import com.cfi.finance.service.FinancialCalculationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class FinancialCalculationServiceTest {

    private FinancialCalculationService calculationService;

    @BeforeEach
    void setUp() {
        calculationService = new FinancialCalculationService();
    }

    @Test
    @DisplayName("Deve rejeitar contexto financeiro nulo")
    void shouldRejectNullContext() {
        assertThrows(InvalidFinancialDataException.class, () -> calculationService.validateFinancialContext(null));
    }

    @Test
    @DisplayName("Deve rejeitar receita negativa")
    void shouldRejectNegativeIncome() {
        FinancialContextDTO context = new FinancialContextDTO(
                "2026-09",
                BigDecimal.valueOf(-100),
                BigDecimal.valueOf(50),
                BigDecimal.valueOf(-150),
                0.0, 1.0, 1, null, null, null, null, null
        );
        assertThrows(InvalidFinancialDataException.class, () -> calculationService.validateFinancialContext(context));
    }

    @Test
    @DisplayName("Deve calcular métricas determinísticas corretamente")
    void shouldCalculateDeterministicMetricsCorrectly() {
        CategoryBreakdownDTO food = new CategoryBreakdownDTO("Alimentação", "food", BigDecimal.valueOf(920), 32.5, 26.3);
        CategoryBreakdownDTO transport = new CategoryBreakdownDTO("Transporte", "transport", BigDecimal.valueOf(300), 10.6, 8.5);

        FinancialContextDTO context = new FinancialContextDTO(
                "2026-09",
                BigDecimal.valueOf(3500),
                BigDecimal.valueOf(2830),
                BigDecimal.valueOf(670),
                19.1,
                94.33,
                30,
                null,
                null,
                null,
                List.of(food, transport),
                null
        );

        Map<String, Object> metrics = calculationService.calculateDeterministicMetrics(context);

        assertNotNull(metrics);
        assertEquals(BigDecimal.valueOf(3500), metrics.get("receitaTotal"));
        assertEquals(BigDecimal.valueOf(2830), metrics.get("despesaTotal"));
        assertEquals(BigDecimal.valueOf(670), metrics.get("saldoCalculado"));
        assertEquals(19.1, (Double) metrics.get("taxaPoupancaPercentual"), 0.1);
        assertEquals("Alimentação", metrics.get("categoriaMaiorGasto"));
        assertEquals(BigDecimal.valueOf(920), metrics.get("categoriaMaiorGastoValor"));
    }

    @Test
    @DisplayName("Deve rejeitar mais de 100 transações no contexto financeiro")
    void shouldRejectMoreThan100Transactions() {
        List<com.cfi.finance.dto.TransactionDTO> many = java.util.stream.IntStream.range(0, 101)
                .mapToObj(i -> new com.cfi.finance.dto.TransactionDTO("id_" + i, "Item " + i, BigDecimal.TEN, "expense", "food", "2026-09-01"))
                .toList();

        FinancialContextDTO context = new FinancialContextDTO(
                "2026-09", BigDecimal.valueOf(5000), BigDecimal.valueOf(1010), BigDecimal.valueOf(3990),
                79.8, 33.6, 30, null, null, null, null, many
        );
        assertThrows(InvalidFinancialDataException.class, () -> calculationService.validateFinancialContext(context));
    }

    @Test
    @DisplayName("Não deve falhar por divisão por zero quando receita for zero")
    void shouldHandleZeroIncomeDeterministically() {
        FinancialContextDTO context = new FinancialContextDTO(
                "2026-09", BigDecimal.ZERO, BigDecimal.valueOf(200), BigDecimal.valueOf(-200),
                0.0, 200.0, 1, null, null, null, null, null
        );
        Map<String, Object> metrics = calculationService.calculateDeterministicMetrics(context);
        assertEquals(0.0, (Double) metrics.get("taxaPoupancaPercentual"));
        assertEquals(0.0, (Double) metrics.get("comprometimentoRendaPercentual"));
        assertEquals(BigDecimal.valueOf(-200), metrics.get("saldoCalculado"));
    }
}
