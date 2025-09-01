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

// Render the chat page on GET "/" (when the user visits the root URL)
app.get("/", (req, res) => {
  res.render("index", { messages, botReply: "" });
});

// Handle chat form submission on POST "/chat"
app.post("/chat", (req, res) => {
  // Convert user message to lowercase and trim whitespace
  let userMessage = req.body.message.toLowerCase().trim();

  // Default bor reply and error message
  let botReply = "I didn't understand your message.";
  let error = "";

  // Sanitize user input (remove potentially harmful characters/data)
  userMessage = sanitizeInput(userMessage);

  // Validate user input - most specific checks first
  if (!userMessage || userMessage.trim() === "") {
    error = "You must write a message.";
    botReply = "Write a message to chat.";
  } else if (userMessage.length < 2) {
    error = "The message must be at least two characters long.";
    botReply = "Your message was too short. Try again.";
  } else if (userMessage.length > 500) {
    error = "Message too long (maximum 500 characters)!";
    botReply = "Your message was too long. Try and make it shorter.";
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

      // Look for a matching keyword in predefined responses
      for (let response of responses) {
        for (let keyword of response.keywords) {
          if (part.toLowerCase().includes(keyword)) {
            // Pick a random answer if keyword is found
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

    // Save user and bot messages if no error
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
