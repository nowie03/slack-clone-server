import { gql } from "apollo-server-express";

export default gql`
  type Channel {
    id: Int!
    name: String!
    public: Boolean!
    messages: [Message!]!
    users: [User!]!
  }

  type CreateChannelResponse {
    status: Boolean!
    errors: [Error!]
    channel: Channel
  }

  type AddUserToChannelResponse {
    status: Boolean!
    errors: [Error!]
    user: User
  }

  type Query {
    getChannels(teamId: Int!): [Channel!]
    getChannelMembers(channelId: Int!): [User!]
  }

  type Subscription {
    channelCreated(teamId: Int!): Channel!
    newUserAddedToChannel(channelId: Int!): User!
  }

  type Mutation {
    createChannel(
      teamId: Int!
      name: String!
      public: Boolean = false
    ): CreateChannelResponse!
    addUserToChannel(
      email: String!
      channelId: Int!
      teamId: Int!
    ): AddUserToChannelResponse!
  }
`;
