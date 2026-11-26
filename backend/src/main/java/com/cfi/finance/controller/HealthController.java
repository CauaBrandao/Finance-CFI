package com.cfi.finance.controller;

import com.cfi.finance.config.GeminiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
@Tag(name = "Monitoramento", description = "Verificação de disponibilidade (health check) da API para ambientes de produção")
public class HealthController {

    private final GeminiConfig geminiConfig;

    public HealthController(GeminiConfig geminiConfig) {
        this.geminiConfig = geminiConfig;
    }

    @GetMapping
    @Operation(summary = "Health Check da API",
            description = "Retorna o status operacional do serviço e indica se a chave do provedor de IA está configurada (sem expor segredos).")
    @ApiResponse(responseCode = "200", description = "Serviço operacional")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        body.put("service", "cfi-finance-backend");
        body.put("aiConfigured", geminiConfig.isApiKeyConfigured());
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(body);
    }
}

