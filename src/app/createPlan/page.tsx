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
} from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
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

ChartJS.register(ArcElement, Tooltip, Legend);

interface Exercise {
  name: string;
  sets: string;
  reps: string;
}

interface WorkoutDay {
  day: string;
  exercises: Exercise[];
}

interface MealItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  items?: string[];
}

interface MealPlan {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snacks: MealItem[];
}

interface TotalNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface GeneratedPlan {
  workoutPlan: WorkoutDay[];
  mealPlan: MealPlan;
  totalNutrition: TotalNutrition;
}

interface UserData {
  age: string;
  weight: string;
  height: string;
  days: string;
  gender: string;
  fitnessGoal: string;
  dietaryPreference: string;
  activityLevel: string;
  workoutLocation: string;
  reEditWeight?: Timestamp;
  [key: string]: any; // For dynamic properties from Firestore
}

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  weight?: number;
  createdDetails?: boolean;
  paid?: boolean;
  date?: Timestamp;
  lastLogin?: Timestamp;
  editedWeight?: Timestamp;
  reEditWeight?: Timestamp;
}

function Page() {
  const [step, setStep] = useState(1);
  const [allowed, setAllowed] = useState(false);
  const [editAllowed, setEditAllowed] = useState(false);
  const [putDetails, setPutDetails] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    age: "",
    weight: "",
    height: "",
    days: "",
    gender: "",
    fitnessGoal: "",
    dietaryPreference: "",
    activityLevel: "",
    workoutLocation: "",
  });

  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const generateWorkoutPlan = (userData: UserData): WorkoutDay[] => {
    const exercises: Record<string, Exercise[]> = {
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
    const workoutPlan: WorkoutDay[] = [];

    for (let i = 0; i < days; i++) {
      const day: WorkoutDay = {
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

  const generateMealPlan = (userData: UserData): { mealPlan: MealPlan; totalNutrition: TotalNutrition } => {
    const weight = parseFloat(userData.weight);
    const height = parseFloat(userData.height);
    const age = parseFloat(userData.age);
    const isMale = userData.gender === "male";

    let bmr = isMale
      ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
      : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extra: 1.9,
    };

    const activityMultiplier = activityMultipliers[userData.activityLevel] || 1.2;

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
    let fats = (totalCalories * 0.25) / 9;
    let carbs = (totalCalories * 0.45) / 4;

    switch (userData.dietaryPreference) {
      case "keto":
        fats = (totalCalories * 0.7) / 9;
        protein = (totalCalories * 0.25) / 4;
        carbs = (totalCalories * 0.05) / 4;
        break;
      case "high-protein":
        protein = (totalCalories * 0.4) / 4;
        fats = (totalCalories * 0.3) / 9;
        carbs = (totalCalories * 0.3) / 4;
        break;
      case "vegan":
        protein = (totalCalories * 0.25) / 4;
        fats = (totalCalories * 0.2) / 9;
        carbs = (totalCalories * 0.55) / 4;
        break;
      case "vegetarian":
        protein = (totalCalories * 0.3) / 4;
        fats = (totalCalories * 0.25) / 9;
        carbs = (totalCalories * 0.45) / 4;
        break;
      case "paleo":
        protein = (totalCalories * 0.35) / 4;
        fats = (totalCalories * 0.35) / 9;
        carbs = (totalCalories * 0.3) / 4;
        break;
      case "low-carb":
        protein = (totalCalories * 0.35) / 4;
        fats = (totalCalories * 0.4) / 9;
        carbs = (totalCalories * 0.25) / 4;
        break;
      case "mediterranean":
        protein = (totalCalories * 0.3) / 4;
        fats = (totalCalories * 0.35) / 9;
        carbs = (totalCalories * 0.35) / 4;
        break;
      case "balanced":
      case "no-preference":
      default:
        protein = (totalCalories * 0.3) / 4;
        fats = (totalCalories * 0.3) / 9;
        carbs = (totalCalories * 0.4) / 4;
        break;
    }

    const mealPlan: MealPlan = {
      breakfast: {
        name: userData.dietaryPreference === "vegan" ? "Smoothie + Oats" : "Eggs + Toast",
        calories: 400,
        protein: 20,
        fats: 10,
        carbs: 50,
      },
      lunch: {
        name: userData.dietaryPreference === "keto" ? "Grilled Chicken + Avocado" : "Chicken + Rice",
        calories: 600,
        protein: 45,
        fats: 20,
        carbs: 60,
      },
      dinner: {
        name: userData.dietaryPreference === "mediterranean" ? "Salmon + Quinoa" : "Steak + Sweet Potatoes",
        calories: 700,
        protein: 50,
        fats: 25,
        carbs: 65,
      },
      snacks: [
        { name: "Greek Yogurt", calories: 150, protein: 10, fats: 5, carbs: 15 },
        { name: "Almonds", calories: 200, protein: 6, fats: 18, carbs: 6 },
        { name: "Protein Shake", calories: 250, protein: 30, fats: 5, carbs: 10 },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.uid) {
      console.error("User is not authenticated");
      alert("Please log in first.");
      return;
    }

    const workoutPlan = generateWorkoutPlan(userData);
    const { mealPlan, totalNutrition } = generateMealPlan(userData);
    setGeneratedPlan({ workoutPlan, mealPlan, totalNutrition });

    try {
      await setDoc(doc(db, "personDetails", user.uid), {
        displayName: user.displayName,
        date: serverTimestamp(),
        age: userData.age,
        weight: userData.weight,
        height: userData.height,
        days: userData.days,
        gender: userData.gender,
        fitnessGoal: userData.fitnessGoal,
        activityLevel: userData.activityLevel,
        dietaryPreference: userData.dietaryPreference,
        workoutLocation: userData.workoutLocation,
      });

      await setDoc(doc(db, "users", user.uid), {
        createdDetails: "true",
      });

      const now = new Date();
      now.setMonth(now.getMonth() + 1);

      const newWeightEntry = {
        date: serverTimestamp(),
        weight: userData.weight,
        reEditDate: now,
      };

      const weightProgressSubCollectionRef = collection(
        doc(db, "weightProgress", user.uid),
        "clientWeight"
      );

      await addDoc(weightProgressSubCollectionRef, newWeightEntry);

      await setDoc(doc(db, "personMacros", user.uid), {
        displayName: user.displayName,
        date: serverTimestamp(),
        calories: totalNutrition.calories,
        fats: totalNutrition.fats,
        protein: totalNutrition.protein,
        carbs: totalNutrition.carbs,
      });
    } catch (error) {
      console.error("Error creating account:", (error as Error).message);
      alert((error as Error).message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser as User | null);
      console.log("User:", currentUser);

      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData(data as UserData);
            if (data.createdDetails) {
              setPutDetails(true);
            } else {
              setPutDetails(false);
            }
          } else {
            console.log("No such user found!");
            setUserData(null as any);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null as any);
        }
      } else {
        setUserData(null as any);
      }
    });

    return () => unsubscribe();
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserData(null as any);
        return;
      }

      setUser(currentUser as User);

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.createdDetails === "true") {
            setPutDetails(true);
          }

          if (userData.paid) {
            setUserData(userData as UserData);
          } else {
            console.log("User does not have an active subscription or trial.");
            setUserData(null as any);
          }
        } else {
          console.log("No such user found!");
          setUserData(null as any);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData(null as any);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userData?.reEditWeight) {
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let storedEditDate = userData.reEditWeight;

    if (storedEditDate?.toDate) {
      storedEditDate = storedEditDate.toDate();
    } else if (typeof storedEditDate === "string") {
      storedEditDate = new Date(storedEditDate);
    }

    if (isNaN(storedEditDate.getTime())) {
      return;
    }

    const editDate = new Date(
      storedEditDate.getFullYear(),
      storedEditDate.getMonth(),
      storedEditDate.getDate()
    );

    if (today.getTime() === editDate.getTime()) {
      setEditAllowed(true);
    } else {
      setEditAllowed(false);
    }
  }, [userData]);

  return (
    <div className="min-h-screen">
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
                    { icon: Home, label: "Location" },
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
                          value={userData.age || ""}
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
                          value={userData.gender}
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
                          value={userData.weight || ""}
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
                          value={userData.height || ""}
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
                          value={userData.fitnessGoal}
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
                          value={userData.dietaryPreference}
                          onChange={handleInputChange}
                          className="form-select"
                          required
                        >
                          <option value="">Select diet type</option>
                          <option value="balanced">Balanced</option>
                          <option value="high-protein">High Protein</option>
                          <option value="low-carb">Low Carb</option>
                          <option value="mediterranean">Mediterranean</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="vegan">Vegan</option>
                          <option value="no-preference">No Preference</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
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
                      <label className="form-label">Workout Location</label>
                      <select
                        name="workoutLocation"
                        value={userData.workoutLocation}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                      >
                        <option value="">Select location</option>
                        <option value="home">Home</option>
                        <option value="gym">Gym</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  )}

                  {editAllowed ? (
                    <>
                      <div className="nav-buttons">
                        <button
                          type={step === 5 ? "submit" : "button"}
                          onClick={() => step < 5 && setStep(step + 1)}
                          className="btn btn-primary"
                        >
                          {step === 5 ? "Generate Plan" : "Next"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setStep((prev) => Math.max(1, prev - 1))
                          }
                          className={`btn ${
                            step === 1 ? "btn-disabled" : "btn-outline"
                          }`}
                          disabled={step === 1}
                        >
                          Previous
                        </button>
                      </div>
                    </>
                  ) : (
                    <h4 className="settingsContentWeight2">
                      {userData.reEditWeight?.toDate
                        ? <div>Cannot edit until {userData.reEditWeight.toDate().toLocaleDateString()}</div>
                        : <></>}
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

          {putDetails ? (
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
          )}
        </main>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="footer-text">
            © 2025 TrainifAI . All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Page;