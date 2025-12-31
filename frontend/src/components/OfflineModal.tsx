import React from 'react';
import './OfflineModal.css';

interface OfflineModalProps {
  amount: number;
  onClose: () => void;
}

const OfflineModal: React.FC<OfflineModalProps> = ({ amount, onClose }) => {
  if (amount <= 0) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-icon">⛏️</div>
        <h2 className="modal-title">С возвращением!</h2>
        <p className="modal-text">
          Пока тебя не было, твои шахты работали на полную мощность:
        </p>
        <div className="modal-amount">
          <span>+{amount}</span>
          <span style={{ fontSize: '1.8rem' }}>💰</span>
        </div>
        <button className="modal-button" onClick={onClose}>
          ЗАБРАТЬ МОНЕТЫ
        </button>
      </div>
    </div>
  );
};

export default OfflineModal;