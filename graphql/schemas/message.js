import { gql } from "apollo-server-express";

export default gql`
  type Message {
    id: Int!
    text: String
    user: User
    channel: Channel
    createdAt: String
  }

  type CreateMessageResponse {
    status: Boolean!
    errors: [Error]
    message: Message
  }

  type Query {
    getChannelMessages(channelId: Int!): [Message]!
    getPrivateChatMessages(privateChatId: Int!): [Message]!
  }

  type Subscription {
    channelMessageCreated(channelId: Int!): Message!
    privateChatMessageCreated(privateChatId: Int!): Message!
  }

  type Mutation {
    createChannelMessage(text: String!, channelId: Int!): CreateMessageResponse!
    createPrivateChatMessage(
      text: String!
      privateChatId: Int!
      userId: Int!
    ): CreateMessageResponse!
  }
`;
