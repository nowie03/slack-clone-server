import { gql } from "apollo-server-express";

export default gql`
  type Channel {
    id: Int!
    name: String!
    public: Boolean!
    messages: [Message!]!
    users: [User!]!
  }

  type CreateChannelResponse{
    status:Boolean!
    errors:[Error!]
    channel:Channel
  }

  type Mutation {
    createChannel(
      teamId: Int!
      name: String!
      public: Boolean = false
    ): CreateChannelResponse!
  }
`;
