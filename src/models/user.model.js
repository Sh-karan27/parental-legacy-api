import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be male, female, or other",
      },
    },

    // Whether the user has parents or guardians — drives the label pair below.
    familyType: {
      type: String,
      required: [true, "Family type is required"],
      enum: {
        values: ["parents", "guardians"],
        message: "Family type must be parents or guardians",
      },
    },

    // Two parental entities the legacy calculator splits values between.
    // Labels are derived from familyType: Mother/Father or Guardian 1/Guardian 2.
    parentOneLabel: {
      type: String,
      trim: true,
      default: "Mother",
    },
    parentOneName: {
      type: String,
      required: [true, "First parent/guardian name is required"],
      trim: true,
    },
    parentTwoLabel: {
      type: String,
      trim: true,
      default: "Father",
    },
    parentTwoName: {
      type: String,
      required: [true, "Second parent/guardian name is required"],
      trim: true,
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.genrateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.genrateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
