"use strict";

import { basename as _basename, join } from "path";
import Sequelize, { DataTypes } from "sequelize";
const basename = _basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
import userCreateFunction from "./user";
import channelCreateFunction from "./channel";
import teamCreateFunction from "./team";
import messageCreateFunction from "./message";
import memberCreateFunction from "./member";
import privateChatCreateFunction from "./privateChat";
import privateChatMemberCreateFunction from "./privateChatMember";
import ChannelMemberCreateFunction from "./channelMember";

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

const models = {
  User: userCreateFunction(sequelize, DataTypes),
  Channel: channelCreateFunction(sequelize, DataTypes),
  Team: teamCreateFunction(sequelize, DataTypes),
  Message: messageCreateFunction(sequelize, DataTypes),
  Member: memberCreateFunction(sequelize),
  PrivateChat: privateChatCreateFunction(sequelize, DataTypes),
  PrivateChatMember: privateChatMemberCreateFunction(sequelize, DataTypes),
  ChannelMember: ChannelMemberCreateFunction(sequelize),
};

Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
export default models;
