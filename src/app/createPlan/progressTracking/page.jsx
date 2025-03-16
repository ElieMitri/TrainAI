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
} from "lucide-react";
import { Line, Pie } from "react-chartjs-2"; // Import the Line component from react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// import './styles.css';
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
import { db, auth } from "../../../../firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
  signOut as firebaseSignOut,
} from "firebase/auth";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


function Page() {
  const [step, setStep] = useState(1);
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState([]);
  const [userData, setUserData] = useState({
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

  const [generatedPlan, setGeneratedPlan] = useState(
    null
  );
  const [user, setUser] = useState(null);
  const [chartProgress, setChartProgress] = useState(null);
  const [macros, setMacros] = useState(null);
  const [weightProgress, setWeightProgress] = useState(null);
  const handleInputChange = (
    e
  ) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 🔹 Save user details to Firestore
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
    } catch (error) {
      console.error("Error creating account:", error.message);
      alert(error.message);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      console.log("User:", currentUser);

      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data()); // ✅ Update userData immediately
          } else {
            console.log("No such user found!");
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Ensure 'user' exists and has a valid 'uid'
    if (!user || !user.uid) {
      console.log("User is not valid or user.uid is missing");
      return;
    }

    // Set loading to true before fetching
    setLoading(true);

    // Function to fetch document from Firestore
    const fetchNutritionData = async () => {
      try {
        console.log("Fetching data for user ID:", user.uid); // Debugging: log user ID
        const docRef = doc(db, "personMacros", user.uid); // Firestore document reference

        // Fetch the document from Firestore
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data()); // Debugging: log document data
          setMacros(docSnap.data()); // Update the macros state with the fetched data
          const nutritionChartData = {
            labels: ["Protein", "Carbs", "Fats"],
            datasets: [
              {
                data: [150, 300, 80], // manually set values here
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
        } else {
          console.log("No such document!"); // If the document doesn't exist
        }
      } catch (error) {
        console.error("Error fetching document:", error); // Log errors
      } finally {
        setLoading(false); // Set loading to false when done
      }
    };

    fetchNutritionData(); // Call the async function to fetch data
  }, [user]); // The effect runs when 'user' changes

  useEffect(() => {
    if (!user?.uid) {
      console.log("User is not valid or user.uid is missing");
      return;
    }
  
    setLoading(true);
  
    const fetchAllDocuments = async () => {
      try {
        console.log("Fetching all documents from clientWeight subcollection");
  
        // Reference to the 'clientWeight' subcollection under 'weightProgress/{user.uid}'
        const clientWeightRef = collection(db, "weightProgress", user.uid, "clientWeight");
  
        // Fetch all the documents in the subcollection
        const querySnapshot = await getDocs(clientWeightRef);
  
        // Check if documents exist
        if (querySnapshot.empty) {
          console.log("No documents found in the clientWeight subcollection.");
          setLoading(false);
          return;
        }
  
        // Extract and store the data from each document
        const allDocuments = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Document data:", data); // Log document data to check
  
          // Check if 'date' is a Firestore Timestamp and convert it to a Date object
          const validDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
  
          return {
            ...data,
            date: validDate,
          };
        });
  
        // Ensure data is sorted based on the date field
        const sortedDocuments = allDocuments.sort((a, b) => a.date - b.date);
  
        // Collect the weight data and corresponding dates
        const weightArray = sortedDocuments.map((doc) => doc.weight);
        const dateLabels = sortedDocuments.map((doc) =>
          doc.date.toLocaleDateString() || "Invalid Date"
        );
  
        // Set the state with the sorted data for the chart
        setLineData(weightArray);
        setLabels(dateLabels);
  
        console.log("Fetched all documents:", sortedDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };
  
    fetchAllDocuments(); // Call the async function to fetch data
  }, [user, db]); // This effect runs when 'user' or 'db' changes
  // Chart data structure
  const weightChart = {
    labels: labels, // Now this will contain the actual dates
    datasets: [
      {
        label: "My Weight",
        data: lineData, // This will contain the weight data for those dates
        fill: false,
        borderColor: "rgb(200, 150, 255)", // Lighter purple
        tension: 0.1,
      },
    ],
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

      <div className="main-wrapper">
        <main className="main">
          <div className="container">
            {/* <div className="plan-container">
              <div className="plan-section"> */}
            {loading ? (
              <></>
            ) : (
              <div>
                {/* <div className="nutrition-chart"> */}
                <Line data={weightChart} />
                {/* <h3 className="chart-title">Daily Nutrition Breakdown</h3> */}
                {/* <Pie data={nutritionChartData} /> */}
                <div
                  style={{
                    marginTop: "1rem",
                    textAlign: "center",
                    color: "black",
                  }}
                >
                  {/* {macros ? (
                          <>
                            <p>Total Calories: {macros.calories} kcal</p>
                            <p>Protein: {macros.protein} g</p>
                            <p>Carbs: {macros.carbs} g</p>
                            <p>Fats: {macros.fats} g</p>
                          </>
                        ) : (
                          <p>Loading macros data...</p> // Display a message while macros is still loading
                        )} */}
                </div>
                {/* </div> */}
              </div>
            )}
            {/* </div>
            </div> */}
          </div>
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
