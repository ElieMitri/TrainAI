"use client";

import React, { useEffect, useState } from "react";
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
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase"; // Make sure these are correctly initialized
import { onAuthStateChanged } from "firebase/auth";

function Page() {
  // Renamed to "Page" (React component names should start with uppercase)
  const [calories, setCalories] = useState(2000);
  const [dietType, setDietType] = useState("balanced");
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const generateMealPlan = () => {
    const mockMealPlan = {
      breakfast: {
        name: "Oatmeal with Berries",
        calories: 350,
        protein: 12,
        carbs: 60,
        fats: 8,
      },
      lunch: {
        name: "Grilled Chicken Salad",
        calories: 450,
        protein: 35,
        carbs: 25,
        fats: 22,
      },
      dinner: {
        name: "Salmon with Quinoa",
        calories: 550,
        protein: 40,
        carbs: 45,
        fats: 25,
      },
      snacks: [
        {
          name: "Greek Yogurt with Honey",
          calories: 150,
          protein: 15,
          carbs: 12,
          fats: 5,
        },
      ],
    };
    setMealPlan(mockMealPlan);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update user state immediately

      if (currentUser) {
        const fetchUserData = async () => {
          try {
            const userDocRef = doc(db, "personMacros", currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              setUserData(userDocSnap.data()); // Update userData if the user exists
              console.log("User data fetched:", userDocSnap.data());
              setLoading(false);
            } else {
              console.warn("No such user found!");
              setUserData(null); // Reset userData if no document found
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUserData(null); // Reset userData on error
          }
        };

        fetchUserData(); // Fetch user data after the user is authenticated
      } else {
        setUserData(null); // Reset userData when no user is authenticated
      }
    });

    // Cleanup function to unsubscribe from auth state change listener
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">
            <a href="/createPlan">
              <ArrowLeft className="nav-logo" />
            </a>
            <Dumbbell className="nav-logo" />
            <span className="nav-title">TrainifAI</span>
          </div>
        </div>
      </nav>

      {loading ? (
        <></>
      ) : (
        <div className="meal-plan-container">
          <h1>Your meal for the day</h1>

          <div className="preferences-section">
            <div className="input-group">
              <label>Your Daily Macros:</label>
              <h1>
                Calories: <span>{userData.calories}</span>
              </h1>
              <h1>
                Carbs (g): <span>{userData.carbs}</span>
              </h1>
              <h1>
                Protein (g): <span>{userData.protein}</span>
              </h1>
              <h1>
                Fat (g): <span>{userData.fats}</span>
              </h1>
            </div>

            <button className="btn btn-primary" onClick={generateMealPlan}>
              Generate Meal Plan
            </button>
          </div>

          {mealPlan && (
            <div className="meal-plan-display">
              <div className="meal-card">
                <h2>Breakfast</h2>
                <p className="meal-name">{mealPlan.breakfast.name}</p>
                <div className="nutrition-info">
                  <span>Calories: {mealPlan.breakfast.calories}</span>
                  <span>Protein: {mealPlan.breakfast.protein}g</span>
                  <span>Carbs: {mealPlan.breakfast.carbs}g</span>
                  <span>Fats: {mealPlan.breakfast.fats}g</span>
                </div>
              </div>

              <div className="meal-card">
                <h2>Lunch</h2>
                <p className="meal-name">{mealPlan.lunch.name}</p>
                <div className="nutrition-info">
                  <span>Calories: {mealPlan.lunch.calories}</span>
                  <span>Protein: {mealPlan.lunch.protein}g</span>
                  <span>Carbs: {mealPlan.lunch.carbs}g</span>
                  <span>Fats: {mealPlan.lunch.fats}g</span>
                </div>
              </div>

              <div className="meal-card">
                <h2>Dinner</h2>
                <p className="meal-name">{mealPlan.dinner.name}</p>
                <div className="nutrition-info">
                  <span>Calories: {mealPlan.dinner.calories}</span>
                  <span>Protein: {mealPlan.dinner.protein}g</span>
                  <span>Carbs: {mealPlan.dinner.carbs}g</span>
                  <span>Fats: {mealPlan.dinner.fats}g</span>
                </div>
              </div>

              {mealPlan.snacks.map((snack, index) => (
                <div key={index} className="meal-card snack">
                  <h2>Snack {index + 1}</h2>
                  <p className="meal-name">{snack.name}</p>
                  <div className="nutrition-info">
                    <span>Calories: {snack.calories}</span>
                    <span>Protein: {snack.protein}g</span>
                    <span>Carbs: {snack.carbs}g</span>
                    <span>Fats: {snack.fats}g</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Page; // Ensure you're exporting "Page"
