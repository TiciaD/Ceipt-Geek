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
  Link,
  Alert
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useFormik } from "formik";
import { CreateAccountSchema } from "../types/schemas";
import { useRouter } from "next/router";
import { useCreateAccountMutation } from "../graphql/generated/graphql";
import { useAuth } from "../utils/useAuth";

export default function CreateAccountForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [signup] = useCreateAccountMutation();
  const { login } = useAuth();
  const router = useRouter();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    validationSchema: CreateAccountSchema,
      onSubmit: async (values) => {
        await signup({
          variables: {
            username: values.username,
            email: values.email,
            password: values.password
          },
        onCompleted: (data) => {
          if (data.login?.success === true) {
            login(data?.login?.token || '')
            router.push('/')
          } else {
            setError("Login Unsuccessful");
          }
        },
        onError: (error) => {
          setError(error.message);
        }
      })
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
        {error && <Grid item>
          <Alert severity="error">{error}</Alert>
        </Grid>}
        <Grid item>
          <TextField
            sx={{ width: { xs: "12rem", sm: "15rem" } }}
            id="username"
            name="username"
            label="Username"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />
        </Grid>
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
        <Grid item>
          <FormControl variant="outlined">
            <InputLabel htmlFor="password">Password</InputLabel>
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
                id="create-account-error"
                sx={{ mx: 0, width: { xs: "12rem", sm: "15rem" } }}
              >
                {formik.errors.password}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={8}>
          <Button type="submit" variant="contained" size="large">
            SIGN UP
          </Button>
        </Grid>
        <Grid item>
            <Link href='/login'>Already have an account?</Link>
        </Grid>
      </Grid>
    </form>
  );
}
