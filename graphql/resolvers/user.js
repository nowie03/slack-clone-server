import { PubSub, withFilter } from "graphql-subscriptions";

export default {
  Query: {
    getUser: (parent, { id }, { models }, info) => {
      return models.User.findOne({ where: { id } });
    },
    getAllUsers: (parent, args, { models }, info) => {
      return models.User.findAll();
    },
  },
  Mutation: {
    createUser: (parent, args, { models }, info) => {
      return models.User.create(args);
    },
  },
};
