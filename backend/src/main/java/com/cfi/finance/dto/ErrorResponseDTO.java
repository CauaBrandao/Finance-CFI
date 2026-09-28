package com.cfi.finance.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Estrutura padrão de resposta para erros da API")
public record ErrorResponseDTO(
        @Schema(description = "Código HTTP do erro", example = "400")
        int status,

        @Schema(description = "Identificador semântico do erro", example = "INVALID_REQUEST")
        String error,

        @Schema(description = "Mensagem amigável explicativa", example = "Os dados financeiros enviados são inválidos.")
        String message,

        @Schema(description = "Lista opcional de erros detalhados de validação")
        List<String> details,

        @Schema(description = "Caminho da requisição", example = "/api/financial-analysis/full")
        String path,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Data e hora do registro do erro", example = "2026-09-28T14:30:00")
        LocalDateTime timestamp
) {
    public ErrorResponseDTO(int status, String error, String message, String path) {
        this(status, error, message, null, path, LocalDateTime.now());
    }

    public ErrorResponseDTO(int status, String error, String message, List<String> details, String path) {
        this(status, error, message, details, path, LocalDateTime.now());
    }
}
