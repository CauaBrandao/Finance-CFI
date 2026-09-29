package com.cfi.finance.client;

import com.cfi.finance.config.GeminiConfig;
import com.cfi.finance.exception.AiServiceUnavailableException;
import com.cfi.finance.exception.AiTimeoutException;
import com.cfi.finance.exception.GeminiApiException;
import com.cfi.finance.exception.RateLimitExceededException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);
    private final RestClient restClient;
    private final GeminiConfig geminiConfig;
    private final ObjectMapper objectMapper;

    public GeminiClient(RestClient geminiRestClient, GeminiConfig geminiConfig, ObjectMapper objectMapper) {
        this.restClient = geminiRestClient;
        this.geminiConfig = geminiConfig;
        this.objectMapper = objectMapper;
    }

    /**
     * Envia o prompt estruturado ao Google Gemini e retorna a resposta pura em JSON
     */
    public String generateStructuredContent(String systemInstruction, String userFinancialDataJson) {
        if (!geminiConfig.isApiKeyConfigured()) {
            log.warn("Chave GEMINI_API_KEY não configurada ou em valor de exemplo. Utilizando motor analítico determinístico.");
            return generateOfflineAnalyticalResponse(userFinancialDataJson);
        }

        try {
            log.info("Iniciando requisição ao Google Gemini (modelo: {})", geminiConfig.getModel());

            Map<String, Object> requestBody = Map.of(
                    "system_instruction", Map.of(
                            "parts", List.of(Map.of("text", systemInstruction))
                    ),
                    "contents", List.of(
                            Map.of(
                                    "role", "user",
                                    "parts", List.of(Map.of("text", "DADOS_FINANCEIROS_DO_USUARIO:\n" + userFinancialDataJson))
                            )
                    ),
                    "generationConfig", Map.of(
                            "responseMimeType", "application/json",
                            "temperature", 0.2
                    )
            );

            // Monta a URL completa explicitamente para evitar a resolução RFC 3986 do Spring,
            // que substitui todo o path do baseUrl quando o URI relativo começa com '/'.
            // URL correta: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=...
            String baseUrl = geminiConfig.getBaseUrl().stripTrailing();
            String fullUrl = baseUrl + "/" + geminiConfig.getModel() + ":generateContent?key=" + geminiConfig.getApiKey();

            String rawResponse = restClient.post()
                    .uri(java.net.URI.create(fullUrl))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, resp) -> {
                        int code = resp.getStatusCode().value();
                        if (code == 429) {
                            throw new RateLimitExceededException("Limite de taxa (Rate Limit) do Gemini excedido. Tente novamente em instantes.");
                        }
                        throw new GeminiApiException("Erro do cliente na API Gemini (HTTP " + code + ")", code);
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, resp) -> {
                        int code = resp.getStatusCode().value();
                        throw new AiServiceUnavailableException("Serviço do Google Gemini temporariamente indisponível (HTTP " + code + ").");
                    })
                    .body(String.class);

            return extractJsonFromGeminiResponse(rawResponse);

        } catch (ResourceAccessException ex) {
            log.warn("Timeout ou falha de conexão na chamada ao Gemini. Utilizando motor analítico determinístico como fallback: {}", ex.getMessage());
            return generateOfflineAnalyticalResponse(userFinancialDataJson);
        } catch (AiServiceUnavailableException | RateLimitExceededException ex) {
            log.warn("Gemini indisponível ou limite de taxa atingido ({}). Utilizando motor analítico determinístico como fallback.", ex.getMessage());
            return generateOfflineAnalyticalResponse(userFinancialDataJson);
        } catch (GeminiApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Erro inesperado ao comunicar com o Google Gemini: {}", ex.getMessage());
            throw new GeminiApiException("Falha na comunicação com a Inteligência Artificial: " + ex.getMessage(), 500);
        }
    }

    /**
     * Extrai o conteúdo JSON gerado da estrutura de resposta da API Gemini
     */
    private String extractJsonFromGeminiResponse(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    String text = parts.get(0).path("text").asText();
                    // Limpa possíveis delimitadores markdown de código se a LLM os incluir
                    text = text.trim();
                    if (text.startsWith("```json")) {
                        text = text.substring(7);
                    }
                    if (text.startsWith("```")) {
                        text = text.substring(3);
                    }
                    if (text.endsWith("```")) {
                        text = text.substring(0, text.length() - 3);
                    }
                    return text.trim();
                }
            }
            throw new GeminiApiException("Resposta do Gemini vazia ou sem bloco de conteúdo válido.", 502);
        } catch (Exception ex) {
            log.error("Erro ao fazer parse do JSON retornado pelo Gemini: {}", ex.getMessage());
            throw new GeminiApiException("Não foi possível processar o formato da resposta da IA.", 502);
        }
    }

    /**
     * Fallback analítico determinístico profissional:
     * Garante resiliência e demonstrabilidade mesmo se a chave estiver ausente ou offline.
     */
    public String generateOfflineAnalyticalResponse(String financialDataJson) {
        try {
            JsonNode data = objectMapper.readTree(financialDataJson);
            double receita = data.path("receitaTotal").asDouble(0);
            double despesa = data.path("despesaTotal").asDouble(0);
            double saldo = data.path("saldo").asDouble(0);
            double taxaPoupanca = data.path("taxaPoupancaPercentual").asDouble(0);

            String situacao = "ESTAVEL";
            if (saldo < 0) {
                situacao = "CRITICO";
            } else if (taxaPoupanca < 10) {
                situacao = "ATENCAO";
            } else if (taxaPoupanca >= 25) {
                situacao = "EXCELENTE";
            } else {
                situacao = "BOM";
            }

            JsonNode categorias = data.path("categoriasDespesa");
            String topCat = "Despesas Gerais";
            double topCatPercent = 0;
            if (categorias.isArray() && !categorias.isEmpty()) {
                JsonNode first = categorias.get(0);
                topCat = first.path("categoria").asText("Despesas Gerais");
                topCatPercent = first.path("percentualDasDespesas").asDouble(0);
            }

            String prepStatus = saldo > 0 && taxaPoupanca >= 15 ? "PREPARADO" : (saldo > 0 ? "PRECISA_DE_AJUSTES" : "PRIORIDADE_ORGANIZACAO");

            return String.format(java.util.Locale.ROOT, """
            {
              "diagnostico": {
                "situacao": "%s",
                "resumo": "Análise determinística estruturada: Receita de R$ %.2f, despesas de R$ %.2f e saldo final de R$ %.2f (taxa de poupança de %.1f%%). A categoria '%s' representa %.1f%% das despesas consolidadas.",
                "problemas": [
                  {
                    "titulo": "Concentração de gastos em %s",
                    "descricao": "A categoria '%s' consome %.1f%% de todas as saídas registradas no período.",
                    "evidencias": [
                      "%s representa %.1f%% do total de despesas.",
                      "Impacto direto sobre a margem de poupança líquida."
                    ],
                    "prioridade": "%s"
                  }
                ],
                "acoes": [
                  {
                    "acao": "Estabelecer um teto mensal específico para %s",
                    "motivo": "Evitar que essa categoria comprometa o saldo final e ampliar a capacidade de poupança.",
                    "prioridade": "ALTA"
                  },
                  {
                    "acao": "Manter acompanhamento semanal dos gastos variáveis",
                    "motivo": "Garantir previsibilidade orçamentária ao longo de todo o ciclo mensal.",
                    "prioridade": "MEDIA"
                  }
                ]
              },
              "problemas": [
                {
                  "titulo": "Concentração de gastos em %s",
                  "descricao": "A categoria '%s' consome %.1f%% de todas as saídas registradas no período.",
                  "evidencias": [
                    "%s representa %.1f%% do total de despesas.",
                    "Impacto direto sobre a margem de poupança líquida."
                  ],
                  "prioridade": "%s"
                }
              ],
              "acoes": [
                {
                  "acao": "Estabelecer um teto mensal específico para %s",
                  "motivo": "Evitar que essa categoria comprometa o saldo final e ampliar a capacidade de poupança.",
                  "prioridade": "ALTA"
                },
                {
                  "acao": "Manter acompanhamento semanal dos gastos variáveis",
                  "motivo": "Garantir previsibilidade orçamentária ao longo de todo o ciclo mensal.",
                  "prioridade": "MEDIA"
                }
              ],
              "preparacaoInvestimento": {
                "status": "%s",
                "justificativa": "Com saldo de R$ %.2f e taxa de poupança de %.1f%%, o fluxo de caixa apresenta %s. Não há informações suficientes sobre reserva de emergência para avaliar esse aspecto.",
                "avisoEducacional": "Esta avaliação tem caráter estritamente educativo e organizacional. Não constitui aconselhamento, consultoria financeira ou recomendação de investimentos."
              }
            }
            """,
                    situacao,
                    receita, despesa, saldo, taxaPoupanca, topCat, topCatPercent,
                    topCat, topCat, topCatPercent, topCat, topCatPercent, topCatPercent > 30 ? "ALTA" : "MEDIA",
                    topCat,
                    topCat, topCat, topCatPercent, topCat, topCatPercent, topCatPercent > 30 ? "ALTA" : "MEDIA",
                    topCat,
                    prepStatus,
                    saldo, taxaPoupanca, prepStatus.equals("PREPARADO") ? "margem estável para aportes regulares" : "necessidade de consolidação prévia antes de aportes maiores"
            );
        } catch (Exception e) {
            log.error("Erro no gerador analítico de contingência: {}", e.getMessage());
            return "{}";
        }
    }
}
