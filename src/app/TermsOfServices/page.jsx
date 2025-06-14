"use client";

import React from "react";
import { useState } from "react";
import { ArrowLeft, Dumbbell, Instagram, Mail } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
// import PrivacyModal from "../components/PrivacyModal";
// import TermsModal from "../components/TermsModal";
import { FaXTwitter } from "react-icons/fa6";
import { FaRedditAlien } from "react-icons/fa";

const PrivacyPage = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="page-container">
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">
            <a href="/">
              <ArrowLeft className="nav-logo" />
            </a>
            <Dumbbell className="nav-logo" />
            <span className="nav-title">TrainifAI</span>
          </div>
        </div>
      </nav>

      <div className="content-wrapper">
        <main className="main-content-privacy">
          <h1 className="page-title">Terms of Service</h1>
          <p className="effective-date">
            <strong>Effective Date:</strong> {today}
          </p>

          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the TrainifAI platform and services, you
              acknowledge that you have read, understood, and agree to be bound
              by these Terms of Service and our Privacy Policy.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Use of the Platform</h2>
            <p>
              TrainifAI is intended for personal fitness purposes only. Users
              are prohibited from misusing, exploiting, or attempting to gain
              unauthorized access to any aspect of the platform.
            </p>
          </section>

          <section className="terms-section">
            <h2>3. User Content</h2>
            <p>
              You retain ownership of any content you submit to TrainifAI. We
              utilize this content solely for the purpose of providing and
              improving our services to you.
            </p>
          </section>

          <section className="terms-section">
            <h2>4. Subscriptions & Billing</h2>
            <p>
              Premium subscription plans automatically renew unless explicitly
              cancelled by the user through their account settings or respective
              application store. Terms of payment are outlined in detail in our
              subscription agreement.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. Health Disclaimer</h2>
            <p>
              TrainifAI provides general fitness guidance and is not a
              substitute for professional medical advice, diagnosis, or
              treatment. Users are strongly advised to consult with qualified
              healthcare professionals before beginning any fitness program or
              making health-related decisions.
            </p>
          </section>

          <section className="terms-section">
            <h2>6. Account Termination</h2>
            <p>
              TrainifAI reserves the right to suspend or terminate accounts that
              violate these Terms of Service, at our sole discretion and without
              prior notice.
            </p>
          </section>

          <section className="terms-section">
            <h2>7. Limitation of Liability</h2>
            <p>
              Use of TrainifAI is at the user's own risk. TrainifAI and its
              parent company shall not be liable for any injuries, losses, or
              damages arising from the use of our platform or services.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in
              accordance with the laws of the user's region or jurisdiction,
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Contact Information</h2>
            <p>
              For inquiries regarding these Terms of Service, please contact our
              support team at:{" "}
              <a href="mailto:trainifai@gmail.com">trainifai@gmail.com</a>
            </p>
          </section>
        </main>
      </div>
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-section">
            <div className="footer-logo">TrainifAI</div>
            <div className="footer-text">
              © {new Date().getFullYear()} TrainifAI. All rights reserved.
            </div>
          </div>

          {/* <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="/workoutPlan">Workouts</a>
              </li>
              <li>
                <a href="/mealPlan">Meal Plans</a>
              </li>
            </ul>
          </div> */}

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li>
                <a href="/FAQ">FAQ</a>
              </li>
              {/* <li>
                <a href="/contact">Contact</a>
              </li> */}
              <li>
                <a href="/TermsOfServices">Terms of Service</a>
              </li>
              <li>
                <a href="/PrivacyPolicy">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* <PrivacyModal
            isOpen={showPrivacy}
            onClose={() => setShowPrivacy(false)}
          />
          <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} /> */}

          <div className="footer-section">
            <h4>Stay Connected</h4>
            <div className="social-icons">
              <a
                href="https://instagram.com/trainif.ai"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="tiktokLogo" />
              </a>
              <a
                href="https://tiktok.com/trainif.ai"
                target="_blank"
                rel="noreferrer"
              >
                <FaTiktok className="tiktokLogo" />
              </a>
              <a
                href="https://instagram.com/trainif.ai"
                target="_blank"
                rel="noreferrer"
              >
                <FaXTwitter className="tiktokLogo" />
              </a>
              <a
                href="https://www.reddit.com/user/TrainifAI/"
                target="_blank"
                rel="noreferrer"
              >
                <FaRedditAlien className="tiktokLogo" />
              </a>
              <a href="mailto:trainifai@gmail.com.com">
                <Mail className="mail tiktokLogo" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;
