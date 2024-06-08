const express = require("express");
const cors = require("cors");
const { default: ollama } = require("ollama");
const { json } = require("body-parser");

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/recipe", async (req, res) => {
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
    const prompt = `Create a recipe with the following instructions. Ingredients: ${ingredients}, MealType: ${mealType}, Cuisine: ${cuisine}, CookingTime: ${cookingTime}, Complexity: ${complexity}. The response will contain three main section, Title, Ingredients and Instruction.`;
    // const prompt = `Write me a knock knock joke`;
    const response = await ollama.generate({
      model: "mistral",
      prompt: prompt,
      format: json,
      raw: true,
      keep_alive: 10000
      // stream: true
    });

    console.log(response.response)
    // Assuming the response is an object containing the recipe details
    sendEvent(response.response);
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
