// Load environment variables
const fs = require("fs");
console.log("📁 .env exists:", fs.existsSync(".env")); // Confirms .env file presence

require("dotenv").config(); // Load .env from current directory

// Confirm key loaded
console.log(
  "🔐 Loaded OPENAI_API_KEY:",
  process.env.OPENAI_API_KEY?.slice(0, 10) || "NOT FOUND"
);

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Check if OpenAI API Key exists
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing! Check your .env file.");
  process.exit(1);
} else {
  console.log("🔑 OpenAI Key loaded successfully.");
}

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// Generate Meal Plan Route
app.post("/generate", async (req, res) => {
  const { calories, protein, carbs, fats } = req.body;

  // Validate input
  if (
    ![calories, protein, carbs, fats].every(
      (val) => typeof val === "number" && !isNaN(val)
    )
  ) {
    return res
      .status(400)
      .json({ error: "Invalid or missing nutritional values." });
  }

  const prompt = `
  You are a nutritionist AI assistant. Create a one-day meal plan that meets these nutritional targets as closely as possible — within ±5% range per macro.
  
  TARGET:
  - Calories: ${calories} kcal
  - Protein: ${protein}g
  - Carbs: ${carbs}g
  - Fats: ${fats}g
  
  Instructions:
  - Each meal must include macro counts.
  - Total macros at the end must be close to target (±5%).
  - Use realistic food portions based on standard nutritional data.
  
  Format:
  
  Meal: <Meal Name>
  - <Item> - <Portion>
  - <Item> - <Portion>
  Macros for this meal:
  - Calories: <number> kcal
  - Protein: <number> g
  - Carbs: <number> g
  - Fats: <number> g
  
  Final Total:
  - Total Calories: <number> kcal
  - Total Protein: <number> g
  - Total Carbs: <number> g
  - Total Fats: <number> g
  
  Rules:
  - Plain text only.
  - No summaries.
  - No Markdown formatting.
  `;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const mealPlan = response?.data?.choices?.[0]?.message?.content;

    if (!mealPlan) {
      return res.status(502).json({ error: "Invalid response from OpenAI." });
    }

    res.status(200).json({ mealPlan });
  } catch (error) {
    console.error(
      "🔥 OpenAI API Error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to generate meal plan.",
      details: error.response?.data || error.message,
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
