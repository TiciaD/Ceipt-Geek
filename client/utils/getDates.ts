function getDates() {
  const formatDate = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];
    return formattedDate;
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Month starts from 0

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0);

  const formattedFirstDayOfMonth = formatDate(firstDayOfMonth);
  const formattedLastDayOfMonth = formatDate(lastDayOfMonth);

  const firstDayOfYear = new Date(currentYear, 0, 1);
  const lastDayOfYear = new Date(currentYear, 11, 31);

  const formattedFirstDayOfYear = formatDate(firstDayOfYear);
  const formattedLastDayOfYear = formatDate(lastDayOfYear);

  return {
    formattedFirstDayOfMonth,
    formattedLastDayOfMonth,
    formattedFirstDayOfYear,
    formattedLastDayOfYear,
  };
}

export default getDates;
