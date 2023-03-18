import { 
  Box, 
  Card, 
  CardContent, 
  CircularProgress, 
  Grid, 
  Typography 
} from "@mui/material";
import DashboardTable from "./DashboardTable";

export type Receipt = {
  id: string,
  storeName: string,
  cost: string,
  date: string,
  expense: string,
  tags: Tag[]
};

type Tag = {
  id: string,
  tagName: string
};

export interface GroupedReceipt {
  date: string;
  receipts: Receipt[];
}

export default function Dashboard() {
  // TODO: Dummy data, replace with query when ready
  const receipts: Receipt[] = [
    {
      id: "1",
      storeName: "Netflix",
      cost: "65.10",
      date: "2022-04-05",
      expense: "ENTERTAINMENT",
      tags: [
        {
          id: "2",
          tagName: "Black"
        }
      ]
    },
    {
      id: "2",
      storeName: "Petco",
      cost: "59.60",
      date: "2023-03-31",
      expense: "UTILITIES",
      tags: [
        {
          id: "2",
          tagName: "Black"
        }
      ]
    },
    {
      id: "3",
      storeName: "Laser Tag",
      cost: "33.76",
      date: "2022-04-16",
      expense: "LEGAL",
      tags: [
        {
          id: "3",
          tagName: "White"
        },
        {
          id: "4",
          tagName: "Violet"
        }
      ]
    },
    {
      id: "4",
      storeName: "Kroger",
      cost: "45.64",
      date: "2022-04-06",
      expense: "GROCERY",
      tags: [
        {
          id: "2",
          tagName: "Black"
        },
        {
          id: "4",
          tagName: "Violet"
        },
      ]
    },
    {
      id: "5",
      storeName: "Lowe's",
      cost: "23.34",
      date: "2022-04-06",
      expense: "GROCERY",
      tags: [
        {
          id: "4",
          tagName: "Violet"
        },
      ]
    }
  ];

  // Group receipts by date
  const groupedReceipts = receipts.reduce((accumulator: GroupedReceipt[], currentValue: Receipt) => {
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
  }, []);

  return (
    <>
      <Card sx={{ width: "auto", padding: "2rem", marginBottom: "2rem" }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: "bold" }} align="center" gutterBottom>
            {"You've Spent:"}
          </Typography>

          {/* TODO: Replace with values from backend */}
          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold", padding: 0 }} align="center" gutterBottom>
              Today:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "" }} align="center" gutterBottom>
              $16.27
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold" }} align="center" gutterBottom>
              Yesterday:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "" }} align="center" gutterBottom>
              $50.54
            </Typography>
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
