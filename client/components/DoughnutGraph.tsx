import { Box, useTheme } from "@mui/material";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  TooltipItem,
  TooltipModel,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import expenseMap from "../constants/expenseMap";
import { useEffect, useState } from "react";
import NoRowsOverlay from "./NoReceiptsOverlay";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface IReceiptExpenseData {
  expense: string;
  cost: number;
}

function DoughnutGraph({
  receiptData,
}: {
  receiptData: IReceiptExpenseData[];
}) {
  const theme = useTheme();
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  const options: ChartOptions<"doughnut"> = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: windowWidth ? (windowWidth < 750 ? "top" : "left") : "left",
        fullSize: true,
        onHover: (event, legendItem, legend) => {
          if (!legendItem.hidden) {
            const index = legendItem.index;
            const chart = legend.chart;
            const segment = chart.getDatasetMeta(0).data[index!];

            chart.setActiveElements([{ datasetIndex: 0, index: index! }]);
            chart.tooltip?.setActiveElements(
              [{ datasetIndex: 0, index: index! }],
              { x: segment.x, y: segment.y }
            );
          }
        },
        labels: {
          color: theme.palette.mode === "dark" ? "white" : "black",
          sort: (a, b, data) => {
            if (data.labels && data.labels.length > 1) {
              const labelA = data.labels[a.index!] as string;
              const labelB = data.labels[b.index!] as string;
              return labelA.localeCompare(labelB);
            }
            return 1;
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function (
            this: TooltipModel<"doughnut">,
            tooltipItem: TooltipItem<"doughnut">
          ) {
            const parsedValue = tooltipItem.parsed;
            const cost = parsedValue.toFixed(2);
            const sum = tooltipItem.dataset.data.reduce((a, b) => a + b);
            const percentage = ((parsedValue / sum) * 100).toFixed(2);

            return [`Total spent: $${cost}`, `Percentage: ${percentage}%`];
          },
        },
      },
    },
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  const expenseData: Record<string, number> = {};

  if (receiptData.length > 0) {
    receiptData.forEach((receipt) => {
      const expense = receipt.expense;
      const cost = receipt.cost;

      if (expenseData.hasOwnProperty(expense)) {
        expenseData[expense] += cost;
      } else {
        expenseData[expense] = cost;
      }
    });
  }

  const data: ChartData<"doughnut"> = {
    labels: Object.keys(expenseData).map(
      (expense) => expenseMap[expense].displayString
    ),
    datasets: [
      {
        data: Object.values(expenseData),
        backgroundColor: Object.keys(expenseData).map(
          (expense) => expenseMap[expense].chartBackgroundColor
        ),
        borderColor: Object.keys(expenseData).map(
          (expense) => expenseMap[expense].chartBorderColor
        ),
        borderWidth: 1.5,
      },
    ],
  };

  return (
    <Box
      sx={{
        height: `${
          windowWidth ? (windowWidth > 400 ? "600px" : "auto") : "600px"
        }`,
        display: "flex",
        justifyContent: "center",
      }}
    >
      {receiptData.length > 0 ? (
        <Doughnut
          data={data}
          options={options}
          plugins={[
            {
              id: "legendMargin",
              beforeInit: function (chart: any) {
                if (chart.legend) {
                  const fitValue = chart.legend.fit;
                  chart.legend.fit = function fit() {
                    fitValue.bind(chart.legend)();
                    return (this.height += 10);
                  };
                }
              },
            },
          ]}
        />
      ) : (
        <NoRowsOverlay />
      )}
    </Box>
  );
}

export default DoughnutGraph;
