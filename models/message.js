export default (sequelize, dataTypes) => {
  const Message = sequelize.define("message", {
    text: {
      type: dataTypes.STRING,
    },
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Channel, {
      foreignKey: "channelId",
    });

    Message.belongsTo(models.User, {
      foreignKey: "userId",
    });
  };
  return Message;
};
