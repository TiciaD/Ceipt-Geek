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
import { useUpdateEmailMutation } from "../graphql/generated/graphql";


export default function PasswordRecoveryForm() {
  const [error, setError] = useState("");
  const [mutationSubmitted, setMutationSubmitted] = useState(false);
  // const [updateEmailMutation] = useUpdateEmailMutation();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: PasswordRecoverySchema,
    onSubmit: async (values) => {
      setError("");
      setMutationSubmitted(true);
      // await updateEmailMutation({
      //   variables: {
      //     email: values.email,
      //     currentPassword: values.password,
      //   },
      //   onCompleted: (data) => {
      //     if (data.updateUser?.user?.email) {
      //       setUserDetails((prev) => {
      //         const current = { ...prev };
      //         current.email = data?.updateUser?.user?.email!;

      //         return current;
      //       });
      //       setMutationSubmitted(false);
      //       setEmailModalIsOpen(false);
      //     } else {
      //       setError("Update Email Unsuccessful");
      //       setMutationSubmitted(false);
      //     }
      //   },
      //   onError: (error) => {
      //     setMutationSubmitted(false);
      //     setError(error.message);
      //   },
      //   fetchPolicy: "network-only",
      // });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        direction="column"
        spacing={3}
        sx={{ py: "1rem" }}
      >
        {error && (
          <Grid item>
            <Alert severity="error">{error}</Alert>
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
          <Button type="submit" variant="contained" size="large">
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
