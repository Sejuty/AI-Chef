import "./App.css";
import { useState } from "react";
// import axios from "axios";

function App() {
  const [recipeInfo, setRecipeInfo] = useState({
    ingredients: "",
    mealType: "",
    cuisine: "",
    cookingTime: "",
    complexity: "",
  });

  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setRecipeInfo((info) => {
  //     ({ ...info, [name]: value });
  //   });
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipeInfo((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  console.log(recipe);

  const generateRecipe = () => {
    setLoading(true);
    setError("");
    const { ingredients, mealType, cuisine, cookingTime, complexity } =
      recipeInfo;

    const eventSource = new EventSource(
      `http://localhost:3001/recipeStream?ingredients=${encodeURIComponent(
        ingredients
      )}&mealType=${encodeURIComponent(mealType)}&cuisine=${encodeURIComponent(
        cuisine
      )}&cookingTime=${encodeURIComponent(
        cookingTime
      )}&complexity=${encodeURIComponent(complexity)}`
    );

    eventSource.onmessage = (event) => {
      setLoading(false);
      setRecipe(event.data);
    };

    eventSource.onerror = () => {
      setLoading(false);
      setError("Failed to generate recipe. Please try again.");
      eventSource.close();
    };

    eventSource.onopen = () => {
      console.log("Connection to event stream opened.");
    };

    eventSource.addEventListener("close", () => {
      eventSource.close();
    });
  };
  return (
    <div>
      <h1>Recipe Generator</h1>
      <div>
        <label>Ingredients: </label>
        <input
          type="text"
          name="ingredients"
          value={recipeInfo.ingredients}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Meal Type: </label>
        <input
          type="text"
          name="mealType"
          value={recipeInfo.mealType}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Cuisine: </label>
        <input
          type="text"
          name="cuisine"
          value={recipeInfo.cuisine}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Cooking Time: </label>
        <input
          type="text"
          name="cookingTime"
          value={recipeInfo.cookingTime}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Complexity: </label>
        <input
          type="text"
          name="complexity"
          value={recipeInfo.complexity}
          onChange={handleChange}
        />
      </div>
      <button onClick={generateRecipe} disabled={loading}>
        {loading ? "Generating..." : "Generate Recipe"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {recipe && (
        <div>
          <h2>Generated Recipe</h2>
          <pre>{recipe}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
