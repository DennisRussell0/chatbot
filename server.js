import express from "express";
import responses from "./responses.js";
import { sanitizeInput } from "./sanitizeInput.js";
const app = express();

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(
  express.static(
    "public" /*, {
  maxAge: "1d" // Or e.g. 3600 for 1 hour - caching static assets
}*/
  )
);

// Store all chat messages
const messages = [];

// Helper: compute category stats
function getCategoryStats() {
  const stats = {};
  messages.forEach((msg) => {
    if (msg.category && msg.sender === "Bot") {
      stats[msg.category] = (stats[msg.category] || 0) + 1;
    }
  });
  return stats;
}

// Render the chat page on GET "/" (when the user visits the root URL)
app.get("/", (req, res) => {
  const totalMessages = messages.length;
  const userCount = messages.filter(msg => msg.sender === "User").length;
  const botCount = messages.filter(msg => msg.sender === "Bot").length;

  res.render("index", {
    messages,
    botReply: "",
    categoryStats: getCategoryStats(),
    totalMessages, 
    userCount, 
    botCount
  });
});

// Handle chat form submission on POST "/chat"
app.post("/chat", (req, res) => {
  // Convert user message to lowercase and trim whitespace
  let originalUserMessage = req.body.message.trim();
  let userMessage = sanitizeInput(originalUserMessage.toLowerCase());
  let matchedCategory = "uncategorized";

  // Default bot reply and error message
  let botReply =
    "I didn't understand your message. Try and write something else.";
  let error = "";

  // Validate user input
  if (!userMessage) {
    error = "You must write a message.";
    botReply = "Write a message to chat.";
  } else if (userMessage.length < 2) {
    error = "The message must be at least two characters long.";
    botReply =
      "Your message must contain at least 2 characters. Please try again.";
  } else if (userMessage.length > 100) {
    error = "Message too long (maximum 100 characters)!";
    botReply =
      "Your message must not contain more than 100 characters. Please try again.";
  } else {
    // Split the input into sentences by "."
    // Remove extra spaces and ignore empty parts
    const parts = userMessage
      .split(/[.,!?]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const replies = [];

    // Process each part of the message separately
    for (const part of parts) {
      let foundResponse = false;

      // Specific logic first
      if (part.includes("thank") && part.includes("nothing")) {
        replies.push("That's not very nice...");
        matchedCategory = "feelings";
        foundResponse = true;
      } else if (part.includes("thank") && part.includes("help")) {
        replies.push("You're welcome! I'm here to help.");
        matchedCategory = "help";
        foundResponse = true;
      } else if (part.includes("thank")) {
        replies.push("You're welcome!");
        matchedCategory = "thanks";
        foundResponse = true;
      } else if (part.includes("sorry")) {
        replies.push("It's alright, no problem!");
        matchedCategory = "feelings";
        foundResponse = true;
      }

      // General logic (fallback)
      if (!foundResponse) {
        // Look for a matching keyword in predefined responses
        for (let response of responses) {
          if (
            response.keywords.some((keyword) =>
              part.toLowerCase().includes(keyword)
            )
          ) {
            // Pick a random answer if keyword is found
            const randomIndex = Math.floor(
              Math.random() * response.answers.length
            );
            replies.push(response.answers[randomIndex]);
            matchedCategory = response.category || matchedCategory;
            foundResponse = true;
            break;
          }
        }
      }

      // If no response matched, use a default reply
      if (!foundResponse) {
        replies.push(
          `I don't understand your message: "${part}". Please try and write something else.`
        );
      }
    }

    botReply = replies.join(" ");

    // Extra logic depending on category
    if (matchedCategory === "feelings") {
      botReply += " Would you like me tell you about how I feel?";
    } else if (matchedCategory === "favour") {
      botReply += " Feel free to do me a favour if you want!";
    }

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

    return res.redirect("/");
  }

  // If validation error, then show bot error message too
  if (error) {
    messages.push({
      sender: "Bot",
      text: botReply,
      time: new Date().toLocaleString("da-DK"),
      category: "error",
    });
  }

  // Render the chat page with updated messages and any error
  res.render("index", { messages, botReply, /* totalMessages, userCount, botCount, error*/ });
});

// Handle personalization form submission on POST "/add-response"
app.post("/add-response", (req, res) => {
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
  if (!global.userLearnedResponses) {
    global.userLearnedResponses = [];
  }
  global.userLearnedResponses.push({
    keyword: cleanKeyword,
    answer: cleanAnswer,
    timestamp: new Date(),
  });

  // Redirect
  res.redirect("/?success=response_added");
});

// Handle statistics on GET "/stats"
app.get("/stats", (req, res) => {
  res.render("stats", {
    categoryStats: getCategoryStats(),
    messages,
  });
});

// Reset message array
app.post("/clear", (req, res) => {
  messages.length = 0;
  res.redirect("/");
});

// Start the server on port 3000
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
