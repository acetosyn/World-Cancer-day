document.addEventListener("DOMContentLoaded", () => {
  const flash = document.getElementById("flash-message");

  // Select About & Contact links
  const aboutLink = document.querySelector('a[data-nav="about"]');
  const contactLink = document.querySelector('a[data-nav="contact"]');

  function showFlash() {
    flash.classList.remove("hidden", "hide");
    flash.classList.add("show");

    // Auto-hide after 3 seconds
    setTimeout(() => {
      flash.classList.add("hide");
      setTimeout(() => flash.classList.add("hidden"), 500);
    }, 3000);
  }

  if (aboutLink) aboutLink.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent navigation
    showFlash();
  });

  if (contactLink) contactLink.addEventListener("click", (e) => {
    e.preventDefault();
    showFlash();
  });
});
