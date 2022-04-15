export default (sequelize, dataTypes) => {
  const Team = sequelize.define("team", {
    name: {
      type: dataTypes.STRING,
      unique: true,
    },
  });

  Team.associate = (models) => {
    Team.belongsToMany(models.User, {
      through: "member",
      foreignKey: "teamId",
    });

    Team.belongsTo(models.User, {
      foreignKey: "owner",
    });
  };

  return Team;
};
