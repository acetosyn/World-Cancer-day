document.addEventListener("DOMContentLoaded", () => {
  // ---------------- HERO SLIDER ----------------
  const slides = document.querySelectorAll(".slide, .hero-slide");
  let current = 0;
  if (slides.length > 0) {
    setInterval(() => {
      slides[current].classList.remove("active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("active");
    }, 5000);
  }

  // Animate Hero Buttons on load
  const heroButtons = document.querySelector(".hero-buttons");
  if (heroButtons) {
    setTimeout(() => {
      heroButtons.classList.add("visible");
    }, 800);
  }

  // ---------------- FLASH MESSAGE (every 10s) ----------------
  const flashEl = document.getElementById("flash-message");
  const flashMessages = [
    "ℹ️ Please double-check your name, email, and phone — accurate details help us contact you quickly.",
    "✅ Use an active phone number and inbox you check often to avoid delays.",
    "🔐 Your details are safe with us and used only for your registration follow-up.",
  ];
  if (flashEl) {
    let idx = 0;
    const showFlash = () => {
      flashEl.classList.remove("fade-in");
      // force reflow to restart animation
      void flashEl.offsetWidth;
      flashEl.textContent = flashMessages[idx % flashMessages.length];
      flashEl.classList.add("fade-in");
      idx++;
    };
    showFlash(); // initial
    setInterval(showFlash, 10000); // every 10s
  }

  // ---------------- REGISTRATION FORM ----------------
  const form = document.getElementById("cancerDayForm");
  const popup = document.getElementById("thankYouPopup");
  const closeBtn = document.getElementById("closePopupBtn");

  function showThankYouCard() {
    if (!popup) return;
    popup.classList.remove("hidden");
    const card = popup.querySelector(".popup-card");
    if (card) {
      card.classList.remove("scale-in");
      void card.offsetWidth; // restart CSS animation
      card.classList.add("scale-in");
    }
    // Auto-close after 5s (optional)
    clearTimeout(popup._autoTimer);
    popup._autoTimer = setTimeout(() => {
      popup.classList.add("hidden");
    }, 5000);
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      try {
        const response = await fetch("/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          showThankYouCard();
          form.reset();
        } else {
          alert("Registration failed. Please try again.");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong.");
      }
    });
  }

  closeBtn?.addEventListener("click", () => {
    popup?.classList.add("hidden");
  });

  // ---------------- HEADER LINKS “STAY TUNED” ----------------
  document.querySelectorAll("nav a, nav button").forEach(el => {
    el.addEventListener("click", (e) => {
      const href = el.getAttribute("href") || "";
      const text = el.textContent.trim().toLowerCase();

      if (!href.startsWith("#") && text !== "home" && text !== "epiconsult") {
        e.preventDefault();
        alert("Stay Tuned – Epiconsult website is coming soon!");
      }
    });
  });
});
