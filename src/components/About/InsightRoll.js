
import React from "react";

const InsightRoll = ({ insights, transformInsights }) => {
  const displayedInsights = transformInsights ? transformInsights(insights) : insights; //bien doi thong tin ( ham transform )

  if (!displayedInsights || displayedInsights.length === 0) { //ktra DL , neu ko co thong tin -> tra ve No insights available
    return <div>No insights available</div>;
  }

  return (
    <div className="w-full bg-accent dark:bg-accentDark text-light dark:text-dark whitespace-nowrap overflow-hidden">
      <div className="animate-roll w-full py-2 sm:py-3 flex items-center justify-center capitalize font-semibold tracking-wider text-sm sm:text-base">
        {displayedInsights.map((text, index) => (
          <div key={index}> 
            {text} <span className="px-8">|</span>  
          </div>
        ))}
      </div>
    </div>
  );
};

const transform = (insights) => insights.map((insight) =>`${insight}`); // bien doi thong tin thanh chuoi

const App = () => (
  <InsightRoll
  insights={[
   "Welcome to TechConnect!  Your gateway to tech knowledge ❤",
      "We're thrilled to have you here; your presence is our pleasure!",
      "Discover insights that inspire innovation!",
      "Connect with like-minded tech enthusiasts and grow together!",
      "Join us in exploring the latest trends and technologies!",
      "Your journey in tech starts here—let's make it amazing!",
      "Engage with our community and share your unique perspective!",
      "Stay curious, stay connected—welcome aboard!",

  ]}
  transformInsights={transform}
  />
);

export default App;
