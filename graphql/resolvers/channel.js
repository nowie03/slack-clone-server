export default {
  Mutation: {
    createChannel: async (parent, args, { models, user }, info) => {
      try {
        const channel=await models.Channel.create(args);
        return {
          status: true,
          channel:channel
        };
      } catch (error) {
        console.log(error);
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
