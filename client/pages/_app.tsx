import React from "react";
import "../styles/globals.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { CssBaseline } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Layout from "../components/Layout";

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
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

function App({ Component, pageProps }: AppProps) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const defaultTheme = prefersDarkMode ? "dark" : "light";
  const defaultActiveTheme = prefersDarkMode ? darkTheme : lightTheme;
  const [activeTheme, setActiveTheme] = useState(defaultActiveTheme);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(defaultTheme);

  function getActiveTheme(themeMode: Theme) {
    return themeMode === "light" ? lightTheme : darkTheme;
  }

  const toggleTheme: React.MouseEventHandler<HTMLButtonElement> = () => {
    const desiredTheme = selectedTheme === "light" ? "dark" : "light";

    setSelectedTheme(desiredTheme);
  };

  useEffect(() => {
    if (prefersDarkMode) {
      setSelectedTheme("dark");
    } else {
      setSelectedTheme("light");
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

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={activeTheme}>
        <CssBaseline />
        <Layout>
          <Component {...pageProps} toggleTheme={toggleTheme} />
        </Layout>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
