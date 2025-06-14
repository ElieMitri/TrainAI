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
  Instagram,
  Mail,
} from "lucide-react";
import { GiHamburgerMenu } from "react-icons/gi";
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
  onSnapshot,
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
import { FaXTwitter } from "react-icons/fa6";
import { FaRedditAlien } from "react-icons/fa";
import Whish from "../../public/whish.png";
import PaymentModal from "./components/Modal";
import Image from "next/image";
import OMT from "../../public/OMT.png";
import western from "../../public/western.png";
import logo from "../../enhanced-IMG_3755.jpeg.png";

import Notification from "./components/Notification";
// import PrivacyModal from "./components/PrivacyModal";
// import TermsModal from "./components/TermsModal";
import { FaTiktok } from "react-icons/fa";

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
    <div className="modal-overlay">
      <div className="modal">
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.visible}
          onClose={hideNotification}
        />
        <button className="modal-close" onClick={closeModal}>
          X
        </button>
        <div className="modal-header">
          <h2 className="modal-title">
            {type === "signIn" ? "Login" : "Sign Up"}
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
              ? "Login"
              : "Create Account"}
          </button>
        </form>
        <div className="modal-footer">
          {type === "signIn" ? (
            <p>
              Don't have an account?{" "}
              <a
                // href="#"
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
                // href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  setActiveModal("signIn");
                }}
              >
                Login
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
  const [loading, setLoading] = useState(true);
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
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [addingWeight, setAddingWeight] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [isntLoggedIn, setIsntLoggedIn] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

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

  // ✅ Consolidate auth state handling to avoid multiple redundant listeners
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // console.log("User:", currentUser);

      if (currentUser) {
        const fetchUserData = async () => {
          try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              setUserData(userDocSnap.data()); // ✅ Update userData immediately
              // console.log("User data:", userDocSnap.data());
            } else {
              console.warn("No such user found!");
              setUserData(null);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUserData(null);
          }
        };

        fetchUserData(); // ✅ Call async function safely
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
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
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserData(null);
        setSubscribed(false);
        setNotSubscribed(false);
        setLoading(false); // Stop loading when there's no user
        return;
      }

      setUser(currentUser);

      // Reference to the Firestore document
      const userDocRef = doc(db, "users", currentUser.uid);

      // ✅ Real-time listener for user data updates
      const unsubscribeSnapshot = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserData(userData);
            setSubscribed(!!userData.paid);
            setNotSubscribed(!userData.paid);
          } else {
            console.warn("No such user found!");
            setUserData(null);
            setSubscribed(false);
            setNotSubscribed(false);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching user data:", error);
          setUserData(null);
          setSubscribed(false);
          setNotSubscribed(false);
          setLoading(false); // Stop loading on error as well
        }
      );

      // Cleanup function
      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

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
    if (!user?.uid) {
      console.error("User is not logged in.");
      return;
    }

    if (!weightAdded || isNaN(weightAdded)) {
      console.error("Invalid weight input!");
      showNotification("Please enter a valid weight.", "error");
      return;
    }

    setAddingWeight(true); // Start loading

    const clientWeightRef = collection(
      doc(db, "weightProgress", user.uid),
      "clientWeight"
    );
    const userRef = doc(db, "users", user.uid);

    try {
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      if (nextMonth.getDate() !== now.getDate()) {
        nextMonth.setDate(0);
      }

      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

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
        const weightDocRef = doc(clientWeightRef, existingDoc.id);
        await updateDoc(weightDocRef, {
          weight: Number(weightAdded),
          date: Timestamp.fromDate(now),
        });
        showNotification("Weight updated successfully!", "success");
      } else {
        await addDoc(clientWeightRef, {
          weight: Number(weightAdded),
          date: Timestamp.fromDate(now),
        });
        showNotification("New weight added!", "success");
      }

      await updateDoc(userRef, {
        editedWeight: serverTimestamp(),
        weight: Number(weightAdded),
        reEditWeight: Timestamp.fromDate(nextMonth),
      });

      setTimeout(() => {
        setOpenSettingsModal(false);
      }, 1500); // delay in milliseconds (e.g., 1.5 seconds)
    } catch (error) {
      console.error("❌ Error updating weight:", error);
      showNotification("Couldn't update weight. Please try again.", "error");
    } finally {
      setAddingWeight(false); // Always stop loading
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

  if (loading) {
    return (
      <div className="loading-container">
        <Image src={logo} alt="Loading" className="logoImageLoading" />
        <h1 className="loadingh1">TrainifAI</h1>
      </div>
    );
  }

  // const sectionRef = useRef(null);

  // const scrollToSection = () => {
  //   sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  function cancelMembership() {
    if (!user) {
      console.error("User is not logged in.");
      return;
    }

    const userRef = doc(db, "users", user.uid);

    updateDoc(userRef, {
      paid: false,
      paidLifetime: false,
    })
      .then(() => {
        showNotification("Membership canceled successfully!", "success");
        setSubscribed(false);
        setTimeout(() => {
          setOpenSettingsModal(false);
        }, 2000); // 500ms delay (change this to your desired time)

        setNotSubscribed(true);
        setOpenCancelModal(false);
        setUserData((prev) => ({ ...prev, paid: false }));
        // console.log("Membership canceled successfully!");
      })
      .catch((error) => {
        console.error("Error canceling membership:", error);
        showNotification(
          "Couldn't cancel membership. Please try again.",
          "error"
        );
      });
  }

  const paymentMethods = [
    // {
    //   id: "wish-money",
    //   // ✅ Brand is intentionally spelled "Whish"
    //   name: "Whish Money",
    //   icon: <Image alt="Whish Money" src={Whish} />,
    //   description: "Pay with your Whish Money account",
    // },
    {
      id: "omt",
      name: "OMT (Online Money Transfer)",
      icon: <Image alt="OMT Logo" src={OMT} />,
      description: "Quick online bank transfer",
    },
    {
      id: "western-union",
      name: "Western Union",
      icon: <Image alt="Western Union" src={western} className="western" />,
      description: "Quick online bank transfer",
    },
    {
      id: "crypto",
      name: "Cryptocurrency",
      icon: "🪙",
      description: "BTC, ETH, USDT, and more",
    },
  ];

  return (
    <div>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.visible}
        onClose={hideNotification}
      />
      {paymentModalOpen ? (
        <PaymentModal
          setPaymentModalOpen={setPaymentModalOpen}
          userData={userData}
          setSubscribed={setSubscribed}
          setNotSubscribed={setNotSubscribed}
        />
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

                {/* <div className="settings-information-item">
                  <span className="settings-information-label">Password:</span>
                  <button className="settings-action-button settings-password-button">
                    Update Password
                  </button>
                </div> */}
                <Notification
                  type={notification.type}
                  message={notification.message}
                  isVisible={notification.visible}
                  onClose={hideNotification}
                />

                {userData && userData.paid ? (
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
                      {addingWeight ? (
                        <button className="settings-action-button settings-weight-button">
                          Processing...
                        </button>
                      ) : (
                        <button
                          className="settings-action-button settings-weight-button"
                          onClick={editOrAddWeight}
                        >
                          Update
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
              {openCancelModal && (
                <div className="modal-backdrop">
                  <div className="modal">
                    <h3>Are you sure you want to cancel your membership?</h3>
                    <div className="modal-actions">
                      <button
                        // className="confirm-button"
                        className="btn btn-primary"
                        onClick={cancelMembership}
                      >
                        Yes
                      </button>
                      <button
                        className="btn btn-primary white"
                        onClick={() => setOpenCancelModal(false)}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="settings-modal-footer">
                {userData && userData.paid ? (
                  <button
                    onClick={() => setOpenCancelModal(true)}
                    className="settings-action-button settings-logout-button"
                  >
                    Cancel Membership
                  </button>
                ) : (
                  <></>
                )}
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

      {isOpen && (
        <>
          <div
            className={`floating-nav-overlay ${isOpen ? "active" : ""}`}
            onClick={closeSidebar}
          ></div>

          <div className={`floating-nav-panel ${isOpen ? "active" : ""}`}>
            <nav className="floating-nav-links">
              <a href="/">Home</a>
              <a href="/createPlan">Create Plan</a>
              <a href="/mealPlan">Meal Plan</a>
              <a href="/workoutPlan">Workout Plan</a>
              <a href="/workoutPlan">Progress Tracking</a>
              <a href="/account">Account</a>
            </nav>
          </div>
        </>
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
              <GiHamburgerMenu
                className="hamburger-icon"
                onClick={openSidebar}
              />
            ) : (
              <></>
            )}
            {notSubscribed ? (
              <div className="buttonsWrapper">
                <a className="btn btn-primary premium" href="#pricing">
                  Premium
                </a>
                <button
                  onClick={logout}
                  className="settings-action-button settings-logout-button margin"
                >
                  <LogOut />
                </button>
              </div>
            ) : (
              <></>
            )}
            {!user && (
              <div className="nav-buttons">
                <button
                  onClick={() => setActiveModal("signIn")}
                  className="btn btn-primary"
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveModal("tryFree")}
                  className="btn btn-outline white"
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

      <section className="how-it-worksSub" id="how-it-worksSub">
        <div className="container">
          <div className="glow-ball ball-1"></div>
          <div className="glow-ball ball-2"></div>

          <div className="features-grid">
            <a href="/createPlan/progressTracking" className="feature-card">
              <div className="feature-icon">
                <Activity />
              </div>
              <h3 className="feature-title">Progress Tracking</h3>
              <p className="text-muted">
                Monitor your progress and get AI-powered adjustments to optimize
                results
              </p>
            </a>
            <a href="/workoutPlan" className="feature-card">
              <div className="feature-icon">
                <Dumbbell />
              </div>
              <h3 className="feature-title">Custom Workouts</h3>
              <p className="text-muted">
                Receive personalized workout routines optimized for your fitness
                level
              </p>
            </a>
            <a href="/mealPlan" className="feature-card">
              <div className="feature-icon">
                <Utensils />
              </div>
              <h3 className="feature-title">Personalized Meal Plans</h3>
              <p className="text-muted">
                Get AI-generated meal plans tailored to your dietary preferences
                and goals
              </p>
            </a>
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

            {/* New Plan (e.g., Yearly Premium Plan) */}
            <div className="pricing-card">
              <div className="price-tier">Premium Plan</div>
              <div className="price">
                $29.99 <span>/month</span>
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

              {!user ? (
                <button
                  onClick={() => setActiveModal("signIn")} // 👈 opens sign up modal now
                  className="btn btn-primary"
                >
                  Get Premium
                </button>
              ) : !userData?.paid ? (
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="btn btn-primary"
                >
                  Get Premium
                </button>
              ) : null}
            </div>

            <div className="pricing-card popular">
              <div className="popular-badge">Get up to 45% off!</div>
              <div className="price-tier">Yearly Premium Plan</div>
              <div className="price">
                $199.99 <span>/year</span>
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

              {!user ? (
                <button
                  onClick={() => setActiveModal("signIn")} // 👈 opens sign up modal now
                  className="btn btn-primary"
                >
                  Get Yearly Premium
                </button>
              ) : !userData?.paid ? (
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="btn btn-primary"
                >
                  Get Yearly Premium
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      {paymentModalOpen && (
        <div
          className="paymo_overlay"
          onClick={(e) => {
            if (e.target.classList.contains("paymo_overlay")) {
              setPaymentModalOpen(false);
            }
          }}
        >
          <div className="paymo_container">
            {/* {isComplete ? (
              <div className="paymo_success">
                <div className="paymo_success_icon">✅</div>
                <div className="paymo_success_title">Payment Successful!</div>
                <div className="paymo_success_message">
                  Your payment using {selectedMethod} has been processed.
                </div>
                <button
                  className="paymo_button"
                  onClick={() => setIsComplete(false)}
                >
                  Return to Payment Options
                </button>
              </div>
            ) : ( */}
            <>
              <div className="paymo_header">
                <div className="paymo_header_title">Select Payment Method</div>
                <div className="paymo_header_subtitle">
                  Choose your preferred payment option
                </div>
              </div>

              <div className="paymo_body">
                <form onSubmit={handleSubmit}>
                  <div className="paymo_payment_options">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`paymo_payment_option ${
                          selectedMethod === method.name ? "paymo_selected" : ""
                        }`}
                      >
                        <div className="paymo_icon">{method.icon}</div>
                        <div className="paymo_payment_details">
                          <div className="paymo_payment_name">
                            {method.name}
                          </div>
                          <div className="paymo_payment_description">
                            {method.description}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          className="paymo_radio"
                          checked={selectedMethod === method.name}
                          onChange={() => setSelectedMethod(method.name)}
                        />
                      </label>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary paymoBtn"
                    disabled={!selectedMethod}
                  >
                    {selectedMethod
                      ? `Pay with ${selectedMethod}`
                      : "Select a Payment Method"}
                  </button>
                </form>
              </div>
            </>
            {/* )} */}
          </div>
        </div>
      )}

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

export default App;
