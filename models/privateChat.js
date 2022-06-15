export default (sequelize, dataTypes) => {
  const PrivateChat = sequelize.define("private_chat");

  PrivateChat.associate = (models) => {
    PrivateChat.belongsToMany(models.User, {
      through: "private_chat_member",
      foreignKey: "privateChatId",
    });

    PrivateChat.belongsTo(models.Team, {
      foreignKey: "teamId",
    });
  };
  return PrivateChat;
};
