import React, { createContext } from "react";
import "../styles/globals.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { CssBaseline } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { createUploadLink } from "apollo-upload-client"
import { setContext } from "@apollo/client/link/context";
import Layout from "../components/Layout";

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

interface AuthContext {
  userToken: string | null;
  setUserToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContext>({
  userToken: null,
  setUserToken: () => {},
});

const lightTheme = createTheme({
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          padding: "4rem",
          display: "flex",
          minHeight: "100vh",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          WebkitBoxShadow: "0 0 0 1000px white inset",
        },
      },
    },
  },
  palette: {
    mode: "light",
    primary: {
      main: "#3c8c30",
    },
    secondary: {
      main: "#e2395e",
    },
    background: {
      default: "#fafafa",
    },
  },
});

const darkTheme = createTheme({
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          padding: "4rem",
          display: "flex",
          minHeight: "100vh",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          "&:-webkit-autofill": {
            WebkitBoxShadow: "0 0 0 1000px #1e1e1e inset",
          },
        },
      },
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#3c8c30",
    },
    secondary: {
      main: "#e2395e",
    },
  },
});

type Theme = "light" | "dark";

const httpLink = createUploadLink({
  uri: process.env.BACKEND_URL || "http://localhost:8000/graphql/",
  credentials: "include",
});

export const AUTH_TOKEN = "ceipt-geek-auth-token";
const authLink = setContext((_, { headers }) => {
  let token = localStorage.getItem(AUTH_TOKEN) || "";
  if (token) token = JSON.parse(token);
  return {
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App({ Component, pageProps }: AppProps) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const defaultTheme = prefersDarkMode ? "dark" : "light";
  const defaultActiveTheme = prefersDarkMode ? darkTheme : lightTheme;

  const [activeTheme, setActiveTheme] = useState(defaultActiveTheme);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(defaultTheme);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  function getActiveTheme(themeMode: Theme) {
    return themeMode === "light" ? lightTheme : darkTheme;
  }

  const toggleTheme: React.MouseEventHandler<HTMLButtonElement> = () => {
    setSelectedTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    let storedTheme = null;
    if (typeof window !== "undefined") {
      storedTheme = localStorage.getItem("ceipt-geek-theme") || null;
    }

    if (storedTheme !== null && (storedTheme === "dark" || "light")) {
      setSelectedTheme(storedTheme as Theme);
    } else {
      if (prefersDarkMode) {
        setSelectedTheme("dark");
      } else {
        setSelectedTheme("light");
      }
    }
  }, [prefersDarkMode]);

  useEffect(() => {
    setActiveTheme(getActiveTheme(selectedTheme));
  }, [selectedTheme]);

  const colorMode = {
    toggleColorMode: () => {
      const desiredTheme = selectedTheme === "light" ? "dark" : "light";
      setSelectedTheme(desiredTheme);
    },
  };
  const authContextValues = {
    userToken: currentToken,
    setUserToken: (userToken: string | null) => {
      setCurrentToken(userToken);
    },
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <AuthContext.Provider value={authContextValues}>
        <ThemeProvider theme={activeTheme}>
          <CssBaseline />
          <Layout>
            <ApolloProvider client={client}>
              <Component {...pageProps} toggleTheme={toggleTheme} />
            </ApolloProvider>
          </Layout>
        </ThemeProvider>
      </AuthContext.Provider>
    </ColorModeContext.Provider>
  );
}

export default App;
