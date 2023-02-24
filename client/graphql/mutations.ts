import { gql } from "@apollo/client";

export const CREATE_ACCOUNT_MUTATION = gql`mutation CreateAccountMutation (
  $email: String!
  $password: String!
  $username: String!
){
  createUser(email: $email, password: $password, username: $username) {
    user {
      username,
      email
    }
  }
}`

export const LOGIN_MUTATION = gql`
  mutation LoginMutation (
    $email: String!
    $password: String!
  ) {
      tokenAuth(email: $email, password: $password) {
        token
        payload
      }
    }
`