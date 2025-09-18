document.addEventListener("DOMContentLoaded", () => {
  const texts = [
    "Every year, millions of lives are lost to cancer due to late detection and lack of access to quality healthcare. This World Cancer Day, Epiconsult is committed to bridging the gap with free screenings, awareness campaigns, and diagnostic support.",
    "Early detection saves lives. Epiconsult provides affordable diagnostic services, empowering communities to fight cancer with knowledge and timely care.",
    "Together for progress, together for hope — join Epiconsult in raising awareness, reducing stigma, and supporting patients on their journey.",
    "Access to modern cancer diagnostics should not be a privilege. At Epiconsult, we are breaking barriers and making care available to everyone.",
    "Prevention starts with awareness. From Pap smears to tumor markers, Epiconsult ensures vital screenings are within your reach.",
    "Community health is at the heart of Epiconsult. We stand with you, offering compassionate care, modern diagnostics, and expert guidance.",
    "This World Cancer Day, Epiconsult reaffirms its mission: better detection, better treatment, better outcomes for all.",
    "Together, we can close the gap in healthcare access and equity, ensuring no one is left behind.",
    "Epiconsult is your trusted partner in building healthier communities through awareness, prevention, and care."
  ];

  const slider = document.querySelector(".awareness-slider");
  const dotsContainer = document.querySelector(".awareness-dots");

  texts.forEach((txt, i) => {
    const card = document.createElement("div");
    card.className = "awareness-card";
    card.style.backgroundImage = `url('/static/images/c${i+1}.jpg')`;
    card.innerHTML = `<div class="awareness-text">${txt}</div>`;
    slider.appendChild(card);
  });

  const cards = document.querySelectorAll(".awareness-card");
  const batchSize = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  const totalBatches = Math.ceil(cards.length / batchSize);
  let currentBatch = 0;
  let interval;

  // Dots
  for (let i = 0; i < totalBatches; i++) {
    const dot = document.createElement("span");
    dot.dataset.index = i;
    if (i === 0) dot.classList.add("active");
    dotsContainer.appendChild(dot);
  }
  const dots = document.querySelectorAll(".awareness-dots span");

  function showBatch(batch) {
    const offset = -(batch * 100);
    slider.style.transform = `translateX(${offset}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === batch));
  }

  function nextBatch() {
    currentBatch = (currentBatch + 1) % totalBatches;
    showBatch(currentBatch);
  }
  function prevBatch() {
    currentBatch = (currentBatch - 1 + totalBatches) % totalBatches;
    showBatch(currentBatch);
  }

  document.querySelector(".awareness-nav.next").addEventListener("click", () => {
    nextBatch();
    resetInterval();
  });
  document.querySelector(".awareness-nav.prev").addEventListener("click", () => {
    prevBatch();
    resetInterval();
  });

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      currentBatch = parseInt(dot.dataset.index);
      showBatch(currentBatch);
      resetInterval();
    });
  });

  function startInterval() {
    interval = setInterval(nextBatch, 7000); // 7 seconds
  }
  function resetInterval() {
    clearInterval(interval);
    startInterval();
  }

  slider.addEventListener("mouseenter", () => clearInterval(interval));
  slider.addEventListener("mouseleave", startInterval);

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") nextBatch();
    if (e.key === "ArrowLeft") prevBatch();
  });

  showBatch(0);
  startInterval();
});
