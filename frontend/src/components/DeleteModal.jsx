import React from 'react';

export const DeleteModal = ({ isOpen, transactionDescription, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" id="deleteModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div className="modal-box">
        <div className="modal-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h3 id="modalTitle">Confirmar Exclusão</h3>
        <p id="deleteModalText">
          Deseja realmente excluir {transactionDescription ? `"${transactionDescription}"` : 'esta transação'}?
        </p>
        <div className="modal-actions">
          <button className="btn-secondary" id="cancelDeleteBtn" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn-danger" id="confirmDeleteBtn" onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};
