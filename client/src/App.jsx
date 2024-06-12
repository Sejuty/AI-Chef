import { useState, useEffect, useRef } from "react";
import "./index.css";
import { Input, Select } from "@chakra-ui/react";
import {
  COMPLEXITY_OPTIONS,
  COOKING_TIME_OPTIONS,
  CUISINE_OPTIONS,
  MEAL_OPTIONS,
} from "./constant";

import BIRDS from "vanta/dist/vanta.fog.min";

function App() {
  const [recipeInfo, setRecipeInfo] = useState({
    ingredients: "",
    mealType: "",
    cuisine: "",
    cookingTime: "",
    complexity: "",
  });

  const [vantaEffect, setVantaEffect] = useState(null);
  const myRef = useRef(null);
  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        BIRDS({
          el: myRef.current,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

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

  const generateRecipe = () => {
    setLoading(true);
    setError("");
    const { ingredients, mealType, cuisine, cookingTime, complexity } =
      recipeInfo;

    const eventSource = new EventSource(
      `http://localhost:3001/recipeStream?ingredients=${ingredients}&mealType=${mealType}&cuisine=${cuisine}&cookingTime=${cookingTime}&complexity=${complexity}`
    );

    eventSource.onmessage = (event) => {
      setLoading(false);

      const formattedData = event.data.replace(/\\n/g, "\n");
      setRecipe(formattedData);
    };

    eventSource.onerror = () => {
      setLoading(false);
      setError("Failed to generate recipe. Please try again.");
      eventSource.close();
    };

    eventSource.onopen = () => {
      console.log("Generating Recipe...");
    };

    eventSource.addEventListener("close", () => {
      eventSource.close();
    });
  };

  return (
    <div ref={myRef}>
      <h1>Recipe Generator</h1>
      <div>
        <label className="text-red-500">Ingredients: </label>
        <Input
          value={recipeInfo.ingredients}
          onChange={handleChange}
          placeholder="Ingredients"
        />
      </div>
      <div>
        {/* <label>Meal Type: </label> */}
        <Select placeholder="Meal Type">
          {MEAL_OPTIONS.map((meal, index) => {
            return (
              <option key={index} value={meal.value}>
                {meal.label}
              </option>
            );
          })}
        </Select>
      </div>
      <div>
        {/* <label>Cuisine: </label> */}
        <Select placeholder="Cuisine">
          {CUISINE_OPTIONS.map((item, index) => {
            return (
              <option key={index} value={item.value}>
                {item.label}
              </option>
            );
          })}
        </Select>
      </div>
      <div>
        {/* <label>Cooking Time: </label> */}
        <Select placeholder="Cooking Time">
          {COOKING_TIME_OPTIONS.map((item, index) => {
            return (
              <option key={index} value={item.value}>
                {item.label}
              </option>
            );
          })}
        </Select>
      </div>
      <div>
        {/* <label>Complexity: </label> */}
        <Select placeholder="Comlplexity">
          {COMPLEXITY_OPTIONS.map((item, index) => {
            return (
              <option key={index} value={item.value}>
                {item.label}
              </option>
            );
          })}
        </Select>
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
