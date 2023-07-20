import { useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";

import ResetPasswordForm from "../forms/ResetPasswordForm";
import { usePasswordRecoveryQuery } from "../graphql/generated/graphql";

export default function ResetPasswordUI({ token }: { token: string }) {
  const theme = useTheme();
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  usePasswordRecoveryQuery({
    variables: {
      token: token as string,
    },
    onCompleted: (data) => {
      if (data.userId) {
        setUserId(data.userId);
      } else {
        setError(
          "An error occurred retrieving your password reset request. Please refresh the page. If you continue to see this error, please submit another password reset request."
        );
      }
      setLoading(false);
    },
    onError: (error) => {
      setError(error.message);
      setLoading(false);
    },
    fetchPolicy: "network-only",
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="20px">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" padding="20px">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
          Reset Your Password
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
          Enter a new password for your account
        </Typography>
        <ResetPasswordForm userId={userId} token={token} />
      </CardContent>
    </Card>
  );
}
