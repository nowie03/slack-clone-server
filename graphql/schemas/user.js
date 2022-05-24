import { gql } from "apollo-server-express";

export default gql`
  type User {
    id: Int!
    username: String!
    email: String!
    password: String!
    teams: [Team!]!
  }

  type Query {
    getUser(id: Int!): User!
    getAllUsers: [User!]!
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

  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
    ): RegisterResponse!
    login(email: String!, password: String!): LoginResponse!
  }
`;
