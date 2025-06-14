"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Notebook as Robot, Save, Trash2, Pencil } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { FaRedditAlien } from "react-icons/fa";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Notification from "./src/app/components/Notification";
// import * as React from "react";
// import PrivacyModal from "../components/PrivacyModal";
// import TermsModal from "../components/TermsModal";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Image from "next/image";
import trainifai from "../../../public/trainifai.jpg";
import { FaTiktok } from "react-icons/fa";

const muscleGroupsMap = {
  Push: ["chest", "shoulders", "arms"],
  Pull: ["back", "arms"],
  Legs: ["legs"],
  Upper: ["chest", "back", "shoulders", "arms"],
  Lower: ["legs", "glutes"],
  "Full Body": ["chest", "back", "legs", "core", "arms", "shoulders"],
  Glutes: ["glutes"],
  "Core + Conditioning": ["core"],
  "Glutes + Core": ["glutes", "core"],
};

const exerciseDatabase = {
  chest: [
    { name: "Bench Press", importance: 10 },
    { name: "Incline Dumbbell Press", importance: 9 },
    { name: "Push-Ups", importance: 8 },
    { name: "Chest Flyes", importance: 7 },
    { name: "Decline Press", importance: 7 },
    { name: "Dumbbell Chest Press", importance: 8 },
    { name: "Cable Chest Flyes", importance: 6 },
    { name: "Chest Dips", importance: 9 },
    { name: "Machine Chest Press", importance: 6 },
    { name: "Pec Deck Machine", importance: 6 },
    { name: "Close-Grip Bench Press", importance: 7 },
    { name: "Landmine Chest Press", importance: 6 },
  ],
  back: [
    { name: "Pull-Ups", importance: 10 },
    { name: "Bent Over Rows", importance: 9 },
    { name: "Lat Pulldowns", importance: 8 },
    { name: "Face Pulls", importance: 7 },
    { name: "Seated Cable Rows", importance: 8 },
    { name: "T-Bar Rows", importance: 8 },
    { name: "Barbell Rows", importance: 9 },
    { name: "Dumbbell Rows", importance: 8 },
    { name: "Single-Arm Dumbbell Row", importance: 8 },
    { name: "Inverted Rows", importance: 7 },
    { name: "Deadlifts", importance: 10 },
    { name: "Hyperextensions", importance: 6 },
    { name: "Shrugs", importance: 5 },
    { name: "Renegade Rows", importance: 6 },
    { name: "Kettlebell Swings", importance: 6 },
  ],
  legs: [
    { name: "Squats", importance: 10 },
    { name: "Deadlifts", importance: 10 },
    { name: "Lunges", importance: 8 },
    { name: "Leg Press", importance: 9 },
    { name: "Leg Extensions", importance: 7 },
    { name: "Leg Curls", importance: 7 },
    { name: "Bulgarian Split Squats", importance: 9 },
    { name: "Step-Ups", importance: 8 },
    { name: "Hip Thrusts", importance: 9 },
    { name: "Glute Bridges", importance: 8 },
    { name: "Calf Raises", importance: 6 },
    { name: "Romanian Deadlifts", importance: 9 },
    { name: "Walking Lunges", importance: 8 },
    { name: "Sumo Squats", importance: 8 },
    { name: "Box Jumps", importance: 6 },
    { name: "Kettlebell Swings", importance: 6 },
    { name: "Smith Machine Squats", importance: 7 },
  ],
  shoulders: [
    { name: "Military Press", importance: 9 },
    { name: "Lateral Raises", importance: 8 },
    { name: "Front Raises", importance: 7 },
    { name: "Shrugs", importance: 6 },
    { name: "Arnold Press", importance: 9 },
    { name: "Upright Rows", importance: 7 },
    { name: "Reverse Pec Deck", importance: 7 },
    { name: "Face Pulls", importance: 8 },
    { name: "Dumbbell Shoulder Press", importance: 8 },
    { name: "Cable Lateral Raises", importance: 6 },
    { name: "Barbell Shoulder Press", importance: 9 },
    { name: "Dumbbell Front Raise", importance: 6 },
    { name: "Cable Front Raise", importance: 6 },
    { name: "Overhead Dumbbell Triceps Extension", importance: 5 },
  ],
  arms: [
    { name: "Bicep Curls", importance: 7 },
    { name: "Tricep Extensions", importance: 7 },
    { name: "Hammer Curls", importance: 8 },
    { name: "Diamond Push-Ups", importance: 7 },
    { name: "Concentration Curls", importance: 7 },
    { name: "Preacher Curls", importance: 7 },
    { name: "EZ Bar Curls", importance: 8 },
    { name: "Cable Tricep Pushdowns", importance: 8 },
    { name: "Overhead Tricep Extensions", importance: 7 },
    { name: "Close-Grip Bench Press", importance: 8 },
    { name: "Barbell Curls", importance: 8 },
    { name: "Tricep Dips", importance: 8 },
    { name: "Cable Bicep Curls", importance: 7 },
    { name: "Chin-Ups", importance: 9 },
    { name: "Zottman Curls", importance: 6 },
    { name: "Tricep Kickbacks", importance: 6 },
  ],
  core: [
    { name: "Planks", importance: 9 },
    { name: "Crunches", importance: 7 },
    { name: "Russian Twists", importance: 7 },
    { name: "Leg Raises", importance: 8 },
    { name: "Mountain Climbers", importance: 6 },
    { name: "Ab Wheel Rollouts", importance: 9 },
    { name: "Bicycle Crunches", importance: 7 },
    { name: "V-Ups", importance: 8 },
    { name: "Flutter Kicks", importance: 6 },
    { name: "Side Planks", importance: 8 },
    { name: "Hanging Leg Raises", importance: 9 },
    { name: "Cable Woodchoppers", importance: 8 },
    { name: "Lying Leg Raises", importance: 7 },
    { name: "Toe Touches", importance: 6 },
    { name: "Reverse Crunches", importance: 7 },
    { name: "Plank with Leg Lift", importance: 7 },
  ],
  glutes: [
    { name: "Hip Thrusts", importance: 10 },
    { name: "Glute Bridges", importance: 9 },
    { name: "Cable Kickbacks", importance: 8 },
    { name: "Bulgarian Split Squats", importance: 9 },
    { name: "Sumo Deadlifts", importance: 9 },
    { name: "Frog Pumps", importance: 6 },
    { name: "Step-Ups", importance: 8 },
    { name: "Glute Kickbacks", importance: 7 },
    { name: "Cable Glute Bridges", importance: 8 },
    { name: "Single-Leg Hip Thrusts", importance: 9 },
    { name: "Hip Abductions", importance: 7 },
    { name: "Walking Lunges", importance: 8 },
    { name: "Kettlebell Swings", importance: 7 },
    { name: "Glute Ham Raises", importance: 8 },
    { name: "Barbell Hip Thrusts", importance: 10 },
    { name: "Squats", importance: 10 },
  ],
};

