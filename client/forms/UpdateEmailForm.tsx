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
import { useFormik } from "formik";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { UpdateEmailSchema } from "../types/schemas";
import { useUpdateEmailMutation } from "../graphql/generated/graphql";
import { IPartialUser } from "../pages/profile";

export default function UpdateEmailForm({
  setUserDetails,
  setEmailModalIsOpen,
}: {
  setUserDetails: React.Dispatch<React.SetStateAction<IPartialUser>>;
  setEmailModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mutationSubmitted, setMutationSubmitted] = useState(false);
  const [updateEmailMutation] = useUpdateEmailMutation();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: UpdateEmailSchema,
    onSubmit: async (values) => {
      setError("");
      setMutationSubmitted(true);
      await updateEmailMutation({
        variables: {
          email: values.email,
          currentPassword: values.password,
        },
        onCompleted: (data) => {
          if (data.updateUser?.user?.email) {
            setUserDetails((prev) => {
              const current = { ...prev };
              current.email = data?.updateUser?.user?.email!;

              return current;
            });
            setMutationSubmitted(false);
            setEmailModalIsOpen(false);
          } else {
            setError("Update Email Unsuccessful");
            setMutationSubmitted(false);
          }
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
            label="New Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>
        <Grid item xs={8}>
          <FormControl variant="outlined">
            <InputLabel
              htmlFor="password"
              error={formik.touched.password && Boolean(formik.errors.password)}
            >
              Password
            </InputLabel>
            <OutlinedInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              sx={{ width: { xs: "12rem", sm: "15rem" } }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
            />
            {formik.touched.password && formik.errors.password && (
              <FormHelperText
                error
                id="update-email-error"
                sx={{ mx: 0, width: { xs: "12rem", sm: "15rem" } }}
              >
                {formik.errors.password}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={8}>
          <Button type="submit" variant="contained" size="large">
            {mutationSubmitted ? (
              <CircularProgress color="warning" size={20} />
            ) : (
              "Update Email"
            )}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
