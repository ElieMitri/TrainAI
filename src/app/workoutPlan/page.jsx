"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Edit3,
  Check,
  Plus,
  TrendingUp,
  Clock,
  Target,
  Zap,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  ArrowLeft,
  Save,
  Trash2,
  Pencil,
} from "lucide-react";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";

// Your existing interfaces and data

// Your existing muscle groups and exercise database
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
  // Your existing state variables
  const [weeklyWorkout, setWeeklyWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [todaysExercises, setTodaysExercises] = useState([
    { id: "1", name: "Pull-Ups", sets: 3, reps: 7, completedSets: 0 },
    { id: "2", name: "Chest Dips", sets: 3, reps: 8, completedSets: 0 },
    {
      id: "3",
      name: "Military Press",
      sets: 3,
      reps: 10,
      completedSets: 0,
      weight: 135,
    },
    { id: "4", name: "Push-Ups", sets: 3, reps: 10, completedSets: 0 },
    {
      id: "5",
      name: "Lat Pulldowns",
      sets: 4,
      reps: 12,
      completedSets: 0,
      weight: 120,
    },
    {
      id: "6",
      name: "Lateral Raises",
      sets: 3,
      reps: 10,
      completedSets: 0,
      weight: 25,
    },
    {
      id: "7",
      name: "Close-Grip Bench Press",
      sets: 4,
      reps: 10,
      completedSets: 0,
      weight: 185,
    },
    {
      id: "8",
      name: "Cable Tricep Pushdowns",
      sets: 3,
      reps: 12,
      completedSets: 0,
      weight: 60,
    },
  ]);
  const [currentDay, setCurrentDay] = useState("Friday");
  const [hasWorkouts, setHasWorkouts] = useState(true);
  const [doesntHaveWorkouts, setDoesntHaveWorkouts] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [originalTimerSeconds] = useState(90);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExerciseFirebase, setSelectedExerciseFirebase] = useState("");
  const [formData, setFormData] = useState({});
  const [gender, setGender] = useState("male");
  const [userTrainingDays, setUserTrainingDays] = useState(5);
  //   const [selectedExerciseFirebase, setSelectedExercisefirbase] = useState("");

  // Calculate progress
  //   const totalSets = todaysExercises.reduce((sum, ex) => sum + ex.sets, 0);
  let totalSets = 0;

  if (Array.isArray(todaysExercises)) {
    for (let i = 0; i < todaysExercises.length; i++) {
      totalSets += todaysExercises[i].sets || 0;
    }
  }

  console.log("Total sets:", totalSets);

  const completedSets = todaysExercises.reduce(
    (sum, ex) => sum + (ex.completedSets || 0),
    0
  );

  const safeCompleted = Number(completedSets) || 0;
  const safeTotal = Number(totalSets) || 0;

  const progressPercentage =
    safeTotal > 0 ? (safeCompleted / safeTotal) * 100 : 0;

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds]);

  // Your existing functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimerSeconds(originalTimerSeconds);
  };

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

  const handleClickFirebase = (event, exerciseName) => {
    setAnchorEl(event.currentTarget); // Set anchor element to the clicked icon
    setSelectedExercisefirbase(exerciseName); // Set selected exercise name
  };

  const handleClick = (event, workoutDay, exerciseName) => {
    setAnchorEl(event.currentTarget); // Set anchor element to the clicked icon
    setSelectedDay(workoutDay); // Set selected day
    setSelectedExercise(exerciseName); // Set selected exercise name
  };

  const today = new Date();
  const formattedDate = today.toLocaleString("en-US", {
    month: "short", // "Dec"
    day: "numeric", // "13"
  });

  console.log(formattedDate); // e.g., "Jun 14"

  return (
    <div className="app">
      <div className="app__background"></div>

      <div className="app__content">
        {/* Navigation */}
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

        {/* Main Content */}
        {doesntHaveWorkouts && (
          <div className="workout-generator">
            <div className="generator__header">
              <div className="generator__icon">
                <Dumbbell />
              </div>
              <h1 className="generator__title">Workout Bot</h1>
            </div>

            <button
              onClick={generateWorkout}
              disabled={loading}
              className="btn btn--generate"
            >
              <Dumbbell className="btn__icon" />
              {loading ? "Generating..." : "Generate Weekly Workout Plan"}
            </button>

            {weeklyWorkout && (
              <div className="workout-plan">
                <div className="workout-plan__header">
                  <button
                    onClick={saveToFirebase}
                    disabled={loading}
                    className="btn btn--save"
                  >
                    <Save className="btn__icon" />
                    Save Workout
                  </button>
                </div>
                {/* Your existing workout plan display logic */}
              </div>
            )}
          </div>
        )}

        {hasWorkouts && (
          <div className="workout-tracker">
            {/* Header */}
            <div className="headerWorkout">
              {/* <div className="header__top">
                <div className="header__branding">
                  <div className="header__logo">
                    <Zap className="header__logo-icon" />
                  </div>
                  <div>
                    <h1 className="header__title">FitTracker</h1>
                    <p className="header__subtitle">Your workout companion</p>
                  </div>
                </div>
                <Calendar className="header__calendar" />
              </div> */}

              {/* Day Navigation */}
              <div className="day-nav">
                <button className="day-nav__button">
                  <ChevronLeft className="day-nav__icon" />
                </button>
                <div className="day-nav__info">
                  <h2 className="day-nav__day">{currentDay}</h2>
                  <p className="day-nav__date">{formattedDate}</p>
                </div>
                <button className="day-nav__button">
                  <ChevronRight className="day-nav__icon" />
                </button>
              </div>

              {/* Progress Card */}
              <div className="card progress-card">
                <div className="progress-card__header">
                  <div className="progress-card__label">
                    <TrendingUp className="progress-card__icon" />
                    <span className="progress-card__text">
                      Workout Progress
                    </span>
                  </div>
                  <span className="progress-card__percentage">
                    {Math.round(progressPercentage.toFixed(0))}%
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-bar__fill"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>

                <div className="progress-card__stats">
                  <span>
                    {completedSets} of {totalSets} sets
                  </span>
                  <span>{todaysExercises.length} exercises</span>
                </div>
              </div>

              {/* Timer Card */}
              {/* <div className="card timer-card">
                <div className="timer__container">
                  <div className="timer__info">
                    <Clock className="timer__icon" />
                    <div>
                      <p className="timer__label">Rest Timer</p>
                      <p className="timer__duration">90 seconds</p>
                    </div>
                  </div>
                  
                  <div className="timer__controls">
                    <span className="timer__display">
                      {formatTime(timerSeconds)}
                    </span>
                    <div className="timer__buttons">
                      <button
                        onClick={toggleTimer}
                        className="timer__btn timer__btn--primary"
                      >
                        {isTimerActive ? (
                          <Pause className="timer__btn-icon" />
                        ) : (
                          <Play className="timer__btn-icon timer__btn-icon--play" />
                        )}
                      </button>
                      <button
                        onClick={resetTimer}
                        className="timer__btn timer__btn--secondary"
                      >
                        <RotateCcw className="timer__btn-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Exercises List */}
            <div className="exercises">
              {todaysExercises.map((exercise) => {
                const isCompleted = exercise.completedSets === exercise.sets;
                const isInProgress =
                  exercise.completedSets > 0 &&
                  exercise.completedSets < exercise.sets;

                return (
                  <div
                    key={exercise.id}
                    className={`exercise ${
                      isCompleted
                        ? "exercise--completed"
                        : isInProgress
                        ? "exercise--in-progress"
                        : ""
                    }`}
                  >
                    {/* Exercise Header */}
                    <div className="exercise__header">
                      <div className="exercise__info">
                        <div className="exercise__title-row">
                          <h3 className="exercise__name">{exercise.name}</h3>
                          {isCompleted && (
                            <div className="exercise__completed-badge">
                              <Check className="exercise__completed-icon" />
                            </div>
                          )}
                        </div>
                        <div className="exercise__details">
                          <span>
                            {exercise.sets} sets × {exercise.reps} reps
                          </span>
                          {/* {exercise.weight && (
                            <span className="exercise__weight">
                              <Target className="exercise__weight-icon" />
                              <span>{exercise.weight} lbs</span>
                            </span>
                          )} */}
                        </div>
                      </div>

                      {/* <button
                        className="exercise__edit-btn"
                        onClick={(event) =>
                          handleClickFirebase(event, exercise.name)
                        }
                      >
                        <Pencil className="exercise__edit-icon" />
                      </button> */}
                    </div>

                    {/* Sets Progress */}
                    <div className="exercise__sets">
                      <div className="exercise__sets-info">
                        <span className="exercise__sets-label">Sets:</span>
                        <div className="exercise__set-circles">
                          {Array.from({ length: exercise.sets }, (_, i) => (
                            <div
                              key={i}
                              className={`set-circle ${
                                i < exercise.completedSets
                                  ? "set-circle--completed"
                                  : ""
                              }`}
                            >
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="exercise__controls">
                        <button
                          onClick={() => decrementSet(exercise.id)}
                          disabled={exercise.completedSets === 0}
                          className="exercise__btn exercise__btn--decrement"
                        >
                          −
                        </button>
                        <span className="exercise__counter">
                          {exercise.completedSets}
                        </span>
                        <button
                          onClick={() => incrementSet(exercise.id)}
                          disabled={exercise.completedSets === exercise.sets}
                          className="exercise__btn exercise__btn--increment"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Completion Status */}
                    {isCompleted && (
                      <div className="exercise__completion">
                        <Check className="exercise__completion-icon" />
                        <span className="exercise__completion-text">
                          Exercise completed!
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Exercise Button */}
            {/* <button className="btn btn--add-exercise">
              <Plus className="btn__icon" />
              <span>Add Exercise</span>
            </button> */}

            {/* Complete Workout Button */}
            {completedSets === totalSets && (
              <button className="btn btn--complete-workout">
                <Check className="btn__icon" />
                <span>Complete Workout</span>
              </button>
            )}
          </div>
        )}

        {/* Edit Modal (simplified version of your MUI Menu) */}
        {anchorEl && (
          <div className="modal-overlay" onClick={handleClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h3>Edit Exercise</h3>
                <button onClick={handleClose} className="modal__close">
                  ×
                </button>
              </div>
              <div className="modal__content">
                <div className="form-group">
                  <label>Sets</label>
                  <select value={sets} onChange={handleSetChange}>
                    <option value="">Sets</option>
                    {[...Array(5)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Reps</label>
                  <select value={reps} onChange={handleRepChange}>
                    <option value="">Reps</option>
                    {[...Array(15)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn btn--update"
                  onClick={updateRepsAndSetsFirebase}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
