const planets = {
  mercury: 199,
  venus: 299,
  //   earth: 399, can't observe Earth from Earth
  mars: 499,
  jupiter: 599,
  saturn: 699,
  uranus: 799,
  neptune: 899,
};

const location = "'-97.13000,+49.90000,0'";

const urlBuilder = (planet, location) =>
  `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&MAKE_EPHEM=YES&COMMAND=${planet}&EPHEM_TYPE=OBSERVER&CENTER='coord@399'&COORD_TYPE=GEODETIC&SITE_COORD=${location}&START_TIME='2024-12-01'&STOP_TIME='2024-12-02'&STEP_SIZE='1m'&QUANTITIES='9'&REF_SYSTEM='ICRF'&CAL_FORMAT='CAL'&CAL_TYPE='M'&TIME_DIGITS='MINUTES'&ANG_FORMAT='HMS'&APPARENT='AIRLESS'&RANGE_UNITS='AU'&SUPPRESS_RANGE_RATE='NO'&SKIP_DAYLT='NO'&SOLAR_ELONG='0,180'&EXTRA_PREC='NO'&R_T_S_ONLY='TVH'&CSV_FORMAT='NO'&OBJ_DATA='NO'`;

const parseResponse = (response) => {
  console.log("######################\n the response", response);
  const split = response.split("$$")[1];
  const rise = split.match(/\d{4}-[a-zA-Z]{3}-\d{2}\s\d{2}:\d{2}/gm)[0];

  const riseDate = new Date(rise + " UTC");

  console.log("The UTC date is " + riseDate);
  console.log("The local date is " + riseDate.toLocaleString());
};

const response = await fetch(url)
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
    parseResponse(result);
  });
