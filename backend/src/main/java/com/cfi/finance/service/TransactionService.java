package com.cfi.finance.service;

import com.cfi.finance.dto.TransactionDTO;
import com.cfi.finance.exception.InvalidFinancialDataException;
import com.cfi.finance.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TransactionService {

    private final Map<String, TransactionDTO> transactionStore = new ConcurrentHashMap<>();

    public List<TransactionDTO> findAll() {
        return new ArrayList<>(transactionStore.values());
    }

    public Optional<TransactionDTO> findById(String id) {
        return Optional.ofNullable(transactionStore.get(id));
    }

    public TransactionDTO create(TransactionDTO dto) {
        if (dto == null) {
            throw new InvalidFinancialDataException("A transação não pode ser nula.");
        }
        String id = (dto.id() != null && !dto.id().trim().isEmpty())
                ? dto.id()
                : UUID.randomUUID().toString();

        TransactionDTO newTransaction = new TransactionDTO(
                id,
                dto.description(),
                dto.amount(),
                dto.type(),
                dto.category(),
                dto.date() != null ? dto.date() : java.time.LocalDate.now().toString()
        );

        transactionStore.put(id, newTransaction);
        return newTransaction;
    }

    public TransactionDTO update(String id, TransactionDTO dto) {
        if (!transactionStore.containsKey(id)) {
            throw new ResourceNotFoundException("Transação com ID '" + id + "' não encontrada para atualização.");
        }
        TransactionDTO updated = new TransactionDTO(
                id,
                dto.description(),
                dto.amount(),
                dto.type(),
                dto.category(),
                dto.date()
        );
        transactionStore.put(id, updated);
        return updated;
    }

    public void delete(String id) {
        if (!transactionStore.containsKey(id)) {
            throw new ResourceNotFoundException("Transação com ID '" + id + "' não encontrada para exclusão.");
        }
        transactionStore.remove(id);
    }
}
