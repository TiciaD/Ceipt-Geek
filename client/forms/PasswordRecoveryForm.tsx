import { useState } from "react";
import {
  Button,
  Grid,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import { PasswordRecoverySchema } from "../types/schemas";
import { useRequestPasswordResetMutation } from "../graphql/generated/graphql";

export default function PasswordRecoveryForm() {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mutationSubmitted, setMutationSubmitted] = useState(false);
  const [requestPasswordResetMutation] = useRequestPasswordResetMutation();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: PasswordRecoverySchema,
    onSubmit: async (values) => {
      setError("");
      setSuccessMessage("");
      setMutationSubmitted(true);
      await requestPasswordResetMutation({
        variables: {
          email: values.email,
        },
        onCompleted: (data) => {
          if (data.requestPasswordReset?.success) {
            setSuccessMessage(
              "Password reset link has been sent to your email address"
            );
          } else {
            setError("Password reset request unsuccessful");
          }
          setMutationSubmitted(false);
        },
        onError: (error) => {
          setMutationSubmitted(false);
          setError(error.message);
        },
        fetchPolicy: "network-only",
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        direction="column"
        spacing={2.5}
        sx={{ py: "1rem" }}
      >
        {error && (
          <Grid item>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
        {successMessage && (
          <Grid item>
            <Alert severity="success">{successMessage}</Alert>
          </Grid>
        )}
        <Grid item>
          <TextField
            sx={{ width: { xs: "12rem", sm: "15rem" } }}
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>
        <Grid item xs={8}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={mutationSubmitted}
          >
            {mutationSubmitted ? (
              <CircularProgress color="warning" size={20} />
            ) : (
              "Recover Password"
            )}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
