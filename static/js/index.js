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

  // ---------------- REGISTRATION FORM ----------------
const form = document.getElementById("cancerDayForm");
const popup = document.getElementById("thankYouPopup");
const registerBtn = document.getElementById("registerBtn");
const btnText = registerBtn?.querySelector(".btn-text");

function setButtonLoading(isLoading) {
  if (!registerBtn || !btnText) return;

  if (isLoading) {
    registerBtn.classList.add("loading");
    btnText.innerHTML = `<span class="loading-spinner"></span> Registering...`;
    registerBtn.disabled = true;
  } else {
    registerBtn.classList.remove("loading");
    btnText.textContent = "Register Now";
    registerBtn.disabled = false;
  }
}

function showThankYouCard(data) {
  if (!popup) return;
  popup.classList.remove("hidden");

  const card = popup.querySelector(".popup-card");
  if (card) {
    card.innerHTML = `
      <div class="thumb-anim">👍</div>
      <h3 class="text-xl font-bold mt-2">Thanks for registering!</h3>
      <p class="mt-2">Hi <strong>${data.full_name}</strong>,</p>
      <p>We’ve received your registration with the email <strong>${data.email}</strong> and phone <strong>${data.phone}</strong>.</p>
      <p class="mt-2">Our team will contact you shortly.</p>
      <button id="closePopupBtn" class="close-btn">Close</button>
    `;

    card.classList.remove("scale-in");
    void card.offsetWidth;
    card.classList.add("scale-in");
  }

  // Bind close button
  const closeBtnNew = document.getElementById("closePopupBtn");
  closeBtnNew?.addEventListener("click", () => {
    popup.classList.add("hidden");
  });
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    setButtonLoading(true); // show button spinner

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      setButtonLoading(false); // reset button state

      if (response.ok) {
        showThankYouCard(data);
        form.reset();
      } else {
        if (result.error && result.error.toLowerCase().includes("already registered")) {
          window.showFlash(
            `⚠️ This email is already registered with us.
Please use a different email address, or kindly await our follow-up.
Thank you for choosing Epiconsult.`,
            "error"
          );
        } else {
          window.showFlash("⚠ Registration failed. Try again.", "error");
        }
      }
    } catch (err) {
      console.error(err);
      setButtonLoading(false);
      window.showFlash("⚠ Something went wrong. Please retry.", "error");
    }
  });
}


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

  viewer.addEventListener("click", (e) => {
    if (e.target === viewer) {
      viewer.style.display = "none";
      viewerImg.src = "";
    }
  });
});
