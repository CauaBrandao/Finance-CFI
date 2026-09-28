package com.cfi.finance.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Ação prática recomendada vinculada diretamente a um problema identificado")
public record ActionItemDTO(
        @Schema(description = "Ação prática a ser executada pelo usuário", example = "Estabelecer um teto semanal para refeições fora de casa")
        String acao,

        @Schema(description = "Justificativa da ação e benefício esperado", example = "Reduzir o impacto dessa categoria no orçamento mensal e aumentar a margem para poupança.")
        String motivo,

        @Schema(description = "Nível de prioridade da ação (ALTA, MEDIA, BAIXA)", example = "ALTA")
        String prioridade
) {}
