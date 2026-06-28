const express = require("express");
const consultationController = require("../controllers/consultationController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// All consultation routes require authentication
router.use(protect);

router
  .route("/")
  .post(consultationController.submitConsultation)
  .get(consultationController.getConsultationHistory);

router.get("/latest", consultationController.getLatestConsultation);

module.exports = router;
