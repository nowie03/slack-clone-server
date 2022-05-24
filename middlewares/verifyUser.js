import jwt from "jsonwebtoken";
import models from "../models";

export default async (req, res) => {
  const accessToken = req.headers.accesstoken;
  console.log(req.headers);
  try {
    //check if accessToken is valid
    const { user } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
  } catch (error) {
    //if accessToken is invalid then it might have been expired
    const refreshToken = req.headers.refreshtoken;
    console.log(error);
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
      const newAccessToken = jwt.sign({ user: user }, ACCESS_TOKEN_SECRET, {
        expiresIn: "24h",
      });

      const newRefreshToken = jwt.sign({ user: user }, REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
      });

      res.set("Access-Control-Expose-Headers", "accessToken ,refreshToken");
      res.set("accessToken", newAccessToken);
      res.set("refreshToken", newRefreshToken);
    } catch (error) {
      return;
    }
  }
};
