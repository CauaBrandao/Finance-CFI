package com.cfi.finance.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cfiFinanceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CFI Finance — Inteligência Financeira Pessoal API")
                        .description("API REST com integração determinística e contextual com Google Gemini. " +
                                "Categoria: Classificação / Análise Financeira. Desenvolvido para controle de finanças, " +
                                "diagnóstico de orçamento, identificação de problemas, plano de ação e maturidade para investimentos.")
                        .version("2.0.0")
                        .contact(new Contact()
                                .name("Cauã, Fernando & Igor — CFI Finance Team")
                                .email("cfi-finance@academic.local"))
                        .license(new License().name("MIT License")))
                .servers(List.of(
                        new Server().url("/api").description("Servidor Local Spring Boot REST API")
                ));
    }
}
