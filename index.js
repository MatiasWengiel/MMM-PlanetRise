const getInnerText = ({ planet, isPlanetUp, riseTime, setTime }) => {
  if (isPlanetUp) {
    return `${planet} is currently in the sky, and will set at ${setTime}`;
  }
  return `${planet} will rise at ${riseTime} and set at ${setTime}`;
};

const setGrayscale = (planetRef, isPlanetUp) => {
  return isPlanetUp
    ? planetRef.classList.remove("grayscale")
    : planetRef.classList.add("grayscale");
};

const setPlanet = ({ planet, isPlanetUp, riseTime, setTime }) => {
  const nameForInterpolation = planet.toLowerCase();
  const planetText = document.getElementById(`${nameForInterpolation}-text`);
  const planetPicture = document.getElementById(
    `${nameForInterpolation}-picture`
  );

  planetText.innerText = getInnerText({
    planet,
    isPlanetUp,
    riseTime,
    setTime,
  });

  setGrayscale(planetPicture, isPlanetUp);
};

const mercuryText = document.getElementById("mercury-text");
const mercuryPicture = document.getElementById("mercury-picture");
const venusText = document.getElementById("venus-text");
const venusPicture = document.getElementById("venus-picture");

const planets = ["Mercury", "Venus"];

setPlanet({
  planet: "Mercury",
  isPlanetUp: true,
  riseTime: "9:00 PM",
  setTime: "3:00 AM",
});

setPlanet({
  planet: "Venus",
  isPlanetUp: false,
  riseTime: "1:00 PM",
  setTime: "7:30 PM",
});
