import verifyUser from "../../middlewares/verifyUser";

export default {
  Mutation: {
    createTeam: async (parent, args, { models, user }, info) => {
      console.log(user);
      try {
        // await models.Team.create({ ...args, owner: user.id });
        return {
          status: true,
        };
      } catch (err) {
        // console.log(err);
        return {
          status: false,
          errors: [
            {
              path: "create team",
              message: "Couldn't create team",
            },
          ],
        };
      }
    },
  },
};
