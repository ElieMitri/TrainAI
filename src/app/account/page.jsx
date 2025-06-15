"use client";

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../firebase";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function AccountPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [addingWeight, setAddingWeight] = useState(false);
  const [weightAdded, setWeightAdded] = useState("");
  const [notification, setNotification] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification(null), 3000);
  };

  const logout = async () => {
    try {
      await auth.signOut();
      showNotification("Logged out successfully!", "success");
      setTimeout(() => {
        router.push("/"); // or "/" or any other route
      }, 1000); // wait a moment for notification
    } catch (error) {
      console.error("Logout error:", error);
      showNotification("Logout failed. Try again.", "error");
    }
  };

  const editOrAddWeight = async () => {
    if (!user?.uid) {
      showNotification("You are not logged in.", "error");
      return;
    }

    const parsedWeight = Number(weightAdded);
    if (!parsedWeight || isNaN(parsedWeight)) {
      showNotification("Please enter a valid weight.", "error");
      return;
    }

    setAddingWeight(true);

    const clientWeightRef = collection(
      doc(db, "weightProgress", user.uid),
      "clientWeight"
    );
    const userRef = doc(db, "users", user.uid);

    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const snapshot = await getDocs(clientWeightRef);
      let existingDoc = null;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const date =
          data.date instanceof Timestamp
            ? data.date.toDate()
            : new Date(data.date);

        if (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        ) {
          existingDoc = { id: docSnap.id, ...data };
        }
      });

      if (existingDoc) {
        const existingRef = doc(clientWeightRef, existingDoc.id);
        await updateDoc(existingRef, {
          weight: parsedWeight,
          date: Timestamp.fromDate(now),
        });
        showNotification("Weight updated successfully!", "success");
      } else {
        await addDoc(clientWeightRef, {
          weight: parsedWeight,
          date: Timestamp.fromDate(now),
        });
        showNotification("New weight added!", "success");
      }

      const nextMonth = new Date(now);
      nextMonth.setMonth(currentMonth + 1);
      if (nextMonth.getDate() !== now.getDate()) nextMonth.setDate(0);

      await updateDoc(userRef, {
        editedWeight: serverTimestamp(),
        weight: parsedWeight,
        reEditWeight: Timestamp.fromDate(nextMonth),
      });
    } catch (err) {
      console.error("❌ Error updating weight:", err);
      showNotification("Failed to update weight. Try again.", "error");
    } finally {
      setAddingWeight(false);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="account-page">
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
      <div className="account-page__container">
        <h1 className="account-page__title">Account Settings</h1>

        <div className="account-page__info">
          <div className="account-info__row">
            <span className="account-info__label">Name:</span>
            <span className="account-info__value">
              {user?.displayName || "—"}
            </span>
          </div>
          <div className="account-info__row">
            <span className="account-info__label">Email:</span>
            <span className="account-info__value">{user?.email || "—"}</span>
          </div>
        </div>

        {userData?.paid && (
          <section className="account-page__weight">
            <label className="account-weight__label">Update Your Weight</label>
            <div className="account-weight__form">
              <input
                type="number"
                value={weightAdded}
                onChange={(e) => setWeightAdded(e.target.value)}
                className="account-weight__input"
                placeholder="Enter weight (kg)"
              />
              <button
                className="btn btn-primary"
                onClick={editOrAddWeight}
                disabled={addingWeight}
              >
                {addingWeight ? "Updating..." : "Save"}
              </button>
            </div>
          </section>
        )}

        {notification?.visible && (
          <div
            className={`account-notification account-notification--${notification.type}`}
          >
            {notification.message}
          </div>
        )}

        <div className="account-page__footer">
          {userData?.paid && (
            <button className="account-footer__button account-footer__cancel">
              Cancel Membership
            </button>
          )}
          <button
            onClick={logout}
            className="account-footer__button account-footer__logout"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
