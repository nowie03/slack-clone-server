import { withFilter } from "graphql-subscriptions";
import models from "../../models";

export default {
  Message: {
    user: async (parent, args, { models, user }, info) => {
      return await models.User.findOne({ where: { id: parent.userId } });
    },
    channel: async (parent, args, { models, user }, info) => {
      return await models.Channel.findOne({ where: { id: parent.channelId } });
    },
  },
  Subscription: {
    channelMessageCreated: {
      subscribe: withFilter(
        (parent, args, { pubsub }, info) =>
          pubsub.asyncIterator(["CHANNEL_MESSAGE_CREATED"]),
        (payload, variables) => {
          console.log(payload);
          return (
            payload.channelMessageCreated.channelId === variables.channelId
          );
        }
      ),
    },
    privateChatMessageCreated: {
      subscribe: withFilter(
        (parent, args, { pubsub }, info) =>
          pubsub.asyncIterator("PRIVATE_MESSAGE_CREATED"),
        (payload, variables) => {
          console.log({ payload, variables });
          return (
            variables.privateChatId ===
            payload.privateChatMessageCreated.privateChatId
          );
        }
      ),
    },
  },
  Query: {
    getChannelMessages: async (
      parent,
      { channelId },
      { models, user },
      info
    ) => {
      try {
        const messages = await models.Message.findAll({
          order: [["createdAt", "ASC"]],
          where: {
            channelId: channelId,
          },
        });
        return messages;
      } catch (error) {
        console.log(err);
      }
    },
    getPrivateChatMessages: async (
      parent,
      { privateChatId },
      { models, pubsub },
      info
    ) => {
      try {
        const messages = await models.Message.findAll({
          where: {
            privateChatId: privateChatId,
          },
        });
        return messages;
      } catch (error) {
        console.log(error);
      }
    },
  },
  Mutation: {
    createChannelMessage: async (
      parent,
      args,
      { models, user, pubsub },
      info
    ) => {
      try {
        const response = await models.Message.create({
          ...args,
          userId: user.id,
        });

        const channelPromise = models.Channel.findOne({
          where: { id: response.channelId },
        });
        const userPromise = models.User.findOne({
          where: { id: response.userId },
        });

        const [currentUser, currentChannel] = await Promise.all([
          userPromise,
          channelPromise,
        ]);

        pubsub.publish("CHANNEL_MESSAGE_CREATED", {
          channelMessageCreated: {
            ...response.dataValues,
            user: currentUser.dataValues,
            channel: currentChannel.dataValues,
          },
        });

        return {
          status: true,
          message: response,
        };
      } catch (err) {
        console.log(err);
        return {
          status: false,
          errors: [
            {
              message: "unable to create message",
              path: "create message",
            },
          ],
        };
      }
    },
    createPrivateChatMessage: async (parent, args, { pubsub }, info) => {
      try {
        const response = await models.sequelize.transaction(async (t) => {
          const message = await models.Message.create({ ...args });
          console.log(message);
          return message;
        });

        pubsub.publish("PRIVATE_MESSAGE_CREATED", {
          privateChatMessageCreated: {
            ...response.dataValues,
          },
        });

        return {
          status: true,
          message: response,
        };
      } catch (error) {
        return {
          status: false,
          errors: error.map(({ message, path }) => {
            message, path;
          }),
        };
      }
    },
  },
};
