package com.cfi.finance;

import com.cfi.finance.controller.FinancialAnalysisController;
import com.cfi.finance.dto.*;
import com.cfi.finance.service.FinancialAnalysisService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FinancialAnalysisController.class)
class FinancialAnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FinancialAnalysisService analysisService;

    @Test
    @DisplayName("POST /financial-analysis/full deve retornar 200 OK com análise estruturada")
    void shouldReturn200ForValidFullAnalysis() throws Exception {
        DiagnosisResponseDTO diag = new DiagnosisResponseDTO("ESTAVEL", "Panorama estável.", List.of(), List.of());
        InvestmentReadinessResponseDTO readiness = new InvestmentReadinessResponseDTO("PREPARADO", "Fluxo equilibrado.", "Aviso");
        FullAnalysisResponseDTO mockResponse = new FullAnalysisResponseDTO(
                diag, List.of(), List.of(), readiness, Map.of("saldoCalculado", 500)
        );

        Mockito.when(analysisService.getFullAnalysis(any(FinancialContextDTO.class))).thenReturn(mockResponse);

        FinancialContextDTO requestContext = new FinancialContextDTO(
                "2026-09",
                BigDecimal.valueOf(3000),
                BigDecimal.valueOf(2500),
                BigDecimal.valueOf(500),
                16.7, 83.33, 30, null, null, null, null, null
        );

        mockMvc.perform(post("/financial-analysis/full")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestContext)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.diagnostico.situacao").value("ESTAVEL"))
                .andExpect(jsonPath("$.preparacaoInvestimento.status").value("PREPARADO"));
    }

    @Test
    @DisplayName("POST /financial-analysis/full com corpo vazio deve retornar 400 Bad Request")
    void shouldReturn400ForEmptyBody() throws Exception {
        mockMvc.perform(post("/financial-analysis/full")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }
}
