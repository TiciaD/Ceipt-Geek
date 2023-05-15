import { Card, CardContent, Typography } from "@mui/material";
import PasswordRecoveryForm from "../../forms/PasswordRecoveryForm";

export default function PasswordRecovery() {
  return (
    <Card sx={{ minWidth: 275, padding: "2rem" }}>
      <CardContent>
        <Typography
          variant="h3"
          sx={{ fontWeight: "bold", textAlign: "center" }}
          gutterBottom
        >
          Password Recovery
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", textAlign: "center" }}
          gutterBottom
        >
          Enter your account's email address
        </Typography>
        <PasswordRecoveryForm />
      </CardContent>
    </Card>
  );
}
