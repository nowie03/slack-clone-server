import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DATABASE_URL,
  process.env.USER_NAME,
  process.env.PASSWORD
);

const models = {
  user: sequelize.import(path.join(__dirname, file)),
};

Object.keys(models).forEach((modelName) => {});

models.sequelize = sequelize;
models.sequelize = sequelize;

export default models;
