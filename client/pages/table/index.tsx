import { useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridValueFormatterParams,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { Button, Chip, Grid, LinearProgress, useTheme } from "@mui/material";
import GridCellExpand from "../../components/GridCellExpand";
import queryReceiptData from "../../utils/queryReceiptData";
import NoRowsOverlay from "../../components/NoRowsOverlay";
import CustomGridToolbar from "../../components/CustomGridToolbar";

export interface IRow {
  id: string;
  date: string;
  storeName: string;
  expense: string;
  cost: number;
  tax: number;
  notes: string;
  tags: {
    tagName: string;
  }[];
}

const expenseMap = {
  FOOD: "Food",
  HOUSING: "Housing",
  TRANSPORTATION: "Transportation",
  ENTERTAINMENT: "Entertainement",
  EDUCATION: "Education",
  HEALTHCARE: "Healthcare",
  UTILITIES: "Utilities",
  CLOTHING: "Clothing",
  PHONE: "Phone",
  PERSONAL_CARE: "Personal Care",
  PET_CARE: "Pet Care",
  CHILD_CARE: "Child Care",
  MEMBERSHIPS_AND_SUBSCRIPTIONS: "Memberships and Subscriptions",
  GIFTS: "Gifts",
  TRAVEL: "Travel",
  DEBT_REPAYMENT: "Debt Repayment",
  SAVINGS: "Savings",
  INVESTMENTS: "Investments",
  EMERGENCY_FUND: "Emergency Fund",
  LARGE_PURCHASES: "Large Purchases",
  LEGAL: "Legal",
  TAXES: "Taxes",
  OTHER: "Other",
};

export default function ReceiptsTable() {
  const theme = useTheme();
  const [rows, setRows] = useState<IRow[]>([]);
  const [loading, setLoading] = useState(true);

  queryReceiptData(setRows, setLoading);

  function renderCellExpand(params: GridRenderCellParams<any, string>) {
    return (
      <GridCellExpand
        value={params.value || ""}
        width={params.colDef.computedWidth}
      />
    );
  }

  const columns: GridColDef[] = [
    {
      field: "Open Receipt Button",
      headerName: "",
      width: 90,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          style={{ margin: "auto" }}
          tabIndex={params.hasFocus ? 0 : -1}
          onClick={() => console.log(params.row.id)}
        >
          open
        </Button>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      type: "date",
      width: 120,
      valueGetter: ({ value }) => value && new Date(value),
      valueFormatter: (params) => {
        return params.value.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      },
    },
    { field: "storeName", headerName: "Store Name", width: 140 },
    {
      field: "expense",
      headerName: "Expense",
      width: 140,
      valueGetter: ({ value }: { value: string }) => {
        return value && (expenseMap as Record<string, string>)[value];
      },
    },
    {
      field: "cost",
      headerName: "Cost",
      type: "number",
      width: 100,
      valueFormatter: (params: GridValueFormatterParams<number>) => {
        if (params.value == null) {
          return "";
        }
        return `$${params.value.toFixed(2).toLocaleString()}`;
      },
    },
    {
      field: "tax",
      headerName: "Tax",
      type: "number",
      width: 100,
      valueGetter: (params) => {
        if (!params.value) {
          return params.value;
        }
        return params.value * 100;
      },
      valueFormatter: (params: GridValueFormatterParams<number>) => {
        if (params.value == null) {
          return "";
        }
        return `${params.value.toLocaleString()}%`;
      },
    },
    {
      field: "notes",
      headerName: "Notes",
      width: 200,
      // renderCell: renderCellExpand,
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 175,
      valueGetter: (params) => {
        if (!params.value) {
          return params.value;
        }
        const tagNames = params.value
          .map((tag: { id: string; tagName: string }) => tag.tagName)
          .sort()
          .join(",");
        return tagNames;
      },
      renderCell: (params) => {
        const tags = params.value.split(",");
        return (
          <Grid container spacing={1}>
            {tags.map((tag: string) => {
              return (
                <Grid item>
                  <Chip
                    variant="outlined"
                    label={tag}
                    sx={{ borderColor: `${tag}`, borderWidth: "2px" }}
                  />
                </Grid>
              );
            })}
          </Grid>
        );
      },
    },
  ];

  return (
    <>
      <div style={{ height: "700px" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 20, 50]}
          onRowDoubleClick={(row) => console.log("RowDoubleClick", row.id)}
          getRowHeight={() => "auto"}
          rowCount={rows.length}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
            sorting: {
              sortModel: [{ field: "date", sort: "desc" }],
            },
          }}
          sx={{
            "& ::-webkit-scrollbar": {
              width: "1.2em",
            },
            "& ::-webkit-scrollbar-track": {
              background: theme.palette.mode === "dark" ? "#222" : "#f1f1f1",
              border: "none",
            },
            "& ::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.mode === "dark" ? "#ddd" : "#888",
              borderRadius: "0.75em",
            },
            "& ::-webkit-scrollbar-thumb:hover": {
              background: theme.palette.mode === "dark" ? "#aaa" : "#555",
            },
            "& ::-webkit-scrollbar-corner": {
              display: "none",
            },
            "&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell": {
              py: "8px",
            },
            "&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell": {
              py: "15px",
            },
            "&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell": {
              py: "22px",
            },
          }}
          slots={{
            toolbar: CustomGridToolbar,
            loadingOverlay: LinearProgress,
            noRowsOverlay: NoRowsOverlay,
          }}
        />
      </div>
    </>
  );
}
