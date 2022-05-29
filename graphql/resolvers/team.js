import { Op } from "sequelize";

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
        // const response2 = await models.Team.findAll({
        //   where: {
        //     members: {
        //       [Op.contains]: user,
        //     },
        //   },
        //   include: {
        //     all: true,
        //   },
        // });
        // console.log(response2);
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
        const team = await models.Team.create({ ...args, owner: user.id });
        await models.Channel.create({
          name: "general",
          public: true,
          teamId: team.id,
        });
        return {
          status: true,
          team: team,
        };
      } catch (err) {
        console.log(err);
        return {
          status: false,
          errors: err.errors.map(({ message, path }) => ({ message, path })),
        };
      }
    },
    addUserToTeam: async (
      parent,
      { teamId, email },
      { models, user },
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

          return {
            status: true,
            user: userToAdd,
          };
        } else {
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
