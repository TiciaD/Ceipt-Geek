import { Card, CardContent, Typography } from "@mui/material";
import CreateReceiptForm from "../../forms/CreateReceiptForm";

export default function CreateReceipt() {
  return (
    <Card sx={{ minWidth: 200, padding: {sm: "2rem", xs: "10px"} }}>
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
