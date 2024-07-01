import { useState, useEffect, useRef } from "react";
import "./index.css";
import { CURRENT_STATES, OPTIONS } from "./constant";

import FOG from "vanta/dist/vanta.fog.min";

function App() {
  const [ingredients, setIngredients] = useState("");
  const [mealType, setMealType] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [complexity, setComplexity] = useState("");
  const [current, setCurrent] = useState("");

  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const myRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (vantaEffect) {
      vantaEffect.destroy();
    }

    const effect = FOG({
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
    });

    setVantaEffect(effect);

    return () => {
      if (effect) effect.destroy();
    };
  }, [recipe]);

  // const a =
  //   " Title: Quick French Brunch: Rice and Potato Hash\n\nIngredients:\n- 1 cup cooked rice (preferably basmati or jasmine)\n- 2 medium-sized potatoes, peeled and diced\n- Salt, to taste\n- Pepper, to taste\n- 2 tablespoons olive oil\n- 1 small onion, finely chopped\n- 2 cloves garlic, minced\n- 1 tablespoon fresh parsley, chopped (optional)\n- 2 large eggs\n\nInstructions:\n\n1. In a large skillet over medium heat, warm up 1 tablespoon of olive oil. Add the diced potatoes and season with salt and pepper. Cook for about 8 minutes or until potatoes are tender and lightly browned. Stir occasionally to prevent sticking.\n\n2. Remove the cooked potatoes from the skillet and set them aside in a bowl. Do not clean the skillet.\n\n3. In the same skillet, heat the remaining 1 tablespoon of olive oil over medium heat. Add the chopped onion and cook until it becomes translucent, about 2-3 minutes. Stir in the minced garlic and cook for another minute.\n\n4. Add the cooked rice to the skillet with the sautéed onions and garlic. Mix well to combine.\n\n5. Return the cooked potatoes to the skillet and gently stir to distribute them throughout the rice mixture. Cook for an additional 2 minutes, allowing the flavors to meld together.\n\n6. Create two small indentations in the hash using a spoon. Crack an egg into each indention. Reduce heat to low, cover the skillet, and cook the eggs until whites are set (about 4-5 minutes). You can also cover the skillet and let the eggs finish cooking if you prefer over-easy or over-hard eggs.\n\n7. Sprinkle the hash with fresh parsley before serving for added flavor. Enjoy your quick French brunch!"
  //     .replace(/\n\n/g, "<br /> <br />")
  //     .replace(/\n/g, " <br/>");

  const [collapsedOption, setCollapsedOption] = useState([
    false,
    false,
    false,
    false,
  ]);
  const updateCollapsedOption = (index) => {
    setCollapsedOption((prev) => prev.map((_, i) => i === index));
  };

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
    if (e.key === "Enter" && ingredients) {
      setCurrent("mealType");
    }
  };

  return (
    <div ref={myRef} className="h-full min-h-screen overflow-x-hidden p-5">
      <h1 className="text-white text-center py-6 text-xl">Recipe Generator</h1>
      <div className="flex flex-col gap-5 items-center ">
        <div className="w-1/2">
          <input
            value={ingredients}
            onChange={(e) => {
              setIngredients(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ingredients (Press Enter to continue)"
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
          <div className="w-2/3 px-3 pb-5 border border-white rounded text-white mt-7">
            <h2 className="text-center  text-2xl py-6 pb-5 border-b ">
              Generated Recipe
            </h2>
            <div
              className="mt-5 px-3"
              dangerouslySetInnerHTML={{
                __html: recipe
                  .replace(/\n\n/g, "<br /> <br />")
                  .replace(/\n/g, " <br/>"),
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
