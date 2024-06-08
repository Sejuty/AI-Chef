const express = require("express");
const cors = require("cors");
const { default: ollama } = require("ollama");

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/recipeStream", async (req, res) => {
  const ingredients = req.query.ingredients;
  const mealType = req.query.mealType;
  const cuisine = req.query.cuisine;
  const cookingTime = req.query.cookingTime;
  const complexity = req.query.complexity;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (chunk) => {
    res.write(`data: ${chunk}\n\n`);
  };

  try {
    const prompt = `Create a recipe with the following instructions. Ingredients: ${ingredients}, MealType: ${mealType}, Cuisine: ${cuisine}, CookingTime: ${cookingTime}, Complexity: ${complexity}. The response will contain three main sections: Title, Ingredients, and Instructions.`;
    
    const response = await ollama.generate({
      model: "mistral",
      prompt: prompt,
    });

    sendEvent(JSON.stringify(response.response));
  } catch (error) {
    console.error("Error:", error);
    sendEvent("Error generating recipe.");
  }

  res.on("close", () => {
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
