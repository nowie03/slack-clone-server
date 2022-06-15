export default (sequelize, dataTypes) => {
  const User = sequelize.define("user", {
    username: {
      type: dataTypes.STRING,
      unique: true,
      validate: {
        isAlphanumeric: {
          args: true,
          msg: "Username should contain only numbers and alphabets",
        },
        len: {
          args: [3, 30],
          msg: "Username should be between 3 and 30 characters long",
        },
      },
    },
    email: {
      type: dataTypes.STRING,
      unique: true,
      validate: {
        isEmail: {
          args: true,
          msg: "email should be a valid email",
        },
      },
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
    User.belongsToMany(models.PrivateChat, {
      through: "private_chat_member",
      foreignKey: "userId",
    });
  };

  return User;
};
