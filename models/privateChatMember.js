export default (sequelize) => {
  const PrivateChatMember = sequelize.define("private_chat_member", {});

  return PrivateChatMember;
};
