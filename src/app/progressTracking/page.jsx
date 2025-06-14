"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { Line } from "react-chartjs-2";
import { FaTiktok } from "react-icons/fa";
import { Instagram, Mail } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { FaRedditAlien } from "react-icons/fa";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { collection, doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Page() {
  const [lineData, setLineData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const clientWeightRef = collection(
      db,
      "weightProgress",
      user.uid,
      "clientWeight"
    );

    const unsubscribe = onSnapshot(clientWeightRef, (querySnapshot) => {
      if (querySnapshot.empty) {
        setLineData([]);
        setLabels([]);
        setLoading(false);
        return;
      }

      const docs = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const date =
          data.date instanceof Timestamp
            ? data.date.toDate()
            : new Date(data.date);
        return { weight: data.weight, date };
      });

      const sorted = docs.sort((a, b) => a.date - b.date);
      setLineData(sorted.map((item) => item.weight));
      setLabels(sorted.map((item) => item.date.toLocaleDateString()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const weightChartData = {
    labels,
    datasets: [
      {
        label: "My Weight",
        data: lineData,
        fill: false,
        borderColor: "rgb(200, 150, 255)",
        tension: 0.2,
      },
    ],
  };

  const weightChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="min-h-screen">
      {/* ✅ KEEPING ORIGINAL NAVBAR */}
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

      {/* ✅ MAIN CHART SECTION */}
      <div className="main-wrapper">
        <main className="main-progress">
          <div className="containerProgress">
            {loading ? (
              <p className="loading-text">Loading your progress...</p>
            ) : (
              <div className="chart-container">
                <Line data={weightChartData} options={weightChartOptions} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ✅ KEEPING ORIGINAL FOOTER */}
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
}

export default Page;
