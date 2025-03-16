"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Activity,
  Dumbbell,
  Home,
  User,
  Utensils,
  X,
  Crown,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import {
  setDoc,
  doc,
  collection,
  serverTimestamp,
  addDoc,
  getDoc,
  updateDoc,
  signOut,
  getFirestore,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db, auth, requestNotificationPermission } from "../../firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
  signOut as firebaseSignOut,
} from "firebase/auth";
import Head from "next/head";

import PaymentModal from "./components/Modal";

function Modal({
  isOpen,
  onClose,
  type,
  setActiveModal,
  setSubscribed,
  setNotSubscribed,
}) {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false); // 🔹 Added loading state
  const userEmail = useRef(null);
  const userPassword = useRef(null);
  const userName = useRef(null);

  async function login(e) {
    e.preventDefault();
    if (loading) return;

    const email = userEmail.current?.value;
    const password = userPassword.current?.value;

    if (!email || !password) {
      alert("Please enter both email and password.");
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

      // 🔹 Update Firestore with login timestamp
      await setDoc(
        doc(db, "users", user.uid),
        { lastLogin: serverTimestamp() },
        { merge: true }
      );

      // 🔹 Fetch user data (optional, if needed)
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // console.log("User data:", userSnap.data());
        if (userSnap.data().paid) {
          setSubscribed(true);
        } else {
          setSubscribed(false);
          setNotSubscribed(true);
        }
      } else {
        // console.log("User document does not exist!");
      }

      // console.log("User signed in:", user);
      onClose(); // Close modal if applicable
    } catch (error) {
      console.error("Login error:", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
      document.body.style.overflowY = "auto"; // Restore scrolling
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    const email = userEmail.current?.value;
    const password = userPassword.current?.value;
    const displayName = userName.current?.value;

    if (!email || !password || !displayName) {
      alert("Please fill in all fields.");
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

      // 🔹 Save user details to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        date: serverTimestamp(),
        // freeTrialActive: false,
        // freeTrialEnded: false,
        paid: false,
      });

      // console.log("Account created successfully!");
      onClose(); // Close modal (optional)
    } catch (error) {
      // console.error("Error creating account:", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
      document.body.style.overflowY = "auto"; // Disable scrolling
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          X
        </button>
        <div className="modal-header">
          <h2 className="modal-title">
            {type === "signIn" ? "Sign In" : "Create Free Account"}
          </h2>
        </div>
        <form
          onSubmit={type === "signIn" ? login : handleSubmit}
          className="modal-form"
        >
          {type === "tryFree" && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="form-input"
                placeholder="Enter your name"
                required
                ref={userName}
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              required
              ref={userEmail}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter your password"
              required
              ref={userPassword}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? "Processing..."
              : type === "signIn"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>
        <div className="modal-footer">
          {type === "signIn" ? (
            <p>
              Don't have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  setActiveModal("tryFree");
                }}
              >
                Sign up
              </a>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  setActiveModal("signIn");
                }}
              >
                Sign in
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editAllowed, setEditAllowed] = useState(false);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [userData, setUserData] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "",
    fitnessGoal: "",
    dietaryPreference: "",
    activityLevel: "",
    workoutLocation: "",
    freeTrialActive: false,
    freeTrialEndTime: null,
  });
  const [user, setUser] = useState(null);
  const [paid, setPaid] = useState(false);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [freeTrialActive, setFreeTrialActive] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [weightAdded, setWeightAdded] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [notSubscribed, setNotSubscribed] = useState(false);

  // ✅ Consolidate auth state handling to avoid multiple redundant listeners
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      // console.log("User:", currentUser);

      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data()); // ✅ Update userData immediately
            // console.log("User data:", userDocSnap.data());
          } else {
            // console.log("No such user found!");
            setUserData(null);
          }
        } catch (error) {
          // console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Directly reflect free trial start without needing a refresh
  // async function startFreeTrial() {
  //   if (loading) return;
  //   setLoading(true);

  //   const now = new Date();
  //   const freeTrialEndTime = Timestamp.fromDate(
  //     new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  //   );

  //   // ✅ Immediately update state for instant UI changes
  //   setUserData((prevUserData) => ({
  //     ...prevUserData,
  //     freeTrialActive: true,
  //     freeTrialEnded: false,
  //     freeTrialEndTime: freeTrialEndTime,
  //   }));

  //   try {
  //     const userRef = doc(db, "users", user.uid);
  //     await updateDoc(userRef, {
  //       freeTrialActive: true,
  //       freeTrialEnded: false,
  //       freeTrialStartTime: serverTimestamp(),
  //       freeTrialEndTime: freeTrialEndTime,
  //     });

  //     console.log("Free trial started successfully!");
  //     setMessage("✅ Free trial started! Enjoy for 7 days!");

  //     setTimeout(() => setMessage(""), 5000);
  //   } catch (error) {
  //     console.error("Error starting free trial:", error);
  //     setMessage("❌ Failed to start free trial. Try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // ✅ Real-time countdown update for free trial
  useEffect(() => {
    if (!userData?.freeTrialEndTime) return;

    const trialEnd = userData.freeTrialEndTime.toDate();

    const updateCountdown = () => {
      const now = new Date();
      const timeDiff = trialEnd - now;

      if (timeDiff <= 0) {
        setTimeLeft("Your free trial has ended.");
        setFreeTrialActive(false);
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
      const seconds = Math.floor((timeDiff / 1000) % 60);

      setTimeLeft(
        `Free trial ends in ${days}d ${hours}h ${minutes}m ${seconds}s`
      );
      setFreeTrialActive(true);
    };

    updateCountdown(); // ✅ Run immediately
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [userData?.freeTrialEndTime]);

  // ✅ Logout function
  async function signOut() {
    try {
      await firebaseSignOut(auth);
      // console.log("User signed out successfully.");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  // ✅ CSS Styles for message toast
  const styles = {
    toast: {
      position: "fixed",
      top: "20px",
      right: "20px",
      backgroundColor: "#333",
      color: "white",
      padding: "10px 15px",
      borderRadius: "5px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
      fontSize: "14px",
      zIndex: 1000,
    },
  };

  // useEffect(() => {
  //   if (!userData?.freeTrialEndTime) {
  //     setFreeTrialActive(false); // Set to false if there is no free trial end time or no user data
  //     return;
  //   }

  //   // Convert Firestore timestamp to JS Date
  //   const trialEnd = userData.freeTrialEndTime.toDate();
  //   const userRef = doc(db, "users", user.uid);

  //   const updateCountdown = () => {
  //     const now = new Date();
  //     const timeDiff = trialEnd - now; // Difference in milliseconds

  //     if (timeDiff <= 0) {
  //       setTimeLeft("Your free trial has ended.");
  //       setFreeTrialActive(false); // Mark free trial as inactive once it has ended
  //       return;
  //     }

  //     // Convert milliseconds to days, hours, minutes
  //     const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  //     const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
  //     const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
  //     const seconds = Math.floor((timeDiff / 1000) % 60);

  //     setTimeLeft(
  //       `Free trial ends in ${days}d ${hours}h ${minutes}m ${seconds}s`
  //     );
  //     setFreeTrialActive(true);
  //   };

  //   updateCountdown(); // Run immediately
  //   const interval = setInterval(updateCountdown, 1000); // Update every second

  //   return () => clearInterval(interval); // Cleanup interval on unmount
  // }, [userData]);

  const logout = async () => {
    try {
      await signOut(auth);
      // console.log("User signed out successfully.");
      setOpenSettingsModal(false);
      setSubscribed(false);
    } catch (error) {
      // console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserData(null); // ✅ Clear user data on logout to prevent errors
        return;
      }

      setUser(currentUser);

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data()); // ✅ Update state only if user exists
          if (userDocSnap.data().paid) {
            setSubscribed(true);
          } else {
            setNotSubscribed(true);
          }
        } else {
          // console.log("No such user found!");
          setUserData(null);
        }
      } catch (error) {
        // console.error("Error fetching user data:", error);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  async function editWeight() {
    const now = new Date(); // Get the current date
    now.setMonth(now.getMonth() + 1); // Add one month

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        editedWeight: serverTimestamp(),
        weight: Number(weightAdded),
        reEditWeight: now,
      });

      // console.log("updated!");
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!userData?.reEditWeight) {
      // console.log("❌ No edit date found");
      return;
    }

    const now = new Date(); // Current date & time
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Normalize today's date

    let storedEditDate = userData.reEditWeight; // Get stored edit date

    // Debugging: Log stored edit date
    // console.log("📌 Stored Edit Date (Before Conversion):", storedEditDate);

    // Convert Firestore Timestamp or String to JavaScript Date
    if (storedEditDate?.toDate) {
      storedEditDate = storedEditDate.toDate(); // Firestore Timestamp to Date
    } else if (typeof storedEditDate === "string") {
      storedEditDate = new Date(storedEditDate); // Convert string to Date
    }

    // Debugging: Log stored edit date after conversion
    // console.log("📌 Stored Edit Date (After Conversion):", storedEditDate);

    if (isNaN(storedEditDate.getTime())) {
      // console.error("🚨 Invalid storedEditDate:", storedEditDate);
      return;
    }

    const editDate = new Date(
      storedEditDate.getFullYear(),
      storedEditDate.getMonth(),
      storedEditDate.getDate()
    ); // Normalize stored edit date

    // Debugging: Log both dates for comparison
    // console.log("📌 Today's Date:", today);
    // console.log("📌 Edit Date:", editDate);

    // Check if today is the edit date
    if (today.getTime() === editDate.getTime()) {
      // console.log("✅ Editing is allowed today!");
      setEditAllowed(true);
      // Enable edit functionality here (e.g., set state)
    } else {
      // console.log("❌ Editing is not allowed yet.");
      setEditAllowed(false);
    }
  }, [userData]); // Ensure the correct dependency is used

  async function editOrAddWeight() {
    if (!weightAdded) {
      // console.error("Weight is empty or null!");
      return;
    }

    const clientWeightRef = collection(
      db,
      "weightProgress",
      user.uid,
      "clientWeight"
    );
    const userRef = doc(db, "users", user.uid); // Reference to the user document

    try {
      // Get current date and next month
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1); // Add one month

      // Extract current month & year
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Query all weight entries
      const querySnapshot = await getDocs(clientWeightRef);
      let existingDoc = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const docDate =
          data.date instanceof Timestamp
            ? data.date.toDate()
            : new Date(data.date);

        if (
          docDate.getMonth() === currentMonth &&
          docDate.getFullYear() === currentYear
        ) {
          existingDoc = { id: doc.id, ...data };
        }
      });

      if (existingDoc) {
        // Update existing weight entry for this month
        const weightDocRef = doc(
          db,
          "weightProgress",
          user.uid,
          "clientWeight",
          existingDoc.id
        );
        await updateDoc(weightDocRef, {
          weight: Number(weightAdded),
          date: Timestamp.fromDate(now),
        });
        // console.log("Updated existing weight entry for this month.");
      } else {
        // Create a new weight entry
        await addDoc(clientWeightRef, {
          weight: Number(weightAdded),
          date: Timestamp.fromDate(now),
        });
        // console.log("Added new weight entry.");
      }

      // Update user document
      await updateDoc(userRef, {
        editedWeight: serverTimestamp(),
        weight: Number(weightAdded),
        // reEditWeight: nextMonth,
      });

      // console.log("User weight updated!");
    } catch (error) {
      console.error("Error updating weight:", error);
    }
  }

  function closeModal() {
    setOpenSettingsModal(false);
    setWeightAdded("");
    document.body.style.overflowY = "auto"; // Disable scrolling
  }

  function openModal() {
    setOpenSettingsModal(true);
    document.body.style.overflowY = "hidden"; // Disable scrolling
  }

  function openPaymentModal() {
    document.body.style.overflowY = "hidden"; // Disable scrolling
    setPaymentModalOpen(true);
  }

  return (
    <div>
      {userData && userData.paid ? (
        <Settings strokeWidth={1.5} className="settings" onClick={openModal} />
      ) : (
        // fallback content if userData or userData.paid is not available
        <></>
      )}
      {paymentModalOpen ? (
        <PaymentModal setPaymentModalOpen={setPaymentModalOpen} />
      ) : (
        <></>
      )}
      <Head>
        <title>TrainifAI</title>
      </Head>
      {openSettingsModal ? (
        <div className="settings-modal-overlay">
          <div className="settings-modal-container">
            <button
              className="settings-modal-close-button"
              onClick={closeModal}
            >
              <span aria-hidden="true">&times;</span>
            </button>
            <div className="settings-modal-content">
              <h2 className="settings-modal-heading">Account Settings</h2>

              <div className="settings-information-section">
                <div className="settings-information-item">
                  <span className="settings-information-label">Name:</span>
                  <span className="settings-information-value">
                    {user.displayName}
                  </span>
                </div>

                <div className="settings-information-item">
                  <span className="settings-information-label">Email:</span>
                  <span className="settings-information-value">
                    {user.email}
                  </span>
                </div>

                <div className="settings-information-item">
                  <span className="settings-information-label">Password:</span>
                  <button className="settings-action-button settings-password-button">
                    Update Password
                  </button>
                </div>

                <div className="settings-information-item">
                  <span className="settings-information-label">Weight:</span>
                  <div className="settings-weight-control">
                    <input
                      type="number"
                      value={weightAdded}
                      className="settings-weight-input"
                      onChange={(e) => setWeightAdded(e.target.value)}
                      placeholder="Weight"
                    />
                    <button
                      className="settings-action-button settings-weight-button"
                      onClick={editOrAddWeight}
                    >
                      Update Weight
                    </button>
                  </div>
                </div>
              </div>

              <div className="settings-modal-footer">
                <button
                  onClick={logout}
                  className="settings-action-button settings-logout-button"
                >
                  Logout <LogOut />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      <Modal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        type={activeModal}
        setActiveModal={setActiveModal}
        setSubscribed={setSubscribed}
        setWeightAdded={setWeightAdded}
        setNotSubscribed={setNotSubscribed}
      />

      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">
            <Dumbbell className="nav-logo" />
            <span className="nav-title">TrainifAI</span>
          </div>
          <div className="btns-wrapper">
            {" "}
            {subscribed ? (
              <Link href="/createPlan">
                <button className="btn btn-primary">Create Plan</button>
              </Link>
            ) : (
              <></>
            )}
            {notSubscribed ? (
              <button className="btn btn-primary" onClick={openPaymentModal}>
                Premium
              </button>
            ) : (
              <></>
            )}
            {!user && (
              <div className="nav-buttons">
                <button
                  onClick={() => setActiveModal("signIn")}
                  className="btn btn-primary"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveModal("tryFree")}
                  className="btn btn-outline"
                >
                  Sign Up
                </button>
              </div>
            )}
            {userData && (userData.paid || userData.paidLifetime) && (
              <div className="nav-buttons">
                {/* <Link href="/createPlan">
                  <button className="btn btn-primary">Create Plan</button>
                </Link> */}
                <Crown strokeWidth={3} className="crown" />
              </div>
            )}
          </div>
        </div>
      </nav>
      <section className="hero">
        {message && <div style={styles.toast}>{message}</div>}
        <div className="container">
          <div className="hero-content">
            <h1>
              Your AI-Powered <span>Fitness</span> & <span>Nutrition</span>{" "}
              Coach
            </h1>
            <p>
              Get personalized meal plans and workout routines tailored to your
              goals, preferences, and lifestyle. Powered by advanced AI to help
              you achieve results faster.
            </p>
            <div className="hero-buttons">
              {/* <a href="#" className="btn btn-secondary">See How It Works</a> */}
            </div>
          </div>
          <div className="hero-image">
            {/* <img src="/api/placeholder/1200/600" alt="FitPlan AI Dashboard Preview"> */}
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <div className="section-header">
            <h2>Powered by AI, Designed for You</h2>
            <p>
              Our platform uses advanced artificial intelligence to create
              personalized plans that adapt to your progress and preferences.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card-front">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="M7 12a5 5 0 0 1 10 0"></path>
                  <line x1="8" y1="9" x2="8" y2="9"></line>
                  <line x1="16" y1="9" x2="16" y2="9"></line>
                </svg>
              </div>
              <h3>Personalized Meal Plans</h3>
              <p>
                Custom daily meal plans with breakfast, lunch, dinner, and
                snacks based on your dietary preferences, allergies, and fitness
                goals.
              </p>
            </div>
            <div className="feature-card-front">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
              </div>
              <h3>Custom Workout Routines</h3>
              <p>
                AI-generated exercise programs adapted to your fitness level,
                available equipment, and time constraints with video
                demonstrations.
              </p>
            </div>
            <div className="feature-card-front">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3>Progress Tracking</h3>
              <p>
                Monitor your journey with detailed analytics on workout
                performance, nutrition intake, and body measurements to stay
                motivated.
              </p>
            </div>
            <div className="feature-card-front">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3>Personal AI Coach</h3>
              <p>
                Receive ongoing adjustments to your plan based on your progress,
                feedback, and changing preferences for optimal results.
              </p>
            </div>
            <div className="feature-card-front">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="M12 12h.01"></path>
                  <path d="M17 12h.01"></path>
                  <path d="M7 12h.01"></path>
                </svg>
              </div>
              <h3>Meal Customization</h3>
              <p>
                Easily swap meals, adjust portions, or regenerate options to
                suit your taste while maintaining your nutritional goals.
              </p>
            </div>
            <div className="feature-card-front">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18"></path>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                </svg>
              </div>
              <h3>Detailed Analytics</h3>
              <p>
                Access comprehensive breakdowns of calories, macros, and
                exercise performance to understand what works for your body.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How TrainifAI Works</h2>
            <p>
              Getting started with personalized nutrition and fitness plans is
              simple and takes less than 5 minutes.
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Your Profile</h3>
              <p>
                Enter your details, goals, and preferences to help our AI
                understand your needs.
              </p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Get Your Plan</h3>
              <p>
                Our AI generates a customized meal and workout plan tailored
                specifically to you.
              </p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Follow & Track</h3>
              <p>
                Follow your plan daily and track your progress through our
                easy-to-use dashboard.
              </p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Adapt & Improve</h3>
              <p>
                Your plan evolves with you as the AI learns from your feedback
                and progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Simple, Transparent Pricing</h2>
            <p>
              Choose the plan that works best for your fitness journey and
              budget. All plans include personalized recommendations.
            </p>
          </div>
          <div className="pricing-grid">
            {/* Monthly Premium Plan */}
            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <div className="price-tier">Premium Plan</div>
              <div className="price">
                $14.99 <span>/month</span>
              </div>
              <ul className="pricing-features">
                <li className="included">Advanced meal plans</li>
                <li className="included">Custom workout routines</li>
                <li className="included">Macro tracking</li>
                <li className="included">Meal customization</li>
                <li className="included">Progress analytics</li>
                <li className="included">AI-powered recommendations</li>
                {/* <li className="included">Premium video workouts</li> */}
              </ul>
              {userData && userData.paid ? (
                <></>
              ) : (
                <button onClick={openPaymentModal} className="btn btn-primary">
                  Get Premium
                </button>
              )}
            </div>

            {/* New Plan (e.g., Yearly Premium Plan) */}
            <div className="pricing-card">
              <div className="price-tier">Yearly Premium Plan</div>
              <div className="price">
                $149.99 <span>/year</span>
              </div>
              <ul className="pricing-features">
                <li className="included">Advanced meal plans</li>
                <li className="included">Custom workout routines</li>
                <li className="included">Macro tracking</li>
                <li className="included">Meal customization</li>
                <li className="included">Progress analytics</li>
                <li className="included">AI-powered recommendations</li>
                {/* <li className="included">Premium video workouts</li> */}
              </ul>

              {userData && userData.paid ? (
                <></>
              ) : (
                <button className="btn btn-primary" onClick={openPaymentModal}>
                  Get Yearly Premium
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-text">
            © 2025 TrainifAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
