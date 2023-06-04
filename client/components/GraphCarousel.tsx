import React, { useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import DoughnutGraph from "./DoughnutGraph";
import {
  queryMonthExpenseBreakdownData,
  queryYearExpenseBreakdownData,
} from "../utils/queryExpenseBreakdownData";
import { IReceiptExpenseData } from "./DoughnutGraph";

function GraphCarousel() {
  const [monthLoading, setMonthLoading] = useState(true);
  const [yearLoading, setYearLoading] = useState(true);
  const [monthData, setMonthData] = useState<IReceiptExpenseData[]>([]);
  const [yearData, setYearData] = useState<IReceiptExpenseData[]>([]);

  queryMonthExpenseBreakdownData(setMonthLoading, setMonthData);

  queryYearExpenseBreakdownData(setYearLoading, setYearData);

  return (
    <>
      {monthLoading || yearLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ height: "200px" }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Carousel
          stopAutoPlayOnHover={true}
          interval={8000}
          swipe={true}
          sx={{ my: 5 }}
          fullHeightHover={false}
          navButtonsAlwaysVisible={true}
          navButtonsWrapperProps={{
            style: {
              bottom: "-25px",
              top: "unset",
            },
          }}
        >
          {[
            <Box key={0}>
              <Typography
                variant="h5"
                textAlign="center"
                marginBottom="25px"
                fontWeight="bold"
              >
                This Month's Expense Breakdown
              </Typography>
              <DoughnutGraph receiptData={monthData} />
            </Box>,
            <Box key={1}>
              <Typography
                variant="h5"
                textAlign="center"
                marginBottom="25px"
                fontWeight="bold"
              >
                This Year's Expense Breakdown
              </Typography>
              <DoughnutGraph receiptData={yearData} />
            </Box>,
          ]}
        </Carousel>
      )}
    </>
  );
}

export default GraphCarousel;
