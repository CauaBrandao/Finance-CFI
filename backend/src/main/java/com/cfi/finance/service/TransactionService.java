package com.cfi.finance.service;

import com.cfi.finance.dto.TransactionDTO;
import com.cfi.finance.exception.InvalidFinancialDataException;
import com.cfi.finance.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TransactionService {

    private final Map<String, TransactionDTO> transactionStore = Collections.synchronizedMap(new LinkedHashMap<>());

    public List<TransactionDTO> findAll() {
        synchronized (transactionStore) {
            return new ArrayList<>(transactionStore.values());
        }
    }

    public Optional<TransactionDTO> findById(String id) {
        return Optional.ofNullable(transactionStore.get(id));
    }

    public TransactionDTO create(TransactionDTO dto) {
        if (dto == null) {
            throw new InvalidFinancialDataException("A transação não pode ser nula.");
        }
        String id = (dto.id() != null && !dto.id().trim().isEmpty())
                ? dto.id().trim()
                : UUID.randomUUID().toString();

        String normalizedDate = (dto.date() != null && !dto.date().isBlank())
                ? dto.date().trim()
                : java.time.LocalDate.now().toString();

        TransactionDTO newTransaction = new TransactionDTO(
                id,
                dto.description().trim(),
                dto.amount(),
                dto.type().trim(),
                dto.category().trim(),
                normalizedDate
        );

        transactionStore.put(id, newTransaction);
        return newTransaction;
    }

    public TransactionDTO update(String id, TransactionDTO dto) {
        synchronized (transactionStore) {
            TransactionDTO existing = transactionStore.get(id);
            if (existing == null) {
                throw new ResourceNotFoundException("Transação com ID '" + id + "' não encontrada para atualização.");
            }
            String normalizedDate = (dto.date() != null && !dto.date().isBlank())
                    ? dto.date().trim()
                    : existing.date();

            TransactionDTO updated = new TransactionDTO(
                    id,
                    dto.description().trim(),
                    dto.amount(),
                    dto.type().trim(),
                    dto.category().trim(),
                    normalizedDate
            );
            transactionStore.put(id, updated);
            return updated;
        }
    }

    public void delete(String id) {
        if (!transactionStore.containsKey(id)) {
            throw new ResourceNotFoundException("Transação com ID '" + id + "' não encontrada para exclusão.");
        }
        transactionStore.remove(id);
    }
}
