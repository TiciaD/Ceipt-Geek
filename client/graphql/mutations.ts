import { gql } from '@apollo/client';

export const CREATE_ACCOUNT_MUTATION = gql`
  mutation CreateAccount($email: String!, $password: String!, $username: String!) {
    createUser(email: $email, password: $password, username: $username) {
      user {
        username
        email
      }
    }

    login(email: $email, password: $password) {
      token
      success
    }
  }
`;

export const AUTH_MUTATION = gql`
  mutation auth($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      success
    }
  }
`
export const DELETE_RECEIPT_MUTATION = gql`
  mutation DeleteReceipt($receiptId: ID!) {
    deleteReceipt(receiptId: $receiptId) {
`;

export const UPDATE_USERNAME_MUTATION = gql`
  mutation UpdateUsername($username: String!) {
    updateUser(username: $username) {
      user {
        username
      }
    }
  }
`;

export const UPDATE_EMAIL_MUTATION = gql`
  mutation UpdateEmail($email: String!, $currentPassword: String!) {
    updateUser(email: $email, currentPassword: $currentPassword) {
      user {
        email
      }
    }
  }
`;

export const UPDATE_PASSWORD_MUTATION = gql`
  mutation UpdatePassword($updatedPassword: String!, $currentPassword: String!) {
    updateUser(updatedPassword: $updatedPassword, currentPassword: $currentPassword) {
      user {
        id
        username
        email
      }
    }
  }
`;

export const DELETE_ACCOUNT_MUTATION = gql`
  mutation DeleteAccount {
    deleteUser {
      success
    }
  }
`;

export const CREATE_RECEIPT_MUTATION = gql`
  mutation CreateReceipt(
    $storeName: String!
    $date: Date!
    $expense: String!
    $tax: DecimalType!
    $cost: DecimalType!
    $notes: String
    $tags: [String!]
    $receiptImage: Upload
  ) {
    createReceipt(
      receiptData: {
        storeName: $storeName
        date: $date
        expense: $expense
        tax: $tax
        cost: $cost
        notes: $notes
        tags: $tags
        receiptImage: $receiptImage
      }
    ) {
      receipt {
        id
        storeName
        cost
        date
        tax
        cost
        notes
        user {
          id
        }
      }
    }
  }
`;
