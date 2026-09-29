package com.cfi.finance.controller;

import com.cfi.finance.dto.*;
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
@RequestMapping("/financial-analysis")
@Tag(name = "Inteligência Financeira", description = "Endpoints analíticos para diagnóstico financeiro, detecção de problemas com evidências e plano de ação estruturado integrados ao Google Gemini")
public class FinancialAnalysisController {

    private final FinancialAnalysisService analysisService;

    public FinancialAnalysisController(FinancialAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/full")
    @Operation(summary = "Análise Financeira Integral",
            description = "Consolida métricas determinísticas e submete o contexto financeiro estruturado ao Google Gemini para emitir diagnóstico orçamentário completo, detecção de desvios com evidências empíricas, plano de ação priorizado e avaliação de maturidade para investimentos.")
    @RequestBody(description = "Contexto financeiro contendo métricas e transações do período", required = true,
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = FinancialContextDTO.class),
                    examples = @ExampleObject(name = "Contexto Completo", value = """
                            {
                              "periodo": "2026-09",
                              "receitaTotal": 3500.00,
                              "despesaTotal": 2830.00,
                              "saldo": 670.00,
                              "taxaPoupancaPercentual": 19.1,
                              "gastoMedioDiario": 94.33,
                              "diasRastreados": 30,
                              "maiorDespesa": {
                                "descricao": "Aluguel",
                                "valor": 1200.00,
                                "categoria": "housing"
                              },
                              "metaGastosMensal": {
                                "limite": 2500.00,
                                "gastoAtual": 2830.00,
                                "percentualAtingido": 113.2,
                                "restante": -330.00
                              },
                              "metaInvestimentoMensal": {
                                "meta": 500.00,
                                "totalAportado": 350.00,
                                "quantidadeAportes": 2,
                                "percentualAtingido": 70.0,
                                "restante": 150.00
                              },
                              "categoriasDespesa": [
                                {
                                  "categoria": "Moradia",
                                  "chave": "housing",
                                  "totalGasto": 1200.00,
                                  "percentualDasDespesas": 42.4,
                                  "percentualDaReceita": 34.3
                                },
                                {
                                  "categoria": "Alimentação",
                                  "chave": "food",
                                  "totalGasto": 920.00,
                                  "percentualDasDespesas": 32.5,
                                  "percentualDaReceita": 26.3
                                }
                              ],
                              "ultimasTransacoes": [
                                {
                                  "id": "tx_1",
                                  "description": "Salário Mensal",
                                  "amount": 3500.00,
                                  "type": "income",
                                  "category": "salary",
                                  "date": "2026-09-01"
                                },
                                {
                                  "id": "tx_2",
                                  "description": "Aluguel",
                                  "amount": 1200.00,
                                  "type": "expense",
                                  "category": "housing",
                                  "date": "2026-09-05"
                                }
                              ]
                            }
                            """)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Análise integral gerada com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = FullAnalysisResponseDTO.class),
                            examples = @ExampleObject(name = "Exemplo Análise Integral", value = """
                                    {
                                      "diagnostico": {
                                        "situacao": "ATENCAO",
                                        "resumo": "O fluxo de caixa fechou positivo com saldo de R$ 670,00 (taxa de poupança de 19,1%), porém as despesas superaram a meta de gastos em 13,2%, impulsionadas por moradia e alimentação.",
                                        "problemas": [
                                          {
                                            "titulo": "Meta de gastos mensal estourada",
                                            "descricao": "As despesas totais atingiram R$ 2.830,00, superando o teto orçamentário definido de R$ 2.500,00.",
                                            "evidencias": [
                                              "Excesso de R$ 330,00 acima do teto estipulado",
                                              "Consumo de 113,2% do orçamento planejado"
                                            ],
                                            "prioridade": "ALTA"
                                          }
                                        ],
                                        "acoes": [
                                          {
                                            "acao": "Revisar despesas com alimentação e reduzir pedidos externos",
                                            "motivo": "A categoria alimentação consumiu 26,3% da receita líquida do mês.",
                                            "prioridade": "ALTA"
                                          }
                                        ]
                                      },
                                      "problemas": [
                                        {
                                          "titulo": "Meta de gastos mensal estourada",
                                          "descricao": "As despesas totais atingiram R$ 2.830,00, superando o teto orçamentário de R$ 2.500,00.",
                                          "evidencias": [
                                            "Excesso de R$ 330,00 acima do teto estipulado",
                                            "Consumo de 113,2% do orçamento planejado"
                                          ],
                                          "prioridade": "ALTA"
                                        }
                                      ],
                                      "acoes": [
                                        {
                                          "acao": "Revisar despesas com alimentação e reduzir pedidos externos",
                                          "motivo": "A categoria alimentação consumiu 26,3% da receita líquida do mês.",
                                          "prioridade": "ALTA"
                                        }
                                      ],
                                      "preparacaoInvestimento": {
                                        "status": "PRECISA_DE_AJUSTES",
                                        "justificativa": "O saldo mensal é positivo e foram aportados R$ 350,00, mas o estouro do teto orçamentário exige estabilização prévia antes de aumentar aportes regulares.",
                                        "avisoEducacional": "Esta avaliação tem caráter estritamente educacional e organizacional. Não constitui aconselhamento, consultoria financeira ou recomendação de investimentos."
                                      },
                                      "metricasDeterministas": {
                                        "receitaTotal": 3500.00,
                                        "despesaTotal": 2830.00,
                                        "saldoCalculado": 670.00,
                                        "taxaPoupancaPercentual": 19.1,
                                        "comprometimentoRendaPercentual": 80.9,
                                        "diasRastreados": 30,
                                        "gastoMedioDiario": 94.33,
                                        "categoriaMaiorGasto": "Moradia",
                                        "categoriaMaiorGastoValor": 1200.00,
                                        "categoriaMaiorGastoPercentualDespesas": 42.4
                                      }
                                    }
                                    """))),
            @ApiResponse(responseCode = "400", description = "Dados da requisição inválidos ou fora dos limites permitidos",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponseDTO.class),
                            examples = @ExampleObject(name = "Dados Inválidos", value = """
                                    {
                                      "status": 400,
                                      "error": "INVALID_REQUEST",
                                      "message": "A receita total informada é inválida ou negativa.",
                                      "path": "/api/financial-analysis/full",
                                      "timestamp": "2026-09-29T14:30:00"
                                    }
                                    """))),
            @ApiResponse(responseCode = "429", description = "Limite de taxa (Rate Limit) do provedor Google Gemini excedido",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponseDTO.class),
                            examples = @ExampleObject(name = "Rate Limit", value = """
                                    {
                                      "status": 429,
                                      "error": "RATE_LIMIT_EXCEEDED",
                                      "message": "Limite de taxa (Rate Limit) do Gemini excedido. Tente novamente em instantes.",
                                      "path": "/api/financial-analysis/full",
                                      "timestamp": "2026-09-29T14:30:00"
                                    }
                                    """))),
            @ApiResponse(responseCode = "503", description = "Serviço do Google Gemini temporariamente indisponível",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponseDTO.class),
                            examples = @ExampleObject(name = "IA Indisponível", value = """
                                    {
                                      "status": 503,
                                      "error": "AI_SERVICE_UNAVAILABLE",
                                      "message": "Serviço do Google Gemini temporariamente indisponível (HTTP 503).",
                                      "path": "/api/financial-analysis/full",
                                      "timestamp": "2026-09-29T14:30:00"
                                    }
                                    """))),
            @ApiResponse(responseCode = "504", description = "Tempo limite (Timeout) excedido na comunicação com a IA",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponseDTO.class),
                            examples = @ExampleObject(name = "Timeout", value = """
                                    {
                                      "status": 504,
                                      "error": "GATEWAY_TIMEOUT",
                                      "message": "Tempo limite excedido ao aguardar resposta do Google Gemini (35 segundos).",
                                      "path": "/api/financial-analysis/full",
                                      "timestamp": "2026-09-29T14:30:00"
                                    }
                                    """)))
    })
    public ResponseEntity<FullAnalysisResponseDTO> getFullAnalysis(@Valid @org.springframework.web.bind.annotation.RequestBody FinancialContextDTO context) {
        FullAnalysisResponseDTO response = analysisService.getFullAnalysis(context);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/diagnosis")
    @Operation(summary = "Diagnóstico Financeiro e Problemas",
            description = "Avalia a situação orçamentária do usuário e identifica pontos de atenção com evidências numéricas extraídas estritamente dos dados enviados.")
    @RequestBody(description = "Contexto financeiro contendo métricas e transações do período", required = true,
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = FinancialContextDTO.class)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Diagnóstico retornado com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = DiagnosisResponseDTO.class),
                            examples = @ExampleObject(name = "Diagnóstico com Atenção", value = """
                                    {
                                      "situacao": "ATENCAO",
                                      "resumo": "Saldo positivo de R$ 670,00, mas com comprometimento de 80,9% da renda em custos fixos e variáveis.",
                                      "problemas": [
                                        {
                                          "titulo": "Alta concentração de despesas em Moradia",
                                          "descricao": "Os custos com moradia representam 42,4% de todas as despesas pagas no período.",
                                          "evidencias": [
                                            "Moradia somou R$ 1.200,00 em despesas",
                                            "Comprometeu 34,3% de toda a receita recebida"
                                          ],
                                          "prioridade": "ALTA"
                                        }
                                      ],
                                      "acoes": [
                                        {
                                          "acao": "Manter teto para despesas variáveis para compensar o custo fixo de moradia",
                                          "motivo": "Garantir que os custos essenciais não comprimam a taxa de poupança mensal.",
                                          "prioridade": "ALTA"
                                        }
                                      ]
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
                                      "path": "/api/financial-analysis/diagnosis",
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
    public ResponseEntity<DiagnosisResponseDTO> getDiagnosis(@Valid @org.springframework.web.bind.annotation.RequestBody FinancialContextDTO context) {
        DiagnosisResponseDTO response = analysisService.getDiagnosis(context);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/action-plan")
    @Operation(summary = "Plano de Ação Recomendado",
            description = "Gera ações práticas e priorizadas diretamente conectadas aos problemas orçamentários diagnosticados.")
    @RequestBody(description = "Contexto financeiro contendo métricas e transações do período", required = true,
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = FinancialContextDTO.class)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Plano de ação gerado com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ActionPlanResponseDTO.class),
                            examples = @ExampleObject(name = "Plano Recomendado", value = """
                                    {
                                      "acoes": [
                                        {
                                          "acao": "Estabelecer limite semanal para refeições e delivery",
                                          "motivo": "Reduzir o impacto de alimentação (R$ 920,00) que consumiu 26,3% da receita.",
                                          "prioridade": "ALTA"
                                        },
                                        {
                                          "acao": "Programar aporte de investimento no dia do recebimento do salário",
                                          "motivo": "Garantir o cumprimento da meta de investimento mensal antes dos gastos variáveis.",
                                          "prioridade": "MEDIA"
                                        }
                                      ],
                                      "orientacaoGeral": "Execute as ações de prioridade ALTA nos próximos 7 dias para garantir alívio orçamentário."
                                    }
                                    """))),
            @ApiResponse(responseCode = "400", description = "Contexto financeiro inválido ou campos obrigatórios ausentes",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponseDTO.class))),
            @ApiResponse(responseCode = "429", description = "Limite de taxa (Rate Limit) do provedor Google Gemini excedido",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class))),
            @ApiResponse(responseCode = "503", description = "Serviço do Google Gemini temporariamente indisponível",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class))),
            @ApiResponse(responseCode = "504", description = "Tempo limite (Timeout) excedido na comunicação com a IA",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class)))
    })
    public ResponseEntity<ActionPlanResponseDTO> getActionPlan(@Valid @org.springframework.web.bind.annotation.RequestBody FinancialContextDTO context) {
        ActionPlanResponseDTO response = analysisService.getActionPlan(context);
        return ResponseEntity.ok(response);
    }
}
