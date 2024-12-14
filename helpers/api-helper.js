import {
  getDateToday,
  getDateTomorrow,
  stringDateToUTCDate,
} from "./date-helpers.js";

// earth: 399, can't observe Earth from Earth
const planets = {
  Mercury: 199,
  Venus: 299,
  Mars: 499,
  Jupiter: 599,
  Saturn: 699,
  Uranus: 799,
  Neptune: 899,
};

const location = "'-97.13000,+49.90000,0'";

const getUrl = (planet, location) =>
  `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&MAKE_EPHEM=YES&COMMAND=${planet}&EPHEM_TYPE=OBSERVER&CENTER='coord@399'&COORD_TYPE=GEODETIC&SITE_COORD=${location}&START_TIME='${getDateToday}'&STOP_TIME='${getDateTomorrow}'&STEP_SIZE='1m'&QUANTITIES='9'&REF_SYSTEM='ICRF'&CAL_FORMAT='CAL'&CAL_TYPE='M'&TIME_DIGITS='MINUTES'&ANG_FORMAT='HMS'&APPARENT='AIRLESS'&RANGE_UNITS='AU'&SUPPRESS_RANGE_RATE='NO'&SKIP_DAYLT='NO'&SOLAR_ELONG='0,180'&EXTRA_PREC='NO'&R_T_S_ONLY='TVH'&CSV_FORMAT='NO'&OBJ_DATA='NO'`;

const parseResponse = (response) => {
  const relevantResponseSection = response.split("$$")[1];
  const arrayOfValues = relevantResponseSection
    //Split each set of values in the string into its own array element
    .split("\\n")
    //Remove the ones that don't have a date in them (they are not necessary)
    .filter((value) => value.match(/\d{4}-[a-zA-Z]{3}-\d{2}\s\d{2}:\d{2}/gm));

  const refinedValues = arrayOfValues.map((value) => {
    //Remove extra white space, leave one so we can split each part of the value to form an array
    const valueAsArray = value.replace(/\s+/g, " ").trim().split(" ");

    valueAsArray.splice(valueAsArray.length - 2, 2);

    return valueAsArray;
  });

  // Finds each value array that contains an "r" (for rise) or "s" (for set), parses it into a string without the last part of the valueArray
  // and turns it into a date
  const rises = refinedValues
    .filter((value) => value[2].includes("r"))
    .map((value) => `${value[0]} ${value[1]}`)
    .map((value) => new Date(value + " UTC"));
  const sets = refinedValues
    .filter((value) => value[2].includes("s"))
    .map((value) => `${value[0]} ${value[1]}`)
    .map((value) => stringDateToUTCDate(value));

  /* TENTATIVE LOGIC
     if (planet is up) => <planet> is currently in the sky, setting at <time> \n next rise <time>
     if (!planet is up) => <planet> is not currently in the sky, rising at <time> \n next set <time> 
  */

  //If the next time the planet rises is after it next sets, it must be in the sky right now
  const isPlanetUp = rises[0] > sets[0];
  const nextSet = sets[0] > new Date() ? sets[0] : sets[1];
  const nextRise = rises[0] > new Date() ? rises[0] : rises[1];

  // TODO: Maybe instead of having the date in date format we can have it as "today" or "tomorrow"
  return {
    verbose: isPlanetUp
      ? `is currently in the sky, and will set ${nextSet.toLocaleString()}. Next rise will be ${rises[0].toLocaleString()}`
      : `will rise ${rises[0].toLocaleString()}, and will set ${nextSet.toLocaleString()}. It will rise again ${rises[1].toLocaleString()}`,
    isPlanetUp,
    nextSet,
    nextRise,
  };
};

const getPlanetRiseAndSet = async (url) =>
  await fetch(url)
    .then((response) => response.body)
    .then((responseBody) => {
      const reader = responseBody.getReader();

      return new ReadableStream({
        start(controller) {
          function push() {
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }
              controller.enqueue(value);
              push();
            });
          }
          push();
        },
      });
    })
    .then((stream) =>
      new Response(stream, { headers: { "Content-Type": "text/html" } }).text()
    )
    .then((result) => {
      const response = parseResponse(result);
      return response;
    });

for (const planet in planets) {
  const url = getUrl(planets[planet], location);
  const riseAndSet = await getPlanetRiseAndSet(url);
  console.log(`${planet} ${riseAndSet.verbose}`);
}

//Make it so that if the rise time is < timeNow, says something like "planet is already up"
