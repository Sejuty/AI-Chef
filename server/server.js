const express = require("express");
const cors = require("cors");
const { default: ollama } = require("ollama");

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/recipeStream", async (req, res) => {
  let { ingredients, mealType, cuisine, cookingTime, complexity } = req.query;

  // Encode spaces in the query parameters
  ingredients = encodeURIComponent(ingredients);
  mealType = encodeURIComponent(mealType);
  cuisine = encodeURIComponent(cuisine);
  cookingTime = encodeURIComponent(cookingTime);
  complexity = encodeURIComponent(complexity);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (chunk) => {
    res.write(`data: ${chunk}\n\n`);
  };

  try {
    const prompt = `Create a recipe with the following instructions. Ingredients: ${ingredients}, MealType: ${mealType}, Cuisine: ${cuisine}, CookingTime: ${cookingTime}, Complexity: ${complexity}. The response will only contain three main sections: Title, Ingredients, and Instructions.`;

    const response = await ollama.generate({
      model: "mistral",
      prompt: prompt,
      // keep_alive: 10000,
    });

    console.log(JSON.stringify(response.response));
    sendEvent(JSON.stringify(response.response));
  } catch (error) {
    console.error("Error:", error);
    // sendEvent("Error generating recipe.");
  }

  res.on("close", () => {
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
