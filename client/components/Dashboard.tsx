import { 
  Box, 
  Card, 
  CardContent, 
  Typography 
} from "@mui/material";
import { ReceiptType, useAllReceiptsByUserQuery, useTotalExpenditureByDateQuery } from "../graphql/generated/graphql";
import DashboardTable from "./DashboardTable";

export interface GroupedReceipt {
  date: string;
  receipts: ReceiptType[];
}

export default function Dashboard() {
  const allReceipts = useAllReceiptsByUserQuery({fetchPolicy: "cache-and-network"});

  // Get current date
  const currentDate = new Date();
  const todayFormattedDate = currentDate.toISOString().split('T')[0];

  const totalExpenditureToday = useTotalExpenditureByDateQuery({
    variables: {
      dateGte: todayFormattedDate,
      dateLte: todayFormattedDate,
    }
  });

  // Get yesterday's date
  currentDate.setDate(currentDate.getDate() - 1);
  const yesterdayFormattedDate = currentDate.toISOString().split('T')[0];

  const totalExpenditureYesterday = useTotalExpenditureByDateQuery({
    variables: {
      dateGte: yesterdayFormattedDate,
      dateLte: yesterdayFormattedDate,
    }
  });

  if (allReceipts.loading) {
    return <p>Loading...</p>
  }

  if (allReceipts.error) {
    return <p>Error {allReceipts.error.message}</p>
  }

  let receipts = allReceipts.data?.allReceiptsByUser as ReceiptType[];
  // Group receipts by date
  const groupedReceipts = receipts ? receipts.reduce((accumulator: GroupedReceipt[], currentValue: ReceiptType) => {
    const existingReceipts = accumulator.find(
      (item) => item.date === currentValue.date
    );
    if (existingReceipts) {
      existingReceipts.receipts.push(currentValue);
    } else {
      accumulator.push({
        date: currentValue.date,
        receipts: [currentValue],
      });
    }
    return accumulator;
  }, [])
  :
  [];

  return (
    <>
      <Card sx={{ width: "auto", padding: "2rem", marginBottom: "2rem" }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: "bold" }} align="center" gutterBottom>
            {"You've Spent:"}
          </Typography>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold", padding: 0 }} align="center" gutterBottom>
              Today:
            </Typography>
            {
              totalExpenditureToday.loading ? 
              <p>Loading...</p>
              :
              <Typography variant="body1" align="center" gutterBottom>
                {
                  totalExpenditureToday.error ? 
                  totalExpenditureToday.error.message 
                  : 
                  `${totalExpenditureToday.data?.totalExpenditureByDate?.toFixed(2)}`
                }
              </Typography>
            }
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold" }} align="center" gutterBottom>
              Yesterday:
            </Typography>
            {
              totalExpenditureYesterday.loading && !totalExpenditureToday.error? 
              <p>Loading...</p>
              :
              <Typography variant="body1" align="center" gutterBottom>
                {
                  totalExpenditureYesterday.error ? 
                  totalExpenditureYesterday.error.message 
                  : 
                  `${totalExpenditureYesterday?.data?.totalExpenditureByDate?.toFixed(2)}`
                }
              </Typography>
            }
          </Box>
            {/* TODO: Add Doughnut Chart from Chart.js  */}
        </CardContent>
      </Card>
      {groupedReceipts.map((receiptGroup, i) => {
        return (
          <>
            <Box key={`${receiptGroup.date}_${i}`} sx={{ marginBottom: "2rem" }}>
              <Typography variant="h5">{receiptGroup.date}</Typography>
              <DashboardTable receiptGroup={receiptGroup}/>
            </Box>
          </>
        )
      })}
    </>
  );
}
