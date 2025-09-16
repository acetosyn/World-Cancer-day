document.addEventListener("DOMContentLoaded", () => {
  // Hero Slider
  const slides = document.querySelectorAll(".slide, .hero-slide");
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }, 5000);

  // Animate Hero Buttons on load
  const heroButtons = document.querySelector(".hero-buttons");
  if (heroButtons) {
    setTimeout(() => {
      heroButtons.classList.add("visible");
    }, 800); // delay for smooth entrance
  }

  // Registration Form
  const form = document.getElementById("cancerDayForm");
  const popup = document.getElementById("thankYouPopup");
  const closeBtn = document.getElementById("closePopupBtn");

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
          popup?.classList.remove("hidden");
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
    popup.classList.add("hidden");
  });

  // Header clicks → Stay tuned
  document.querySelectorAll("nav a, nav button").forEach(el => {
    el.addEventListener("click", (e) => {
      if (!el.getAttribute("href").startsWith("#")) {
        e.preventDefault();
        alert("Stay Tuned – Epiconsult website is coming soon!");
      }
    });
  });
});
