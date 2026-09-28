package com.cfi.finance.controller;

import com.cfi.finance.dto.ErrorResponseDTO;
import com.cfi.finance.dto.TransactionDTO;
import com.cfi.finance.exception.ResourceNotFoundException;
import com.cfi.finance.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@Tag(name = "Transações", description = "Endpoints para gerenciamento de receitas e despesas")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    @Operation(summary = "Listar todas as transações", description = "Retorna a lista completa de movimentações cadastradas.")
    @ApiResponse(responseCode = "200", description = "Lista de transações recuperada com sucesso")
    public ResponseEntity<List<TransactionDTO>> getAll() {
        return ResponseEntity.ok(transactionService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter transação por ID", description = "Recupera os detalhes de uma movimentação específica.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transação encontrada"),
            @ApiResponse(responseCode = "404", description = "Transação não encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class)))
    })
    public ResponseEntity<TransactionDTO> getById(@PathVariable String id) {
        return transactionService.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Transação com ID '" + id + "' não encontrada."));
    }

    @PostMapping
    @Operation(summary = "Criar nova transação", description = "Cadastra uma nova receita ou despesa no sistema.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Transação criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados da transação inválidos",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class)))
    })
    public ResponseEntity<TransactionDTO> create(@Valid @RequestBody TransactionDTO transaction) {
        TransactionDTO created = transactionService.create(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar transação", description = "Altera os dados de uma movimentação existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transação atualizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados de atualização inválidos",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Transação não encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class)))
    })
    public ResponseEntity<TransactionDTO> update(@PathVariable String id, @Valid @RequestBody TransactionDTO transaction) {
        TransactionDTO updated = transactionService.update(id, transaction);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir transação", description = "Remove definitivamente uma movimentação cadastrada.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Transação removida com sucesso"),
            @ApiResponse(responseCode = "404", description = "Transação não encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDTO.class)))
    })
    public ResponseEntity<Void> delete(@PathVariable String id) {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
