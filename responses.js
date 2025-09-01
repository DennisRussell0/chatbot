// Predefined responses for the chatbot
const responses = [
  {
    keywords: ["hello", "hi"],
    answers: ["Hello there!", "Hi there!", "Hi!", "Hello!"],
  },
  {
    keywords: ["how are you doing", "how are you"],
    answers: [
      "I'm fine, thank you! How are you?",
      "I'm doing well! How are you?",
    ],
  },
  {
    keywords: ["bye", "see you", "goodbye"],
    answers: ["Goodbye!", "See you!", "Thanks for the chat!"],
  },
  {
    keywords: ["help"],
    answers: ["I can help you chat!", "Ask me anything!"],
  },
];

export default responses;
