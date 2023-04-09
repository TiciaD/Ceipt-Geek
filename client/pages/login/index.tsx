import { Card, CardContent, Typography } from "@mui/material";
import LoginForm from "../../forms/LoginForm";

export default function Login() {
  console.log(process.env)
  console.log(process.env.BACKEND_URL || "none");
  return (
    <Card sx={{ minWidth: 275, padding: "2rem" }}>
      <CardContent>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", textAlign: "center" }}
          gutterBottom
        >
          Sign In to Your Account
        </Typography>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
