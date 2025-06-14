"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Dumbbell,
  Home,
  User,
  Utensils,
  X,
  ArrowLeft,
  BadgePlus,
  Link,
  Instagram,
  Mail,
} from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { FaXTwitter } from "react-icons/fa6";
import { FaRedditAlien } from "react-icons/fa";
import {
  setDoc,
  doc,
  collection,
  serverTimestamp,
  addDoc,
  getDoc,
  updateDoc,
  getFirestore,
  getDocs,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../../firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Notification from "../components/Notification";

ChartJS.register(ArcElement, Tooltip, Legend);

function Page() {
  const [step, setStep] = useState(1);
  const [allowed, setAllowed] = useState(false);
  const [editAllowed, setEditAllowed] = useState(true);
  const [putDetails, setPutDetails] = useState(false);
  const [userData, setUserData] = useState({
    age: "",
    weight: "",
    height: "",
    days: "",
    gender: "",
    fitnessGoal: "",
    dietaryPreference: "",
    activityLevel: "",
    workoutLocation: "gym",
    allergies: "",
    healthProblems: "",
    hatedFood: [],
  });

  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [user, setUser] = useState(null);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
      allergies: name === "allergies" ? value.split(", ") : prevState.allergies,
      hatedFood: name === "hatedFood" ? value.split(", ") : prevState.hatedFood,
      healthProblems:
        name === "healthProblems"
          ? value.split(", ")
          : prevState.healthProblems,
    }));
  };

  const router = useRouter();

  const generateWorkoutPlan = (userData) => {
    const exercises = {
      chest: [
        { name: "Bench Press", sets: "3", reps: "8-12" },
        { name: "Incline Dumbbell Press", sets: "3", reps: "10-12" },
        { name: "Push-Ups", sets: "3", reps: "12-15" },
      ],
      back: [
        { name: "Pull-Ups", sets: "3", reps: "8-12" },
        { name: "Bent Over Rows", sets: "3", reps: "10-12" },
        { name: "Lat Pulldowns", sets: "3", reps: "12-15" },
      ],
      legs: [
        { name: "Squats", sets: "4", reps: "8-12" },
        { name: "Romanian Deadlifts", sets: "3", reps: "10-12" },
        { name: "Leg Press", sets: "3", reps: "12-15" },
      ],
      shoulders: [
        { name: "Overhead Press", sets: "3", reps: "8-12" },
        { name: "Lateral Raises", sets: "3", reps: "12-15" },
        { name: "Face Pulls", sets: "3", reps: "15-20" },
      ],
      arms: [
        { name: "Bicep Curls", sets: "3", reps: "12-15" },
        { name: "Tricep Extensions", sets: "3", reps: "12-15" },
        { name: "Hammer Curls", sets: "3", reps: "12-15" },
      ],
    };

    const days = parseInt(userData.days);
    const workoutPlan = [];

    for (let i = 0; i < days; i++) {
      const day = {
        day: `Day ${i + 1}`,
        exercises: [],
      };

      switch (i % 3) {
        case 0:
          day.exercises = [...exercises.chest, ...exercises.arms];
          break;
        case 1:
          day.exercises = [...exercises.back, ...exercises.arms];
          break;
        case 2:
          day.exercises = [...exercises.legs, ...exercises.shoulders];
          break;
      }

      workoutPlan.push(day);
    }

    return workoutPlan;
  };

  const generateMealPlan = (userData) => {
    const weight = parseFloat(userData.weight);
    const height = parseFloat(userData.height);
    const age = parseFloat(userData.age);
    const isMale = userData.gender === "male";

    let bmr = isMale
      ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
      : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extra: 1.9,
    };

    const activityMultiplier =
      activityMultipliers[userData.activityLevel] || 1.2;

    let totalCalories = bmr * activityMultiplier;

    switch (userData.fitnessGoal) {
      case "weight-loss":
        totalCalories *= 0.8;
        break;
      case "muscle-gain":
        totalCalories *= 1.1;
        break;
    }

    let protein = (totalCalories * 0.3) / 4;
    let fats = (totalCalories * 0.3) / 9;
    let carbs = (totalCalories * 0.4) / 4;

    switch (userData.dietaryPreference) {
      case "keto":
        fats = (totalCalories * 0.75) / 9;
        protein = (totalCalories * 0.2) / 4;
        carbs = (totalCalories * 0.05) / 4;
        break;
      case "vegan":
        protein = (totalCalories * 0.15) / 4;
        fats = (totalCalories * 0.25) / 9;
        carbs = (totalCalories * 0.6) / 4;
        break;
      case "balanced":
      case "no-preference":
      default:
        // Default for balanced or no preference diet
        protein = (totalCalories * 0.2) / 4;
        fats = (totalCalories * 0.3) / 9;
        carbs = (totalCalories * 0.5) / 4;
        break;
    }

    const mealPlan = {
      breakfast: {
        name:
          userData.dietaryPreference === "vegan"
            ? "Smoothie + Oats"
            : "Eggs + Toast",
        calories: 400,
        protein: 20,
        fats: 10,
        carbs: 50,
      },
      lunch: {
        name:
          userData.dietaryPreference === "keto"
            ? "Grilled Chicken + Avocado"
            : "Chicken + Rice",
        calories: 600,
        protein: 45,
        fats: 20,
        carbs: 60,
      },
      dinner: {
        name:
          userData.dietaryPreference === "mediterranean"
            ? "Salmon + Quinoa"
            : "Steak + Sweet Potatoes",
        calories: 700,
        protein: 50,
        fats: 25,
        carbs: 65,
      },
      snacks: [
        {
          name: "Greek Yogurt",
          calories: 150,
          protein: 10,
          fats: 5,
          carbs: 15,
        },
        { name: "Almonds", calories: 200, protein: 6, fats: 18, carbs: 6 },
        {
          name: "Protein Shake",
          calories: 250,
          protein: 30,
          fats: 5,
          carbs: 10,
        },
      ],
    };

    return {
      mealPlan,
      totalNutrition: {
        calories: Math.round(totalCalories),
        protein: Math.round(protein),
        fats: Math.round(fats),
        carbs: Math.round(carbs),
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.uid) {
      console.error("User is not authenticated");
      alert("Please log in first.");
      return;
    }

    const workoutPlan = generateWorkoutPlan(userData);
    const { mealPlan, totalNutrition } = generateMealPlan(userData);
    setGeneratedPlan({ workoutPlan, mealPlan, totalNutrition });

    // Remove undefined values
    const sanitizedUserData = Object.fromEntries(
      Object.entries(userData).filter(([_, v]) => v !== undefined)
    );

    try {
      await setDoc(doc(db, "personDetails", user.uid), {
        ...sanitizedUserData, // Use sanitized data
        displayName: user.displayName,
        date: serverTimestamp(),
      });

      await setDoc(
        doc(db, "users", user.uid),
        { createdDetails: "true" },
        { merge: true }
      );

      const now = new Date();
      now.setMonth(now.getMonth() + 1);

      const newWeightEntry = {
        date: serverTimestamp(),
        weight: userData.weight ?? 0, // Ensure weight has a valid value
        reEditDate: Timestamp.fromDate(now),
      };

      const weightProgressSubCollectionRef = collection(
        doc(db, "weightProgress", user.uid),
        "clientWeight"
      );

      await addDoc(weightProgressSubCollectionRef, newWeightEntry);

      await updateDoc(doc(db, "users", user.uid), {
        reEditWeight: Timestamp.fromDate(now),
      });

      await setDoc(doc(db, "personMacros", user.uid), {
        displayName: user.displayName,
        date: serverTimestamp(),
        calories: totalNutrition.calories ?? 0,
        fats: totalNutrition.fats ?? 0,
        protein: totalNutrition.protein ?? 0,
        carbs: totalNutrition.carbs ?? 0,
      });

      showNotification("Goals generated successfully!", "success");
    } catch (error) {
      console.error("Error creating account:", error.message);
      alert(error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // console.log("User:", currentUser);

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);

        // Using onSnapshot to listen to document changes in real-time
        const unsubscribeSnapshot = onSnapshot(
          userDocRef,
          (userDocSnap) => {
            if (userDocSnap.exists()) {
              const data = userDocSnap.data();
              setUserData(data);
              if (data.createdDetails) {
                setPutDetails(true);
              } else {
                setPutDetails(false);
              }
            } else {
              // console.log("No such user found!");
              setUserData(null);
            }
          },
          (error) => {
            console.error("Error fetching user data:", error);
            setUserData(null);
          }
        );

        // Cleanup the snapshot listener on unmount or when the user logs out
        return () => unsubscribeSnapshot();
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe(); // Cleanup on auth state change listener
  }, []);

  const nutritionChartData = {
    labels: ["Protein", "Carbs", "Fats"],
    datasets: [
      {
        data: generatedPlan
          ? [
              generatedPlan.totalNutrition.protein,
              generatedPlan.totalNutrition.carbs,
              generatedPlan.totalNutrition.fats,
            ]
          : [0, 0, 0],
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // If no user is authenticated, reset user data
        setUser(null);
        setUserData(null);
        setPutDetails(false); // Reset putDetails state if no user is authenticated
        return;
      }

      setUser(currentUser);

      // Real-time listener for the user's document in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);

      // Listen to real-time updates
      const unsubscribeSnapshot = onSnapshot(userDocRef, (userDocSnap) => {
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();

          // Check if 'createdDetails' flag exists and is "true"
          if (userData.createdDetails === "true") {
            setPutDetails(true); // Set putDetails if createdDetails is "true"
          } else {
            setPutDetails(false); // Set putDetails to false if not created
          }

          // Check if the user has an active subscription or trial
          if (userData.paid) {
            setUserData(userData); // Set user data if the user has a valid subscription
          } else {
            // console.log("User does not have an active subscription or trial.");
            setUserData(null); // Reset user data if no active subscription
            router.push("/"); // Redirect to home if no active subscription
          }
        } else {
          // console.log("No such user found!");
          setUserData(null); // Reset user data if document does not exist
        }
      });

      // Cleanup function to unsubscribe from Firestore real-time updates
      return () => unsubscribeSnapshot();
    });

    // Cleanup function to unsubscribe from auth state change listener
    return () => unsubscribeAuth();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  useEffect(() => {
    if (!userData?.reEditWeight) {
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Remove time

    const storedEditDate = userData.reEditWeight.toDate(); // Convert Firestore Timestamp to JS Date

    const normalizedEditDate = new Date(
      storedEditDate.getFullYear(),
      storedEditDate.getMonth(),
      storedEditDate.getDate()
    );

    // Debugging
    // console.log("Today's Date:", today);
    // console.log("Today's Timestamp:", today.getTime());
    // console.log("Re-Edit Date:", normalizedEditDate);
    // console.log("Re-Edit Timestamp:", normalizedEditDate.getTime());

    if (today.getTime() >= normalizedEditDate.getTime()) {
      setEditAllowed(true);
      // console.log("Editing NOT allowed");
    } else {
      setEditAllowed(false);
      // console.log("Editing IS allowed");
    }
  }, [userData]);
  

  return (
    <div className="page-wrapper">
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

      <div className="main-wrapper">
        <main className="main">
          <div className="card">
            <div style={{ textAlign: "center" }}>
              <h1 className="heading-lg">Your Personal AI Fitness Journey</h1>
            </div>

            {!generatedPlan ? (
              <>
                <div className="steps2">
                  {[
                    { icon: User, label: "Info" },
                    { icon: Utensils, label: "Diet" },
                    { icon: Activity, label: "Activity" },
                    { icon: Home, label: "Days" },
                    { icon: BadgePlus, label: "Generate" },
                  ].map((item, index) => (
                    <React.Fragment key={item.label}>
                      <div className="step">
                        <div
                          className={`step-icon ${
                            step > index + 1
                              ? "step-completed"
                              : step === index + 1
                              ? "step-active"
                              : ""
                          }`}
                        >
                          <item.icon />
                        </div>
                        <span className="step-label">{item.label}</span>
                      </div>
                      {index < 4 && (
                        <div
                          className={`step-line ${
                            step > index + 1 ? "step-line-active" : ""
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Age</label>
                        <input
                          type="number"
                          name="age"
                          value={userData?.age || ""}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter your age"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select
                          name="gender"
                          value={userData?.gender}
                          onChange={handleInputChange}
                          className="form-select"
                          required
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Weight (kg)</label>
                        <input
                          type="number"
                          name="weight"
                          value={userData?.weight || ""}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter your weight"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Height (cm)</label>
                        <input
                          type="number"
                          name="height"
                          value={userData?.height || ""}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter your height"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Fitness Goal</label>
                        <select
                          name="fitnessGoal"
                          value={userData?.fitnessGoal}
                          onChange={handleInputChange}
                          className="form-select"
                          required
                        >
                          <option value="">Select your goal</option>
                          <option value="weight-loss">Weight Loss</option>
                          <option value="muscle-gain">Muscle Gain</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Dietary Preference</label>
                        <select
                          name="dietaryPreference"
                          value={userData?.dietaryPreference}
                          onChange={handleInputChange}
                          className="form-select"
                          required
                        >
                          <option value="">Select diet type</option>
                          <option value="balanced">Balanced</option>
                          <option value="keto">Keto</option>
                          <option value="vegan">Vegan</option>
                          <option value="no-preference">No Preference</option>
                        </select>
                      </div>
                      {/* <div className="form-group">
                        <label className="form-label">Hated Foods</label>
                        <input
                          className="form-input"
                          type="text"
                          name="hatedFoods"
                          onChange={handleInputChange}
                          placeholder="Enter hated foods"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Allergies</label>
                        <input
                          className="form-input"
                          type="text"
                          name="allergies"
                          onChange={handleInputChange}
                          placeholder="Enter allergies"
                        />
                      </div> */}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Activity Level</label>
                        <select
                          name="activityLevel"
                          value={userData.activityLevel}
                          onChange={handleInputChange}
                          className="form-select"
                          required
                        >
                          <option value="">Select activity level</option>
                          <option value="sedentary">
                            Sedentary (little or no exercise)
                          </option>
                          <option value="light">
                            Lightly active (1-3 days/week)
                          </option>
                          <option value="moderate">
                            Moderately active (3-5 days/week)
                          </option>
                          <option value="very">
                            Very active (6-7 days/week)
                          </option>
                          <option value="extra">
                            Extra active (very active + physical job)
                          </option>
                        </select>
                      </div>
                      {/* <div className="form-group">
                        <label className="form-label">Health Problems</label>
                        <input
                          className="form-input"
                          type="text"
                          name="healthProblems"
                          onChange={handleInputChange}
                          placeholder="Enter Health Problems"
                        />
                      </div> */}
                    </div>
                  )}

                  {step === 4 && (
                    <div className="form-group">
                      <label className="form-label">Days</label>
                      <select
                        name="days"
                        value={userData.days}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                      >
                        <option value="">Select Days</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </div>
                  )}

                  {editAllowed ? (
                    <>
                      <div className="nav-buttons">
                        <button
                          type="button"
                          onClick={() =>
                            setStep((prev) => Math.max(1, prev - 1))
                          }
                          className={`btn ${
                            step === 1 ? "btn-disabled white" : "white"
                          }`}
                          disabled={step === 1}
                        >
                          Previous
                        </button>
                        <button
                          type={step === 4 ? "submit" : "button"}
                          onClick={() =>
                            step < 4 && setStep((prevStep) => prevStep + 1)
                          }
                          className="btn btn-primary"
                        >
                          {step === 4 ? "Generate Plan" : "Next"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <h4 className="settingsContentWeight2">
                      {userData.reEditWeight?.toDate ? (
                        <div>
                          Cannot edit until{" "}
                          {userData.reEditWeight.toDate().toLocaleDateString()}
                        </div>
                      ) : (
                        <></>
                      )}
                    </h4>
                  )}
                </form>
              </>
            ) : (
              <div className="plan-container">
                <div className="plan-section">
                  <div className="nutrition-chart">
                    <h3 className="chart-title">Daily Nutrition Breakdown</h3>
                    <Pie data={nutritionChartData} />
                    <div
                      style={{
                        marginTop: "1rem",
                        textAlign: "center",
                        color: "black",
                      }}
                    >
                      <p>
                        Total Calories: {generatedPlan.totalNutrition.calories}{" "}
                        kcal
                      </p>
                      <p>Protein: {generatedPlan.totalNutrition.protein}g</p>
                      <p>Carbs: {generatedPlan.totalNutrition.carbs}g</p>
                      <p>Fats: {generatedPlan.totalNutrition.fats}g</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* {putDetails ? (
            <div className="features-grid">
              <a href="/createPlan/progressTracking" className="feature-card">
                <div className="feature-icon">
                  <Activity />
                </div>
                <h3 className="feature-title">Progress Tracking</h3>
                <p className="text-muted">
                  Monitor your progress and get AI-powered adjustments to
                  optimize results
                </p>
              </a>
              <a href="/mealPlan" className="feature-card">
                <div className="feature-icon">
                  <Utensils />
                </div>
                <h3 className="feature-title">Personalized Meal Plans</h3>
                <p className="text-muted">
                  Get AI-generated meal plans tailored to your dietary
                  preferences and goals
                </p>
              </a>

              <a href="/workoutPlan" className="feature-card">
                <div className="feature-icon">
                  <Dumbbell />
                </div>
                <h3 className="feature-title">Custom Workouts</h3>
                <p className="text-muted">
                  Receive personalized workout routines optimized for your
                  fitness level
                </p>
              </a>
            </div>
          ) : (
            <></>
          )} */}
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
}

export default Page;
