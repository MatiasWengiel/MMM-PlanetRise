import { getDateToday, getDateTomorrow } from "./date-helpers.js";

const planets = {
  // Mercury: 199,
  Venus: 299,
  // //   earth: 399, can't observe Earth from Earth
  // Mars: 499,
  // Jupiter: 599,
  // Saturn: 699,
  // Uranus: 799,
  // Neptune: 899,
};

const location = "'-97.13000,+49.90000,0'";

//TODO: Figure out if we can change the time from UTC to local, so that the date is more accurate
const getUrl = (planet, location) =>
  `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&MAKE_EPHEM=YES&COMMAND=${planet}&EPHEM_TYPE=OBSERVER&CENTER='coord@399'&COORD_TYPE=GEODETIC&SITE_COORD=${location}&START_TIME='${getDateToday()}'&STOP_TIME='${getDateTomorrow()}'&STEP_SIZE='1m'&QUANTITIES='9'&REF_SYSTEM='ICRF'&CAL_FORMAT='CAL'&CAL_TYPE='M'&TIME_DIGITS='MINUTES'&ANG_FORMAT='HMS'&APPARENT='AIRLESS'&RANGE_UNITS='AU'&SUPPRESS_RANGE_RATE='NO'&SKIP_DAYLT='NO'&SOLAR_ELONG='0,180'&EXTRA_PREC='NO'&R_T_S_ONLY='TVH'&CSV_FORMAT='NO'&OBJ_DATA='NO'`;

const parseResponse = (response) => {
  console.info(new Date(getDateToday()), new Date(getDateTomorrow()));
  const split = response.split("$$")[1];
  console.log(split);
  const set = split.match(/\d{4}-[a-zA-Z]{3}-\d{2}\s\d{2}:\d{2}/gm)[0];
  const rise = split.match(/\d{4}-[a-zA-Z]{3}-\d{2}\s\d{2}:\d{2}/gm)[1];
  console.log("set is ", new Date(set + " UTC").toLocaleString());

  const riseDate = new Date(rise + " UTC");

  return riseDate.toLocaleString();
};

const getPlanetRise = async (url) =>
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
    .then((stream) => new Response(stream, { headers: { "Content-Type": "text/html" } }).text())
    .then((result) => {
      const response = parseResponse(result);
      return response;
    });

// console.log(await getPlanetRise(url));

for (const planet in planets) {
  const url = getUrl(planets[planet], location);
  console.log(`${planet} rises at:`, await getPlanetRise(url));
}
