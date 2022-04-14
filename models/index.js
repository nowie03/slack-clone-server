import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DATABASE_URL,
  process.env.USER_NAME,
  process.env.PASSWORD
);

const models = {
  user: sequelize.import("./user"),
  team: sequelize.import("./team"),
  message: sequelize.import("./message"),
  member: sequelize.import("./member"),
  channel: sequelize.import("./channel"),
};

Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.sequelize = sequelize;

export default models;
