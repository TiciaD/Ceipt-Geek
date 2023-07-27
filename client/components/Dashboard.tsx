import { Box, Card, CardContent, Grid, Typography } from "@mui/material";

import { useTotalExpenditureByDateQuery } from "../graphql/generated/graphql";
import DashboardTable from "./DashboardTable";
import GraphCarousel from "./GraphCarousel";

import getDates from "../utils/getDates";

export default function Dashboard() {
  const {
    formattedCurrentDate,
    formattedFirstDayOfMonth,
    formattedLastDayOfMonth,
    formattedFirstDayOfYear,
    formattedLastDayOfYear,
    formattedFirstDayOfWeek,
    formattedLastDayOfWeek,
  } = getDates();

  
  const totalExpenditureToday = useTotalExpenditureByDateQuery({
    variables: {
      dateGte: formattedCurrentDate,
      dateLte: formattedCurrentDate,
    },
    fetchPolicy: "cache-and-network",
  });

  const totalExpenditureThisWeek = useTotalExpenditureByDateQuery({
    variables: {
      dateGte: formattedFirstDayOfWeek,
      dateLte: formattedLastDayOfWeek,
    },
    fetchPolicy: "cache-and-network",
  });

  const totalExpenditureThisMonth = useTotalExpenditureByDateQuery({
    variables: {
      dateGte: formattedFirstDayOfMonth,
      dateLte: formattedLastDayOfMonth,
    },
    fetchPolicy: "cache-and-network",
  });

  const totalExpenditureThisYear = useTotalExpenditureByDateQuery({
    variables: {
      dateGte: formattedFirstDayOfYear,
      dateLte: formattedLastDayOfYear,
    },
    fetchPolicy: "cache-and-network",
  });

  return (
    <>
      <Card sx={{ width: "auto", padding: "2rem" }}>
        <CardContent>
          <Typography
            sx={{
              fontWeight: "bold",
              mb: 3,
              fontSize: { sm: "1.75rem", xs: "1.5rem" },
            }}
            align="center"
          >
            {"You've Spent:"}
          </Typography>
          <Grid container rowSpacing={1.5} columnSpacing={{ xs: 1 }}>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold" }}
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
                    : `$${totalExpenditureToday.data?.totalExpenditureByDate?.toFixed(
                        2
                      )}`}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold" }}
                align="center"
                gutterBottom
              >
                This Week:
              </Typography>
              {totalExpenditureThisWeek.loading ? (
                <p>Loading...</p>
              ) : (
                <Typography variant="body1" align="center" gutterBottom>
                  {totalExpenditureThisWeek.error
                    ? totalExpenditureThisWeek.error.message
                    : `$${totalExpenditureThisWeek.data?.totalExpenditureByDate?.toFixed(
                        2
                      )}`}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold" }}
                align="center"
                gutterBottom
              >
                This Month:
              </Typography>
              {totalExpenditureThisMonth.loading ? (
                <p>Loading...</p>
              ) : (
                <Typography variant="body1" align="center" gutterBottom>
                  {totalExpenditureThisMonth.error
                    ? totalExpenditureThisMonth.error.message
                    : `$${totalExpenditureThisMonth.data?.totalExpenditureByDate?.toFixed(
                        2
                      )}`}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold" }}
                align="center"
                gutterBottom
              >
                This Year:
              </Typography>
              {totalExpenditureThisYear.loading ? (
                <p>Loading...</p>
              ) : (
                <Typography variant="body1" align="center" gutterBottom>
                  {totalExpenditureThisYear.error
                    ? totalExpenditureThisYear.error.message
                    : `$${totalExpenditureThisYear.data?.totalExpenditureByDate?.toFixed(
                        2
                      )}`}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <GraphCarousel />
      <DashboardTable />
    </>
  );
}
