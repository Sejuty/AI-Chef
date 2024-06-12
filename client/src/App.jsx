import { useState, useEffect, useRef } from "react";
import "./index.css";
import {
  COMPLEXITY_OPTIONS,
  COOKING_TIME_OPTIONS,
  CUISINE_OPTIONS,
  MEAL_OPTIONS,
} from "./constant";

import FOG from "vanta/dist/vanta.fog.min";

function App() {
  const [ingredients, setIngredients] = useState("");
  const [mealType, setMealType] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [complexity, setComplexity] = useState("");

  const [collapsedOption, setCollapsedOption] = useState([
    false,
    false,
    false,
    false,
  ]);

  const updateCollapsedOption = (index) => {
    setCollapsedOption((prev) => prev.map((_, i) => i === index));
  };
  const [current, setCurrent] = useState("mealType");

  const [vantaEffect, setVantaEffect] = useState(null);
  const myRef = useRef(null);
  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        FOG({
          el: myRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          highlightColor: 0x221c22,
          midtoneColor: 0x3a3750,
          lowlightColor: 0x281c28,
          baseColor: 0x241e25,
          blurFactor: 0.64,
          speed: 3.2,
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

  const generateRecipe = () => {
    setLoading(true);
    setError("");

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
    <div ref={myRef} className="h-screen p-5 ">
      <h1>Recipe Generator</h1>
      <div className="flex flex-col gap-5 items-center ">
        <div className="w-1/2">
          {/* <label className="text-red-500">Ingredients: </label> */}
          <input
            value={ingredients}
            onChange={(e) => {
              setIngredients(e.target.value);
            }}
            placeholder="Ingredients"
            name="ingredients"
            className="w-full px-3 py-2 rounded bg-transparent border border-white text-white"
          />
        </div>
        <div className="w-1/2">
          <div
            placeholder="Meal Type"
            className="relative w-full px-3 py-2 rounded bg-transparent border border-white text-white"
          >
            {current === "mealType" ? (
              MEAL_OPTIONS.map((item, index) => {
                return (
                  <div
                    key={index}
                    value={item.value}
                    className={`bg-transparent ${
                      collapsedOption[0] ? "hidden" : ""
                    }`}
                  >
                    <div
                      className={`px-3 py-2 hover:bg-[#3433333c] rounded cursor-pointer `}
                      onClick={() => {
                        setCurrent("cuisine");
                        setMealType(item.value);
                        updateCollapsedOption(0);
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                );
              })
            ) : (
              <div>{mealType}</div>
            )}
          </div>
        </div>
        <div className="w-1/2">
          <div
            data-text="Cuisine"
            className="relative w-full px-3 py-2 rounded bg-transparent border border-white text-white"
          >
            {current === "cuisine" ? (
              CUISINE_OPTIONS.map((item, index) => {
                return (
                  <div
                    key={index}
                    value={item.value}
                    className={`bg-transparent ${
                      collapsedOption[1] ? "hidden" : ""
                    }`}
                  >
                    <div
                      className={`px-3 py-2 hover:bg-[#3433333c] rounded cursor-pointer `}
                      onClick={() => {
                        // handleSelectedOption();
                        setCurrent("cookingTime");
                        setCuisine(item.value);
                        updateCollapsedOption(1);
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                );
              })
            ) : (
              <div>{cuisine}</div>
            )}
          </div>
        </div>
        <div className="w-1/2">
          <div
            data-text="Cooking Time"
            className="relative w-full px-3 py-2 rounded bg-transparent border border-white text-white"
          >
            {current === "cookingTime" ? (
              COOKING_TIME_OPTIONS.map((item, index) => {
                return (
                  <div
                    key={index}
                    value={item.value}
                    className={`bg-transparent ${
                      collapsedOption[2] ? "hidden" : ""
                    }`}
                  >
                    <div
                      className={`px-3 py-2 hover:bg-[#3433333c] rounded cursor-pointer `}
                      onClick={() => {
                        // handleSelectedOption();
                        setCurrent("complexity");
                        setCookingTime(item.value);
                        updateCollapsedOption(2);
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                );
              })
            ) : (
              <div>{cookingTime}</div>
            )}
          </div>
        </div>
        <div className="w-1/2">
          <div
            data-text="Complexity"
            className="relative w-full px-3 py-2 rounded bg-transparent border border-white text-white"
          >
            {current === "complexity" ? (
              COMPLEXITY_OPTIONS.map((item, index) => {
                return (
                  <div
                    key={index}
                    value={item.value}
                    className={`bg-transparent ${
                      collapsedOption[3] ? "hidden" : ""
                    }`}
                  >
                    <div
                      className={`px-3 py-2 hover:bg-[#3433333c] rounded cursor-pointer `}
                      onClick={() => {
                        // handleSelectedOption();
                        setCurrent("");
                        setComplexity(item.value);
                        updateCollapsedOption(3);
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                );
              })
            ) : (
              <div>{complexity}</div>
            )}
          </div>
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
    </div>
  );
}

export default App;
