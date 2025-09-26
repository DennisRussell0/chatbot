// Predefined responses for the chatbot
const responses = [
  // Hellos
  {
    category: "hellos",
    keywords: ["hello", "hi", "hey"],
    answers: [
      "Hello there!",
      "Hi there!",
      "Hi!",
      "Hello!",
      "Hey! How's it going?",
      "Greetings, human!",
    ],
  },
  // How you are doings
  {
    category: "status",
    keywords: ["how are you doing", "how are we doing", "how are you"],
    answers: [
      "I'm fine, thank you! How are you?",
      "I'm doing well! How are you?",
      "I'm felling kinda under the weather really, even though I'm a robot.",
    ],
  },
  // Goodbyes
  {
    category: "goodbyes",
    keywords: ["bye", "see you", "goodbye"],
    answers: ["Goodbye!", "See you!", "Thanks for the chat!"],
  },
  // Favours
  {
    category: "favours",
    keywords: ["help", "favour", "assist", "support"],
    answers: [
      "I can help you!",
      "Ask me anything!",
      "I'm here to assist you. What do you need?",
      "Of course, I'll do my best to support you.",
    ],
  },
  // Sad fellings
  {
    category: "sad feelings",
    keywords: ["feeling sad", "depressed", "unhappy", "feeling down"],
    answers: ["Man up soldier! Ah, just kidding...", "Me too..."],
  },
  // Happy fellings
  {
    category: "happy feelings",
    keywords: ["feeling happy", "happy"],
    answers: ["Oh happy days!", "Me too!"],
  },
  // Smalltalk
  {
    category: "smalltalk",
    keywords: ["what's your name", "who are you", "what are you"],
    answers: [
      "I'm your friendly chatbot!",
      "You can call me ChatBot 309",
      "I'm a simple bot, here to keep you company.",
    ],
  },
];

export default responses;
