package com.cfi.finance.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@Schema(description = "Representação de uma transação financeira")
public record TransactionDTO(
        @Schema(description = "Identificador único da transação", example = "tx_8f93a")
        String id,

        @NotBlank(message = "A descrição não pode estar em branco")
        @Size(max = 120, message = "A descrição não pode exceder 120 caracteres")
        @Schema(description = "Descrição detalhada do registro", example = "Supermercado Semanal")
        String description,

        @NotNull(message = "O valor é obrigatório")
        @DecimalMin(value = "0.01", message = "O valor deve ser de no mínimo R$ 0,01")
        @Schema(description = "Valor monetário em reais", example = "250.75")
        BigDecimal amount,

        @NotBlank(message = "O tipo é obrigatório (income ou expense)")
        @Pattern(regexp = "^(income|expense)$", message = "O tipo deve ser 'income' ou 'expense'")
        @Schema(description = "Tipo de movimentação: income (entrada) ou expense (saída)", example = "expense")
        String type,

        @NotBlank(message = "A categoria é obrigatória")
        @Size(max = 40, message = "A categoria não pode exceder 40 caracteres")
        @Schema(description = "Chave da categoria", example = "food")
        String category,

        @Schema(description = "Data da movimentação em formato ISO", example = "2026-09-28")
        String date
) {
    @JsonCreator
    public static TransactionDTO of(
            @JsonProperty("id") String id,
            @JsonProperty("description") String description,
            @JsonProperty("descricao") String descricao,
            @JsonProperty("amount") BigDecimal amount,
            @JsonProperty("valor") BigDecimal valor,
            @JsonProperty("type") String type,
            @JsonProperty("tipo") String tipo,
            @JsonProperty("category") String category,
            @JsonProperty("categoria") String categoria,
            @JsonProperty("date") String date,
            @JsonProperty("data") String data
    ) {
        String finalDesc = (description != null && !description.isBlank()) ? description : descricao;
        BigDecimal finalAmount = (amount != null) ? amount : valor;
        String finalType = (type != null && !type.isBlank()) ? type : tipo;
        String finalCategory = (category != null && !category.isBlank()) ? category : categoria;
        String finalDate = (date != null && !date.isBlank()) ? date : data;

        return new TransactionDTO(id, finalDesc, finalAmount, finalType, finalCategory, finalDate);
    }
}
