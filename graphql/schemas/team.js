import { gql } from "apollo-server-express";

export default gql`
  type Team {
    id: Int!
    name: String!
    owner: User
    members: [User!]!
    channels: [Channel!]!
  }

  type CreateTeamResponse {
    status: Boolean!
    errors: [Error]
  }

  type Mutation {
    createTeam(name: String!): CreateTeamResponse!
  }
`;
