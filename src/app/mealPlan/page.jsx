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
  Instagram,
  Mail,
} from "lucide-react";
import { GiMeal } from "react-icons/gi";
import { FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaRedditAlien } from "react-icons/fa";
// import {
//   Activity,
//   Dumbbell,
//   Home,
//   User,
//   Utensils,
//   X,
//   Crown,
//   Settings,
//   LogOut,
//   Instagram,
//   Mail,
// } from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  Timestamp,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  onSnapshot as onCollectionSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../../firebase"; // Make sure these are correctly initialized
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Notification from "../components/Notification";
import axios from "axios";

const parseMealPlan = (rawText) => {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const flatMeals = [];
  let currentMeal = null;
  let isFinalTotals = false;

  for (let line of lines) {
    const mealMatch = line.match(/^Meal:\s*(.+)/i);
    if (mealMatch) {
      if (currentMeal) flatMeals.push(currentMeal);
      currentMeal = {
        title: mealMatch[1],
        items: [],
        macros: {},
      };
      isFinalTotals = false;
      continue;
    }

    if (/^Final Total:/i.test(line)) {
      if (currentMeal) flatMeals.push(currentMeal);
      currentMeal = {
        title: "Final Total",
        items: [],
        macros: {},
      };
      isFinalTotals = true;
      continue;
    }

    // Food line
    if (/^-/.test(line) && !/Calories|Protein|Carbs|Fats/i.test(line)) {
      const parts = line.slice(1).split(/[:-]/);
      const item = parts[0]?.trim();
      const portion = parts.slice(1).join(":").trim();
      if (item && portion && !isFinalTotals) {
        currentMeal?.items.push({ item, portion });
      }
      continue;
    }

    // Macros
    const macros = currentMeal?.macros;
    if (/Calories:/i.test(line)) {
      const match = line.match(/Calories:\s*(\d+)/i);
      if (match) macros.calories = `${match[1]} kcal`;
    }
    if (/Protein:/i.test(line)) {
      const match = line.match(/Protein:\s*(\d+)/i);
      if (match) macros.protein = `${match[1]} g`;
    }
    if (/Carbs|Carbohydrates/i.test(line)) {
      const match = line.match(/(?:Carbs|Carbohydrates):\s*(\d+)/i);
      if (match) macros.carbs = `${match[1]} g`;
    }
    if (/Fats?/i.test(line)) {
      const match = line.match(/Fats?:\s*(\d+)/i);
      if (match) macros.fats = `${match[1]} g`;
    }
  }

  if (currentMeal) flatMeals.push(currentMeal);

  // 👇 Post-process: nest snacks under previous meal
  const structuredMeals = [];
  let lastMainMeal = null;

  for (const meal of flatMeals) {
    if (/snack/i.test(meal.title)) {
      if (lastMainMeal) {
        lastMainMeal.snacks = lastMainMeal.snacks || [];
        lastMainMeal.snacks.push(meal);
      } else {
        structuredMeals.push(meal); // orphan snack, fallback
      }
    } else if (meal.title === "Final Total") {
      structuredMeals.push(meal);
    } else {
      structuredMeals.push(meal);
      lastMainMeal = meal;
    }
  }

  return structuredMeals;
};

