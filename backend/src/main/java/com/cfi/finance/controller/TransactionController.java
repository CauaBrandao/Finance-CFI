package com.cfi.finance.controller;

import com.cfi.finance.dto.ErrorResponseDTO;
import com.cfi.finance.dto.TransactionDTO;
import com.cfi.finance.exception.ResourceNotFoundException;
import com.cfi.finance.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
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
@Tag(name = "Transações", description = "Operações CRUD para gerenciamento de movimentações financeiras (receitas e despesas)")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    @Operation(summary = "Listar todas as transações",
            description = "Retorna a lista completa de movimentações financeiras cadastradas no sistema.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de transações recuperada com sucesso",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = TransactionDTO.class)),
                            examples = @ExampleObject(name = "Exemplo de Lista", value = """
                                    [
                                      {
                                        "id": "tx_1a2b3c",
                                        "description": "Salário Mensal",
                                        "amount": 3500.00,
                                        "type": "income",
                                        "category": "salary",
                                        "date": "2026-09-01"
                                      },
                                      {
                                        "id": "tx_4d5e6f",
                                        "description": "Supermercado Semanal",
                                        "amount": 250.75,
                                        "type": "expense",
                                        "category": "food",
                                        "date": "2026-09-05"
                                      }
                                    ]
                                    """)))
    })
    public ResponseEntity<List<TransactionDTO>> getAll() {
        return ResponseEntity.ok(transactionService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter transação por ID",
            description = "Recupera os detalhes de uma movimentação financeira específica a partir do seu identificador único.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transação encontrada com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = TransactionDTO.class),
                            examples = @ExampleObject(name = "Transação Encontrada", value = """
                                    {
                                      "id": "tx_4d5e6f",
                                      "description": "Supermercado Semanal",
                                      "amount": 250.75,
                                      "type": "expense",
                                      "category": "food",
                                      "date": "2026-09-05"
                                    }
                                    """))),
            @ApiResponse(responseCode = "404", description = "Transação não encontrada",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponseDTO.class),
                            examples = @ExampleObject(name = "Erro 404", value = """
                                    {
                                      "status": 404,
                                      "error": "RESOURCE_NOT_FOUND",
                                      "message": "Transação com ID 'tx_inexistente' não encontrada.",
                                      "path": "/api/transactions/tx_inexistente",
                                      "timestamp": "2026-09-29T14:30:00"
                                    }
                                    """)))
    })
    public ResponseEntity<TransactionDTO> getById(
            @Parameter(description = "Identificador único da transação", example = "tx_4d5e6f", required = true)
            @PathVariable String id) {
        return transactionService.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Transação com ID '" + id + "' não encontrada."));
    }

    @PostMapping
    @Operation(summary = "Criar nova transação",
            description = "Cadastra uma nova receita ou despesa no sistema. Caso o ID não seja informado, um identificador UUID será gerado automaticamente.")
    @RequestBody(description = "Dados da transação a ser cadastrada", required = true,
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = TransactionDTO.class),
                    examples = {
                            @ExampleObject(name = "Exemplo Despesa", value = """
                                    {
                                      "description": "Supermercado Semanal",
                                      "amount": 250.75,
                                      "type": "expense",
                                      "category": "food",
                                      "date": "2026-09-28"
                                    }
                                    """),
                            @ExampleObject(name = "Exemplo Receita", value = """
                                    {
                                      "description": "Rendimento Freelance",
                                      "amount": 1200.00,
                                      "type": "income",
                                      "category": "services",
                                      "date": "2026-09-15"
                                    }
                                    """)
                    }))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Transação criada com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = TransactionDTO.class),
                            examples = @ExampleObject(name = "Transação Criada", value = """
                                    {
                                      "id": "tx_9c8b7a",
                                      "description": "Supermercado Semanal",
                                      "amount": 250.75,
                                      "type": "expense",
                                      "category": "food",
                                      "date": "2026-09-28"
                                    }
                                    """))),
            @ApiResponse(responseCode = "400", description = "Dados da transação inválidos ou campos obrigatórios ausentes",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponseDTO.class),
                            examples = @ExampleObject(name = "Erro de Validação", value = """
                                    {
                                      "status": 400,
                                      "error": "VALIDATION_FAILED",
                                      "message": "Os dados da requisição contêm campos inválidos ou obrigatórios ausentes.",
                                      "details": [
                                        "A descrição não pode estar em branco",
                                        "O tipo deve ser 'income' ou 'expense'",
                                        "O valor deve ser de no mínimo R$ 0,01"
                                      ],
                                      "path": "/api/transactions",
                                      "timestamp": "2026-09-29T14:30:00"
                                    }
                                    """)))
    })
    public ResponseEntity<TransactionDTO> create(@Valid @org.springframework.web.bind.annotation.RequestBody TransactionDTO transaction) {
        TransactionDTO created = transactionService.create(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar transação existente",
            description = "Altera os dados de uma movimentação previamente cadastrada.")
    @RequestBody(description = "Novos dados da transação para substituição", required = true,
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = TransactionDTO.class),
                    examples = @ExampleObject(name = "Atualização de Valor", value = """
                            {
                              "description": "Supermercado Semanal com Desconto",
                              "amount": 210.50,
                              "type": "expense",
                              "category": "food",
                              "date": "2026-09-28"
                            }
                            """)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transação atualizada com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = TransactionDTO.class),
                            examples = @ExampleObject(name = "Transação Atualizada", value = """
                                    {
                                      "id": "tx_4d5e6f",
                                      "description": "Supermercado Semanal com Desconto",
                                      "amount": 210.50,
                                      "type": "expense",
                                      "category": "food",
                                      "date": "2026-09-28"
                                    }
                                    """))),
            @ApiResponse(responseCode = "400", description = "Dados de atualização inválidos",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponseDTO.class),
                            examples = @ExampleObject(name = "Erro 400", value = """
                                    {
                                      "status": 400,
                                      "error": "VALIDATION_FAILED",
                                      "message": "Os dados da requisição contêm campos inválidos ou obrigatórios ausentes.",
                                      "details": ["O valor deve ser de no mínimo R$ 0,01"],
                                      "path": "/api/transactions/tx_4d5e6f",
                                      "timestamp": "2026-09-29T14:30:00"
                                    }
                                    """))),
            @ApiResponse(responseCode = "404", description = "Transação não encontrada para atualização",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponseDTO.class),
                            examples = @ExampleObject(name = "Erro 404", value = """
                                    {
                                      "status": 404,
                                      "error": "RESOURCE_NOT_FOUND",
                                      "message": "Transação com ID 'tx_4d5e6f' não encontrada para atualização.",
                                      "path": "/api/transactions/tx_4d5e6f",
                                      "timestamp": "2026-09-29T14:30:00"
                                    }
                                    """)))
    })
    public ResponseEntity<TransactionDTO> update(
            @Parameter(description = "Identificador da transação a ser atualizada", example = "tx_4d5e6f", required = true)
            @PathVariable String id,
            @Valid @org.springframework.web.bind.annotation.RequestBody TransactionDTO transaction) {
        TransactionDTO updated = transactionService.update(id, transaction);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir transação",
            description = "Remove definitivamente uma movimentação cadastrada pelo seu identificador único.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Transação removida com sucesso (sem conteúdo no corpo)"),
            @ApiResponse(responseCode = "404", description = "Transação não encontrada para exclusão",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponseDTO.class),
                            examples = @ExampleObject(name = "Erro 404", value = """
                                    {
                                      "status": 404,
                                      "error": "RESOURCE_NOT_FOUND",
                                      "message": "Transação com ID 'tx_inexistente' não encontrada para exclusão.",
                                      "path": "/api/transactions/tx_inexistente",
                                      "timestamp": "2026-09-29T14:30:00"
                                    }
                                    """)))
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "Identificador da transação a ser excluída", example = "tx_4d5e6f", required = true)
            @PathVariable String id) {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
