package com.cfi.finance.controller;

import com.cfi.finance.dto.ErrorResponseDTO;
import com.cfi.finance.dto.FinancialContextDTO;
import com.cfi.finance.dto.InvestmentReadinessResponseDTO;
import com.cfi.finance.service.FinancialAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/investments")
@Tag(name = "Investimentos & Preparação", description = "Avaliação da maturidade orçamentária do usuário para iniciar ou expandir investimentos")
public class InvestmentController {

    private final FinancialAnalysisService analysisService;

    public InvestmentController(FinancialAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/readiness")
    @Operation(summary = "Avaliação de Preparação para Investir",
            description = "Analisa a estabilidade de fluxo de caixa, saldo disponível e capacidade de poupança para classificar a preparação do usuário (PREPARADO, PRECISA_DE_AJUSTES, PRIORIDADE_ORGANIZACAO). Ferramenta estritamente educacional.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Avaliação de preparação concluída",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = InvestmentReadinessResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Contexto financeiro inválido",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class)))
    })
    public ResponseEntity<InvestmentReadinessResponseDTO> getInvestmentReadiness(@Valid @RequestBody FinancialContextDTO context) {
        InvestmentReadinessResponseDTO response = analysisService.getInvestmentReadiness(context);
        return ResponseEntity.ok(response);
    }
}
