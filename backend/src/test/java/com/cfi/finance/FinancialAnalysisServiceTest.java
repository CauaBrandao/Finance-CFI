package com.cfi.finance;

import com.cfi.finance.client.GeminiClient;
import com.cfi.finance.dto.*;
import com.cfi.finance.service.FinancialAnalysisService;
import com.cfi.finance.service.FinancialCalculationService;
import com.cfi.finance.service.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class FinancialAnalysisServiceTest {

    private FinancialAnalysisService analysisService;
    private GeminiClient geminiClient;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        geminiClient = Mockito.mock(GeminiClient.class);
        objectMapper = new ObjectMapper();
        FinancialCalculationService calculationService = new FinancialCalculationService();
        GeminiService geminiService = new GeminiService(geminiClient, objectMapper);
        analysisService = new FinancialAnalysisService(calculationService, geminiService);
    }

    @Test
    @DisplayName("Deve orquestrar análise financeira completa com resposta estruturada")
    void shouldOrchestrateFullAnalysisSuccessfully() {
        String mockAiResponse = """
            {
              "diagnostico": {
                "situacao": "ATENCAO",
                "resumo": "Despesas com alta concentração na categoria alimentação.",
                "problemas": [
                  {
                    "titulo": "Alta concentração de despesas",
                    "descricao": "Alimentação representa parcela desproporcional da receita.",
                    "evidencias": ["Alimentação totalizou R$ 920,00"],
                    "prioridade": "ALTA"
                  }
                ],
                "acoes": [
                  {
                    "acao": "Estabelecer teto mensal de R$ 700,00 para alimentação",
                    "motivo": "Reduzir pressão sobre a margem de poupança",
                    "prioridade": "ALTA"
                  }
                ]
              },
              "problemas": [
                {
                  "titulo": "Alta concentração de despesas",
                  "descricao": "Alimentação representa parcela desproporcional da receita.",
                  "evidencias": ["Alimentação totalizou R$ 920,00"],
                  "prioridade": "ALTA"
                }
              ],
              "acoes": [
                {
                  "acao": "Estabelecer teto mensal de R$ 700,00 para alimentação",
                  "motivo": "Reduzir pressão sobre a margem de poupança",
                  "prioridade": "ALTA"
                }
              ],
              "preparacaoInvestimento": {
                "status": "PRECISA_DE_AJUSTES",
                "justificativa": "O saldo é positivo, mas a concentração de gastos em alimentação reduz a flexibilidade para aportes.",
                "avisoEducacional": "Aviso educacional."
              }
            }
            """;

        when(geminiClient.generateStructuredContent(anyString(), anyString())).thenReturn(mockAiResponse);

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
                List.of(new CategoryBreakdownDTO("Alimentação", "food", BigDecimal.valueOf(920), 32.5, 26.3)),
                null
        );

        FullAnalysisResponseDTO result = analysisService.getFullAnalysis(context);

        assertNotNull(result);
        assertNotNull(result.diagnostico());
        assertEquals("ATENCAO", result.diagnostico().situacao());
        assertEquals(1, result.problemas().size());
        assertEquals("Alta concentração de despesas", result.problemas().get(0).titulo());
        assertEquals("ALTA", result.problemas().get(0).prioridade());
        assertEquals("PRECISA_DE_AJUSTES", result.preparacaoInvestimento().status());
        assertNotNull(result.metricasDeterministas());
        assertEquals(BigDecimal.valueOf(670), result.metricasDeterministas().get("saldoCalculado"));
    }
}
