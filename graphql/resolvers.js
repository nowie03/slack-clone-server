import { PubSub, withFilter } from "graphql-subscriptions";

export default {
  Query: {
    hi: (parent, args, context, info) => "hi",
  },
};
