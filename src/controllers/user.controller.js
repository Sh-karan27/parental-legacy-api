import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const genrateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.genrateAccessToken();
    const refreshToken = user.genrateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while gentrating refresh & access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    username,
    email,
    password,
    dob,
    gender,
    familyType,
    parentOneName,
    parentTwoName,
  } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    !dob ||
    !gender ||
    !familyType ||
    !parentOneName ||
    !parentTwoName
  ) {
    throw new ApiError(400, "all keys are required");
  }

  const allowedGenders = ["male", "female", "other"];
  if (!allowedGenders.includes(gender)) {
    throw new ApiError(400, "Gender must be male, female, or other");
  }

  const allowedFamilyTypes = ["parents", "guardians"];
  if (!allowedFamilyTypes.includes(familyType)) {
    throw new ApiError(400, "Family type must be parents or guardians");
  }

  const parsedDob = new Date(dob);

  if (isNaN(parsedDob.getTime())) {
    throw new ApiError(400, "Date of birth is invalid");
  }

  if (parsedDob.getTime() > Date.now()) {
    throw new ApiError(400, "Date of birth cannot be in the future");
  }

  const userExist = await User.findOne({ $or: [{ username }, { email }] });

  if (userExist) {
    throw new ApiError(409, "User with username or email already exit");
  }

  const [parentOneLabel, parentTwoLabel] =
    familyType === "guardians"
      ? ["Guardian 1", "Guardian 2"]
      : ["Mother", "Father"];

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    dob: parsedDob,
    gender,
    familyType,
    parentOneName,
    parentTwoName,
    parentOneLabel,
    parentTwoLabel,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to register user, try again.");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user resgisted!!"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or password is required");
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User not found. Please register");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { refreshToken, accessToken } = await genrateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken "
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refreshToken ");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, " refreshToken is expired or used ");
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
      user._id
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword || newPassword)) {
    throw new ApiError(400, "Both old password and new are required");
  }

  const user = await User.findById(req.user?._id);

  const correctPassword = await user.isPasswordCorrect(oldPassword);

  if (!correctPassword) {
    throw new ApiError(401, "Incorrect password. Try again");
  }
  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched succesfully"));
});

const updateDob = asyncHandler(async (req, res) => {
  const { dob } = req.body;

  if (!dob) {
    throw new ApiError(400, "Date of birth is required");
  }

  const parsedDob = new Date(dob);

  if (isNaN(parsedDob.getTime())) {
    throw new ApiError(400, "Date of birth is invalid");
  }

  if (parsedDob.getTime() > Date.now()) {
    throw new ApiError(400, "Date of birth cannot be in the future");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { dob: parsedDob } },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Date of birth updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateDob,
};
