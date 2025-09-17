// ================= EPICARE ASSISTANT =================
document.addEventListener("DOMContentLoaded", () => {
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-btn");
  const messagesContainer = document.getElementById("messages");
  const typingIndicator = document.getElementById("typing-indicator");

  let conversation = [];

  // ----------------- HELPERS -----------------
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Add user message to chat
  function displayUserMessage(message) {
    const row = document.createElement("div");
    row.classList.add("flex", "items-start", "justify-end", "gap-3");

    const msg = document.createElement("div");
    msg.classList.add("bg-white", "text-gray-900", "p-3", "rounded-xl", "shadow", "max-w-[75%]");
    msg.textContent = message;

    row.appendChild(msg);
    messagesContainer.appendChild(row);
    scrollToBottom();
  }

  // Add bot message container
  function displayBotMessage() {
    const row = document.createElement("div");
    row.classList.add("flex", "items-start", "gap-3");

    const avatar = document.createElement("img");
    avatar.src = "/static/images/bot.jpg";
    avatar.classList.add("w-10", "h-10", "rounded-full", "shadow");

    const msg = document.createElement("div");
    msg.classList.add(
      "bg-gradient-to-r",
      "from-redbrand",
      "to-pink-600",
      "text-white",
      "p-3",
      "rounded-xl",
      "shadow",
      "max-w-[75%]"
    );
    msg.textContent = "";

    row.appendChild(avatar);
    row.appendChild(msg);
    messagesContainer.appendChild(row);
    scrollToBottom();

    return msg;
  }

  // Typing effect for streaming responses
  async function typeWriterEffect(element, text, speed = 25) {
    for (let char of text) {
      element.textContent += char;
      await new Promise((resolve) => setTimeout(resolve, speed));
      scrollToBottom();
    }
  }

  // ----------------- MAIN SEND -----------------
  async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Display user message
    displayUserMessage(userMessage);
    conversation.push({ role: "user", content: userMessage });
    userInput.value = "";

    // Show typing indicator
    typingIndicator.classList.remove("hidden");

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversation: conversation,
        }),
      });

      if (!response.ok) throw new Error("Chat response failed");

      // Hide typing indicator
      typingIndicator.classList.add("hidden");

      // Prepare bot message
      const botMsgDiv = displayBotMessage();

      // Stream response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullBotResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullBotResponse += chunk;
        await typeWriterEffect(botMsgDiv, chunk);
      }

      conversation.push({ role: "assistant", content: fullBotResponse });
    } catch (err) {
      console.error("❌ Chat error:", err);
      typingIndicator.classList.add("hidden");
      const errorDiv = displayBotMessage();
      errorDiv.textContent = "⚠ Sorry, something went wrong.";
    }
  }

  // ----------------- INITIAL WELCOME -----------------
// Show initial bot message only if chat is empty
function showInitialMessage() {
  if (messagesContainer.children.length > 0) return; // ✅ prevent duplicate

  const row = document.createElement("div");
  row.classList.add("flex", "items-start", "gap-3");

  const avatar = document.createElement("img");
  avatar.src = "/static/images/bot.jpg";
  avatar.classList.add("w-10", "h-10", "rounded-full", "shadow");

  const msg = document.createElement("div");
  msg.classList.add(
    "bg-gradient-to-r",
    "from-redbrand",
    "to-pink-600",
    "text-white",
    "p-3",
    "rounded-xl",
    "shadow",
    "max-w-[75%]"
  );
  msg.textContent = "👋 Hi, I'm Epicare — your virtual health assistant. How can I help you today?";

  row.appendChild(avatar);
  row.appendChild(msg);
  messagesContainer.appendChild(row);
}

  // ----------------- EVENT LISTENERS -----------------
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Show initial bot message
  showInitialMessage();
});
