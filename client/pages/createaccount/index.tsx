import { Card, CardContent, Typography } from "@mui/material";
import CreateAccountForm from "../../forms/CreateAccountForm";

export default function CreateAccount() {
  return (
    <Card sx={{ minWidth: 275, padding: "2rem" }}>
      <CardContent>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", textAlign: "center" }}
          gutterBottom
        >
          Create an Account
        </Typography>
        <CreateAccountForm />
      </CardContent>
    </Card>
  );
}
