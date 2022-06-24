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
    accessToken: String
  }

  type Query {
    getUser(id: Int!): User
    getUserByMail(email: String!): User
    getAllUsers: [User]!
    isUserPartOfTeam(userId: Int!, teamId: Int!): Boolean!
    isUserPartOfChannel(userId: Int!,channelId: Int!):Boolean!
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
