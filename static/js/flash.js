document.addEventListener("DOMContentLoaded", () => {
  const flash = document.getElementById("flash-message");

  function showFlash(message, type = "success") {
    if (!flash) return;

    flash.textContent = message;
    flash.classList.remove("hidden", "opacity-0", "bg-green-500", "bg-red-500");
    flash.classList.add("opacity-100");

    // Choose color
    if (type === "error") flash.classList.add("bg-red-500");
    else flash.classList.add("bg-green-500");

    setTimeout(() => {
      flash.classList.remove("opacity-100");
      flash.classList.add("opacity-0");
    }, 4000);
  }

  // About / Contact demo flashes
  const aboutLink = document.querySelector('a[data-nav="about"]');
  const contactLink = document.querySelector('a[data-nav="contact"]');

  if (aboutLink) aboutLink.addEventListener("click", (e) => {
    e.preventDefault();
    showFlash("ℹ️ Stay Tuned — About page is coming soon!", "success");
  });

  if (contactLink) contactLink.addEventListener("click", (e) => {
    e.preventDefault();
    showFlash("📞 Stay Tuned — Contact page is coming soon!", "success");
  });

  // Expose globally for other scripts
  window.showFlash = showFlash;
});
