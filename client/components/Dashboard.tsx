import { Card, CardContent, Typography } from "@mui/material";

export default function Dashboard() {
  return (
    <Card sx={{ minWidth: 275, padding: "2rem" }}>
      <CardContent>
        <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
          Authenticated Dashboard
        </Typography>
      </CardContent>
    </Card>
  );
}
