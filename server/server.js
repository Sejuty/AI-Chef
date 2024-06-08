const express = require("express");
const cors = require("cors");
const { default: ollama } = require('ollama');

const app = express();
const PORT = 3001;

app.use(cors());

// app.get("/recipeStream", (req, res) => {
//   const ingredients = req.query.ingredients;
//   const mealType = req.query.mealType;
//   const cuisine = req.query.cuisine;
//   const cookingTime = req.query.cookingTime;
//   const complexity = req.query.complexity;

//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");

//   const sendEvent = (chunk)=>{

//   }
// });




async function chatWithLlama() {
  try {
    const response = await ollama.chat({
      model: 'mistral',
      messages: [{ role: 'user', content: 'Create a recipe with the following instruction. Ingredients: 2 egges and potatoes, MealType: breakfast, cuisine :italian, cookingTime : % min, complexity : chef ' }],
    });
    console.log(response.message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}

chatWithLlama();


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
