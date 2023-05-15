import { 
  Chip,
  Paper, 
  styled, 
  Table, 
  TableBody, 
  TableCell, 
  tableCellClasses, 
  TableContainer, 
  TableHead, 
  TableRow 
} from "@mui/material";
import { GroupedReceipt } from "./Dashboard";
import type { NextRouter } from 'next/router';



interface DashboardTableProps {
  receiptGroup: GroupedReceipt,
  router: NextRouter;
}

export default function DashboardTable({ receiptGroup, router }: DashboardTableProps) {
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="dashboard table">
        <TableHead>
          <TableRow>
            <StyledTableCell align="left" colSpan={3}>
              Expense Type
            </StyledTableCell>
            <StyledTableCell align="left" colSpan={3}>
              Store Name
            </StyledTableCell>
            <StyledTableCell align="left" colSpan={3}>
              Tags
            </StyledTableCell>
            <StyledTableCell align="left" colSpan={3}>
              Total
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {receiptGroup.receipts.map((receipt) => (
            <StyledTableRow sx={{cursor: "pointer"}} key={receipt.node?.id} onClick={() => router.push(`/receiptdetails/${receipt.node?.id}`)}>
              <StyledTableCell colSpan={3} align="left">
                <Chip label={receipt.node?.expense} color="secondary" />
              </StyledTableCell>
              <StyledTableCell colSpan={3} align="left">{receipt.node?.storeName}</StyledTableCell>
              <StyledTableCell colSpan={3} align="left">
                {receipt.node?.tags.map((tag) => 
                  <Chip key={tag.id} label={tag.tagName} color="secondary" />
                )}
              </StyledTableCell>
              <StyledTableCell colSpan={3} align="left" sx={{color: "red"}}>-{receipt.node?.cost}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}