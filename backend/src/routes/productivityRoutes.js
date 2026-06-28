const express = require("express");
const router = express.Router();
const productivityController = require("../controllers/productivityController");
const { protect } = require("../middlewares/authMiddleware");
const { restrictToPremium } = require("../middlewares/limitMiddleware");

router.use(protect);

// Only premium users can use the document analyzer
router.post("/analyze-document", restrictToPremium, productivityController.analyzeDocument);

module.exports = router;
