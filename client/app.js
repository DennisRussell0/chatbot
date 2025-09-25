// --- Global functions ---

// Fetch messages from server and show them
async function fetchMessages() {
  const messagesDiv = document.getElementById("messages");
  const res = await fetch("/messages");
  const data = await res.json();
  messagesDiv.innerHTML = "";
  for (const msg of data.messages) {
    const div = document.createElement("div");
    div.className = `message ${msg.sender.toLowerCase()}`;
    div.textContent = msg.text;
    messagesDiv.appendChild(div);
  }
  // Scroll to bottom
  const chat = document.querySelector(".chat-messages-wrapper");
  if (chat) chat.scrollTop = chat.scrollHeight;
}

// Fetch stats from server and console log them for now (ready for use in UI if needed)
async function fetchStats() {
  const res = await fetch("/messages/stats");
  const data = await res.json();
  console.log(data);
}

// --- DOM interaction ---
document.addEventListener("DOMContentLoaded", () => {
  const messagesDiv = document.getElementById("messages");
  const chatForm = document.getElementById("chat-form");
  const userInput = document.getElementById("message-input");

  // Character counter
  const input = document.getElementById("message-input");
  const counter = document.getElementById("character-count");
  const container = document.querySelector(".character-counter");

  input.addEventListener("input", function (event) {
    let length = event.target.value.length;
    counter.innerText = length;

    container.classList.remove("warning", "danger");

    if (length > 100) {
      container.classList.add("danger");
    } else if (length > 75) {
      container.classList.add("warning");
    }
  });

  // Send user message to server
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;
    await fetch("/messages/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    userInput.value = "";
    fetchMessages();
    fetchStats();
  });

  // Modal functionality
  const modalOverlay = document.getElementById("personalizationModalOverlay");
  const openModalBtn = document.querySelector(".open-personalization-modal");
  const closeModalBtn = document.getElementById("closePersonalizationModal");

  openModalBtn.addEventListener("click", () => {
    modalOverlay.style.display = "flex";
  });

  closeModalBtn.addEventListener("click", () => {
    modalOverlay.style.display = "none";
  });

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.style.display = "none";
    }
  });

  // Add response(s) from personalization modal
  const personalizationForm = document.getElementById("personalization-form");
  if (personalizationForm) {
    personalizationForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const keyword = personalizationForm.elements["keyword"].value.trim();
      const answer = personalizationForm.elements["answer"].value.trim();
      if (!keyword || !answer) return;

      await fetch("/messages/add-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, answer }),
      });

      personalizationForm.reset();
      modalOverlay.style.display = "none";
    });
  }

  // Clear chat functionality
  const clearBtn = document.getElementById("clearChat");
  if (clearBtn) {
    clearBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await fetch("/messages/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      fetchMessages();
    });
  }

  // Fetch messages and stats on load
  fetchMessages();
  fetchStats();
});
