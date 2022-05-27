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
        const team=await models.Team.create({ ...args, owner: user.id });
        await models.Channel.create({name:"general",public:true,teamId:team.id})
        return {
          status: true,
          team:team
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
  Team:{
    channels:async ({id},args,{models},info)=> await models.Channel.findAll({where:{teamId:id}})
  }
};
