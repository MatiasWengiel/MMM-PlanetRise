const timeNow = new Date();
const timeInADay = new Date(Date.parse(timeNow) + 24 * 60 * 60 * 1000).toISOString();

console.log(timeNow, timeInADay);

//Parse the date as this:
// https://ssd.jpl.nasa.gov/horizons/manual.html#time
