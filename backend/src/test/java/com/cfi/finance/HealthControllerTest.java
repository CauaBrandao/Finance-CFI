package com.cfi.finance;

import com.cfi.finance.config.GeminiConfig;
import com.cfi.finance.controller.HealthController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HealthController.class)
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GeminiConfig geminiConfig;

    @Test
    @DisplayName("GET /health deve retornar 200 UP sem expor segredos")
    void shouldReturnHealthUp() throws Exception {
        Mockito.when(geminiConfig.isApiKeyConfigured()).thenReturn(false);

        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("cfi-finance-backend"))
                .andExpect(jsonPath("$.aiConfigured").value(false));
    }
}
