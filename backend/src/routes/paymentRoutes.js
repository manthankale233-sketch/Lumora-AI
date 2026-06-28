const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");

// Webhook must NOT use protect middleware and needs raw body (handled in app.js / route level)
router.post("/webhook", express.raw({ type: "application/json" }), paymentController.stripeWebhook);

// Protected routes
router.post("/checkout", protect, paymentController.createCheckoutSession);
router.post("/portal", protect, paymentController.createPortalSession);
router.post("/sandbox-subscribe", protect, paymentController.sandboxSubscribe);

module.exports = router;
