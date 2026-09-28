package com.cfi.finance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Problema ou ponto de atenção detectado com evidências empíricas")
public record ProblemDTO(
        @Schema(description = "Título descritivo do problema", example = "Concentração excessiva em Alimentação")
        String titulo,

        @Schema(description = "Explicação detalhada do padrão detectado", example = "Os gastos com alimentação representam mais de 25% da receita líquida do mês.")
        String descricao,

        @Schema(description = "Evidências comprovadas exclusivamente a partir dos dados do usuário", example = "[\"Alimentação totalizou R$ 920,00 (26,3% da receita)\", \"Foram 14 pedidos em restaurantes/delivery\"]")
        List<String> evidencias,

        @Schema(description = "Nível de prioridade de intervenção (ALTA, MEDIA, BAIXA)", example = "ALTA")
        String prioridade
) {}
