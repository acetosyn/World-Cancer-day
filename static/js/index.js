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
      void flashEl.offsetWidth; // restart animation
      flashEl.textContent = flashMessages[idx % flashMessages.length];
      flashEl.classList.add("fade-in");
      idx++;
    };
    showFlash();
    setInterval(showFlash, 10000);
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
      void card.offsetWidth;
      card.classList.add("scale-in");
    }
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
          epiconsultAlert("⚠ Registration failed. Please try again.");
        }
      } catch (err) {
        console.error(err);
        epiconsultAlert("⚠ Something went wrong.");
      }
    });
  }

  closeBtn?.addEventListener("click", () => {
    popup?.classList.add("hidden");
  });

  // ---------------- CUSTOM TOAST ALERT ----------------
  function epiconsultAlert(message) {
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-[9999] transition-opacity duration-500 opacity-0";
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("opacity-0");
      toast.classList.add("opacity-100");
    });

    setTimeout(() => {
      toast.classList.remove("opacity-100");
      toast.classList.add("opacity-0");
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  // ---------------- HEADER LINKS “STAY TUNED” ----------------
  document.querySelectorAll("nav a, nav button").forEach((el) => {
    el.addEventListener("click", (e) => {
      const href = el.getAttribute("href") || "";
      const text = el.textContent.trim().toLowerCase();

      if (!href.startsWith("#") && text !== "home" && text !== "epiconsult") {
        e.preventDefault();
        epiconsultAlert("Stay Tuned – Epiconsult website is coming soon!");
      }
    });
  });

  // ---------------- POSTER AUTO-ZOOM LOOP ----------------
  const posters = document.querySelectorAll(".poster-card.big");
  let posterIndex = 0;

  function cyclePosters() {
    posters.forEach((p, i) => p.classList.toggle("active", i === posterIndex));
    posterIndex = (posterIndex + 1) % posters.length;
  }

  if (posters.length > 0) {
    cyclePosters();
    setInterval(cyclePosters, 5000);
  }

  const posterSection = document.querySelector(".poster-gallery");
  if (posterSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          posters[posterIndex].classList.add("active");
        } else {
          posters.forEach((p) => p.classList.remove("active"));
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(posterSection);
  }

  // ---------------- POSTER VIEWER ----------------
  // Create viewer container dynamically
  const viewer = document.createElement("div");
  viewer.id = "posterViewer";
  viewer.style.position = "fixed";
  viewer.style.inset = "0";
  viewer.style.background = "rgba(0,0,0,0.8)";
  viewer.style.display = "none";
  viewer.style.alignItems = "center";
  viewer.style.justifyContent = "center";
  viewer.style.zIndex = "10000";
  viewer.innerHTML = `
    <div style="position: relative; max-width: 90%; max-height: 90%;">
      <img id="posterViewerImg" src="" alt="Poster" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.6);" />
      <button id="closePosterViewer" style="position: absolute; top: -16px; right: -16px; background: #dc2626; color: #fff; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 20px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">✕</button>
    </div>
  `;
  document.body.appendChild(viewer);

  const viewerImg = viewer.querySelector("#posterViewerImg");
  const closeViewerBtn = viewer.querySelector("#closePosterViewer");

  posters.forEach((poster) => {
    poster.addEventListener("click", () => {
      const img = poster.querySelector("img");
      if (img) {
        viewerImg.src = img.src;
        viewer.style.display = "flex";
      }
    });
  });

  closeViewerBtn.addEventListener("click", () => {
    viewer.style.display = "none";
    viewerImg.src = "";
  });

  // Close when clicking background (not image)
  viewer.addEventListener("click", (e) => {
    if (e.target === viewer) {
      viewer.style.display = "none";
      viewerImg.src = "";
    }
  });
});
