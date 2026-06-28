const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.route("/")
  .get(noteController.getUserNotes)
  .post(noteController.createNote);

router.post("/generate", noteController.generateAINote);

router.route("/:id")
  .get(noteController.getNoteById)
  .put(noteController.updateNote)
  .delete(noteController.deleteNote);

router.post("/:id/summarize", noteController.summarizeNote);

module.exports = router;
