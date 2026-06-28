const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["skin", "hair"],
      required: true,
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    analysis: {
      type: String,
      required: true,
    },
    recommendedRoutine: [
      {
        timeOfDay: { type: String, enum: ["morning", "night"] },
        stepNumber: Number,
        productName: String,
        category: String,
        instructions: String,
      }
    ],
    recommendedProducts: [
      {
        name: String,
        brand: String,
        price: String,
        keyIngredients: String,
        benefits: String,
        whyRecommended: String,
        usage: String,
        buyingLink: String,
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Consultation", consultationSchema);
