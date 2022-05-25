import { gql } from "apollo-server-express";

export default gql`
  type User {
    id: Int!
    username: String!
    email: String!
    password: String!
    teams: [Team!]!
  }

  type RegisterResponse {
    status: Boolean!
    user: User
    errors: [Error]
  }

  type LoginResponse {
    status: Boolean!
    errors: [Error]
    accessToken: String
    refreshToken: String
  }

  type verifyResponse {
    status: Boolean!
  }

  type Query {
    getUser(id: Int!): User!
    getAllUsers: [User!]!
    verifyUser(accessToken: String, refreshToken: String): verifyResponse!
  }

  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
    ): RegisterResponse!
    login(email: String!, password: String!): LoginResponse!
  }
`;
