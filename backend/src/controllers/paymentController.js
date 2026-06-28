let stripe;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "your_stripe_secret_key_here") {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn("⚠️ STRIPE_SECRET_KEY is not configured. Payment endpoints will return a 500 error if called.");
}

const User = require("../models/User");
const AppError = require("../utils/appError");

// @desc    Create a Stripe Checkout Session for a subscription
// @route   POST /api/payments/checkout
// @access  Private
exports.createCheckoutSession = async (req, res, next) => {
  try {
    if (!stripe) {
      return next(new AppError("Stripe is not configured on this server. Please add STRIPE_SECRET_KEY in the .env file.", 500));
    }

    const { plan } = req.body;
    if (!plan || !["pro", "enterprise"].includes(plan)) {
      return next(new AppError("Please select a valid plan (pro or enterprise)", 400));
    }

    let priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (plan === "enterprise") {
      priceId = process.env.STRIPE_ENTERPRISE_PRICE_ID;
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = req.user.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: { userId: req.user._id.toString() },
      });
      stripeCustomerId = customer.id;

      // Save customer ID
      await User.findByIdAndUpdate(req.user._id, {
        "subscription.stripeCustomerId": stripeCustomerId,
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.CLIENT_URL}/dashboard?billing=success`,
      cancel_url: `${process.env.CLIENT_URL}/billing?billing=cancel`,
      metadata: { userId: req.user._id.toString(), plan },
    });

    res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a Stripe Customer Portal Session for subscription management
// @route   POST /api/payments/portal
// @access  Private
exports.createPortalSession = async (req, res, next) => {
  try {
    if (!stripe) {
      return next(new AppError("Stripe is not configured on this server. Please add STRIPE_SECRET_KEY in the .env file.", 500));
    }

    const stripeCustomerId = req.user.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      return next(new AppError("No billing history found. Please subscribe first.", 400));
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/billing`,
    });

    res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe Webhook handler
// @route   POST /api/payments/webhook
// @access  Public
exports.stripeWebhook = async (req, res, next) => {
  if (!stripe) {
    return res.status(500).send("Stripe is not configured on this server.");
  }

  let event;

  try {
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      req.body, // Must be the raw body buffer
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;

        await User.findByIdAndUpdate(userId, {
          "subscription.plan": plan,
          "subscription.stripeSubscriptionId": session.subscription,
          "subscription.status": "active",
        });
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const priceId = subscription.items.data[0].price.id;
        let plan = "free";
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "pro";
        if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) plan = "enterprise";

        await User.findOneAndUpdate(
          { "subscription.stripeCustomerId": customerId },
          {
            "subscription.plan": plan,
            "subscription.status": subscription.status,
            "subscription.stripePriceId": priceId,
            "subscription.currentPeriodEnd": new Date(subscription.current_period_end * 1000),
          }
        );
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        await User.findOneAndUpdate(
          { "subscription.stripeCustomerId": customerId },
          {
            "subscription.plan": "free",
            "subscription.status": "inactive",
            "subscription.stripeSubscriptionId": null,
            "subscription.stripePriceId": null,
          }
        );
        break;
      }
      default:
        console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Mock Sandbox Subscription Bypass
// @route   POST /api/payments/sandbox-subscribe
// @access  Private
exports.sandboxSubscribe = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!plan || !["free", "pro", "enterprise"].includes(plan)) {
      return next(new AppError("Please select a valid plan (free, pro, or enterprise)", 400));
    }

    const stripeCustomerId = req.user.subscription?.stripeCustomerId || `mck_${Math.random().toString(36).substring(2, 11)}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        "subscription.plan": plan,
        "subscription.status": plan === "free" ? "inactive" : "active",
        "subscription.stripeCustomerId": stripeCustomerId,
        "subscription.stripeSubscriptionId": plan === "free" ? null : `sub_${Math.random().toString(36).substring(2, 16)}`,
        "subscription.currentPeriodEnd": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Successfully subscribed to ${plan} (Sandbox Mode)`,
      user: updatedUser
    });
  } catch (error) {
    console.error("❌ Sandbox Subscribe Error:", error);
    next(error);
  }
};
