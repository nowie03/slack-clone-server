import { withFilter } from "graphql-subscriptions";
import user from "../../models/user";

export default {
  Channel: {
    users: async ({ id }, args, { models }, info) => {
      const response = await models.ChannelMember.findAll({
        where: {
          channelId: id,
        },
      });

      return response.map(async ({ userId }) => {
        const user = await models.User.findOne({
          where: {
            id: userId,
          },
        });
        console.log(user);
        return user;
      });
    },
  },
  Query: {
    getChannels: async (parent, { teamId }, { models }, info) => {
      const channels = await models.Channel.findAll({
        where: {
          teamId,
        },
      });
      return channels;
    },
    getChannelMembers: async (parent, { channelId }, { models }, info) => {
      const members = await models.ChannelMember.findAll({
        where: { channelId },
      });
      console.log(members);
      return members.map(
        async ({ userId }) =>
          await models.User.findOne({ where: { id: userId } })
      );
    },
  },
  Subscription: {
    channelCreated: {
      subscribe: withFilter(
        (parent, args, { pubsub }, info) =>
          pubsub.asyncIterator(["CHANNEL_CREATED"]),
        (payload, variables) => {
          console.log({ channelCreatedPayload: payload });
          return payload.channelCreated.teamId === variables.teamId;
        }
      ),
    },
    newUserAddedToChannel: {
      subscribe: withFilter(
        (parent, args, { pubsub }, info) =>
          pubsub.asyncIterator(["NEW_USER_ADDED_TO_CHANNEL"]),
        (payload, variables) =>
          payload.newUserAddedToChannel.channelId === variables.channelId
      ),
    },
  },
  Mutation: {
    addUserToChannel: async (parent, args, { models, pubsub }, info) => {
      try {
        const user = await models.User.findOne({
          where: { email: args.email },
        });
        if (!!user) {
          const isUserPartOfTeam = await models.Member.findOne({
            where: {
              userId: user.dataValues.id,
              teamId: args.teamId,
            },
          });

          console.log({ isUserPartOfTeam });

          if (!!isUserPartOfTeam) {
            const isUserAlreadyInChannel = await models.ChannelMember.findOne({
              where: { channelId: args.channelId, userId: user.dataValues.id },
            });
            if (!!isUserAlreadyInChannel) {
              const response = await models.sequelize.transaction(async (t) => {
                const addedUserResponse = await models.ChannelMember.create({
                  ...args,
                  userId: user.id,
                });
                console.log(addedUserResponse);
                return addedUserResponse;
              });
              //TODO:ADD USERS WHO ARE PART OF TEAM ONLY args.teamId

              const addedUser = await models.User.findOne({
                where: { id: response.dataValues.userId },
              });

              pubsub.publish("NEW_USER_ADDED_TO_CHANNEL", {
                channelId: args.channelId,
                newUserAddedToChannel: {
                  ...addedUser.dataValues,
                },
              });

              return {
                status: true,
                user: addedUser,
              };
            } else {
              return {
                status: false,
                errors: [
                  {
                    message: "user already in channel",
                    path: "add user to channel",
                  },
                ],
              };
            }
          } else {
            return {
              status: false,
              errors: [
                {
                  path: "add user to channel",
                  message: "User not part of team",
                },
              ],
            };
          }
        } else {
          return {
            status: false,
            errors: [
              {
                message: "user doesnt exists",
                path: "add user to channel",
              },
            ],
          };
        }
      } catch (error) {
        console.log(error);
        return {
          status: false,
          errors: error.errors.map((error) => ({
            path: error.path,
            message: error.message,
          })),
        };
      }
    },
    createChannel: async (parent, args, { models, user, pubsub }, info) => {
      try {
        // transactions automaically rolls back if a error occurs
        const response = await models.sequelize.transaction(async (t) => {
          const channel = await models.Channel.create(args);
          const memberResponse = await models.ChannelMember.create({
            userId: user.id,
            channelId: channel.id,
          });
          console.log(memberResponse);

          return channel;
        });
        pubsub.publish("CHANNEL_CREATED", {
          teamId: args.teamId,
          channelCreated: {
            ...response.dataValues,
          },
        });
        return {
          status: true,
          channel: response,
        };
      } catch (error) {
        // console.log(error);
        return {
          status: false,
          errors: error.errors.map((errorItem) => {
            return {
              path: errorItem.path,
              message: errorItem.message,
            };
          }),
        };
      }
    },
  },
};
