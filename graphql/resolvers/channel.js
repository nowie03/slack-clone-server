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
  Mutation: {
    addUserToChannel: async (parent, args, { models }, info) => {
      try {
        const response = await models.sequelize.transaction(async (t) => {
          const addedUserResponse = await models.ChannelMember.create({
            ...args,
          });
          console.log(addedUserResponse);
          return addedUserResponse;
        });
        //TODO:ADD USERS WHO ARE PART OF TEAM ONLY args.teamId

        const addedUser = await models.User.findOne({
          where: { id: response.dataValues.userId },
        });

        return {
          status: true,
          user: addedUser,
        };
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
    createChannel: async (parent, args, { models, user }, info) => {
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
