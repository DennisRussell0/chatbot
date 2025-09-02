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

  // Default bot reply and error message
  let botReply = "I didn't understand your message.";
  let error = "";

  // Sanitize user input (remove potentially harmful characters/data)
  userMessage = sanitizeInput(userMessage);

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
      if (part.includes("thank") && part.includes("help")) {
        replies.push("You're welcome! I'm here to help.");
        foundResponse = true;
      } else if (part.includes("thank")) {
        replies.push("You're welcome!");
        foundResponse = true;
      } else if (part.includes("sorry")) {
        replies.push("It's alright, no problem!");
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

    // No error -> save and redirect
    messages.push({ sender: "User", text: userMessage });
    messages.push({ sender: "Bot", text: botReply });
    return res.redirect("/");
  }

  // Render the chat page with updated messages and any error
  if (error) {
    messages.push({ sender: "Bot", text: botReply });
  }

  // Render the chat page with updated messages and any error
  res.render("index", { messages, botReply /*, error*/ });
});

// Start the server on port 3000
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
