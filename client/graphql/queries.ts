import { gql } from "@apollo/client";

export const ALL_RECEIPTS_QUERY = gql`query AllReceipts{
  receipts{
    id,
    storeName,
    cost,
    date,
    expense,
    user {
      id
    }
  }
}`