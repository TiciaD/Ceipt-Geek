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