import React, { useState } from "react";
import { CreditCard, X, Check } from "lucide-react";

const PaymentModal = ({ isOpen, onClose, planDetails }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'error'

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStatus("success");

      setTimeout(() => {
        onClose();
        setPaymentStatus(null);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-container">
        <button className="payment-modal-close" onClick={onClose}>
          ×
        </button>

        {!paymentStatus && (
          <>
            <h2 className="payment-modal-title">
              Upgrade to {planDetails?.name || "Premium"}
            </h2>
            <p className="payment-modal-description">
              {planDetails?.description || "Unlock all features"}
            </p>

            <form className="payment-modal-form" onSubmit={handleSubmit}>
              <div className="payment-modal-form-group">
                <label className="payment-modal-label">Card Number</label>
                <input
                  type="text"
                  className="payment-modal-input"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="payment-modal-form-row">
                <div className="payment-modal-form-group">
                  <label className="payment-modal-label">MM/YY</label>
                  <input
                    type="text"
                    className="payment-modal-input"
                    placeholder="12/34"
                    required
                  />
                </div>
                <div className="payment-modal-form-group">
                  <label className="payment-modal-label">CVC</label>
                  <input
                    type="text"
                    className="payment-modal-input"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className="payment-modal-form-group">
                <label className="payment-modal-label">Name on Card</label>
                <input
                  type="text"
                  className="payment-modal-input"
                  placeholder="John Doe"
                  required
                />
              </div>

              <button
                type="submit"
                className="payment-modal-submit"
                disabled={isProcessing}
              >
                {isProcessing
                  ? "Processing..."
                  : `Pay ${planDetails?.price || "$9.99"}`}
              </button>
            </form>
          </>
        )}

        {paymentStatus === "success" && (
          <div className="payment-modal-success">
            <Check size={40} color="green" />
            <h3>Payment Successful!</h3>
            <p>Your account has been upgraded.</p>
          </div>
        )}

        {paymentStatus === "error" && (
          <div className="payment-modal-error">
            <X size={40} color="red" />
            <h3>Payment Failed</h3>
            <p>Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
