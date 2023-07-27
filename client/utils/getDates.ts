import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfWeek,
  endOfWeek,
  subYears,
} from "date-fns";

function getDates() {
  const currentDate = new Date();
  const previousYearDate = subYears(currentDate, 1);

  const formattedCurrentDate = format(currentDate, "yyyy-MM-dd");
  const formattedFirstDayOfMonth = format(
    startOfMonth(currentDate),
    "yyyy-MM-dd"
  );
  const formattedLastDayOfMonth = format(endOfMonth(currentDate), "yyyy-MM-dd");
  const formattedFirstDayOfYear = format(
    startOfYear(currentDate),
    "yyyy-MM-dd"
  );
  const formattedLastDayOfYear = format(endOfYear(currentDate), "yyyy-MM-dd");
  const formattedFirstDayOfWeek = format(
    startOfWeek(currentDate, { weekStartsOn: 1 }),
    "yyyy-MM-dd"
  );
  const formattedLastDayOfWeek = format(
    endOfWeek(currentDate, { weekStartsOn: 1 }),
    "yyyy-MM-dd"
  );
  const formattedFirstDayOfPreviousYear = format(
    startOfYear(previousYearDate),
    "yyyy-MM-dd"
  );
  const formattedLastDayOfPreviousYear = format(
    endOfYear(previousYearDate),
    "yyyy-MM-dd"
  );

  return {
    formattedCurrentDate,
    formattedFirstDayOfMonth,
    formattedLastDayOfMonth,
    formattedFirstDayOfYear,
    formattedLastDayOfYear,
    formattedFirstDayOfWeek,
    formattedLastDayOfWeek,
    formattedFirstDayOfPreviousYear,
    formattedLastDayOfPreviousYear,
  };
}

export default getDates;
