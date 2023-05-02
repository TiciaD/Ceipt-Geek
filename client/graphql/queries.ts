import { gql } from "@apollo/client";

export const ALL_RECEIPTS_BY_USER_QUERY = gql`
  query AllReceiptsByUser($first: Int!, $after: String) {
    allReceiptsByUser(first: $first, after: $after) {
      edges {
        cursor
        node {
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
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;


export const TOTAL_EXPENDITURE_BY_DATE = gql`query TotalExpenditureByDate($dateGte: Date!, $dateLte: Date!) {
  totalExpenditureByDate(dateGte: $dateGte, dateLte: $dateLte)
}
`