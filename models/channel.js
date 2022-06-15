export default (sequelize, dataTypes) => {
  const Channel = sequelize.define("channel", {
    name: {
      type: dataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    public: {
      type: dataTypes.BOOLEAN,
    },
  });

  Channel.associate = (models) => {
    Channel.belongsTo(models.Team, {
      foreignKey: "teamId",
    });

    Channel.belongsToMany(models.User, {
      through: "channel_member",
      foreignKey: "channelId",
    });
  };

  return Channel;
};
