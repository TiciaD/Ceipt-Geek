import { gql } from "@apollo/client";

export const CREATE_ACCOUNT_MUTATION = gql`mutation CreateAccount (
  $email: String!
  $password: String!
  $username: String!
){
  createUser(email: $email, password: $password, username: $username) {
    user {
      username
      email
    }
  }
  
  login(email:$email, password: $password) {
    token
    success
  }
}`

export const AUTH_MUTATION = gql`
  mutation auth($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      success
    }
  }
`