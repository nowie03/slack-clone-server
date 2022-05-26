import jwt from "jsonwebtoken";
import models from "../models";

export default async (req, res) => {
  const accessToken = req.headers.accesstoken;

  try {
    //check if accessToken is valid
    const { user } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
  } catch (error) {
    //if accessToken is invalid then it might have been expired
    console.log("ACCESS TOKEN EXPIRED");
    const refreshToken = req.headers.refreshtoken;
    try {
      //verify if the refreshToken is valid
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      // if it is valid then decode it and extract user id from it
      const {
        user: { id },
      } = jwt.decode(refreshToken);

      //check if the user exists
      const user = await models.User.findOne({ where: { id: id } });

      if (!user) {
        return;
      }

      //if user exists attach it to the request object
      req.user = user;

      //create new accessToken and refresh token and attach it to the response object
      const newAccessToken = jwt.sign(
        { user: user },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
        }
      );

      res.set({
        "Access-Control-Expose-Headers": "newAccessToken",
        newAccessToken,
      });
    } catch (error) {
      console.log("REFRESH TOKEN EXPIRED");
      return;
    }
  }
};
