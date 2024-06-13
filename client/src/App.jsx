import { useState, useEffect, useRef } from "react";
import "./index.css";
import { CURRENT_STATES, OPTIONS } from "./constant";

import FOG from "vanta/dist/vanta.fog.min";

function App() {
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
  const [current, setCurrent] = useState("");

  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const stateValues = [mealType, cuisine, cookingTime, complexity];
  const stateSetters = [setMealType, setCuisine, setCookingTime, setComplexity];

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setCurrent("mealType");
    }
  };

  return (
    <div ref={myRef} className="h-screen p-5 ">
      <h1 className="text-white text-center py-6 text-xl">Recipe Generator</h1>
      <div className="flex flex-col gap-5 items-center ">
        <div className="w-1/2">
          <input
            value={ingredients}
            onChange={(e) => {
              setIngredients(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ingredients"
            name="ingredients"
            className="w-full px-3 py-2 rounded bg-transparent border border-white text-white"
          />
        </div>
        <div className="w-1/2 flex flex-col gap-5">
          {OPTIONS.map((_, renderSelectIndex) => {
            return (
              <div
                key={renderSelectIndex}
                className="relative w-full px-3 py-2 rounded bg-transparent border border-white text-white"
              >
                {current === CURRENT_STATES[renderSelectIndex] ? (
                  OPTIONS[renderSelectIndex].map((item, index) => {
                    return (
                      <div
                        key={index}
                        value={item.value}
                        className={`bg-transparent ${
                          collapsedOption[renderSelectIndex] ? "hidden" : ""
                        }`}
                      >
                        <div
                          className={`px-3 py-2 hover:bg-[#3433333c] rounded cursor-pointer `}
                          onClick={() => {
                            setCurrent(CURRENT_STATES[renderSelectIndex + 1]);
                            stateSetters[renderSelectIndex](item.value);
                            updateCollapsedOption(renderSelectIndex);
                          }}
                        >
                          {item.label}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div>{stateValues[renderSelectIndex]}</div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={generateRecipe}
          disabled={loading}
          className="border border-white w-1/2 px-3 py-2 text-white rounded hover:bg-white hover:text-black"
        >
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
