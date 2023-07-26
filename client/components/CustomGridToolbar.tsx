import { useRouter } from "next/router";

import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

export default function CustomGridToolbar() {
  const router = useRouter();

  return (
    <GridToolbarContainer sx={{ margin: "1px", marginBottom: "7px" }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => router.push("/create-receipt")}
        sx={{ fontSize: "0.8125rem", marginRight: "auto" }}
      >
        Add Receipt
      </Button>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}
