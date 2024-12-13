const timeNow = new Date();
const timeInADay = new Date(Date.parse(timeNow) + 24 * 60 * 60 * 1000 * 2);

export const getDateToday = timeNow
  .toISOString()
  .split("T")
  .join(" ")
  .split(".")[0];
export const getDateTomorrow = timeInADay
  .toISOString()
  .split("T")
  .join(" ")
  .split(".")[0];

export const stringDateToUTCDate = (stringDate) =>
  new Date(stringDate + " UTC");
//Parse the date as this:
// https://ssd.jpl.nasa.gov/horizons/manual.html#time
