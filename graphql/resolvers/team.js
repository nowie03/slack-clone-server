export default {
  Query: {
    getTeams: async (parent, args, { models, user }, info) => {
      try {
        const response = await models.Team.findAll({
          where: { owner: user.id },
          include: {
            all: true,
          },
        });
        console.log(response);
        return response.map((team) => {
          console.log(team);
          return team;
        });
      } catch (err) {
        console.log(err);
      }
    },
  },
  Mutation: {
    createTeam: async (parent, args, { models, user }, info) => {
      console.log(user);
      try {
        await models.Team.create({ ...args, owner: user.id });
        return {
          status: true,
        };
      } catch (err) {
        console.log(err);
        return {
          status: false,
          errors: err.errors.map(({ message, path }) => ({ message, path })),
        };
      }
    },
  },
};
