import { addDays, format } from "date-fns";

export const getDateToday = () => format(new Date(), "yyyy-MM-dd");
export const getDateTomorrow = () => format(addDays(new Date(), 1), "yyyy-MM-dd");
