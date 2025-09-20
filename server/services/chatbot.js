import responses from "./responses.js";

function handleUserMessage(userMessage, originalUserMessage) {
  let matchedCategory = "uncategorized";

  // Default bot reply and error message
  let botReply =
    "I didn't understand your message. Try and write something else.";
  let error = "";

  try {
    // Validate user input
    switch (true) {
      case !userMessage:
        error = "You must write a message.";
        botReply = "Write a message to chat.";
        break;

      case userMessage.length < 2:
        error = "The message must be at least two characters long.";
        botReply =
          "Your message must contain at least 2 characters. Please try again.";
        break;

      case userMessage.length > 100:
        error = "Message too long (maximum 100 characters)!";
        botReply =
          "Your message must not contain more than 100 characters. Please try again.";
        break;

      default:
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
        switch (matchedCategory) {
          case "feelings":
            botReply += " Would you like me to tell you about how I feel?";
            break;
          case "favour":
            botReply += " Feel free to do me a favour if you want!";
            break;
        }
    }
  } catch (err) {
    error = "Internal error processing message.";
    botReply = "Sorry, something went wrong. Please try again.";
    console.error("Chatbot error:", err);
  }

  return { botReply, matchedCategory, error };
}

export { handleUserMessage };
