"use client";

import React, { useState } from "react";
// import '../styles/Workout.css';
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

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: number;
}

interface WorkoutPlan {
  name: string;
  exercises: Exercise[];
}

function page() {
  const [fitnessLevel, setFitnessLevel] = useState<string>("beginner");
  const [goal, setGoal] = useState<string>("strength");
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);

  const generateWorkout = () => {
    // Mock workout plan - in a real app, this would come from an API
    const mockWorkout: WorkoutPlan = {
      name: "Full Body Strength Workout",
      exercises: [
        {
          name: "Squats",
          sets: 3,
          reps: 12,
          rest: 90,
        },
        {
          name: "Push-ups",
          sets: 3,
          reps: 10,
          rest: 60,
        },
        {
          name: "Dumbbell Rows",
          sets: 3,
          reps: 12,
          rest: 90,
        },
        {
          name: "Lunges",
          sets: 3,
          reps: 10,
          rest: 60,
        },
      ],
    };
    setWorkoutPlan(mockWorkout);
  };

  return (
    <div className="min-h-screen">
    <div className="workout-container">
      <nav className="nav-meal">
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
      <h1>Workout Plan</h1>

      <div className="preferences-section">
        <div className="input-group">
          <label>Fitness Level:</label>
          <select
            value={fitnessLevel}
            onChange={(e) => setFitnessLevel(e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="input-group">
          <label>Goal:</label>
          <select value={goal} onChange={(e) => setGoal(e.target.value)}>
            <option value="strength">Strength</option>
            <option value="endurance">Endurance</option>
            <option value="weight-loss">Weight Loss</option>
            <option value="muscle-gain">Muscle Gain</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={generateWorkout}>Generate Workout</button>
      </div>

      {workoutPlan && (
        <div className="workout-plan-display">
          <h2>{workoutPlan.name}</h2>

          <div className="exercises-grid">
            {workoutPlan.exercises.map((exercise, index) => (
              <div key={index} className="exercise-card">
                <h3>{exercise.name}</h3>
                <div className="exercise-details">
                  <div className="detail">
                    <span className="label">Sets:</span>
                    <span className="value">{exercise.sets}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Reps:</span>
                    <span className="value">{exercise.reps}</span>
                  </div>
                  {/* <div className="detail">
                    <span className="label">Rest:</span>
                    <span className="value">{exercise.rest}s</span>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default page;
