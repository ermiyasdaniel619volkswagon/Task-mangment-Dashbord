import mongoose from "mongoose";
import validator from "validator";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    photo: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      sparse: true, // Allows null/undefined while keeping unique
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return v ? /^\+?[1-9]\d{1,14}$/.test(v) : true;
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },

    // THIS IS THE FIX — Now populate("personalInfo") works perfectly!
    personalInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalInfo",
      default: null,
    },

    hasPersonalInfo: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: [
        "admin",
        "nurse",
        "lab_technician",
        "post_counselor",
        "hospital_staff",
        "donor",
      ],
      default: "donor", // Donors are most common
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
      select: false,
    },

    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Password reset method
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return resetToken;
};

export default mongoose.model("User", userSchema);
