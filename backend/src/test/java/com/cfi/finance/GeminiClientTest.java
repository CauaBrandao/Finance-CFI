package com.cfi.finance;

import com.cfi.finance.client.GeminiClient;
import com.cfi.finance.config.GeminiConfig;
import com.cfi.finance.exception.AiServiceUnavailableException;
import com.cfi.finance.exception.AiTimeoutException;
import com.cfi.finance.exception.RateLimitExceededException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.net.ConnectException;
import java.net.SocketTimeoutException;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class GeminiClientTest {

    private ObjectMapper objectMapper;
    private GeminiConfig geminiConfig;
    private RestClient.Builder restClientBuilder;
    private MockRestServiceServer mockServer;
    private GeminiClient geminiClient;

    private static final String SAMPLE_DATA_JSON = """
            {
              "receitaTotal": 4000.0,
              "despesaTotal": 3200.0,
              "saldo": 800.0,
              "taxaPoupancaPercentual": 20.0,
              "categoriasDespesa": [
                { "categoria": "Alimentação \\"Especial\\"", "percentualDasDespesas": 45.0 }
              ]
            }
            """;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        geminiConfig = new GeminiConfig();
        ReflectionTestUtils.setField(geminiConfig, "apiKey", "test-api-key-123");
        ReflectionTestUtils.setField(geminiConfig, "model", "gemini-3.5-flash");
        ReflectionTestUtils.setField(geminiConfig, "timeoutSeconds", 35);
        ReflectionTestUtils.setField(geminiConfig, "baseUrl", "https://generativelanguage.googleapis.com/v1beta/models");

        restClientBuilder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(restClientBuilder).build();
        geminiClient = new GeminiClient(restClientBuilder.build(), geminiConfig, objectMapper);
    }

    @Test
    @DisplayName("Deve usar motor determinístico offline quando GEMINI_API_KEY não estiver configurada")
    void shouldUseOfflineFallbackWhenApiKeyMissing() throws Exception {
        ReflectionTestUtils.setField(geminiConfig, "apiKey", "");

        String result = geminiClient.generateStructuredContent("system", SAMPLE_DATA_JSON);
        JsonNode root = objectMapper.readTree(result);

        assertEquals("BOM", root.path("diagnostico").path("situacao").asText());
        assertEquals("PREPARADO", root.path("preparacaoInvestimento").path("status").asText());
        assertTrue(root.path("problemas").isArray());
    }

    @Test
    @DisplayName("Deve enviar chave via header x-goog-api-key e extrair JSON da resposta do Gemini")
    void shouldSendKeyInHeaderAndExtractJson() {
        String geminiPayload = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          { "text": "```json\\n{\\"diagnostico\\":{\\"situacao\\":\\"BOM\\",\\"resumo\\":\\"Ok\\"},\\"preparacaoInvestimento\\":{\\"status\\":\\"PREPARADO\\",\\"justificativa\\":\\"Ok\\"}}\\n```" }
                        ]
                      }
                    }
                  ]
                }
                """;

        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("x-goog-api-key", "test-api-key-123"))
                .andExpect(content().string(containsString("DADOS_FINANCEIROS_DO_USUARIO")))
                .andRespond(withSuccess(geminiPayload, MediaType.APPLICATION_JSON));

        String result = geminiClient.generateStructuredContent("system prompt", SAMPLE_DATA_JSON);
        assertTrue(result.startsWith("{"));
        assertTrue(result.contains("\"BOM\""));
        mockServer.verify();
    }

    @Test
    @DisplayName("Deve lançar RateLimitExceededException quando Gemini retornar HTTP 429")
    void shouldThrowRateLimitOn429() {
        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"))
                .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));

        assertThrows(RateLimitExceededException.class,
                () -> geminiClient.generateStructuredContent("system", SAMPLE_DATA_JSON));
    }

    @Test
    @DisplayName("Deve lançar AiServiceUnavailableException quando Gemini retornar HTTP 503")
    void shouldThrowUnavailableOn503() {
        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        assertThrows(AiServiceUnavailableException.class,
                () -> geminiClient.generateStructuredContent("system", SAMPLE_DATA_JSON));
    }

    @Test
    @DisplayName("Deve lançar AiTimeoutException quando ocorrer SocketTimeoutException")
    void shouldThrowTimeoutOnSocketTimeout() {
        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"))
                .andRespond(request -> {
                    throw new ResourceAccessException("Read timed out", new SocketTimeoutException("Read timed out"));
                });

        assertThrows(AiTimeoutException.class,
                () -> geminiClient.generateStructuredContent("system", SAMPLE_DATA_JSON));
    }

    @Test
    @DisplayName("Deve lançar AiServiceUnavailableException quando ocorrer ConnectException")
    void shouldThrowUnavailableOnConnectException() {
        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"))
                .andRespond(request -> {
                    throw new ResourceAccessException("Connection refused", new ConnectException("Connection refused"));
                });

        assertThrows(AiServiceUnavailableException.class,
                () -> geminiClient.generateStructuredContent("system", SAMPLE_DATA_JSON));
    }
}
