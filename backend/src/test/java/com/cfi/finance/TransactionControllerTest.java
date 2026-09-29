package com.cfi.finance;

import com.cfi.finance.controller.TransactionController;
import com.cfi.finance.dto.TransactionDTO;
import com.cfi.finance.exception.ResourceNotFoundException;
import com.cfi.finance.service.TransactionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransactionService transactionService;

    @Test
    @DisplayName("GET /transactions deve retornar 200 OK com lista de transações")
    void shouldReturn200ForGetAll() throws Exception {
        TransactionDTO tx = new TransactionDTO("tx_1", "Salário", BigDecimal.valueOf(3500), "income", "salary", "2026-09-01");
        Mockito.when(transactionService.findAll()).thenReturn(List.of(tx));

        mockMvc.perform(get("/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("tx_1"))
                .andExpect(jsonPath("$[0].description").value("Salário"));
    }

    @Test
    @DisplayName("GET /transactions/{id} existente deve retornar 200 OK")
    void shouldReturn200ForGetById() throws Exception {
        TransactionDTO tx = new TransactionDTO("tx_1", "Salário", BigDecimal.valueOf(3500), "income", "salary", "2026-09-01");
        Mockito.when(transactionService.findById("tx_1")).thenReturn(Optional.of(tx));

        mockMvc.perform(get("/transactions/tx_1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("tx_1"))
                .andExpect(jsonPath("$.amount").value(3500));
    }

    @Test
    @DisplayName("GET /transactions/{id} inexistente deve retornar 404 Not Found")
    void shouldReturn404ForGetByIdNotFound() throws Exception {
        Mockito.when(transactionService.findById("inexistente")).thenReturn(Optional.empty());

        mockMvc.perform(get("/transactions/inexistente"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("POST /transactions com dados válidos deve retornar 201 Created")
    void shouldReturn201ForCreate() throws Exception {
        TransactionDTO tx = new TransactionDTO(null, "Supermercado", BigDecimal.valueOf(150.00), "expense", "food", "2026-09-28");
        TransactionDTO created = new TransactionDTO("tx_123", "Supermercado", BigDecimal.valueOf(150.00), "expense", "food", "2026-09-28");

        Mockito.when(transactionService.create(any(TransactionDTO.class))).thenReturn(created);

        mockMvc.perform(post("/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tx)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("tx_123"))
                .andExpect(jsonPath("$.description").value("Supermercado"));
    }

    @Test
    @DisplayName("POST /transactions com dados inválidos (sem descrição e valor zero) deve retornar 400 Bad Request")
    void shouldReturn400ForInvalidCreate() throws Exception {
        String invalidJson = """
                {
                  "description": "",
                  "amount": 0.00,
                  "type": "invalid_type",
                  "category": ""
                }
                """;

        mockMvc.perform(post("/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    @DisplayName("PUT /transactions/{id} existente deve retornar 200 OK")
    void shouldReturn200ForUpdate() throws Exception {
        TransactionDTO updateReq = new TransactionDTO(null, "Supermercado Atualizado", BigDecimal.valueOf(180.00), "expense", "food", "2026-09-28");
        TransactionDTO updated = new TransactionDTO("tx_1", "Supermercado Atualizado", BigDecimal.valueOf(180.00), "expense", "food", "2026-09-28");

        Mockito.when(transactionService.update(eq("tx_1"), any(TransactionDTO.class))).thenReturn(updated);

        mockMvc.perform(put("/transactions/tx_1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Supermercado Atualizado"));
    }

    @Test
    @DisplayName("PUT /transactions/{id} inexistente deve retornar 404 Not Found")
    void shouldReturn404ForUpdateNotFound() throws Exception {
        TransactionDTO updateReq = new TransactionDTO(null, "Supermercado", BigDecimal.valueOf(180.00), "expense", "food", "2026-09-28");

        Mockito.when(transactionService.update(eq("inexistente"), any(TransactionDTO.class)))
                .thenThrow(new ResourceNotFoundException("Transação com ID 'inexistente' não encontrada para atualização."));

        mockMvc.perform(put("/transactions/inexistente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("DELETE /transactions/{id} deve retornar 204 No Content")
    void shouldReturn204ForDelete() throws Exception {
        Mockito.doNothing().when(transactionService).delete("tx_1");

        mockMvc.perform(delete("/transactions/tx_1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /transactions/{id} inexistente deve retornar 404 Not Found")
    void shouldReturn404ForDeleteNotFound() throws Exception {
        Mockito.doThrow(new ResourceNotFoundException("Transação com ID 'inexistente' não encontrada para exclusão."))
                .when(transactionService).delete("inexistente");

        mockMvc.perform(delete("/transactions/inexistente"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("RESOURCE_NOT_FOUND"));
    }
}
