import { Box, Card, CardContent, Typography } from "@mui/material";

import { useTotalExpenditureByDateQuery } from "../graphql/generated/graphql";
import DashboardTable from "./DashboardTable";
import GraphCarousel from "./GraphCarousel";

export default function Dashboard() {
  const currentDate = new Date();
  const todayFormattedDate = currentDate.toISOString().split("T")[0];

  const totalExpenditureToday = useTotalExpenditureByDateQuery({
    variables: {
      dateGte: todayFormattedDate,
      dateLte: todayFormattedDate,
    },
  });

  // Get yesterday's date
  currentDate.setDate(currentDate.getDate() - 1);
  const yesterdayFormattedDate = currentDate.toISOString().split("T")[0];

  const totalExpenditureYesterday = useTotalExpenditureByDateQuery({
    variables: {
      dateGte: yesterdayFormattedDate,
      dateLte: yesterdayFormattedDate,
    },
  });

  return (
    <>
      <Card sx={{ width: "auto", padding: "2rem", }}>
        <CardContent>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold" }}
            align="center"
            gutterBottom
          >
            {"You've Spent:"}
          </Typography>
          <Box>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", padding: 0 }}
              align="center"
              gutterBottom
            >
              Today:
            </Typography>
            {totalExpenditureToday.loading ? (
              <p>Loading...</p>
            ) : (
              <Typography variant="body1" align="center" gutterBottom>
                {totalExpenditureToday.error
                  ? totalExpenditureToday.error.message
                  : `${totalExpenditureToday.data?.totalExpenditureByDate?.toFixed(
                      2
                    )}`}
              </Typography>
            )}
          </Box>
          <Box>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold" }}
              align="center"
              gutterBottom
            >
              Yesterday:
            </Typography>
            {totalExpenditureYesterday.loading &&
            !totalExpenditureToday.error ? (
              <p>Loading...</p>
            ) : (
              <Typography variant="body1" align="center" gutterBottom>
                {totalExpenditureYesterday.error
                  ? totalExpenditureYesterday.error.message
                  : `${totalExpenditureYesterday?.data?.totalExpenditureByDate?.toFixed(
                      2
                    )}`}
              </Typography>
            )}
          </Box>
          {/* TODO: Add Doughnut Chart from Chart.js  */}
        </CardContent>
      </Card>
      <GraphCarousel />
      <DashboardTable />
    </>
  );
}
