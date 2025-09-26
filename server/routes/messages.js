import express from "express";
import fs from "fs";
import path from "path";
import { handleUserMessage } from "../services/chatbot.js";
import { sanitizeInput } from "../services/sanitizeInput.js";
import responses from "../services/responses.js";

const router = express.Router();

// Path to JSON-file
const dataFile = path.resolve("./data/messages.json");

// Helper: Load messages from file
function loadMessages() {
  try {
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, "[]", "utf-8");
    }
    const fileData = fs.readFileSync(dataFile, "utf-8");
    if (!fileData.trim()) {
      fs.writeFileSync(dataFile, "[]", "utf-8");
      return [];
    }
    return JSON.parse(fileData);
  } catch (err) {
    console.error("Failed to load messages:", err);
    return [];
  }
}

// Helper: Save messages to file
function saveMessages(messages) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(messages, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save messages:", err);
  }
}

// Helper: Compute category stats
function getCategoryStats(messages) {
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
  try {
    const messages = loadMessages();
    res.json({
      messages,
      totalMessages: messages.length,
      userCount: messages.filter((m) => m.sender === "User").length,
      botCount: messages.filter((m) => m.sender === "Bot").length,
      categoryStats: getCategoryStats(messages),
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      res
        .status(500)
        .json({ error: "Corrupted messages file.", details: err.message });
    } else {
      res
        .status(500)
        .json({ error: "Failed to load messages.", details: err.message });
    }
    console.error("Failed to load messages:", err);
  }
});

// Handle chat form submission
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

    const messages = loadMessages();

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

    saveMessages(messages);

    // Render the chat page with updated messages and any error
    res.json({
      user: originalUserMessage,
      bot: botReply,
      error /* totalMessages, userCount, botCount*/,
    });
  } catch (err) {
    if (err instanceof TypeError) {
      res
        .status(500)
        .json({ error: "Type error on server.", details: err.message });
    } else if (err instanceof SyntaxError) {
      res
        .status(500)
        .json({ error: "Syntax error in server data.", details: err.message });
    } else {
      res
        .status(500)
        .json({ error: "Failed to process message.", details: err.message });
    }
    console.error("Failed to process message:", err);
  }
});

// Handle personalization form submission
router.post("/add-response", (req, res) => {
  try {
    const { keyword, answer } = req.body;

    // Validate input
    if (!keyword || !answer) {
      return res.status(400).json({ error: "Keyword or answer missing." });
    }

    if (keyword.trim().length === 0 || answer.trim().length === 0) {
      return res.status(400).json({ error: "Empty fields." });
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

    res.json({ success: true, keyword: cleanKeyword, answer: cleanAnswer });
  } catch (err) {
    if (err instanceof TypeError) {
      res
        .status(500)
        .json({ error: "Type error on server.", details: err.message });
    } else if (err instanceof SyntaxError) {
      res
        .status(500)
        .json({ error: "Syntax error in server data.", details: err.message });
    } else {
      res
        .status(500)
        .json({ error: "Failed to add response.", details: err.message });
    }
    console.error("Failed to add response:", err);
  }
});

// Handle statistics
router.get("/stats", (req, res) => {
  try {
    const messages = loadMessages();
    res.json({
      categoryStats: getCategoryStats(messages),
      totalMessages: messages.length,
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      res
        .status(500)
        .json({ error: "Corrupted messages file.", details: err.message });
    } else {
      res
        .status(500)
        .json({ error: "Failed to load stats.", details: err.message });
    }
    console.error("Failed to load stats:", err);
  }
});

// Clear message array
router.post("/clear", (req, res) => {
  try {
    saveMessages([]);
    res.json({ success: true, message: "Chat cleared" });
  } catch (err) {
    if (err instanceof TypeError) {
      res
        .status(500)
        .json({ error: "Type error on server.", details: err.message });
    } else if (err instanceof SyntaxError) {
      res
        .status(500)
        .json({ error: "Syntax error in server data.", details: err.message });
    } else {
      res
        .status(500)
        .json({ error: "Failed to clear chat.", details: err.message });
    }
    console.error("Failed to clear chat:", err);
  }
});

export default router;
