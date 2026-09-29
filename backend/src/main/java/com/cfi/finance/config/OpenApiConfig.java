package com.cfi.finance.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cfiFinanceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CFI Finance — API de Inteligência Financeira Pessoal")
                        .description("""
                                ### Sobre o CFI Finance
                                O **CFI Finance** é uma API REST desenvolvida em Spring Boot 3 para gestão orçamentária pessoal e análise financeira orientada a dados, integrada à Inteligência Artificial Generativa **Google Gemini**.
                                
                                ### Categoria Acadêmica
                                **Classificação / Análise Financeira**: A API não atua como chatbot genérico; ela processa métricas orçamentárias reais, classifica a situação orçamentária em níveis objetivos (`EXCELENTE`, `ESTAVEL`, `BOM`, `ATENCAO`, `CRITICO`) e avalia a preparação para investimentos (`PREPARADO`, `PRECISA_DE_AJUSTES`, `PRIORIDADE_ORGANIZACAO`).
                                
                                ### Separação de Responsabilidades
                                1. **Motor Determinístico (Spring Boot):** Realiza todos os cálculos matemáticos exatos (totais de receitas/despesas, saldo, taxa de poupança, comprometimento de renda, médias diárias e distribuição por categorias).
                                2. **Motor Analítico (Google Gemini):** Atua estritamente na identificação de desvios orçamentários com evidências empíricas, elaboração de planos de ação priorizados e diagnóstico de maturidade para investir.
                                
                                ### Resiliência e Códigos HTTP
                                A API conta com tratamento global de exceções padronizado (`ErrorResponseDTO`), suportando os códigos:
                                * `200 OK` / `201 Created` / `204 No Content`: Operações bem-sucedidas.
                                * `400 Bad Request`: Validação de entrada ou payload malformado.
                                * `404 Not Found`: Transação não localizada por ID.
                                * `429 Too Many Requests`: Limite de taxa (Rate Limit) do provedor Google Gemini excedido.
                                * `503 Service Unavailable`: Serviço do Google Gemini temporariamente indisponível.
                                * `504 Gateway Timeout`: Tempo limite na comunicação com o provedor de IA excedido.
                                * `500 Internal Server Error`: Erro interno inesperado tratado sem vazamento de dados sensíveis.
                                """)
                        .version("2.0.0")
                        .contact(new Contact()
                                .name("Cauã Brandão, Fernando & Igor Aldivan — CFI Finance Team")
                                .email("cfi-finance@academic.local"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("/api").description("Servidor Local Spring Boot REST API (Context-Path: /api)")
                ))
                .tags(List.of(
                        new Tag().name("Transações")
                                .description("Operações CRUD para gerenciamento de movimentações financeiras (receitas e despesas)"),
                        new Tag().name("Inteligência Financeira")
                                .description("Endpoints analíticos para diagnóstico financeiro, detecção de problemas com evidências e plano de ação estruturado"),
                        new Tag().name("Investimentos & Preparação")
                                .description("Avaliação educacional da maturidade e estabilidade do fluxo de caixa para iniciar ou expandir investimentos")
                ));
    }
}
