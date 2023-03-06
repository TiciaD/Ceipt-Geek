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
  Alert,
} from "@mui/material";
import { useFormik } from "formik";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { LoginSchema } from "../types/schemas";
import { LOGIN_MUTATION } from "../graphql/mutations";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useAuth } from "../utils/useAuth";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loginMutation] = useMutation(LOGIN_MUTATION);
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
      email: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      await loginMutation({
        variables: {
          email: values.email,
          password: values.password
        },
        onCompleted: (data) => {
          login(data.tokenAuth.token)
          router.push('/')
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
                id="login-error"
                sx={{ mx: 0, width: { xs: "12rem", sm: "15rem" } }}
              >
                {formik.errors.password}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={8}>
          <Button type="submit" variant="contained" size="large">
            LOGIN
          </Button>
        </Grid>
        <Grid item>
          <Link href="/createaccount">Don&apos;t have an account?</Link>
        </Grid>
      </Grid>
    </form>
  );
}
