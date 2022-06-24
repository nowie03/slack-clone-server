import { Op, QueryTypes } from "sequelize";
import { withFilter } from "graphql-subscriptions";

export default {
  PrivateChat: {
    user: async ({ userId }, args, { models }, info) =>
      models.User.findOne({ where: { id: userId } }),
  },
  GetTeamsResponse: {
    owner: async ({ owner }, args, { models, user }, info) => {
      return await models.User.findOne({
        where: {
          id: owner,
        },
      });
    },
    channels: async ({ id }, args, { models }, info) =>
      await models.Channel.findAll({ where: { teamId: id } }),
    members: async ({ id }, args, { models }, info) => {
      const response = await models.Member.findAll({ where: { teamId: id } });
      return response.map(async ({ userId }) => {
        const user = await models.User.findOne({ where: { id: userId } });
        return user;
      });
    },
  },
  Subscription: {
    newUserAddedToTeam: {
      subscribe: withFilter(
        (parent, args, { pubsub }, info) =>
          pubsub.asyncIterator(["NEW_USER_ADDED_TO_TEAM"]),
        (payload, variables) =>
          payload.newUserAddedToTeam.teamId === variables.teamId
      ),
    },
  },
  Query: {
    getTeams: async (parent, args, { models, user }, info) => {
      try {
        const response = await models.Team.findAll({
          include: [
            {
              model: models.User,
              where: {
                id: user.id,
              },
            },
          ],
        });

        return response.map(async (team) => {
          // console.log(team);
          const privateChatsAndUserIds = await models.sequelize.query(
            `select  private_chat_members.privateChatId,private_chat_members.userId from private_chat_members where private_chat_members.privateChatId in (select private_chats.id from private_chats join private_chat_members on private_chats.id=private_chat_members.privateChatId where private_chats.teamId=${team.id} and private_chat_members.userId=${user.id}) and private_chat_members.userId!=${user.id};`,
            { raw: true, type: QueryTypes.SELECT }
          );

          return {
            ...team.dataValues,
            privateChats: privateChatsAndUserIds,
          };
        });
      } catch (err) {
        console.log(err);
      }
    },
    getMembers: async (parent, { teamId }, { models }, info) => {
      const members = await models.Member.findAll({
        where: {
          teamId,
        },
      });

      return members.map(
        async ({ userId }) =>
          await models.User.findOne({ where: { id: userId } })
      );
    },
  },
  Mutation: {
    createTeam: async (parent, args, { models, user }, info) => {
      console.log(user);
      try {
        const response = await models.sequelize.transaction(async (t) => {
          const team = await models.Team.create({ ...args, owner: user.id });
          await models.Member.create({
            userId: user.id,
            teamId: team.id,
          });
          const channel = await models.Channel.create({
            name: "general",
            public: true,
            teamId: team.id,
          });
          await models.ChannelMember.create({
            userId: user.id,
            channelId: channel.id,
          });
          return team;
        });
        return {
          status: true,
          team: response,
        };
      } catch (err) {
        // console.log(err);
        return {
          status: false,
          errors: err.errors.map(({ message, path }) => ({ message, path })),
        };
      }
    },
    addUserToTeam: async (
      parent,
      { teamId, email },
      { models, user, pubsub },
      info
    ) => {
      try {
        const teamPromise = models.Team.findOne({ where: { id: teamId } });
        const userToAddPromise = models.User.findOne({
          where: { email: email },
        });
        // parllelly run both fetch
        const [userToAdd, team] = await Promise.all([
          userToAddPromise,
          teamPromise,
        ]);

        console.log(userToAdd);
        if (!userToAdd) {
          return {
            status: false,
            errors: [
              {
                path: "add members",
                message: "user doesnt exists",
              },
            ],
          };
        }

        if (team.owner === user.id) {
          // create member only if the user is owner of the team
          const member = await models.Member.create({
            userId: userToAdd.id,
            teamId,
          });

          const membersOfTeam = await models.Member.findAll({
            where: { teamId: team.id },
          });

          //create a private chat between every memebers of team
          // membersOfTeam.forEach(async (member) => {
          //   if (member.dataValues.userId !== userToAdd.id) {
          //     const privateChat = await models.PrivateChat.create({ teamId });
          //     //add users to private chat
          //     await Promise.all([
          //       models.PrivateChatMember.create({
          //         userId: member.dataValues.userId,
          //         privateChatId: privateChat.id,
          //       }),
          //       models.PrivateChatMember.create({
          //         userId: userToAdd.id,
          //         privateChatId: privateChat.id,
          //       }),
          //     ]);
          //   }
          // });

          //add user to genral channel by default
          const genralChannel = await models.Channel.findOne({
            where: {
              teamId: team.id,
              name: "general",
            },
          });

          await models.ChannelMember.create({
            userId: userToAdd.id,
            channelId: genralChannel.dataValues.id,
          });

          console.log({ userToAdd });
          
          pubsub.publish("NEW_USER_ADDED_TO_CHANNEL", {
            channelId: genralChannel.dataValues.id,
            newUserAddedToChannel: {
              ...userToAdd.dataValues,
            },
          });

          pubsub.publish("NEW_USER_ADDED_TO_TEAM", {
            teamId: team.dataValues.id,
            newUserAddedToTeam: {
              ...userToAdd.dataValues,
            },
          });

          return {
            status: true,
            user: userToAdd,
          };
        } else {
          console.log(team.owner === user.id);
          return {
            status: false,
            errors: [
              {
                path: "add member",
                message: "couldnt add user to team",
              },
            ],
          };
        }
      } catch (err) {
        console.log(err);
        return {
          status: false,
          errors: err.errors.map(({ message, path }) => ({ message, path })),
        };
      }
    },
  },
  Team: {
    owner: async ({ owner }, args, { models, user }, info) => {
      return await models.User.findOne({
        where: {
          id: owner,
        },
      });
    },
    channels: async ({ id }, args, { models }, info) =>
      await models.Channel.findAll({ where: { teamId: id } }),
    members: async ({ id }, args, { models }, info) => {
      const response = await models.Member.findAll({ where: { teamId: id } });
      return response.map(async ({ userId }) => {
        const user = await models.User.findOne({ where: { id: userId } });
        return user;
      });
    },
  },
};
