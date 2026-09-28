package com.cfi.finance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Resposta contendo o Plano de Ação estruturado")
public record ActionPlanResponseDTO(
        @Schema(description = "Lista ordenada de ações recomendadas")
        List<ActionItemDTO> acoes,

        @Schema(description = "Orientação executiva geral", example = "Priorize as ações de prioridade ALTA na primeira quinzena para estabilizar a curva de despesas.")
        String orientacaoGeral
) {}
