import express from "express";
import responses from "./responses.js";
import { sanitizeInput } from "./sanitizeInput.js";
const app = express();

// Set EJS as the templating engine
app.set("view engine", "ejs");
// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));
// Serve static files from the "public" directory
app.use(express.static("public"));

// Store all chat messages
const messages = [];

// Render the chat page on GET /
app.get("/", (req, res) => {
    res.render("index", { messages, botReply: "" });
});

// Handle chat form submission on POST /chat
app.post("/chat", (req, res) => {
  let userMessage = req.body.message.toLowerCase().trim();
  let botReply = "I didn't understand your message.";
  let error = "";

  // Sanitize user input
  userMessage = sanitizeInput(userMessage);

  // Validate user input - most specific prioritized first
  if (!userMessage || userMessage.trim() === "") {
    error = "You must write a message.";
    botReply = "Write a message to chat.";
  } else if (userMessage.length < 2) {
    error = "The message must be at least to characters long.";
    botReply = "Your message was too short. Try again.";
  } else if (userMessage.length > 500) {
    error = "Message too long (maximum 500 characters)!";
    botReply = "Your message was too long. Try and make it shorter.";
  } else {
    const parts = userMessage.split(".")
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const replies = [];

    for (const part of parts) {
      let foundResponse = false;
      for (let response of responses) {
        for (let keyword of response.keywords) {
          if (part.toLowerCase().includes(keyword)) {
            // Pick a random answer from the matched response
            const randomIndex = Math.floor(
              Math.random() * response.answers.length
            );
            replies.push(response.answers[randomIndex]);
            foundResponse = true;
            break;
          }
        }
        if (foundResponse) break;
      }
      // If no response matched, use a default reply
      if (!foundResponse) {
        replies.push(`You wrote: "${part}". Try and write something new.`);
      }
    }

    botReply = replies.join(" ");

    // Save messages if there was no error
    if (!error) {
      messages.push({ sender: "User", text: userMessage });
      messages.push({ sender: "Bot", text: botReply });
    }
  }

  // Render the chat page with updated messages and any error
  res.render("index", { messages, botReply, error });
});

// Start the server on port 3000
app.listen(3000, () => console.log("Server running at http://localhost:3000"));