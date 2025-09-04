// Predefined responses for the chatbot
const responses = [
  // Hellos
  {
    category: "hellos",
    keywords: ["hello", "hi"],
    answers: ["Hello there!", "Hi there!", "Hi!", "Hello!"],
  },
  // How you are doings
  {
    category: "status",
    keywords: ["how are doing", "how are you"],
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
    keywords: ["help", "favour"],
    answers: ["I can help you!", "Ask me anything!"],
  },
  // Fellings
  {
    category: "feelings",
    keywords: ["feeling sad"],
    answers: ["Man up soldier!", "Me too..."],
  },
];

export default responses;
