import express from "express";
import { handleUserMessage } from "../services/chatbot.js";
import { sanitizeInput } from "../services/sanitizeInput.js";
import responses from "../services/responses.js";

const router = express.Router();

// Store all chat messages momentarily - later in data/messages.json
const messages = [];

// Helper: compute category stats
function getCategoryStats() {
  const stats = {};
  for (const msg of messages) {
    if (msg.category && msg.sender === "Bot") {
      stats[msg.category] = (stats[msg.category] || 0) + 1;
    }
  }
  return stats;
}

// Render the chat page on GET "/" (when the user visits the root URL)
router.get("/", (req, res) => {
  /* const totalMessages = messages.length;
  const userCount = messages.filter(msg => msg.sender === "User").length;
  const botCount = messages.filter(msg => msg.sender === "Bot").length;

  res.render("index", {
    messages,
    botReply: "",
    categoryStats: getCategoryStats(),
    totalMessages, 
    userCount, 
    botCount
  }); */

  try {
    res.json({
      messages,
      totalMessages: messages.length,
      userCount: messages.filter((m) => m.sender === "User").length,
      botCount: messages.filter((m) => m.sender === "Bot").length,
      categoryStats: getCategoryStats(),
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch messages.", details: err.message });
  }
});

// Handle chat form submission on POST "/chat"
router.post("/", (req, res) => {
  try {
    if (!req.body || typeof req.body.message !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid request. Message field is required." });
    }

    // Convert user message to lowercase and trim whitespace
    let originalUserMessage = req.body.message.trim();
    if (!originalUserMessage) {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    let userMessage = sanitizeInput(originalUserMessage.toLowerCase());

    const { botReply, matchedCategory, error } = handleUserMessage(
      userMessage,
      originalUserMessage
    );

    // Save user and bot messages
    messages.push({
      sender: "User",
      text: originalUserMessage,
      time: new Date().toLocaleString("da-DK"),
      category: "user-input",
    });

    messages.push({
      sender: "Bot",
      text: botReply,
      time: new Date().toLocaleString("da-DK"),
      category: matchedCategory,
    });

    // Only show 10 latest messages
    // if (messages.length > 10) messages.shift();

    // return res.redirect("/");

    // Render the chat page with updated messages and any error
    res.json({
      user: originalUserMessage,
      bot: botReply,
      error /* totalMessages, userCount, botCount*/,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to process message.", details: err.message });
  }
});

// Handle personalization form submission on POST "/add-response"
router.post("/add-response", (req, res) => {
  try {
    const { keyword, answer } = req.body;

    // Validate input
    if (!keyword || !answer) {
      console.log("Error: Keyword or answer missing");
      return res.redirect("/?error=missing_fields");
    }

    if (keyword.trim().length === 0 || answer.trim().length === 0) {
      console.log("Error: Empty fields");
      return res.redirect("/?error=empty_fields");
    }

    // Clear input
    const cleanKeyword = keyword.trim().toLowerCase();
    const cleanAnswer = answer.trim();

    // Check if keyword already exists
    const existingResponse = responses.find((resp) =>
      resp.keywords.some((kw) => kw === cleanKeyword)
    );

    if (existingResponse) {
      // Add to existing response
      existingResponse.answers.push(cleanAnswer);
      console.log(`Added new answer to existing keyword: ${cleanKeyword}`);
    } else {
      // Create new response object
      responses.push({
        keywords: [cleanKeyword],
        answers: [cleanAnswer],
      });
      console.log(`Created new keyword: ${cleanKeyword}`);
    }

    // Save user generated response separately
    // Consider saving to a JSON file on the server instead
    if (!global.userLearnedResponses) {
      global.userLearnedResponses = [];
    }
    global.userLearnedResponses.push({
      keyword: cleanKeyword,
      answer: cleanAnswer,
      timestamp: new Date(),
    });

    // Redirect
    // res.redirect("/?success=response_added");

    res.json({ success: true, keyword: cleanKeyword, answer: cleanAnswer });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to add response.", details: err.message });
  }
});

// Handle statistics on GET "/stats"
router.get("/stats", (req, res) => {
  try {
    res.json({
      categoryStats: getCategoryStats(),
      totalMessages: messages.length,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch stats.", details: err.message });
  }
});

// Reset message array
router.post("/clear", (req, res) => {
  try {
    messages.length = 0;
    res.json({ success: true, message: "Chat cleared" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to clear chat.", details: err.message });
  }
});

export default router;
