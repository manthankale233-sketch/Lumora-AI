const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    photoUrl: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    skinRating: {
      type: Number,
      min: 1,
      max: 10,
    },
    hairRating: {
      type: Number,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Progress", progressSchema);
