import { gql } from "@apollo/client";

export const ALL_RECEIPTS_BY_USER_QUERY = gql`query AllReceiptsByUser {
  allReceiptsByUser {
    id
    storeName
    cost
    date
    expense
    tags {
      id
      tagName
    }
  }
}`

export const TOTAL_EXPENDITURE_BY_DATE = gql`query TotalExpenditureByDate($dateGte: Date!, $dateLte: Date!) {
  totalExpenditureByDate(dateGte: $dateGte, dateLte: $dateLte)
}
`