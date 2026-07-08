import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
    .json(new ApiResponse(200, analysis, "LegacyLens analysis generated successfully"));
});

export { getMyLegacyLens };
