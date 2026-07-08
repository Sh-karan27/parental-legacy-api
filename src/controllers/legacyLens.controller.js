import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { generateLegacyLensAnalysis } from "../services/legacyLens.service.js";

const getMyLegacyLens = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!user.dob) {
    throw new ApiError(400, "Date of birth not found for this user");
  }

  const analysis = generateLegacyLensAnalysis(user);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        analysis,
        "LegacyLens analysis generated successfully"
      )
    );
});

const getAllUsersLegacyStatus = asyncHandler(async (_, res) => {
  const users = await User.find({})
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  const rows = users.map((user) => {
    const hasGeneratedLegacy = Boolean(user.dob);
    const analysis = hasGeneratedLegacy
      ? generateLegacyLensAnalysis(user)
      : null;

    return {
      userId: user._id,
      legacyId: user._id,
      username: user.username,
      email: user.email,
      dob: user.dob,
      gender: user.gender,
      familyType: user.familyType,
      parentOneLabel: user.parentOneLabel,
      parentOneName: user.parentOneName,
      parentTwoLabel: user.parentTwoLabel,
      parentTwoName: user.parentTwoName,
      hasGeneratedLegacy,
      score: analysis?.summary?.grandTotal ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, rows, "Users legacy status fetched successfully")
    );
});

const getLegacyLensByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.dob) {
    throw new ApiError(
      400,
      "LegacyLens cannot be generated without date of birth"
    );
  }

  const analysis = generateLegacyLensAnalysis(user);

  return res
    .status(200)
    .json(
      new ApiResponse(200, analysis, "LegacyLens analysis fetched successfully")
    );
});

export { getMyLegacyLens, getAllUsersLegacyStatus, getLegacyLensByUserId };
