import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
  signOut as firebaseSignOut,
} from "firebase/auth";

const PaymentModal = ({ setPaymentModalOpen, userData, setSubscribed, setNotSubscribed }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    nameOnCard: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });
  const [showLearnMore, setShowLearnMore] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowLearnMore(false);
    setPaymentModalOpen(false);
    document.body.style.overflowY = "auto"; // Enable scrolling
  };

  const handleOutsideClick = (e) => {
    if (e.target.className === "modal-overlay") {
      handleCloseModal();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const toggleLearnMore = () => {
    setShowLearnMore(!showLearnMore);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      cardDetails.nameOnCard === "Elie Mitri" &&
      cardDetails.cardNumber === "1234 1234 1234 1234" &&
      cardDetails.cardExpiry === "09/27" &&
      cardDetails.cardCvc === "123"
    ) {
      alert("Payment processed successfully!");

      const userRef = doc(db, "users", userData.uid);

      updateDoc(userRef, {
        paid: true
      })

      setNotSubscribed(false)
      setSubscribed(true)
      
    } else {
      alert("Payment failed. Please check your card details and try again.");
    }

    handleCloseModal();
  };

  return (
    <div className="payment-container">
      <div className="modal-overlay" onClick={handleOutsideClick}>
        <div className="modal-container">
          <div className="modal-header row">
            <h3 className="modal-title">Payment Details</h3>
            <button className="close-button" onClick={handleCloseModal}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Payment Method</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={handlePaymentMethodChange}
                      className="radio-input"
                    />
                    <span style={{ marginLeft: "8px" }}>Credit Card</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      className="radio-input"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={handlePaymentMethodChange}
                    />
                    <span style={{ marginLeft: "8px" }}>PayPal</span>
                  </label>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div id="cardDetails">
                  <div className="form-group">
                    <label htmlFor="nameOnCard">Name on Card</label>
                    <input
                      type="text"
                      id="nameOnCard"
                      name="nameOnCard"
                      className="input-field"
                      placeholder="John Smith"
                      value={cardDetails.nameOnCard}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      className="input-field"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group card-row">
                    <div className="card-col">
                      <label htmlFor="cardExpiry">Expiration Date</label>
                      <input
                        type="text"
                        id="cardExpiry"
                        name="cardExpiry"
                        className="input-field"
                        placeholder="MM/YY"
                        value={cardDetails.cardExpiry}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="card-col">
                      <label htmlFor="cardCvc">CVC</label>
                      <input
                        type="text"
                        id="cardCvc"
                        name="cardCvc"
                        className="input-field"
                        placeholder="123"
                        value={cardDetails.cardCvc}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "paypal" && (
                <div className="paypal-message">
                  <p>
                    You will be redirected to PayPal to complete your payment
                    securely.
                  </p>
                </div>
              )}

              <button type="submit" className="submit-button">
                {paymentMethod === "card" ? "Pay Now" : "Continue to PayPal"}
              </button>
            </form>

            <a onClick={toggleLearnMore} className="learn-more-link">
              Learn more about payment security
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
