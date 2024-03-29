import { gql } from '@apollo/client';

export const ALL_RECEIPTS_BY_USER_QUERY = gql`
  query AllReceiptsByUser($first: Int!, $after: String) {
    allReceiptsByUser(first: $first, after: $after) {
      totalCount
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      edges {
        cursor
        node {
          id
          storeName
          cost
          date
          expense
          tax
          notes
          tags {
            tagName
          }
        }
      }
    }
  }
`;

export const EXPENSE_DATA_BY_DATE = gql`
  query ExpenseDataByDate(
    $first: Int!
    $after: String
    $dateGte: Date!
    $dateLte: Date!
  ) {
    filteredReceipts(
      first: $first
      after: $after
      dateGte: $dateGte
      dateLte: $dateLte
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          expense
          cost
        }
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

export const GET_RECEIPT = gql`
  query Receipt($receiptId: String!) {
    receipt(receiptId: $receiptId) {
      storeName
      expense
      cost
      tax
      date
      receiptImage
      tags{
        tagName
      }
      notes
    }
  }`;

export const GET_ALL_TAGS_BY_USER_QUERY = gql`
  query GetAllTagsByUser {
    allUsersTags {
      id
      tagName
    }
  }
`;

export const GET_USERS_TAGS = gql`
  query GetAllUsersTags($sortBy: [String]) {
    allUsersTags(sortBy: $sortBy) {
      tagName
      id
    }
  }
`;

export const GET_ALL_EXPENSE_OPTIONS_QUERY = gql`
  query GetAllExpenseOptions {
    expenses
  }
`;

