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

import java.net.SocketTimeoutException;
import java.net.http.HttpTimeoutException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
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
                            "temperature", 0.2,
                            "thinkingConfig", Map.of(
                                    "thinkingBudget", 0
                            )
                    )
            );

            // Monta a URL sem expor a chave na query string; envia a chave via header x-goog-api-key
            String baseUrl = geminiConfig.getBaseUrl().stripTrailing();
            String fullUrl = baseUrl + "/" + geminiConfig.getModel() + ":generateContent";

            String rawResponse = restClient.post()
                    .uri(java.net.URI.create(fullUrl))
                    .header("x-goog-api-key", geminiConfig.getApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON, MediaType.ALL)
                    .body(requestBody)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, resp) -> {
                        int code = resp.getStatusCode().value();
                        if (code == 429) {
                            throw new RateLimitExceededException("Limite de taxa (Rate Limit) do Gemini excedido. Tente novamente em instantes.");
                        }
                        throw new GeminiApiException("Erro na comunicação com o provedor de IA (HTTP " + code + ").", code);
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, resp) -> {
                        int code = resp.getStatusCode().value();
                        throw new AiServiceUnavailableException("Serviço do Google Gemini temporariamente indisponível (HTTP " + code + ").");
                    })
                    .body(String.class);

            return extractJsonFromGeminiResponse(rawResponse);

        } catch (ResourceAccessException ex) {
            if (isTimeoutException(ex)) {
                log.error("Timeout na comunicação com a API Google Gemini ({}s)", geminiConfig.getTimeoutSeconds());
                throw new AiTimeoutException("Tempo limite excedido ao aguardar resposta do Google Gemini (" +
                        geminiConfig.getTimeoutSeconds() + " segundos).");
            }
            log.error("Falha de conectividade ao acessar a API Google Gemini");
            throw new AiServiceUnavailableException("Serviço do Google Gemini temporariamente inacessível.");
        } catch (RateLimitExceededException | AiServiceUnavailableException | AiTimeoutException ex) {
            log.warn("Exceção de resiliência da IA propagada para tratamento HTTP: {}", ex.getClass().getSimpleName());
            throw ex;
        } catch (org.springframework.web.client.RestClientException ex) {
            log.warn("Falha na chamada ao Gemini. Utilizando motor analítico determinístico como fallback.");
            return generateOfflineAnalyticalResponse(userFinancialDataJson);
        } catch (GeminiApiException ex) {
            log.warn("Exceção da API Gemini (status={}). Utilizando motor analítico determinístico como fallback.", ex.getStatusCode());
            return generateOfflineAnalyticalResponse(userFinancialDataJson);
        } catch (Exception ex) {
            log.warn("Erro inesperado na chamada ao Gemini. Utilizando motor analítico determinístico como fallback.");
            return generateOfflineAnalyticalResponse(userFinancialDataJson);
        }
    }

    private boolean isTimeoutException(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof SocketTimeoutException || current instanceof HttpTimeoutException) {
                return true;
            }
            String msg = current.getMessage();
            if (msg != null && msg.toLowerCase(Locale.ROOT).contains("timed out")) {
                return true;
            }
            current = current.getCause();
        }
        return false;
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
                    for (JsonNode part : parts) {
                        String text = part.path("text").asText("").trim();
                        if (text.isEmpty()) continue;
                        if (text.startsWith("```json")) {
                            text = text.substring(7);
                        }
                        if (text.startsWith("```")) {
                            text = text.substring(3);
                        }
                        if (text.endsWith("```")) {
                            text = text.substring(0, text.length() - 3);
                        }
                        text = text.trim();
                        if (text.startsWith("{") || text.startsWith("[")) {
                            return text;
                        }
                    }
                }
            }
            throw new GeminiApiException("Resposta do Gemini vazia ou sem bloco de conteúdo válido.", 502);
        } catch (GeminiApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Erro ao fazer parse do JSON retornado pelo Gemini.");
            throw new GeminiApiException("Não foi possível processar o formato da resposta da IA.", 502);
        }
    }

    /**
     * Fallback analítico determinístico seguro (serializado via Jackson):
     * Garante resiliência e demonstrabilidade mesmo se a chave estiver ausente ou offline.
     */
    public String generateOfflineAnalyticalResponse(String financialDataJson) {
        try {
            JsonNode data = objectMapper.readTree(financialDataJson);
            double receita = data.path("receitaTotal").asDouble(0);
            double despesa = data.path("despesaTotal").asDouble(0);
            double saldo = data.path("saldo").asDouble(0);
            double taxaPoupanca = data.path("taxaPoupancaPercentual").asDouble(0);

            String situacao;
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

            String prepStatus = saldo > 0 && taxaPoupanca >= 15
                    ? "PREPARADO"
                    : (saldo > 0 ? "PRECISA_DE_AJUSTES" : "PRIORIDADE_ORGANIZACAO");

            String topPriority = topCatPercent > 30 ? "ALTA" : "MEDIA";

            Map<String, Object> problem = new LinkedHashMap<>();
            problem.put("titulo", "Concentração de gastos em " + topCat);
            problem.put("descricao", String.format(Locale.ROOT,
                    "A categoria '%s' consome %.1f%% de todas as saídas registradas no período.", topCat, topCatPercent));
            problem.put("evidencias", List.of(
                    String.format(Locale.ROOT, "%s representa %.1f%% do total de despesas.", topCat, topCatPercent),
                    "Impacto direto sobre a margem de poupança líquida."
            ));
            problem.put("prioridade", topPriority);

            Map<String, Object> action1 = new LinkedHashMap<>();
            action1.put("acao", "Estabelecer um teto mensal específico para " + topCat);
            action1.put("motivo", "Evitar que essa categoria comprometa o saldo final e ampliar a capacidade de poupança.");
            action1.put("prioridade", "ALTA");

            Map<String, Object> action2 = new LinkedHashMap<>();
            action2.put("acao", "Manter acompanhamento semanal dos gastos variáveis");
            action2.put("motivo", "Garantir previsibilidade orçamentária ao longo de todo o ciclo mensal.");
            action2.put("prioridade", "MEDIA");

            List<Map<String, Object>> problemas = List.of(problem);
            List<Map<String, Object>> acoes = List.of(action1, action2);

            Map<String, Object> diagnostico = new LinkedHashMap<>();
            diagnostico.put("situacao", situacao);
            diagnostico.put("resumo", String.format(Locale.ROOT,
                    "Análise determinística estruturada: Receita de R$ %.2f, despesas de R$ %.2f e saldo final de R$ %.2f (taxa de poupança de %.1f%%). A categoria '%s' representa %.1f%% das despesas consolidadas.",
                    receita, despesa, saldo, taxaPoupanca, topCat, topCatPercent));
            diagnostico.put("problemas", problemas);
            diagnostico.put("acoes", acoes);

            Map<String, Object> preparacao = new LinkedHashMap<>();
            preparacao.put("status", prepStatus);
            preparacao.put("justificativa", String.format(Locale.ROOT,
                    "Com saldo de R$ %.2f e taxa de poupança de %.1f%%, o fluxo de caixa apresenta %s. Não há informações suficientes sobre reserva de emergência para avaliar esse aspecto.",
                    saldo,
                    taxaPoupanca,
                    "PREPARADO".equals(prepStatus)
                            ? "margem estável para aportes regulares"
                            : "necessidade de consolidação prévia antes de aportes maiores"));
            preparacao.put("avisoEducacional",
                    "Esta avaliação tem caráter estritamente educativo e organizacional. Não constitui aconselhamento, consultoria financeira ou recomendação de investimentos.");

            Map<String, Object> root = new LinkedHashMap<>();
            root.put("diagnostico", diagnostico);
            root.put("problemas", problemas);
            root.put("acoes", acoes);
            root.put("preparacaoInvestimento", preparacao);

            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            log.error("Erro no gerador analítico de contingência: {}", e.getMessage());
            return "{}";
        }
    }
}
