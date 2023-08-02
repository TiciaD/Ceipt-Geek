import { useState } from "react";
import { useRouter } from "next/router";

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
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  LinearProgress,
  Snackbar,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import GridCellExpand from "./GridCellExpand";
import NoReceiptsOverlay from "./NoReceiptsOverlay";
import CustomGridToolbar from "./CustomGridToolbar";

import queryReceiptData from "../utils/queryReceiptData";
import { useDeleteReceiptMutation } from "../graphql/generated/graphql";
import expenseMap from "../constants/expenseMap";

import { format, add } from "date-fns";

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

export default function ReceiptsTable() {
  const theme = useTheme();
  const router = useRouter();
  const [deleteReceiptMutation] = useDeleteReceiptMutation();
  const [rows, setRows] = useState<IRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queuedDeleteReceiptId, setQueuedDeleteReceiptId] = useState("");
  const [isDeletingReceipt, setIsDeletingReceipt] = useState(false);

  queryReceiptData(setRows, setLoading);

  const handleDeleteReceipt = () => {
    deleteReceiptMutation({
      variables: {
        receiptId: queuedDeleteReceiptId,
      },
      onCompleted: (data) => {
        if (data?.deleteReceipt?.success) {
          setRows(rows.filter((row) => row.id !== queuedDeleteReceiptId));
        }
      },
      onError: (error) => {
        setError(
          "Something went wrong deleting receipt. Please try again. If this issue persists, please log out and back in."
        );
      },
      fetchPolicy: "network-only",
    });

    setIsDeletingReceipt(false);
    setQueuedDeleteReceiptId("");
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
    {
      field: "date",
      headerName: "Date",
      type: "date",
      width: 130,
      valueGetter: ({ value }) => {
        let date = new Date(value);
        date = add(date, { days: 1 });
        return date;
      },
      valueFormatter: ({ value }) => {
        return format(value, "PP");
      },
    },
    { field: "storeName", headerName: "Store Name", width: 160 },
    {
      field: "expense",
      headerName: "Expense",
      width: 160,
      valueGetter: ({ value }: { value: string }) => {
        return value && expenseMap[value].displayString;
      },
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      type: "number",
      width: 100,
      valueGetter: (params) => {
        const total = params.row.cost;
        const tax = params.row.tax;
        return total - tax;
      },
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
      valueFormatter: (params: GridValueFormatterParams<number>) => {
        if (params.value == null) {
          return "";
        }
        return `$${params.value.toFixed(2).toLocaleString()}`;
      },
    },
    {
      field: "cost",
      headerName: "Total Cost",
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
        const tagsString = params.value;
        const tags = tagsString ? params.value.split(",") : [];
        return (
          <Grid container spacing={1}>
            {tags.map((tag: string) => {
              return (
                <Grid item key={tag}>
                  <Chip
                    label={tag}
                    sx={{
                      borderColor:
                        theme.palette.mode === "dark" ? "white" : "black",
                      borderWidth: "2px",
                    }}
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
          <GridActionsCellItem
            icon={<ReceiptLongOutlinedIcon />}
            label="View Receipt"
            title="View Receipt"
            onClick={() => router.push(`/receiptdetails/${params.row.id}`)}
            color="primary"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete Receipt"
            title="Delete Receipt"
            onClick={() => {
              setIsDeletingReceipt(true);
              setQueuedDeleteReceiptId(params.row.id);
            }}
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
      <Box height={750} marginTop={3}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 20, 50, 100]}
          onRowDoubleClick={(row) => router.push(`/receiptdetails/${row.id}`)}
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
            noRowsOverlay: NoReceiptsOverlay,
            noResultsOverlay: NoReceiptsOverlay,
          }}
        />
      </Box>
      <Dialog
        open={isDeletingReceipt}
        onClose={() => {
          setIsDeletingReceipt(false);
          setQueuedDeleteReceiptId("");
        }}
        aria-labelledby="confirm delete account dialog"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to delete this receipt?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This is a permanent and irreversible action. All data associated
            with this receipt will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteReceipt} color="error">
            Delete Receipt
          </Button>
          <Button
            onClick={() => {
              setIsDeletingReceipt(false);
              setQueuedDeleteReceiptId("");
            }}
            color="success"
            autoFocus={true}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
