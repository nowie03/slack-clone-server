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
    team: Team!
    errors: [Error]
  }

  type AddUserResponse {
    status: Boolean!
    user: User
    errors: [Error]
  }

  type PrivateChat{
    user:User!
    privateChatId:Int!
  }

  type GetTeamsResponse {
    id: Int!
    name: String!
    owner: User
    members: [User!]!
    channels: [Channel!]!
    privateChats: [PrivateChat]
  }

  type Query {
    getTeams: [GetTeamsResponse!]
    getMembers(teamId:Int!):[User!]
  }

  type Subscription{
    newUserAddedToTeam(teamId:Int!):User!
  }

  type Mutation {
    createTeam(name: String!): CreateTeamResponse!
    addUserToTeam(teamId: Int!, email: String!): AddUserResponse!
  }
`;
