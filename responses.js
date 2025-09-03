// Predefined responses for the chatbot
const responses = [
  // Hellos
  {
    keywords: ["hello", "hi"],
    answers: ["Hello there!", "Hi there!", "Hi!", "Hello!"],
  },
  // How you are doings
  {
    keywords: ["how are doing"],
    answers: [
      "I'm fine, thank you! How are you?",
      "I'm doing well! How are you?",
      "I'm felling kinda under the weather really, even though I'm a robot.",
    ],
  },
  // Goodbyes
  {
    keywords: ["bye", "see you", "goodbye"],
    answers: ["Goodbye!", "See you!", "Thanks for the chat!"],
  },
  // Favours
  {
    keywords: ["help", "favour"],
    answers: ["I can help you chat!", "Ask me anything!"],
  },
  // Fellings
  {
    keywords: ["feeling sad"],
    answers: ["Man up soldier!", "Me too..."],
  },
];

export default responses;
