import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { BlacklistToken } from "../models/blacklist.model.js";
import ApiError from "../utils/ApiError.js";

export const authUser = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];

    // Token missing
    if (!token) {
      throw new ApiError(
        401,
        "Authentication required."
      );
    }

    // Check blacklisted token
    const isBlacklisted = await BlacklistToken.findOne({
      token,
    });

    if (isBlacklisted) {
      throw new ApiError(
        401,
        "Authentication token is no longer valid."
      );
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find user
    const user = await User.findById(decoded._id);

    if (!user) {
      throw new ApiError(
        401,
        "User associated with this token was not found."
      );
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};