const Note = require("../models/Note");
const aiService = require("../services/aiService");
const AppError = require("../utils/appError");

exports.createNote = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const note = await Note.create({
      user: req.user._id,
      title,
      content,
      tags,
    });
    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

exports.getUserNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user._id, isArchived: false }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, notes });
  } catch (error) {
    next(error);
  }
};

exports.getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return next(new AppError("Note not found", 404));
    res.status(200).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const { title, content, tags, isArchived } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, content, tags, isArchived },
      { new: true, runValidators: true }
    );
    if (!note) return next(new AppError("Note not found", 404));
    res.status(200).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return next(new AppError("Note not found", 404));
    res.status(200).json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.generateAINote = async (req, res, next) => {
  try {
    const { prompt, provider } = req.body;
    if (!prompt) return next(new AppError("Prompt is required", 400));

    const generatedContent = await aiService.generateAINote(prompt, provider);

    // Derive a title from the prompt
    const title = prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt;

    const note = await Note.create({
      user: req.user._id,
      title: `AI Note: ${title}`,
      content: generatedContent,
      tags: ["AI Generated"],
    });

    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

exports.summarizeNote = async (req, res, next) => {
  try {
    const { length, provider } = req.body;
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return next(new AppError("Note not found", 404));

    if (!note.content || !note.content.trim()) {
      return next(new AppError("Note content is empty, cannot summarize", 400));
    }

    const summary = await aiService.summarizeText(note.content, length || "medium", provider);

    res.status(200).json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};
