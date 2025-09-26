// --- Global functions ---

function showLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.style.display = "flex";
}

function hideLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.style.display = "none";
}

// Show error message to user
function showError(message) {
  let errorDiv = document.querySelector(".error-message");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.color = "red";
    errorDiv.style.margin = "8px 0";
    document.querySelector(".chat-messages-wrapper").prepend(errorDiv);
  }
  errorDiv.textContent = message;
  setTimeout(() => errorDiv.remove(), 4000);
}

// Fetch messages from server and show them
async function fetchMessages() {
  const messagesDiv = document.getElementById("messages");
  // Remove welcome message before "Loading..."
  messagesDiv.innerHTML = "";

  showLoading();
  try {
    const res = await fetch("/messages");
    if (!res.ok) throw new Error("Failed to fetch messages");
    const data = await res.json();

    hideLoading();

    // If no messages: welcome "message"
    if (data.messages.length === 0) {
      messagesDiv.innerHTML = `
        <div class="welcome-message">
        <p style="margin-bottom: 2rem;font-weight: 600;"><big>Welcome!</big></p>
          <p>You can greet me with a hello or ask how I am.</p>
          <p><i><small>You can also customize me with your own keywords using the personalize button if you'd like.</small></i></p>
        </div>
      `;
      return;
    }

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
  } catch (err) {
    hideLoading();
    if (err instanceof TypeError) {
      showError("Network error. Please check your connection.");
    } else if (err instanceof SyntaxError) {
      showError("Received invalid data from server.");
    } else if (err instanceof Error) {
      showError(err.message);
    } else {
      showError("Couldn't fetch messages. Try again later.");
    }
    console.error("fetchMessages error:", err);
    messagesDiv.innerHTML =
      "<div class='error-message'>Couldn't fetch messages.</div>";
  }
}

// Fetch stats from server and console log them for now (ready for use in UI if needed)
async function fetchStats() {
  try {
    const res = await fetch("/messages/stats");
    if (!res.ok) throw new Error("Failed to fetch stats");
    const data = await res.json();
    console.log(data);
  } catch (err) {
    if (err instanceof TypeError) {
      showError("Network error. Please check your connection.");
    } else if (err instanceof SyntaxError) {
      showError("Received invalid data from server.");
    } else if (err instanceof Error) {
      showError(err.message);
    } else {
      showError("An unexpected error occurred.");
    }
    console.error("fetchStats error:", err);
  }
}

// --- DOM interaction ---
document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chat-form");
  const input = document.getElementById("message-input");

  // Character counter
  const sendBtn = document.getElementById("sendBtn");
  const counter = document.getElementById("character-count");
  const container = document.querySelector(".character-counter");

  // Initial state
  sendBtn.disabled = true;

  input.addEventListener("input", function (event) {
    let length = event.target.value.length;
    counter.innerText = length;

    container.classList.remove("warning", "danger");

    if (length > 100) {
      container.classList.add("danger");
    } else if (length > 75) {
      container.classList.add("warning");
    }

    // Enable/disable send button
    sendBtn.disabled = length === 0;
  });

  // Send user message to server
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const text = input.value.trim();
      if (!text) {
        throw new Error("You must write a message before sending.");
      }
      if (text.length < 2) {
        throw new Error("Your message must be at least 2 characters long.");
      }
      if (text.length > 100) {
        throw new Error("Your message can't contain more than 100 characters.");
      }
      const res = await fetch("/messages/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error("Server error: " + (errData.details || res.status));
      }
      input.value = "";
      counter.innerText = "0";
      sendBtn.disabled = true;
      container.classList.remove("warning", "danger");
      fetchMessages();
      fetchStats();
    } catch (err) {
      if (err instanceof TypeError) {
        showError("Network error. Please check your connection.");
      } else if (err instanceof SyntaxError) {
        showError("Received invalid data from server.");
      } else if (err instanceof Error) {
        showError(err.message);
      } else {
        showError("An unexpected error occurred.");
      }
      console.error("chatForm submit error:", err);
    }
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
      try {
        const keyword = personalizationForm.elements["keyword"].value.trim();
        const answer = personalizationForm.elements["answer"].value.trim();
        if (!keyword || !answer) {
          throw new Error("Both keyword and answer must be filled out.");
        }

        const res = await fetch("/messages/add-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword, answer }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error("Server error: " + (errData.details || res.status));
        }
        personalizationForm.reset();
        modalOverlay.style.display = "none";
      } catch (err) {
        if (err instanceof TypeError) {
          showError("Network error. Please check your connection.");
        } else if (err instanceof SyntaxError) {
          showError("Received invalid data from server.");
        } else if (err instanceof Error) {
          showError(err.message);
        } else {
          showError("An unexpected error occurred.");
        }
        console.error("personalizationForm submit error:", err);
      }
    });
  }

  // Clear chat functionality
  const clearBtn = document.getElementById("clearChat");
  if (clearBtn) {
    clearBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const messagesDiv = document.getElementById("messages");
      if (
        !messagesDiv ||
        messagesDiv.children.length === 0 ||
        (messagesDiv.children.length === 1 &&
          messagesDiv.firstElementChild.classList.contains("welcome-message"))
      ) {
        showError("There are no messages to clear.");
        return;
      }
      try {
        const res = await fetch("/messages/clear", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          const errData = await res.json();
          showError(errData.error || "Couldn't clear chat.");
          throw new Error("Server error: " + (errData.details || res.status));
        }
        fetchMessages();
      } catch (err) {
        if (err instanceof TypeError) {
          showError("Network error. Please check your connection.");
        } else if (err instanceof SyntaxError) {
          showError("Received invalid data from server.");
        } else if (err instanceof Error) {
          showError(err.message);
        } else {
          showError("An unexpected error occurred.");
        }
        console.error("clearBtn click error:", err);
      }
    });
  }

  // Fetch messages and stats on load
  fetchMessages();
  fetchStats();
});
