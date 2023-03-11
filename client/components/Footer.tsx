import React from "react";
import { Box, Link, Typography } from "@mui/material";

function Footer() {
  return (
    <Box component="footer" sx={{ p: 4, backgroundColor: "primary.main" }}>
      <Typography
        variant="h6"
        color='white'
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
            href="#"
            underline="hover"
            color="inherit"
            sx={{
              marginX: { md: 2 },
              display: "flex",
              alignSelf: { md: "center" },
            }}
          >
            Teammate LinkedIn #1
          </Link>
        </Typography>
        <Typography color={"white"}>
          <Link
            href="#"
            underline="hover"
            color="inherit"
            sx={{
              marginX: { md: 2 },
              display: "flex",
              alignSelf: { md: "center" },
            }}
          >
            Teammate LinkedIn #2
          </Link>
        </Typography>
        <Typography color={"white"}>
          <Link
            href="#"
            underline="hover"
            color="inherit"
            sx={{
              marginX: { md: 2 },
              display: "flex",
              alignSelf: { md: "center" },
            }}
          >
            Teammate LinkedIn #3
          </Link>
        </Typography>
      </Box>
      <Box sx={{ mt: 5, textAlign: "center" }}>
        <Typography color={"white"}>
          &copy; 2022 Ceipt-Tracker is a web app created by a team of volunteers
          from Chingu, using NextJS and Django. Click{" "}
          <Link
            underline="hover"
            href="https://www.chingu.io/howItWorks"
            color="inherit"
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