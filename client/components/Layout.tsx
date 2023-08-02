import Head from "next/head";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useContext } from "react";
import { ColorModeContext } from "../pages/_app";
import { Box } from "@mui/material";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const colorMode = useContext(ColorModeContext);
  return (
    <>
      <Head>
        <title>Ceipt Geek</title>
        <meta name="description" content="Ceipt Geek" />
        <link rel="icon" href="/receipt.ico" />
      </Head>
      <Navbar toggleTheme={colorMode.toggleColorMode} />
      <main>
        <Box
          sx={{
            minHeight: "100vh",
            padding: "2rem",
            maxWidth: "56rem",
            marginX: "auto",
            "@media (max-width: 300px)": {
              padding: "5px",
            }
          }}
        >
          {children}
        </Box>
      </main>
      <Footer />
    </>
  );
}
