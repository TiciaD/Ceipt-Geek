import { gql } from "@apollo/client";

export const ALL_RECEIPTS_BY_USER_QUERY = gql`
  query AllReceiptsByUser {
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
  }
`;

export const TOTAL_EXPENDITURE_BY_DATE = gql`
  query TotalExpenditureByDate($dateGte: Date!, $dateLte: Date!) {
    totalExpenditureByDate(dateGte: $dateGte, dateLte: $dateLte)
  }
`;

export const USER_QUERY = gql`
  query User {
    user {
      id
      username
      email
      dateJoined
      receiptCount
      tagsCount
    }
  }
`;

export const PASSWORD_RECOVERY_QUERY = gql`
  query PasswordRecovery($token: String!) {
    userId: passwordRecovery(token: $token)
  }
`
