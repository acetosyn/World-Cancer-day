// ==============================
// Typewriter Effect for Registration
// ==============================
function typeWriter(elementId, messages, speed = 70, delay = 2500) {
  const element = document.getElementById(elementId);
  if (!element) return;
  let i = 0, j = 0, currentMessage = "";

  function type() {
    if (j < messages[i].length) {
      currentMessage += messages[i].charAt(j);
      element.textContent = currentMessage;
      j++;
      setTimeout(type, speed);
    } else {
      setTimeout(() => {
        currentMessage = "";
        element.textContent = "";
        j = 0;
        i = (i + 1) % messages.length;
        type();
      }, delay);
    }
  }
  type();
}

// Call the typewriter for registration tips
document.addEventListener("DOMContentLoaded", () => {
  typeWriter("registration-typewriter", [
    "✍️ Please enter your Full Name (First and Last).",
    "📧 Please use a valid and active Email Address so we can reach you.",
    "📱 Provide a valid Phone Number to receive our timely updates.",
    "🙏 Thank you for trusting Epiconsult Clinic & Diagnostics.",
  ]);
});
