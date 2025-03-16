"use client";

import React, { useState } from "react";
// import '../styles/MealPlan.css';
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


function page() {
  const [calories, setCalories] = useState(2000);
  const [dietType, setDietType] = useState("balanced");
  const [mealPlan, setMealPlan] = useState(null);

  const generateMealPlan = () => {
    // This is a mock meal plan - in a real app, this would come from an API
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
      <div className="meal-plan-container">
        <h1>Your meal for the day</h1>

        <div className="preferences-section">
          <div className="input-group">
            <label>Daily Calories:</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
            />
          </div>

          <div className="input-group">
            <label>Diet Type:</label>
            <select
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
            >
              <option value="balanced">Balanced</option>
              <option value="low-carb">Low Carb</option>
              <option value="high-protein">High Protein</option>
              <option value="vegetarian">Vegetarian</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={generateMealPlan}>Generate Meal Plan</button>
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
    </div>
  );
}

export default page;
