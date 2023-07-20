import { useState } from "react";
import {
  Button,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useFormik } from "formik";
import { ResetPasswordSchema } from "../types/schemas";
import { useResetPasswordMutation } from "../graphql/generated/graphql";

export default function UpdatePasswordForm({
  userId,
  token,
}: {
  userId: string;
  token: string;
}) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [mutationSubmitted, setMutationSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resetPasswordMutation] = useResetPasswordMutation();

  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values) => {
      setError("");
      setSuccessMessage("");
      setMutationSubmitted(true);
      await resetPasswordMutation({
        variables: {
          token: token,
          userId: userId,
          password: values.newPassword,
        },
        onCompleted: (data) => {
          if (data.resetPassword?.success) {
            setSuccessMessage("Password updated successfully.");
          } else {
            setError(
              "Password not updated. Please submit another password reset request."
            );
          }
        },
        onError: (error) => {
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
        spacing={3}
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
          <FormControl variant="outlined">
            <InputLabel
              htmlFor="newPassword"
              error={
                formik.touched.newPassword && Boolean(formik.errors.newPassword)
              }
            >
              New Password
            </InputLabel>
            <OutlinedInput
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              sx={{ width: { xs: "12rem", sm: "15rem" } }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle new password visibility"
                    onClick={handleClickShowNewPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="New Password"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              error={
                formik.touched.newPassword && Boolean(formik.errors.newPassword)
              }
            />
            {formik.touched.newPassword && formik.errors.newPassword && (
              <FormHelperText
                error
                id="update-password-newPassword-error"
                sx={{ mx: 0, pl: 2, width: { xs: "12rem", sm: "15rem" } }}
              >
                {formik.errors.newPassword}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item>
          <TextField
            sx={{ width: { xs: "12rem", sm: "15rem" } }}
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={
              formik.touched.confirmPassword &&
              Boolean(formik.errors.confirmPassword)
            }
            helperText={
              formik.touched.confirmPassword && formik.errors.confirmPassword
            }
          />
        </Grid>
        <Grid item xs={8}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={mutationSubmitted}
          >
            {error ? (
              <CloseIcon color="error" />
            ) : successMessage ? (
              <DoneIcon color="success" />
            ) : mutationSubmitted ? (
              <CircularProgress color="warning" size={20} />
            ) : (
              "Update Password"
            )}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
