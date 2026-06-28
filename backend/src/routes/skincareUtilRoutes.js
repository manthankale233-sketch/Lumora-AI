const express = require("express");
const skincareUtilController = require("../controllers/skincareUtilController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// All utility routes require authentication
router.use(protect);

router.post("/check-ingredients", skincareUtilController.checkIngredients);
router.post("/compare-products", skincareUtilController.compareProducts);
router.post("/scan-ingredients", skincareUtilController.scanIngredients);

module.exports = router;
