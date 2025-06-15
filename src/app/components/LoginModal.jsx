import React, { useState } from "react";
import {
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function AuthModal({ isOpen, onClose, onLogin, onSignup }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Name validation for signup
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Confirm password for signup
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const userEmail = useRef(null);
  const userPassword = useRef(null);
  const userName = useRef(null);
  const [notification, setNotification] = useState({
    visible: false,
    type: "info",
    message: "",
  });

  const showNotification = (message, type = "info") => {
    setNotification({
      visible: true,
      type,
      message,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  async function login(e) {
    e.preventDefault();
    if (loading) return;

    const email = userEmail.current?.value?.trim();
    const password = userPassword.current?.value;

    if (!email || !password) {
      showNotification("Please enter both email and password.", "error");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        showNotification("User record not found in database.", "error");
        return;
      }

      await updateDoc(userRef, { lastLogin: serverTimestamp() });

      const userData = userSnap.data();
      setSubscribed(userData.paid || false);
      setNotSubscribed(!userData.paid);

      onClose(); // Close modal
    } catch (error) {
      let message = "Login failed. Please try again.";

      switch (error.code) {
        case "auth/user-not-found":
          message = "No account found with this email.";
          break;
        case "auth/wrong-password":
          message = "Password is incorrect. Please try again.";
          break;
        case "auth/invalid-email":
          message = "The email address format is invalid.";
          break;
        case "auth/too-many-requests":
          message = "Too many login attempts. Try again later.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Please check your internet connection.";
          break;
      }

      showNotification(message, "error");
    } finally {
      setLoading(false);
      document.body.style.overflowY = "auto";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    const email = userEmail.current?.value;
    const password = userPassword.current?.value;
    const displayName = userName.current?.value;

    if (!email || !password || !displayName) {
      showNotification("Please fill in all fields.", "error");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        date: serverTimestamp(),
        paid: false,
      });

      onClose(); // Close modal
    } catch (error) {
      let message = "An unexpected error occurred.";

      switch (error.code) {
        case "auth/email-already-in-use":
          message = "This email is already registered.";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          message = "Password should be at least 6 characters.";
          break;
        case "auth/missing-password":
          message = "Please enter a password.";
          break;
        case "auth/internal-error":
          message = "Something went wrong. Please try again.";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Try again later.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Check your connection.";
          break;
      }

      showNotification(message, "error");
    } finally {
      setLoading(false);
      document.body.style.overflowY = "auto";
    }
  }

  function closeModal() {
    onClose(); // Make sure it's spelled the same as the prop

    // Restore scroll behavior
    document.body.style.overflow = "auto";
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="auth-modal__close" onClick={onClose}>
          <X className="auth-modal__close-icon" />
        </button>

        {/* Header */}
        <div className="auth-modal__header">
          <div className="auth-modal__logo">
            <div className="auth-modal__logo-icon">
              <User />
            </div>
          </div>
          <h2 className="auth-modal__title">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="auth-modal__subtitle">
            {isLogin
              ? "Sign in to continue your fitness journey"
              : "Join thousands achieving their fitness goals"}
          </p>
        </div>

        {/* Form */}
        <form className="auth-modal__form" onSubmit={handleSubmit}>
          {/* Name Field (Signup only) */}
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="form-input-wrapper">
                <User className="form-input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-input ${
                    errors.name ? "form-input--error" : ""
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrapper">
              <Mail className="form-input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${
                  errors.email ? "form-input--error" : ""
                }`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${
                  errors.password ? "form-input--error" : ""
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="form-input-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password (Signup only) */}
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-input ${
                    errors.confirmPassword ? "form-input--error" : ""
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <span className="form-error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="form-error form-error--submit">{errors.submit}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="auth-modal__submit"
          >
            {loading ? (
              <>
                <Loader2 className="auth-modal__submit-spinner" />
                <span>{isLogin ? "Signing In..." : "Creating Account..."}</span>
              </>
            ) : (
              <>
                <span>{isLogin ? "Sign In" : "Create Account"}</span>
                <ArrowRight className="auth-modal__submit-icon" />
              </>
            )}
          </button>

          {/* Forgot Password (Login only) */}
          {isLogin && (
            <button type="button" className="auth-modal__forgot">
              Forgot your password?
            </button>
          )}
        </form>

        {/* Switch Mode */}
        <div className="auth-modal__switch">
          <span className="auth-modal__switch-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            type="button"
            className="auth-modal__switch-button"
            onClick={switchMode}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>

        {/* Terms (Signup only) */}
        {!isLogin && (
          <p className="auth-modal__terms">
            By creating an account, you agree to our{" "}
            <a href="#" className="auth-modal__terms-link">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="auth-modal__terms-link">
              Privacy Policy
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