export default function WorkoutBot() {
  const [weeklyWorkout, setWeeklyWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [todaysExercises, setTodaysExercises] = useState([]);
  const [currentDay, setCurrentDay] = useState("");
  const [hasWorkouts, setHasWorkouts] = useState(false);
  const [doesntHaveWorkouts, setDoesntHaveWorkouts] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [disableOptions, setDisableOptions] = useState(false);
  const [options, setOptions] = useState([]);
  const [step, setStep] = useState(0);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [notification, setNotification] = useState({
    visible: false,
    type: "info",
    message: "",
  });
  const [formData, setFormData] = useState({});
  const [gender, setGender] = useState(null);
  const [userTrainingDays, setUserTrainingDays] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState({});
  const [workoutState, setWorkoutState] = useState(weeklyWorkout);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedExerciseFirebase, setSelectedExercisefirbase] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [openAiModal, setOpenAiModal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});

  const open = Boolean(anchorEl);

  // const handleClick = (event, workoutDay, exerciseName) => {
  //   setAnchorEl(event.currentTarget);
  //   setSelectedDay(workoutDay);
  //   setSelectedExercise(exerciseName);
  //   console.log(anchorEl);
  // };

  const handleClick = (event, workoutDay, exerciseName) => {
    setAnchorEl(event.currentTarget); // Set anchor element to the clicked icon
    setSelectedDay(workoutDay); // Set selected day
    setSelectedExercise(exerciseName); // Set selected exercise name
  };
  const handleClickFirebase = (event, exerciseName) => {
    setAnchorEl(event.currentTarget); // Set anchor element to the clicked icon
    setSelectedExercisefirbase(exerciseName); // Set selected exercise name
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");

  // Handle input change for weight, reps, and RIR
  const handleInputChange = (e, exerciseId) => {
    const { name, value } = e.target;

    // Update formData for the specific exercise
    setFormData((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [name]: value,
      },
    }));
    console.log(formData);
  };

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

  // Generate the workout plan
  const generateWorkout = () => {
    setLoading(true);

    const userGender = gender;
    const workoutDays = userTrainingDays;

    const allSplits = {
      male: {
        3: ["Full Body", "Full Body", "Full Body"],
        4: ["Upper", "Lower", "Upper", "Lower"],
        5: ["Push", "Pull", "Legs", "Upper", "Lower"],
      },
      female: {
        3: ["Lower", "Upper", "Full Body"],
        4: ["Lower", "Upper", "Glutes + Core", "Full Body"],
        5: ["Glutes", "Upper", "Lower", "Core + Conditioning", "Full Body"],
      },
    };

    const selectedSplit = [...allSplits[userGender][workoutDays]]; // Use a copy to avoid modifying original

    const weekDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const restDayIndexes = {
      3: [1, 3, 5, 6], // Tue, Thu, Sat, Sun
      4: [2, 5, 6], // Wed, Sat, Sun
      5: [3, 6], // Thu, Sun
    };

    const restDays = restDayIndexes[workoutDays];

    const trainingDays = weekDays.map((dayName, i) => {
      if (restDays.includes(i)) {
        return {
          day: dayName,
          split: "Rest",
          exercises: [],
        };
      } else {
        const split = selectedSplit.shift();
        return {
          day: dayName,
          split: split,
          exercises: [],
        };
      }
    });

    trainingDays.forEach((day) => {
      if (day.split === "Rest") return;

      const muscleGroups = muscleGroupsMap[day.split];

      muscleGroups.forEach((group) => {
        const exercises = exerciseDatabase[group];

        // Get top 5 important exercises
        const topExercises = exercises
          .sort((a, b) => b.importance - a.importance)
          .slice(0, 5);

        // Randomly pick 2 from the top 5, then sort them again by importance
        const selectedExercises = topExercises
          .sort(() => Math.random() - 0.5)
          .slice(0, 2)
          .sort((a, b) => b.importance - a.importance);

        selectedExercises.forEach((exercise) => {
          day.exercises.push({
            name: exercise.name,
            sets: Math.floor(Math.random() * 2) + 3, // 3-4 sets
            reps: [8, 10, 12][Math.floor(Math.random() * 3)],
            weight: 0,
            importance: exercise.importance,
          });
        });
      });
    });

    setWeeklyWorkout({
      name: `Workout Plan - Week ${new Date().toLocaleDateString()}`,
      workouts: trainingDays,
    });

    setLoading(false);
  };

  // Save workout to Firebase
  const saveToFirebase = async () => {
    if (!weeklyWorkout) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No user logged in.");
      alert("You need to be logged in to save a workout.");
      return;
    }

    try {
      setLoading(true);
      // Use currentUser.uid for the document path
      const docRef = await addDoc(
        collection(db, "workouts", currentUser.uid, "weeklyWorkouts"),
        weeklyWorkout
      );

      const userRef = doc(db, "users", currentUser.uid);

      await updateDoc(userRef, {
        lastWorkout: new Date().toLocaleDateString(),
        createdWorkout: true,
      });

      // alert(`Workout saved successfully! Document ID: ${docRef.id}`);
      setHasWorkouts(true);
      setDoesntHaveWorkouts(false);
      showNotification("Workout saved successfully!", "success");
    } catch (error) {
      console.error("Error saving workout: ", error);
      alert("Error saving workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch workouts from Firestore on login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        const userDataRef = doc(db, "personDetails", firebaseUser.uid);
        const userDataSnap = await getDoc(userDataRef);
        if (userDataSnap.exists()) {
          console.log(userDataSnap.data().gender);
          console.log(userDataSnap.data().days);
          setGender(userDataSnap.data().gender);
          setUserTrainingDays(userDataSnap.data().days);
        } else {
          console.log("No user doc found");
        }

        // 🔥 Get user doc from Firestore (assuming users/{uid} structure)
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          // console.log(userSnap.data());
        } else {
          console.log("No user doc found");
        }
      }
    });

    return () => unsubscribe(); // clean up listener
  }, []);

  // Fetch workouts from Firestore and set today's exercises
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(true); // Start loading state

        const workoutsRef = collection(
          db,
          "workouts",
          user.uid,
          "weeklyWorkouts"
        );

        const unsubscribeSnapshot = onSnapshot(workoutsRef, (snapshot) => {
          const fetchedWorkouts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          if (fetchedWorkouts.length === 0) {
            setDoesntHaveWorkouts(true);
            setWorkouts([]);
          } else {
            setWorkouts(fetchedWorkouts[0].workouts);
            console.log(fetchedWorkouts[0].workouts);
          }

          const day = new Date().toLocaleDateString("en-US", {
            weekday: "long",
          });
          setCurrentDay(day);

          const todayWorkout = fetchedWorkouts
            .map((workout) => workout.workouts)
            .flat()
            .find((workout) => workout.day === day);

          if (todayWorkout) {
            // Sort by importance (fallback to 0 if missing)
            const sortedExercises = [...todayWorkout.exercises].sort(
              (a, b) => (b.importance || 0) - (a.importance || 0)
            );

            setTodaysExercises(sortedExercises);
            console.log("Today's exercises:", sortedExercises);
            setHasWorkouts(true);
          } else {
            setDoesntHaveWorkouts(true);
          }

          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribe();
  }, []);

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  //   console.log(formData);
  // };

  const calculateNextWeight = (exercise) => {
    // Ensure rir and reps are properly accessed, and use fallback if undefined
    const rir = formData[exercise.name]?.rir || 0;
    const reps = formData[exercise.name]?.reps || 0;
    const weight = formData[exercise.name]?.weight || 0;

    // Calculate the difference in RIR and reps
    const rirDiff = 2 - rir; // Assuming 2 is the target RIR
    const repDiff = 8 - reps; // Assuming 8 is the target reps

    // Calculate adjustments based on RIR and reps
    const rirAdjustment = rirDiff * 0.02; // 2% per RIR
    const repAdjustment = repDiff * 0.025; // 2.5% per rep

    // Total adjustment
    const totalAdjustment = rirAdjustment + repAdjustment;

    // Calculate and log the new weight
    const newWeight = weight * (1 + totalAdjustment);

    console.log(newWeight.toFixed(2));

    return +newWeight.toFixed(2); // Ensure the result is a number with two decimals
  };

  const handleEditExercise = (exerciseDay, exerciseName) => {
    console.log(`You clicked on: ${exerciseDay}`);
    console.log(`You clicked on: ${exerciseName}`);
    const theWorkoutDay = weeklyWorkout.workouts.find(
      (w) => w.day === exerciseDay
    );

    const theExercise = theWorkoutDay.exercises.find(
      (e) => e.name === exerciseName
    );

    console.log(theExercise);
    handleClick();
  };

  const handleExerciseClick = (exerciseDay, exerciseName) => {
    // console.log(`You clicked on: ${exerciseDay}`);
    // console.log(`You clicked on: ${exerciseName}`);

    console.log(weeklyWorkout.workouts);
    const theWorkoutDay = weeklyWorkout.workouts.find(
      (w) => w.day === exerciseDay
    );

    if (!theWorkoutDay) return;

    theWorkoutDay.exercises = theWorkoutDay.exercises.filter(
      (e) => e.name !== exerciseName
    );

    // console.log(theWorkoutDay.day);
    // console.log(theExercise.name);

    setWeeklyWorkout((prev) => ({
      ...prev,
      workouts: prev.workouts.map((workout) => {
        if (workout.day !== exerciseDay) return workout;
        return {
          ...workout,
          exercises: workout.exercises.filter((e) => e.name !== exerciseName),
        };
      }),
    }));
  };
  const handleExerciseClickFirebase = () => {
    // console.log(`You clicked on: ${exerciseDay}`);
    // console.log(`You clicked on: ${exerciseName}`);

    console.log(selectedExerciseFirebase);
    const theWorkoutDay = weeklyWorkout.workouts.find(
      (w) => w.day === exerciseDay
    );

    if (!theWorkoutDay) return;

    theWorkoutDay.exercises = theWorkoutDay.exercises.filter(
      (e) => e.name !== exerciseName
    );

    // console.log(theWorkoutDay.day);
    // console.log(theExercise.name);

    setWeeklyWorkout((prev) => ({
      ...prev,
      workouts: prev.workouts.map((workout) => {
        if (workout.day !== exerciseDay) return workout;
        return {
          ...workout,
          exercises: workout.exercises.filter((e) => e.name !== exerciseName),
        };
      }),
    }));
  };

  const handleExerciseChange = (e) => {
    setSelectedExercise(e.target.value);
  };

  // Handle day change
  const handleDayChange = (e) => {
    setSelectedDay(e.target.value);
  };

  const handleAddExercise = () => {
    console.log("Selected Exercise: ", selectedExercise);
    console.log("Selected Day: ", selectedDay);
    console.log("Weekly Workout: ", weeklyWorkout.workouts);

    const workoutIndex = weeklyWorkout.workouts.findIndex(
      (w) => w.day === selectedDay
    );

    if (workoutIndex === -1) {
      showNotification(
        `Day ${selectedDay} not found in workout plan.`,
        "error"
      );
      return;
    }

    const theWorkoutDay = weeklyWorkout.workouts[workoutIndex];

    if (theWorkoutDay.exercises.includes(selectedExercise)) {
      showNotification(
        `${selectedExercise} is already added to ${selectedDay}`,
        "error"
      );
      return;
    }

    // Check if the selected day is a rest day
    if (theWorkoutDay.split.toLowerCase() === "rest") {
      showNotification(`Can't add an exercise to a rest day!`, "error");
      return;
    }

    // Make a copy of the workouts array
    const updatedWorkouts = [...weeklyWorkout.workouts];

    const addedExercise = {
      name: selectedExercise,
      sets: Math.floor(Math.random() * 2) + 3, // 3–4 sets
      reps: [8, 10, 12][Math.floor(Math.random() * 3)],
      weight: 0,
    };

    // Update the exercises array for the selected day
    updatedWorkouts[workoutIndex] = {
      ...theWorkoutDay,
      exercises: [...theWorkoutDay.exercises, addedExercise],
    };

    // Update the state immutably
    setWeeklyWorkout({
      ...weeklyWorkout,
      workouts: updatedWorkouts,
    });

    showNotification(`Updated your workout!`, "success");
  };

  const handleSetChange = (e) => {
    setSets(e.target.value);
    console.log("Selected sets:", e.target.value);
  };

  const handleRepChange = (e) => {
    setReps(e.target.value);
    console.log("Selected reps:", e.target.value);
  };
  const updateRepsAndSets = () => {
    console.log(selectedDay);
    console.log(selectedExercise);

    const theWorkoutDay = weeklyWorkout.workouts.find(
      (w) => w.day === selectedDay
    );

    if (!theWorkoutDay) return;

    const theExercise = theWorkoutDay.exercises.find(
      (e) => e.name === selectedExercise
    );

    if (!theExercise) return;

    setWeeklyWorkout((prev) => ({
      ...prev,
      workouts: prev.workouts.map((workout) => {
        if (workout.day !== selectedDay) return workout;

        return {
          ...workout,
          exercises: workout.exercises.map((e) =>
            e.name === selectedExercise ? { ...e, sets, reps } : e
          ),
        };
      }),
    }));
    showNotification(`Updated sets and reps!`, "success");
    handleClose();
  };

  const updateRepsAndSetsFirebase = async () => {
    try {
      console.log("Day:", currentDay);
      console.log("Exercise:", selectedExerciseFirebase);

      const weeklyWorkoutsCollectionRef = collection(
        db,
        "workouts",
        user.uid,
        "weeklyWorkouts"
      );

      const snapshot = await getDocs(weeklyWorkoutsCollectionRef);

      if (snapshot.empty) {
        console.error("No weeklyWorkout document found");
        return;
      }

      const workoutDoc = snapshot.docs[0];
      const docRef = workoutDoc.ref;
      const data = workoutDoc.data();

      const workouts = data.workouts || [];

      const updatedWorkouts = workouts.map((workout) => {
        if (workout.day !== currentDay) return workout;

        const updatedExercises = workout.exercises.map((ex) => {
          if (ex.name !== selectedExerciseFirebase) return ex;
          return { ...ex, sets, reps };
        });

        return { ...workout, exercises: updatedExercises };
      });

      await updateDoc(docRef, {
        workouts: updatedWorkouts,
      });

      showNotification(`Updated sets and reps!`, "success");
      handleClose();
    } catch (error) {
      console.error("Error updating sets/reps:", error);
      showNotification("Error updating workout", "error");
    }
  };

  // const options = [
  //   "I'm not seeing results",
  //   "I want something new",
  //   "Too hard / too easy",
  //   "Didn't like it",
  //   "Other",
  // ];
  // === STATE ===

  // === CONVERSATION FLOW MAP ===
  // === 1. Conversation Map ===
  const conversationMap = {
    "I'm not seeing results": [
      "Got it! Let's look into how we can tweak your workout to be more effective.",
      {
        question: "How long have you been following your current routine?",
        options: ["Less than a month", "1-3 months", "Over 3 months"],
      },
      {
        question: "And how many times do you train each week?",
        options: ["3 Days", "4 Days", "5 Days"],
      },
      "Thanks! Based on this, I’ll analyze intensity, frequency, and recovery to improve your progress.",
    ],
    "I want something new": [
      "Nice! It's always great to switch things up, but changing your workout too often can slow progress.",
      {
        question:
          "Are you looking for something more fun, more challenging, or totally different?",
        options: ["More fun", "More challenging", "Totally different"],
      },
      {
        question: "What kind of training interests you most?",
        options: ["Strength", "Cardio", "HIIT", "Flexibility"],
      },
      "Awesome. I’ll build a fresh plan tailored to your new goals!",
    ],
    "Too hard / too easy": [
      "Balance is key. Let's adjust the difficulty to suit your needs better.",
      {
        question: "Is your current routine too easy or too hard?",
        options: ["Too easy", "Too hard"],
      },
      {
        question: "What part feels off?",
        options: ["Volume (sets/reps)", "Exercise selection", "Rest periods"],
      },
      "Thanks! I’ll fine-tune your plan to hit that sweet spot.",
    ],
    "Didn't like it": [
      "No worries! Let’s figure out what would work better for you.",
      {
        question: "What didn’t you like about it?",
        options: [
          "Too repetitive",
          "Too intense",
          "Not enjoyable",
          "Didn’t feel effective",
        ],
      },
      {
        question:
          "Would you prefer something more structured or more flexible?",
        options: ["Structured", "Flexible"],
      },
      "Cool — I’ll redesign it to match your preferences and keep it motivating.",
    ],
    Other: [
      "Totally fair. Tell me more, and we’ll build a plan around it.",
      {
        question: "Would you prefer to write your own goal or pick one?",
        options: ["Write my goal", "Pick one"],
      },
      {
        question: "Now, do you have access to any equipment?",
        options: ["Yes", "No", "Some basic stuff"],
      },
      "Perfect. That helps me shape the right plan around what you have!",
    ],
  };

  // === 2. Messaging ===
  function addMessage(from, text) {
    setMessages((prev) => [...prev, { from, text }]);
  }

  // === 3. Reset Chat ===
  function resetChat() {
    setOpenAiModal(false);
    setMessages([]);
    setTyping(false);
    setShowOptions(false);
    setStep(0);
    setCurrentFlow(null);
    setDisableOptions(false);
    setUserAnswers({});
    setOptions([]);
  }

  // === 4. Start Conversation ===
  function requestChange() {
    resetChat();
    setOpenAiModal(true);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      addMessage("bot", "Hello!");
      setTyping(true);

      setTimeout(() => {
        setTyping(false);
        addMessage(
          "bot",
          "I'm your workout assistant. Why are you considering changing your workout?"
        );
        setOptions(Object.keys(conversationMap));
        setShowOptions(true);
      }, 1000);
    }, 1000);
  }

  // === 5. Handle User Choice ===
  function handleUserChoice(choice) {
    if (disableOptions) return;

    const currentQuestion =
      currentFlow && step > 0 ? currentFlow[step - 1]?.question : null;
    if (currentQuestion) {
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion]: choice,
      }));
    }

    addMessage("user", choice);
    setDisableOptions(true);
    setShowOptions(false);

    if (choice === "Less than a month") {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        addMessage(
          "bot",
          "🚀 Progress takes time — stay consistent and you'll see amazing results soon."
        );
      }, 1000);
      return;
    }

    if (step === 0) {
      const flow = conversationMap[choice];
      setCurrentFlow(flow);
      setStep(1);

      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        handleBotStep(flow, 0);
      }, 1000);
      return;
    }

    handleCustomReplies(choice);

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setStep((prev) => prev + 1);
      handleBotStep(currentFlow, step);
    }, 1000);
  }

  // === 6. Custom Reply Logic ===
  function handleCustomReplies(choice) {
    if (!currentFlow) return;

    if (currentFlow === conversationMap["I want something new"] && step === 2) {
      const replyMap = {
        "More fun":
          "Let’s make your workouts feel more like play and less like a chore.",
        "More challenging":
          "Let’s crank things up! You’re ready for a new level of intensity. 🔥",
        "Totally different":
          "Fresh start — let’s explore something completely new.",
      };
      if (replyMap[choice]) addMessage("bot", replyMap[choice]);
    }

    if (currentFlow === conversationMap["Too hard / too easy"] && step === 2) {
      const msg =
        choice === "Too easy"
          ? "Got it — time to level things up so it feels more effective!"
          : "No problem — we’ll scale it back so it's more manageable.";
      addMessage("bot", msg);
    }

    if (currentFlow === conversationMap["Didn't like it"] && step === 2) {
      const replyMap = {
        "Too repetitive": "We’ll add more variety to keep things fresh.",
        "Too intense": "We’ll ease the intensity to find a better fit.",
        "Not enjoyable": "Let’s inject more enjoyment into it.",
        "Didn’t feel effective":
          "We’ll make sure your plan delivers noticeable results.",
      };
      if (replyMap[choice]) addMessage("bot", replyMap[choice]);
    }

    if (currentFlow === conversationMap["Other"] && step === 2) {
      const replyMap = {
        "Write my goal":
          "Awesome — feel free to share your goal and I’ll shape a plan around it.",
        "Pick one":
          "Great! I’ll help you explore some goal options that make sense.",
      };
      if (replyMap[choice]) addMessage("bot", replyMap[choice]);
    }
  }

  // === 7. Bot Step Handler ===
  function handleBotStep(flow, index) {
    const nextStep = flow[index + 1];

    if (!nextStep) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        addMessage(
          "bot",
          "That's all I need! I’ll start building your plan. 💪"
        );

        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          const generatedPlan = generateWorkoutFromAnswers(flow, userAnswers);
          if (generatedPlan) {
            console.log("✅ Final Plan:", generatedPlan);
            // setWeeklyWorkout(generatedPlan);
          } else {
            console.warn("⚠️ No plan generated.");
          }
        }, 1000);
      }, 1000);
      return;
    }

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      if (typeof nextStep === "string") {
        addMessage("bot", nextStep);
        setDisableOptions(false);
      } else if (typeof nextStep === "object") {
        addMessage("bot", nextStep.question);
        setOptions(nextStep.options);
        setShowOptions(true);
        setDisableOptions(false);
      }
    }, 1000);
  }

  const incrementSet = (exerciseId) => {
    setTodaysExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              completedSets: Math.min(ex.completedSets + 1, ex.sets),
            }
          : ex
      )
    );
  };

  const decrementSet = (exerciseId) => {
    setTodaysExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              completedSets: Math.max(ex.completedSets - 1, 0),
            }
          : ex
      )
    );
  };
  

  return (
    <div>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.visible}
        onClose={hideNotification}
      />
      {/* <nav className="nav-meal">
        <div className="nav-container">
          <div className="nav-brand">
            <a href="/">
              <ArrowLeft className="nav-logo" />
            </a>
            <Dumbbell className="nav-logo" />
            <span className="nav-title">TrainifAI</span>
          </div>
        </div>
      </nav> */}
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

      <div className="workoutWrapper">
        <div className="workoutCard">
          <div className="workoutCards">
            {doesntHaveWorkouts && (
              <div>
                <div className="header">
                  <Robot size={32} className="headerIcon" />
                  <h1 className="headerTitle">Workout Bot</h1>
                </div>

                <button
                  onClick={generateWorkout}
                  disabled={loading}
                  className="generateButton"
                >
                  <Robot size={20} />
                  {loading ? "Generating..." : "Generate Weekly Workout Plan"}
                </button>

                {/* Render weekly workout after it is generated */}
                {weeklyWorkout && (
                  <div className="weeklyWorkout">
                    <div className="weeklyWorkoutHeader">
                      <button
                        onClick={saveToFirebase}
                        disabled={loading}
                        className="saveButton"
                      >
                        <Save size={20} />
                        Save Workout
                      </button>
                    </div>
                    {/* Display the generated workout */}

                    <div className="workoutDays">
                      <select
                        id="day-select"
                        value={selectedDay}
                        onChange={handleDayChange}
                      >
                        <option value="">Select Day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                      <div className="selectExercise">
                        <select
                          name="exercise"
                          id="exercise-select"
                          value={selectedExercise}
                          onChange={handleExerciseChange}
                        >
                          <option value="">Add Exercise</option>

                          <optgroup label="Chest">
                            <option value="Bench Press">Bench Press</option>
                            <option value="Incline Press">Incline Press</option>
                            <option value="Decline Press">Decline Press</option>
                            <option value="Dumbbell Flyes">
                              Dumbbell Flyes
                            </option>
                            <option value="Cable Crossovers">
                              Cable Crossover
                            </option>
                            <option value="Push-Ups">Push-Ups</option>
                          </optgroup>

                          <optgroup label="Back">
                            <option value="Pull-Ups">Pull-Up</option>
                            <option value="Rows">Row</option>
                            <option value="Lat Pulldowns">Lat Pulldown</option>
                            <option value="Seated Cable Rows">
                              Seated Cable Row
                            </option>
                            <option value="Deadlifts">Deadlift</option>
                            <option value="T-Bar Rows">T-Bar Row</option>
                          </optgroup>

                          <optgroup label="Arms">
                            <option value="Bicep Curls">Bicep Curl</option>
                            <option value="Tricep Pushdowns">
                              Tricep Pushdown
                            </option>
                            <option value="Hammer Curls">Hammer Curl</option>
                            <option value="Preacher Curls">
                              Preacher Curl
                            </option>
                            <option value="Skull Crushers">
                              Skull Crushers
                            </option>
                            <option value="Overhead Tricep Extension">
                              Overhead Tricep Extension
                            </option>
                          </optgroup>

                          <optgroup label="Shoulders">
                            <option value="Overhead Press">
                              Overhead Press
                            </option>
                            <option value="Lateral Raises">
                              Lateral Raises
                            </option>
                            <option value="Front Raises">Front Raises</option>
                            <option value="Rear Delt Flyes">
                              Rear Delt Flyes
                            </option>
                            <option value="Arnold Press">Arnold Press</option>
                            <option value="Shrugs">Shrugs</option>
                          </optgroup>

                          <optgroup label="Legs">
                            <option value="Squats">Squat</option>
                            <option value="Leg Press">Leg Press</option>
                            <option value="Lunges">Lunges</option>
                            <option value="Leg Extension">Leg Extension</option>
                            <option value="Leg Curls">Leg Curl</option>
                            <option value="Step-Ups">Step-Ups</option>
                          </optgroup>

                          <optgroup label="Core">
                            <option value="Plank">Plank</option>
                            <option value="Crunches">Crunches</option>
                            <option value="Leg Raises">Leg Raises</option>
                            <option value="Russian Twists">
                              Russian Twist
                            </option>
                            <option value="Ab Wheel Rollout">
                              Ab Wheel Rollout
                            </option>
                            <option value="Mountain Climbers">
                              Mountain Climbers
                            </option>
                          </optgroup>

                          <optgroup label="Glutes">
                            <option value="Hip Thrusts">Hip Thrust</option>
                            <option value="Glute Bridge">Glute Bridge</option>
                            <option value="Cable Kickbacks">
                              Cable Kickbacks
                            </option>
                            <option value="Deadlifts">Deadlift</option>
                            <option value="Bulgarian Split Squats">
                              Bulgarian Split Squat
                            </option>
                            <option value="Frog Pumps">Frog Pumps</option>
                          </optgroup>
                        </select>

                        <button
                          className="addExercise"
                          onClick={handleAddExercise}
                        >
                          Add
                        </button>
                      </div>
                      {weeklyWorkout.workouts.map((workoutDay, index) => (
                        <div key={index} className="workoutDay">
                          <h3>{workoutDay.day}</h3>
                          {workoutDay.exercises.length > 0 ? (
                            <div className="exercises">
                              {workoutDay.exercises.map((exercise, exIndex) => (
                                <div key={exIndex} className="exercise">
                                  <p className="exerciseTitle">
                                    {exercise.name}
                                  </p>
                                  <p className="exerciseDetails">
                                    {exercise.sets} sets × {exercise.reps} reps
                                  </p>
                                  <Trash2
                                    className="deleteTrash"
                                    onClick={() =>
                                      handleExerciseClick(
                                        workoutDay.day,
                                        exercise.name
                                      )
                                    }
                                  />
                                  <Pencil
                                    className="pencil"
                                    onClick={(event) =>
                                      handleClick(
                                        event,
                                        workoutDay.day,
                                        exercise.name
                                      )
                                    }
                                  />
                                  <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    MenuListProps={{
                                      "aria-labelledby": "basic-button",
                                    }}
                                  >
                                    <MenuItem>
                                      <div className="menuWrapper">
                                        <select
                                          name="sets"
                                          id="sets"
                                          className="menuselect"
                                          value={sets}
                                          onChange={handleSetChange}
                                        >
                                          <option value="">Sets</option>
                                          {[...Array(5)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                              {i + 1}
                                            </option>
                                          ))}
                                        </select>

                                        <select
                                          name="reps"
                                          id="reps"
                                          className="menuselect"
                                          value={reps}
                                          onChange={handleRepChange}
                                        >
                                          <option value="">Reps</option>
                                          {[...Array(15)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                              {i + 1}
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          className="addReps"
                                          onClick={updateRepsAndSets}
                                        >
                                          Update
                                        </button>
                                      </div>
                                    </MenuItem>
                                  </Menu>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No exercises for this day.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {hasWorkouts ? (
              <div className="grid gap-6">
                {/* <p>{currentDay}</p> */}
                {workouts.length > 0 ? (
                  <div className="space-y-3">
                    {/* {workouts.map((day, index) => ( */}
                    <div>
                      <div className="workoutCardwrapper">
                        <h3 className="exerciseDayTitle">{currentDay}</h3>
                        {todaysExercises.length > 0 ? (
                          <div className="space-y-3">
                            {[...todaysExercises]
                              .sort((a, b) => {
                                const musclePriorityByGender = {
                                  male: [
                                    "chest",
                                    "back",
                                    "arms",
                                    "shoulders",
                                    "legs",
                                    "glutes",
                                    "core",
                                  ],
                                  female: [
                                    "glutes",
                                    "legs",
                                    "core",
                                    "back",
                                    "shoulders",
                                    "arms",
                                    "chest",
                                  ],
                                };

                                const priority =
                                  musclePriorityByGender[gender] ||
                                  musclePriorityByGender.male;

                                const getMuscleGroup = (exerciseName) => {
                                  for (const group in exerciseDatabase) {
                                    if (
                                      exerciseDatabase[group].includes(
                                        exerciseName
                                      )
                                    ) {
                                      return group;
                                    }
                                  }
                                  return "core"; // fallback group
                                };

                                const aGroup = getMuscleGroup(a.name);
                                const bGroup = getMuscleGroup(b.name);

                                return (
                                  priority.indexOf(aGroup) -
                                  priority.indexOf(bGroup)
                                );
                              })
                              .map((exercise, exIndex) => (
                                <div key={exIndex} className="exercise">
                                  <p className="exerciseTitle">
                                    {exercise.name}
                                  </p>
                                  <p className="exerciseDetails">
                                    {exercise.sets} sets × {exercise.reps} reps
                                  </p>
                                  <Pencil
                                    className="pencil"
                                    onClick={(event) => {
                                      handleClickFirebase(event, exercise.name);
                                    }}
                                  />
                                  <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    MenuListProps={{
                                      "aria-labelledby": "basic-button",
                                    }}
                                  >
                                    <MenuItem>
                                      <div className="menuWrapper">
                                        <select
                                          name="sets"
                                          id="sets"
                                          className="menuselect"
                                          value={sets}
                                          onChange={handleSetChange}
                                        >
                                          <option value="">Sets</option>
                                          {[...Array(5)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                              {i + 1}
                                            </option>
                                          ))}
                                        </select>

                                        <select
                                          name="reps"
                                          id="reps"
                                          className="menuselect"
                                          value={reps}
                                          onChange={handleRepChange}
                                        >
                                          <option value="">Reps</option>
                                          {[...Array(15)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                              {i + 1}
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          className="addReps"
                                          onClick={updateRepsAndSetsFirebase}
                                        >
                                          Update
                                        </button>
                                      </div>
                                    </MenuItem>
                                  </Menu>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p>No exercises planned for this day.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No workouts available.</p>
                )}
              </div>
            ) : (
              <></>
            )}
          </div>
          {/* {hasWorkouts ? (
            <div className="requestWrapper">
              <div>Wanna change your workout?</div>
              <button
                className="btn btn-primary cursor"
                // onClick={() => setOpenAiModal(true)}
                onClick={requestChange}
              >
                Request
              </button>
            </div>
          ) : (
            <></>
          )} */}
        </div>

        {openAiModal && (
          <div className="nf_fixed_containerChat">
            <div className="nf_cardChat">
              {/* Header */}
              <div className="nf_header">
                <h3 className="nf_title">Chat</h3>
                <h3 className="x" onClick={resetChat}>
                  X
                </h3>
              </div>

              {/* Scrollable Chat Content */}
              <div className="nf_contentChat">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={msg.from === "bot" ? "botText" : "userText"}
                  >
                    {msg.from === "bot" ? (
                      <>
                        <Image
                          src={trainifai}
                          alt="AI logo"
                          className="ailogo"
                        />
                        <p>{msg.text}</p>
                      </>
                    ) : (
                      <>
                        <p>{msg.text}</p>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="userLogo"
                        >
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </>
                    )}
                  </div>
                ))}

                {typing && (
                  <div className="botText">
                    <Image src={trainifai} alt="AI logo" className="ailogo" />
                    <p className="typing-dots">...</p>
                  </div>
                )}

                {/* <div ref={messagesEndRef} /> */}
              </div>

              {/* Options */}
              {showOptions && (
                <div className="options">
                  {options.map((opt, i) => (
                    <button
                      key={i}
                      className="optionBtn cursor"
                      onClick={() => handleUserChoice(opt)}
                      disabled={disableOptions}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
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
    </div>
  );
}
