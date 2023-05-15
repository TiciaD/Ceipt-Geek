import { Card, CardContent, Typography, useTheme } from "@mui/material";
import PasswordRecoveryForm from "../../forms/PasswordRecoveryForm";

export default function PasswordRecovery() {
  const theme = useTheme();

  return (
    <Card sx={{ minWidth: 275, padding: "2rem" }}>
      <CardContent>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            mb: 1,
            [theme.breakpoints.down("md")]: {
              fontSize: "30px",
            },
          }}
          gutterBottom
        >
          Password Recovery
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            mb: 4,
            [theme.breakpoints.down("md")]: {
              fontSize: "15px",
            },
          }}
          gutterBottom
        >
          Enter your account's email address
        </Typography>
        <PasswordRecoveryForm />
      </CardContent>
    </Card>
  );
}
