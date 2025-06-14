import React, { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

const Notification = ({
  type = "info",
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 4000,
}) => {
  useEffect(() => {
    let timer;
    if (isVisible && autoClose) {
      timer = setTimeout(() => {
        handleClose();
      }, duration);
    }
    return () => clearTimeout(timer);
  }, [isVisible, autoClose, duration]);

  const handleClose = () => {
    const notificationElement = document.querySelector(".notification");
    if (notificationElement) {
      notificationElement.classList.add("notification-exit");
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={18} className="notification-icon" />;
      case "error":
        return <AlertCircle size={18} className="notification-icon" />;
      case "warning":
        return <AlertTriangle size={18} className="notification-icon" />;
      default:
        return <AlertCircle size={18} className="notification-icon" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        {getIcon()}
        <p className="notification-message">{message}</p>
      </div>
      <button className="notification-close" onClick={handleClose}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Notification;
