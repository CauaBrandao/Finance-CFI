package com.cfi.finance.controller;

import com.cfi.finance.dto.ErrorResponseDTO;
import com.cfi.finance.dto.FinancialContextDTO;
import com.cfi.finance.dto.InvestmentReadinessResponseDTO;
import com.cfi.finance.service.FinancialAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/investments")
@Tag(name = "Investimentos & Preparação", description = "Avaliação educacional da maturidade e estabilidade do fluxo de caixa para iniciar ou expandir investimentos")
public class InvestmentController {

    private final FinancialAnalysisService analysisService;

    public InvestmentController(FinancialAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/readiness")
    @Operation(summary = "Avaliação de Preparação para Investir",
            description = "Analisa a estabilidade de fluxo de caixa, saldo disponível e capacidade de poupança para classificar a preparação do usuário em 'PREPARADO', 'PRECISA_DE_AJUSTES' ou 'PRIORIDADE_ORGANIZACAO'. Ferramenta com finalidade estritamente educacional que não faz recomendação de ativos financeiros específicos.")
    @RequestBody(description = "Contexto financeiro estruturado com métricas e histórico de despesas/receitas", required = true,
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = FinancialContextDTO.class)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Avaliação de preparação concluída com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = InvestmentReadinessResponseDTO.class),
                            examples = @ExampleObject(name = "Avaliação Concluída", value = """
                                    {
                                      "status": "PRECISA_DE_AJUSTES",
                                      "justificativa": "O usuário mantém saldo positivo de R$ 670,00 e já realizou aportes totalizando R$ 350,00, mas a concentração de despesas essenciais ainda exige ajustes orçamentários antes de elevar o volume mensal de investimentos.",
                                      "avisoEducacional": "Esta avaliação tem caráter estritamente educacional e organizacional. Não constitui aconselhamento, consultoria financeira ou recomendação de investimentos."
                                    }
                                    """))),
            @ApiResponse(responseCode = "400", description = "Contexto financeiro inválido ou campos obrigatórios ausentes",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponseDTO.class),
                            examples = @ExampleObject(name = "Erro 400", value = """
                                    {
                                      "status": 400,
                                      "error": "INVALID_REQUEST",
                                      "message": "A receita total calculada é obrigatória",
                                      "path": "/api/investments/readiness",
                                      "timestamp": "2026-09-29T14:30:00"
                                    }
                                    """))),
            @ApiResponse(responseCode = "429", description = "Limite de taxa (Rate Limit) do provedor Google Gemini excedido",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class))),
            @ApiResponse(responseCode = "503", description = "Serviço do Google Gemini temporariamente indisponível",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class))),
            @ApiResponse(responseCode = "504", description = "Tempo limite (Timeout) excedido na comunicação com a IA",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class)))
    })
    public ResponseEntity<InvestmentReadinessResponseDTO> getInvestmentReadiness(@Valid @org.springframework.web.bind.annotation.RequestBody FinancialContextDTO context) {
        InvestmentReadinessResponseDTO response = analysisService.getInvestmentReadiness(context);
        return ResponseEntity.ok(response);
    }
}
