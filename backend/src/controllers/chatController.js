const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");
const aiService = require("../services/aiService");
const AppError = require("../utils/appError");

// @desc    Create a new chat session
// @route   POST /api/chats
// @access  Private
const createChat = async (req, res, next) => {
  try {
    const { title } = req.body;

    const chat = await Chat.create({
      user: req.user._id,
      title: title || "New Chat",
    });

    res.status(201).json({
      success: true,
      chat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all chats for the logged in user
// @route   GET /api/chats
// @access  Private
const getUserChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages in a specific chat
// @route   GET /api/chats/:id/messages
// @access  Private
const getChatMessages = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) {
      return next(new AppError("Chat not found", 404));
    }

    const messages = await Message.find({ chat: req.params.id }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message & get AI response (Supports streaming & custom providers)
// @route   POST /api/chats/:id/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { content, stream, provider } = req.body;
    if (!content || !content.trim()) {
      return next(new AppError("Message content is required", 400));
    }

    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) {
      return next(new AppError("Chat not found", 404));
    }

    // 1. Save user message
    const userMessage = await Message.create({
      chat: chat._id,
      sender: "user",
      content,
    });

    // 2. Fetch conversation history for context memory
    const history = await Message.find({ chat: chat._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    const formattedHistory = history.reverse();
    const activeProvider = provider || req.user.settings?.defaultProvider || process.env.DEFAULT_AI_PROVIDER || "gemini";

    // 3. Handle Streaming Response (SSE)
    if (stream === true || stream === "true") {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // Send user message confirmation
      res.write(`data: ${JSON.stringify({ type: "user_message", message: userMessage })}\n\n`);

      let completeResponse = "";

      const handleChunk = (chunk) => {
        completeResponse += chunk;
        res.write(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`);
      };

      await aiService.generateResponseStream(content, formattedHistory, activeProvider, handleChunk);

      // Save AI message to database
      const aiMessage = await Message.create({
        chat: chat._id,
        sender: "ai",
        content: completeResponse,
      });

      // Increment message count in User document
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { "usage.aiMessagesCount": 1 }
      });

      // Update chat updatedAt timestamp (Mongoose way)
      chat.updatedAt = new Date();
      await chat.save();

      res.write(`data: ${JSON.stringify({ type: "done", message: aiMessage })}\n\n`);
      res.end();
    } else {
      // 4. Handle Standard (Non-streaming) Response
      const aiResponseText = await aiService.generateResponse(content, formattedHistory, activeProvider);

      const aiMessage = await Message.create({
        chat: chat._id,
        sender: "ai",
        content: aiResponseText,
      });

      // Increment message count in User document
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { "usage.aiMessagesCount": 1 }
      });

      chat.updatedAt = new Date();
      await chat.save();

      res.status(201).json({
        success: true,
        userMessage,
        aiMessage,
      });
    }
  } catch (error) {
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
      res.end();
    } else {
      next(error);
    }
  }
};

// @desc    Rename a chat title
// @route   PATCH /api/chats/:id
// @access  Private
const renameChat = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return next(new AppError("Title is required", 400));
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title },
      { new: true, runValidators: true }
    );

    if (!chat) {
      return next(new AppError("Chat not found", 404));
    }

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a chat and all its messages
// @route   DELETE /api/chats/:id
// @access  Private
const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) {
      return next(new AppError("Chat not found", 404));
    }

    await Message.deleteMany({ chat: chat._id });
    await Chat.deleteOne({ _id: chat._id });

    res.status(200).json({
      success: true,
      message: "Chat and all associated messages deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  renameChat,
  deleteChat,
};
