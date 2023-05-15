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
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useFormik } from "formik";
import { UpdatePasswordSchema } from "../types/schemas";
import { useUpdatePasswordMutation } from "../graphql/generated/graphql";

export default function UpdatePasswordForm() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [mutationSubmitted, setMutationSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatePasswordMutation] = useUpdatePasswordMutation();

  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);
  // const handleClickShowConfirmPassword = () =>
  //   setShowConfirmPassword((show) => !show);
  const handleClickShowCurrentPassword = () =>
    setShowCurrentPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
      currentPassword: "",
    },
    validationSchema: UpdatePasswordSchema,
    onSubmit: async (values) => {
      setError("")
      setSuccessMessage("");
      setMutationSubmitted(true);
      await updatePasswordMutation({
        variables: {
          updatedPassword: values.newPassword,
          currentPassword: values.currentPassword,
        },
        onCompleted: (data) => {
          if (data.updateUser?.user?.id) {
            setSuccessMessage("Password updated successfully");
          } else {
            setError("Password not updated");
          }
          setMutationSubmitted(false);
        },
        onError: (error) => {
          setError(error.message);
          setMutationSubmitted(false);
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
            <InputLabel htmlFor="newPassword">New Password</InputLabel>
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
                sx={{ mx: 0, width: { xs: "12rem", sm: "15rem" } }}
              >
                {formik.errors.newPassword}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
        {/* <Grid item>
          <FormControl variant="outlined">
            <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
            <OutlinedInput
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              sx={{ width: { xs: "12rem", sm: "15rem" } }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Confirm Password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
            />
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <FormHelperText
                  error
                  id="update-password-confirmPassword-error"
                  sx={{ mx: 0, width: { xs: "12rem", sm: "15rem" } }}
                >
                  {formik.errors.confirmPassword}
                </FormHelperText>
              )}
          </FormControl>
        </Grid> */}
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
        <Grid item>
          <FormControl variant="outlined">
            <InputLabel htmlFor="currentPassword">Current Password</InputLabel>
            <OutlinedInput
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              sx={{ width: { xs: "12rem", sm: "15rem" } }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowCurrentPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Current Password"
              value={formik.values.currentPassword}
              onChange={formik.handleChange}
              error={
                formik.touched.currentPassword &&
                Boolean(formik.errors.currentPassword)
              }
            />
            {formik.touched.currentPassword &&
              formik.errors.currentPassword && (
                <FormHelperText
                  error
                  id="update-password-currentPassword-error"
                  sx={{ mx: 0, width: { xs: "12rem", sm: "15rem" } }}
                >
                  {formik.errors.currentPassword}
                </FormHelperText>
              )}
          </FormControl>
        </Grid>
        <Grid item xs={8}>
          <Button type="submit" variant="contained" size="large">
            {mutationSubmitted ? (
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
