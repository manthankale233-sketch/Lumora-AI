const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    avatar: {
      type: String,
      default: "",
    },

    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "dark",
    },

    skinProfile: {
      skinType: {
        type: String,
        enum: ["dry", "oily", "combination", "sensitive", "normal", "unknown"],
        default: "unknown",
      },
      concerns: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    hairProfile: {
      hairType: {
        type: String,
        enum: ["straight", "wavy", "curly", "coily", "unknown"],
        default: "unknown",
      },
      scalpType: {
        type: String,
        enum: ["dry", "oily", "normal", "dandruff-prone", "unknown"],
        default: "unknown",
      },
      concerns: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro", "enterprise"],
        default: "free",
      },
      stripeCustomerId: {
        type: String,
      },
      stripeSubscriptionId: {
        type: String,
      },
      stripePriceId: {
        type: String,
      },
      status: {
        type: String,
        default: "inactive",
      },
      currentPeriodEnd: {
        type: Date,
      },
    },

    settings: {
      defaultProvider: {
        type: String,
        enum: ["gemini", "openai"],
        default: "gemini",
      }
    },

    usage: {
      aiMessagesCount: {
        type: Number,
        default: 0,
      },
      lastUsageReset: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);