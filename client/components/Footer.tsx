import React from "react";
import { Box, Link, Typography } from "@mui/material";

function Footer() {
  return (
    <Box component="footer" sx={{ p: 4, backgroundColor: "primary.main" }}>
      <Typography
        variant="h6"
        color="white"
        gutterBottom
        sx={{ textAlign: { md: "center" } }}
      >
        Our Team
      </Typography>
      <Box
        component="nav"
        className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
        aria-label="Footer"
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Typography color={"white"}>
          <Link
            href="https://www.linkedin.com/in/ticia-dunn/"
            underline="hover"
            color="inherit"
            sx={{
              marginX: { md: 2 },
              display: "flex",
              alignSelf: { md: "center" },
            }}
          >
            Ticia
          </Link>
        </Typography>
        <Typography color={"white"}>
          <Link
            href="https://www.linkedin.com/in/joe-needham/"
            underline="hover"
            color="inherit"
            sx={{
              marginX: { md: 2 },
              display: "flex",
              alignSelf: { md: "center" },
            }}
          >
            Joe
          </Link>
        </Typography>
        <Typography color={"white"}>
          <Link
            href="https://www.linkedin.com/in/richard-zhiyuan-zhang/"
            underline="hover"
            color="inherit"
            sx={{
              marginX: { md: 2 },
              display: "flex",
              alignSelf: { md: "center" },
            }}
          >
            Richard
          </Link>
        </Typography>
      </Box>
      <Box sx={{ mt: 5, textAlign: "center" }}>
        <Typography color={"white"}>
          &copy; 2023 Ceipt Geek is a web app created by a team of volunteers
          from Chingu, using NextJS and Django. Click{" "}
          <Link
            underline="hover"
            href="https://www.chingu.io/howItWorks"
            color="inherit"
            fontWeight={500}
          >
            here
          </Link>{" "}
          to learn more about how Chingu works.
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;
