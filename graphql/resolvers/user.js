import { PubSub, withFilter } from "graphql-subscriptions";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv";

export default {
  Query: {
    getUser: (parent, { id }, { models }, info) => {
      return models.User.findOne({ where: { id } });
    },
    getAllUsers: (parent, args, { models }, info) => {
      return models.User.findAll();
    },
    verifyUser:(parent,{accessToken,refreshToken},{models},info)=>{
      try{
        const {user}=jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
      }catch(error){
        const 
      }
    }
  },
  Mutation: {
    register: async (parent, { password, ...otherArgs }, { models }, info) => {
      if (password.length < 5 || password.length > 50) {
        return {
          status: false,
          errors: [
            {
              path: "password",
              message:
                "Password must be at least 5 characters and not more than 50 characters",
            },
          ],
        };
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      try {
        const user = await models.User.create({
          password: hashedPassword,
          ...otherArgs,
        });
        return {
          status: true,
          user: user,
        };
      } catch (error) {
        return {
          status: false,
          errors: error.errors.map((errorItem) => {
            return {
              path: errorItem.path,
              message: errorItem.message,
            };
          }),
        };
      }
    },
    login: async (
      parent,
      { email, password },
      { models, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET },
      info
    ) => {
      //check mail and return a login response
      const user = await models.User.findOne({ where: { email } });

      if (!user) {
        return {
          status: false,
          errors: [
            {
              path: "email",
              message: "email doesnt exists",
            },
          ],
        };
      }

      // console.log(user.dataValues);
      const passwordResult = await bcrypt.compare(
        password,
        user.dataValues.password
      );

      if (!passwordResult) {
        return {
          status: false,
          errors: [
            {
              path: "password",
              message: "invalid password",
            },
          ],
        };
      }

      //if both are valid then create token and refresh token using jwt and send it as response
      const accessToken = jwt.sign({ user: user }, ACCESS_TOKEN_SECRET, {
        expiresIn: "1m",
      });

      const refreshToken = jwt.sign({ user: user }, REFRESH_TOKEN_SECRET, {
        expiresIn: "1m",
      });

      return {
        status: true,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    },
  },
};
