import { Card, CardContent, Typography } from "@mui/material";
import CreateReceiptForm from "../../forms/CreateReceiptForm";

export default function CreateReceipt() {
  return (
    <Card sx={{ minWidth: 275, padding: "2rem" }}>
      <CardContent>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", textAlign: "center" }}
          gutterBottom
        >
          Create Receipt
        </Typography>
        <CreateReceiptForm />
      </CardContent>
    </Card>
  );
}