function Page() {
  const router = useRouter();
  // Renamed to "Page" (React component names should start with uppercase)
  const [generatedMealPlan, setGeneratedMealPlan] = useState(false);
  const [error, setError] = useState("");
  const [mealPlans, setMealPlans] = useState(null);
  const [calories, setCalories] = useState(2000);
  const [dietType, setDietType] = useState("balanced");
  const [mealPlan, setMealPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [parsedPlan, setParsedPlan] = useState("");
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(true);
  const [generating, setGenerating] = useState(false);

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

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     console.log("Auth state changed:", currentUser.uid); // Log the actual user first

  //     setUser(currentUser); // Update state

  //     if (currentUser) {
  //       const fetchUserData = async () => {
  //         try {
  //           const userDocRef = doc(db, "personMacros", currentUser.uid);
  //           const userDocSnap = await getDoc(userDocRef);

  //           if (userDocSnap.exists()) {
  //             console.log("User data fetched:", userDocSnap.data());
  //             setUserData(userDocSnap.data());
  //             setLoading(false);
  //           } else {
  //             console.warn("No such user found!");
  //             setUserData(null);
  //           }
  //         } catch (error) {
  //           console.error("Error fetching user data:", error);
  //           setUserData(null);
  //         }
  //       };

  //       fetchUserData();
  //     } else {
  //       setUserData(null);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);

  const toggleNutritionCard = () => {
    setIsMinimized(!isMinimized);
  };

  //   if (!user) {
  //     alert("No user found!");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     // 1. Get user data from Firestore
  //     const userRef = doc(db, "users", user.uid);
  //     const userSnap = await getDoc(userRef);
  //     const userData = userSnap.data();

  //     // 2. Send userData to backend
  //     const response = await fetch("http://localhost:5001/generate", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ userData }),
  //     });

  //     const result = await response.json();

  //     if (response.ok && result.mealPlan) {
  //       // 3. Save the meal plan to Firestore from frontend
  //       await addDoc(collection(db, "mealPlans"), {
  //         userId: user.uid,
  //         mealPlan: result.mealPlan,
  //         createdAt: serverTimestamp(),
  //       });

  //       alert("Meal plan saved successfully!");
  //     } else {
  //       alert("Failed to generate meal plan.");
  //     }
  //   } catch (error) {
  //     console.error("Error generating meal plan:", error);
  //     alert("Something went wrong.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   const fetchMealPlans = async () => {
  //     if (!user) {
  //       console.warn("No user found");
  //       return;
  //     }

  //     try {
  //       // Fetch meal plans from the subcollection 'weeklyPlans' for the current user
  //       const mealPlansRef = collection(
  //         db,
  //         "mealPlans",
  //         user.uid,
  //         "weeklyPlans"
  //       );
  //       const mealPlansSnapshot = await getDocs(mealPlansRef);

  //       // Map over the fetched documents and set the state
  //       const fetchedMealPlans = mealPlansSnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));

  //       setMealPlans(fetchedMealPlans); // Update the state with the fetched meal plans
  //     } catch (error) {
  //       console.error("Error fetching meal plans:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchMealPlans();
  // }, [user]);
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setUserData(null);
        setMealPlans([]);
        setTodaysMeals([]);
        setLoading(false);
        return;
      }

      // Real-time listener for user profile (optional, if needed)
      const profileRef = doc(db, "users", currentUser.uid);
      const unsubscribeUser = onSnapshot(profileRef, (profileSnap) => {
        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          // console.log("User profile updated:", profileData);
          // Optional: store profile data separately
          // setUserProfile(profileData);
          if (profileData.generatedMealPlan === true) {
            setGeneratedMealPlan(true);
          } else {
            setGeneratedMealPlan(false);
          }

          if (profileData.paid === true) {
            // setGeneratedMealPlan(true);
          } else {
            // setGeneratedMealPlan(false);
            router.push("/");
          }
        }
      });

      // Real-time listener for personMacros
      const userMacrosRef = doc(db, "personMacros", currentUser.uid);
      const unsubscribeMacros = onSnapshot(userMacrosRef, (snap) => {
        if (snap.exists()) {
          setUserData(snap.data());
        } else {
          console.warn("No personMacros found.");
          setUserData(null);
        }
      });

      // Real-time listener for mealPlans
      const mealPlansRef = collection(
        db,
        "mealPlans",
        currentUser.uid,
        "weeklyPlans"
      );
      const unsubscribeMeals = onCollectionSnapshot(
        mealPlansRef,
        (snapshot) => {
          const fetchedMealPlans = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setMealPlans(fetchedMealPlans);

          // Determine today's meals
          const today = new Date();
          const dayOfWeek = today.toLocaleString("default", {
            weekday: "long",
          });
          const todaysMeals = [];

          for (const plan of fetchedMealPlans) {
            for (const meal of plan.meals) {
              if (meal.day === dayOfWeek) {
                todaysMeals.push(meal);
                break;
              }
            }
          }

          setTodaysMeals(todaysMeals);
          setGeneratedMealPlan(todaysMeals.length > 0);
          setLoading(false);
        },
        (error) => {
          console.error("Real-time meal plan error:", error);
          setMealPlans([]);
          setTodaysMeals([]);
          setGeneratedMealPlan(false);
          setLoading(false);
        }
      );

      // Cleanup all listeners
      return () => {
        unsubscribeUser();
        unsubscribeMacros();
        unsubscribeMeals();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  // console.log(todaysMeals[0].day);

  // const generateAiMealPlan = async () => {
  //   try {
  //     // Start the loading state and reset error
  //     setLoading(true);
  //     setError(""); // Reset any existing error messages

  //     // Log user data to see what you're sending
  //     console.log("Sending user data to backend:", userData);

  //     // Extract the relevant user data
  //     const relevantData = {
  //       calories: userData.calories,
  //       protein: userData.protein,
  //       carbs: userData.carbs,
  //       fats: userData.fats,
  //     };

  //     // Log the relevant data to ensure it's an object, not a string
  //     console.log("Sending relevant data:", relevantData);

  //     // Make the API request to generate the meal plan
  //     const response = await axios.post(
  //       "http://localhost:3001/generate", // Backend endpoint
  //       relevantData, // Send relevant data as an object (no need to stringify it)
  //       {
  //         headers: {
  //           "Content-Type": "application/json", // Ensuring the request content type is correct
  //         },
  //       }
  //     );

  //     // Check if the response contains the expected data
  //     if (response.data && response.data.mealPlan) {
  //       const generatedPlan = response.data.mealPlan;
  //       setMealPlan(generatedPlan); // Set the meal plan state

  //       // Optionally, save the generated meal plan to Firebase
  //       const mealPlanRef = doc(db, "mealPlans", user.id); // Assuming you have user.id to associate the plan
  //       await setDoc(mealPlanRef, {
  //         ...relevantData, // Include relevant data in Firebase
  //         mealPlan: generatedPlan,
  //         createdAt: new Date(),
  //       });

  //       console.log("Meal plan saved to Firebase");
  //     } else {
  //       // If the response is invalid or missing mealPlan
  //       setError("Failed to generate meal plan. No data returned.");
  //     }
  //   } catch (error) {
  //     // Handle errors with a detailed message
  //     setError("Failed to generate meal plan. Please try again.");
  //     console.error("Error generating meal plan:", error.message);

  //     // Log error details if the error response is available
  //     if (error.response) {
  //       console.error("Error response from backend:", error.response.data);
  //     }
  //   } finally {
  //     // Set loading to false regardless of success or failure
  //     setLoading(false);
  //   }
  // };

  const generateAiMealPlan = async () => {
    try {
      setGenerating(true);
      setShowGenerateButton(false);
      setError("");

      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.uid) {
        throw new Error(
          "You must be logged in to generate and save a meal plan."
        );
      }

      const today = new Date().toDateString();
      const mealPlanRef = doc(
        db,
        "mealPlans",
        currentUser.uid,
        "allMeals",
        today
      );
      const existingMealDoc = await getDoc(mealPlanRef);

      if (existingMealDoc.exists()) {
        const data = existingMealDoc.data();
        if (data.createdDay !== today) {
          await setDoc(mealPlanRef, {}, { merge: true });
          setMealPlan(""); // Clear UI
        }
      }

      // Validate input
      const { calories, protein, carbs, fats } = userData || {};
      const isValid = [calories, protein, carbs, fats].every(
        (val) => typeof val === "number" && !isNaN(val)
      );

      if (!isValid) {
        throw new Error("Invalid user data. Please check your input values.");
      }

      const relevantData = { calories, protein, carbs, fats };
      console.log("📦 Sending relevant data:", relevantData);

      // Send request
      const response = await axios.post(
        "http://localhost:3001/generate",
        relevantData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("✅ Response from backend:", response.data);

      const generatedPlan = response?.data?.mealPlan;
      if (typeof generatedPlan !== "string") {
        throw new Error("Unexpected response format from AI meal generator.");
      }

      setMealPlan(generatedPlan);

      // Save to Firebase
      try {
        await setDoc(mealPlanRef, {
          ...relevantData,
          mealPlan: generatedPlan,
          createdAt: new Date(),
          createdDay: today,
        });
        console.log("✅ Meal plan saved to Firebase");
      } catch (firebaseError) {
        console.error("🔥 Firebase save error:", firebaseError);
        setError("Meal plan generated, but failed to save it.");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error || err.message || "Unknown error occurred.";
      console.error("❌ Error generating meal plan:", errorMsg);
      setMealPlan("");
      setError(errorMsg);
    } finally {
      setGenerating(false);
      setShowGenerateButton(true); // Always show button back at the end
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user?.uid) return;

      const today = new Date().toDateString();

      // const tomorrow = new Date();
      // tomorrow.setDate(tomorrow.getDate() + 1);
      // const fakeToday = tomorrow.toDateString();

      const mealPlanRef = doc(db, "mealPlans", user.uid, "allMeals", today); // 👈 doc for today only

      // 👇 Real-time Firestore listener for today’s plan
      const unsubscribePlan = onSnapshot(
        mealPlanRef,
        (docSnap) => {
          if (!docSnap.exists()) {
            console.log("ℹ️ No meal plan found for today.");
            setMealPlan("");
            setParsedPlan([]);
            setShowGenerateButton(true); // 👈 show "Generate" if no plan
            return;
          }

          const data = docSnap.data();
          const rawMealPlan = data?.mealPlan;
          const savedDay = data?.createdDay;

          if (
            typeof rawMealPlan === "string" &&
            rawMealPlan.trim().length > 0
          ) {
            setMealPlan(rawMealPlan);
            setParsedPlan(parseMealPlan(rawMealPlan));

            console.log("✅ Structured meal plan loaded");

            if (savedDay !== today) {
              setShowGenerateButton(true); // 👈 it's an old plan, allow regenerate
            } else {
              setShowGenerateButton(false); // 👈 plan is fresh, hide the button
            }
          } else {
            console.log("ℹ️ Meal plan exists but is not a valid string.");
            setMealPlan("");
            setParsedPlan([]);
            setShowGenerateButton(true);
          }
        },
        (err) => {
          console.error("❌ Firestore listener error:", err);
          setError("Failed to load your saved meal plan.");
          setShowGenerateButton(true);
        }
      );

      // Cleanup: unsubscribe Firestore listener on auth change
      return unsubscribePlan;
    });

    // Cleanup: unsubscribe auth listener on component unmount
    return () => unsubscribeAuth();
  }, []);

  const sortMealSections = (sections) => {
    const order = ["Breakfast", "Snack 1", "Lunch", "Snack 2", "Dinner"];

    // 🧹 Remove any section with "total" in the title
    const filteredSections = sections.filter(
      (section) => !section.title.toLowerCase().includes("total")
    );

    return filteredSections.sort((a, b) => {
      const indexA = order.findIndex((o) =>
        a.title.toLowerCase().includes(o.toLowerCase())
      );
      const indexB = order.findIndex((o) =>
        b.title.toLowerCase().includes(o.toLowerCase())
      );
      return indexA - indexB;
    });
  };

  useEffect(() => {
    if (mealPlan && typeof mealPlan === "string") {
      try {
        const structured = parseMealPlan(mealPlan);
        const sorted = sortMealSections(structured);
        setParsedPlan(sorted);
      } catch (err) {
        console.error("❌ Failed to parse meal plan:", err);
      }
    }
  }, [mealPlan]);

  return (
    <div className="min-h-screen">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.visible}
        onClose={hideNotification}
      />
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

      {loading ? (
        <></>
      ) : (
        <>
          <div className="nf_fixed_container">
            <div className={`nf_card ${isMinimized ? "nf_minimized" : ""}`}>
              <div className="nf_header">
                <h3 className="nf_title">Daily Nutrition</h3>
                <button className="nf_toggle_btn" onClick={toggleNutritionCard}>
                  <span className="nf_icon">{isMinimized ? "▼" : "▲"}</span>
                </button>
              </div>
              {!isMinimized && (
                <div className="nf_content">
                  <div className="nf_stat_row">
                    <span className="nf_stat_label">Calories</span>
                    <span className="nf_stat_value">{userData.calories}</span>
                    {/* <span className="nf_stat_remaining">850 remaining</span> */}
                  </div>
                  <div className="nf_divider"></div>
                  <div className="nf_macro_grid">
                    <div className="nf_macro_item">
                      <span className="nf_macro_label">Protein</span>
                      <span className="nf_macro_value">
                        {userData.protein}g
                      </span>
                      {/* <div className="nf_progress_bar">
                        <div
                          className="nf_progress_fill nf_protein_fill"
                          style={{ width: "65%" }}
                        ></div>
                      </div> */}
                      {/* <span className="nf_macro_remaining">42g left</span> */}
                    </div>
                    <div className="nf_macro_item">
                      <span className="nf_macro_label">Carbohydrates</span>
                      <span className="nf_macro_value">{userData.carbs}g</span>
                      {/* <div className="nf_progress_bar">
                        <div
                          className="nf_progress_fill nf_carbs_fill"
                          style={{ width: "70%" }}
                        ></div>
                      </div> */}
                      {/* <span className="nf_macro_remaining">68g left</span> */}
                    </div>
                    <div className="nf_macro_item">
                      <span className="nf_macro_label">Fats</span>
                      <span className="nf_macro_value">{userData.fats}g</span>
                      {/* <div className="nf_progress_bar">
                        <div
                          className="nf_progress_fill nf_fats_fill"
                          style={{ width: "55%" }}
                        ></div>
                      </div>
                      <span className="nf_macro_remaining">29g left</span> */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {mealPlan ? (
            <div className="mealWrapper">
              <div className="clear"></div>
              {parsedPlan?.map((section, index) => (
                <React.Fragment key={index}>
                  <div className="meal-section">
                    <h3 className="meal-title">{section.title}</h3>

                    {Array.isArray(section.items) &&
                      section.items.length > 0 && (
                        <ul className="meal-list">
                          {section.items.map((food, i) => (
                            <li key={i}>
                              {food.item} — {food.portion}
                            </li>
                          ))}
                        </ul>
                      )}

                    {section.macros && (
                      <p className="meal-macros">
                        <strong>Calories:</strong>{" "}
                        {section.macros.calories || "N/A"} |{" "}
                        <strong>Protein:</strong>{" "}
                        {section.macros.protein || "N/A"} |{" "}
                        <strong>Carbs:</strong> {section.macros.carbs || "N/A"}{" "}
                        | <strong>Fats:</strong> {section.macros.fats || "N/A"}
                      </p>
                    )}
                  </div>

                  {/* 👉 Insert this to render nested snacks */}
                  {Array.isArray(section.snacks) &&
                    section.snacks.map((snack, sIdx) => (
                      <React.Fragment key={`snack-${index}-${sIdx}`}>
                        <div className="clear"></div>
                        <div className="meal-section">
                          <h3 className="meal-title">{snack.title}</h3>

                          {Array.isArray(snack.items) &&
                            snack.items.length > 0 && (
                              <ul className="meal-list">
                                {snack.items.map((food, i) => (
                                  <li key={i}>
                                    {food.item} — {food.portion}
                                  </li>
                                ))}
                              </ul>
                            )}
                          <div className="clear"></div>

                          {snack.macros && (
                            <p className="meal-macros">
                              <strong>Calories:</strong>{" "}
                              {snack.macros.calories || "N/A"} |{" "}
                              <strong>Protein:</strong>{" "}
                              {snack.macros.protein || "N/A"} |{" "}
                              <strong>Carbs:</strong>{" "}
                              {snack.macros.carbs || "N/A"} |{" "}
                              <strong>Fats:</strong>{" "}
                              {snack.macros.fats || "N/A"}
                            </p>
                          )}
                          {/* <div className="clear"></div> */}
                        </div>
                      </React.Fragment>
                    ))}

                  <div className="clear"></div>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <>
              {showGenerateButton && (
                <div className="generate-button-wrapper">
                  <button
                    onClick={generateAiMealPlan}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    Generate Today's Meal
                    <GiMeal className="meal" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
      {generating && (
        <div className="loading-container2">
          <div className="loading-message">
            🍽️ Generating your meal plan, please wait...
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-container2">
          <span className="loader"></span>
        </div>
      )}

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-section">
            <div className="footer-logo">TrainifAI</div>
            <div className="footer-text">
              © 2025 TrainifAI. All rights reserved.
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

export default Page; // Ensure you're exporting "Page"
