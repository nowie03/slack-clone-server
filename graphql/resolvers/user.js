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
    verifyUser: async (
      parent,
      { accessToken, refreshToken },
      { models, user },
      info
    ) => {
      try {
        const { user } = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );
      } catch (error) {
        //accessToken invalid
        try {
          jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
          const {
            user: { id },
          } = jwt.decode(refreshToken);

          const user = await models.User.findOne({ where: { id: id } });
          console.log(user);
          if (!user) {
            //if the user is hoax
            return {
              status: false,
            };
          }
          //accessToken is invalid but refresh token is there
          const newAccessToken = jwt.sign(
            { user: user },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
            }
          );
          return {
            status: true,
            accessToken: newAccessToken,
          };
        } catch (error) {
          //refresh Token also invalid
          console.log(error);
          return {
            status: false,
          };
        }
      }
      return {
        status: true,
      };
    },
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
    login: async (parent, { email, password }, { models }, info) => {
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
      const accessToken = jwt.sign(
        { user: user },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
        }
      );

      const refreshToken = jwt.sign(
        { user: user },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "5m",
        }
      );

      return {
        status: true,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    },
  },
};
