import { useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridValueFormatterParams,
  GridRenderCellParams,
  GridActionsCellItem,
  GridRowId,
} from "@mui/x-data-grid";
import {
  Alert,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Snackbar,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import GridCellExpand from "./GridCellExpand";
import NoRowsOverlay from "./NoRowsOverlay";
import CustomGridToolbar from "./CustomGridToolbar";

import queryReceiptData from "../utils/queryReceiptData";
import { useDeleteReceiptMutation } from "../graphql/generated/graphql";

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
  const [deleteReceiptMutation] = useDeleteReceiptMutation();
  const [rows, setRows] = useState<IRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  queryReceiptData(setRows, setLoading);

  const handleDeleteReceipt = (id: GridRowId) => {
    deleteReceiptMutation({
      variables: {
        receiptId: String(id),
      },
      onCompleted: (data) => {
        if (data?.deleteReceipt?.success) {
          setRows(rows.filter((row) => row.id !== id));
        }
      },
      onError: (error) => {
        setError(
          "Something went wrong deleting receipt. Please try again. If this issue persists, please log out and back in."
        );
      },
      fetchPolicy: "network-only",
    });
  };

  function renderCellExpand(params: GridRenderCellParams<any, string>) {
    return (
      <GridCellExpand
        value={params.value || ""}
        width={params.colDef.computedWidth}
      />
    );
  }

  const columns: GridColDef[] = [
    // {
    //   field: "Open Receipt Button",
    //   headerName: "",
    //   width: 90,
    //   sortable: false,
    //   filterable: false,
    //   disableColumnMenu: true,
    //   renderCell: (params) => (
    //     <Button
    //       variant="outlined"
    //       size="small"
    //       style={{ margin: "auto" }}
    //       tabIndex={params.hasFocus ? 0 : -1}
    //       onClick={() => console.log(params.row.id)}
    //     >
    //       open
    //     </Button>
    //   ),
    // },
    {
      field: "date",
      headerName: "Date",
      type: "date",
      width: 130,
      valueGetter: ({ value }) => value && new Date(value),
      valueFormatter: ({ value }) =>
        value &&
        value.toLocaleDateString("en-us", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    { field: "storeName", headerName: "Store Name", width: 160 },
    {
      field: "expense",
      headerName: "Expense",
      width: 160,
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
      renderCell: renderCellExpand,
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
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 100,
      cellClassName: "actions",
      getActions: (params) => {
        return [
          //   icon={<EditIcon />}
          //   label="Edit"
          //   className="textPrimary"
          //   onClick={() => console.log("edit", params.row.id)}
          //   color="primary"
          // />,
          <GridActionsCellItem
            icon={<ReceiptLongOutlinedIcon />}
            label="Open Receipt"
            title="Open Receipt"
            onClick={() => console.log("open", params.row.id)}
            color="primary"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete Receipt"
            title="Delete Receipt"
            onClick={() => handleDeleteReceipt(params.row.id)}
            color="error"
          />,
        ];
      },
    },
  ];

  return (
    <>
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
      <div style={{ height: "800px" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 20, 50, 100]}
          onRowDoubleClick={(row) => console.log("RowDoubleClick", row.id)}
          getRowHeight={() => "auto"}
          rowCount={rows.length}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 20, page: 0 },
            },
            sorting: {
              sortModel: [{ field: "date", sort: "desc" }],
            },
          }}
          sx={{
            "& ::-webkit-scrollbar": {
              width: "10px",
              height: "10px",
            },
            "& ::-webkit-scrollbar-track": {
              backgroundColor:
                theme.palette.mode === "dark" ? "#222" : "#f1f1f1",
              border: "none",
            },
            "& ::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.mode === "dark" ? "#ddd" : "#888",
              borderRadius: "0.75em",
            },
            "& ::-webkit-scrollbar-thumb:hover": {
              backgroundColor: theme.palette.mode === "dark" ? "#aaa" : "#555",
            },
            "& ::-webkit-scrollbar-corner": {
              backgroundColor:
                theme.palette.mode === "dark" ? "#222" : "#f1f1f1",
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
            noResultsOverlay: NoRowsOverlay,
          }}
        />
      </div>
    </>
  );
}
