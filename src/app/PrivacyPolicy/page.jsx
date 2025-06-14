import React from "react";
import { ArrowLeft, Dumbbell, Instagram, Mail } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { FaRedditAlien } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa";

const PrivacyPage = () => {
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
          <h1 className="page-title">Privacy Policy</h1>
          <p className="effective-date">
            <strong>Effective Date:</strong> {today}
          </p>

          <p className="privacy-introduction">
            At <strong>TrainifAI</strong>, your privacy is important to us. This
            Privacy Policy explains how we collect, use, and protect your
            information when you use our services.
          </p>

          <section className="terms-section">
            <h2>1. Information We Collect</h2>
            <p>
              We collect several types of information to provide and improve our
              services:
            </p>
            <ul className="privacy-list">
              <li>
                <strong>Personal Information:</strong> Name, email, profile
                data.
              </li>
              <li>
                <strong>Health & Fitness Data:</strong> Weight, goals, workouts,
                meal preferences.
              </li>
              <li>
                <strong>Device & Usage Data:</strong> IP address, browser type,
                usage stats.
              </li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>2. How We Use Your Information</h2>
            <p>
              We use your data to deliver personalized fitness plans, optimize
              the app functionality, and communicate with you about your account
              and services.
            </p>
          </section>

          <section className="terms-section">
            <h2>3. Data Sharing</h2>
            <p>
              We don't sell your personal data. We only share it with trusted
              service providers and partners when necessary to provide our
              services.
            </p>
          </section>

          <section className="terms-section">
            <h2>4. Your Choices</h2>
            <p>
              You can edit or delete your data, opt out of marketing messages,
              or request full account deletion by contacting us at{" "}
              <a href="mailto:trainifai@gmail.com">trainifai@gmail.com</a>.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. Data Security</h2>
            <p>
              We implement encryption and security measures to protect your
              data, but no system is 100% secure. We continuously monitor and
              improve our security practices.
            </p>
          </section>

          <section className="terms-section">
            <h2>6. Children's Privacy</h2>
            <p>
              Our application is not intended for children under 13. We do not
              knowingly collect personal information from children under 13
              years of age.
            </p>
          </section>

          <section className="terms-section">
            <h2>7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We'll notify you
              of significant changes via email or in-app notifications.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. International Users</h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your own, where privacy laws may be different.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Contact Information</h2>
            <p>
              For inquiries regarding this Privacy Policy, please contact our
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
            <TermsModal
              isOpen={showTerms}
              onClose={() => setShowTerms(false)}
            /> */}

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
