export default (sequelize, dataTypes) => {
  const User = sequelize.define("user", {
    username: {
      type: dataTypes.STRING,
      unique: true,
    },
    email: {
      type: dataTypes.STRING,
      unique: true,
    },
    password: {
      type: dataTypes.STRING,
    },
  });

  User.associate = (models) => {
    User.belongsToMany(models.Team, {
      through: "member",
      foreignKey: "userId",
    });
    User.belongsToMany(models.Channel, {
      through: "channel_member",
      foreignKey: "userId",
    });
  };

  return User;
};
