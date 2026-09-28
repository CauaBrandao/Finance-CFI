package com.cfi.finance.controller;

import com.cfi.finance.dto.*;
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
@RequestMapping("/financial-analysis")
@Tag(name = "Inteligência Financeira", description = "Endpoints de classificação, diagnóstico, identificação de problemas e plano de ação integrados ao Google Gemini")
public class FinancialAnalysisController {

    private final FinancialAnalysisService analysisService;

    public FinancialAnalysisController(FinancialAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/full")
    @Operation(summary = "Análise Financeira Integral",
            description = "Consolida métricas determinísticas e submete o contexto financeiro ao Google Gemini para diagnóstico completo, detecção de desvios, plano de ação e maturidade para investimentos.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Análise gerada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = FullAnalysisResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados da requisição inválidos ou fora dos limites",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class))),
            @ApiResponse(responseCode = "429", description = "Limite de taxa (Rate Limit) do Gemini atingido",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class))),
            @ApiResponse(responseCode = "503", description = "Serviço da IA temporariamente indisponível",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class))),
            @ApiResponse(responseCode = "504", description = "Tempo limite (Timeout) excedido na comunicação com a IA",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class)))
    })
    public ResponseEntity<FullAnalysisResponseDTO> getFullAnalysis(@Valid @RequestBody FinancialContextDTO context) {
        FullAnalysisResponseDTO response = analysisService.getFullAnalysis(context);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/diagnosis")
    @Operation(summary = "Diagnóstico Financeiro e Problemas",
            description = "Avalia a situação orçamentária do usuário e identifica pontos de atenção com evidências numéricas extraídas dos dados.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Diagnóstico retornado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DiagnosisResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Contexto financeiro inválido",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class)))
    })
    public ResponseEntity<DiagnosisResponseDTO> getDiagnosis(@Valid @RequestBody FinancialContextDTO context) {
        DiagnosisResponseDTO response = analysisService.getDiagnosis(context);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/action-plan")
    @Operation(summary = "Plano de Ação Recomendado",
            description = "Gera ações práticas e priorizadas diretamente conectadas aos problemas orçamentários diagnosticados.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Plano de ação gerado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ActionPlanResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Contexto financeiro inválido",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class)))
    })
    public ResponseEntity<ActionPlanResponseDTO> getActionPlan(@Valid @RequestBody FinancialContextDTO context) {
        ActionPlanResponseDTO response = analysisService.getActionPlan(context);
        return ResponseEntity.ok(response);
    }
}
