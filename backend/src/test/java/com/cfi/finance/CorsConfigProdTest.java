package com.cfi.finance;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("prod")
@TestPropertySource(properties = {
        "cors.allowed-origins=https://cfi-finance.vercel.app"
})
class CorsConfigProdTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Perfil prod deve bloquear origem localhost no CORS")
    void shouldRejectLocalhostInProd() throws Exception {
        mockMvc.perform(options("/transactions")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Perfil prod deve permitir apenas o domínio configurado em CORS_ALLOWED_ORIGINS")
    void shouldAllowConfiguredProdOrigin() throws Exception {
        mockMvc.perform(options("/transactions")
                        .header("Origin", "https://cfi-finance.vercel.app")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://cfi-finance.vercel.app"));
    }
}
