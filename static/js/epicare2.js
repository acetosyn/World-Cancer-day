// ================= EPICARE ASSISTANT EXTENSIONS (epicare2.js) =================
document.addEventListener("DOMContentLoaded", () => {
  // ---------- DOM HOOKS ----------
  const micButton = document.getElementById("voice-toggle") || document.getElementById("mic-button");
  const micIcon = micButton?.querySelector("i");
  const languageSelect = document.getElementById("language-select");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-btn");
  const messagesContainer = document.getElementById("messages");

  const conversationRef = window.conversation || [];

  // ---------- UTILITIES ----------
  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  function findBotAvatar(node) {
    return node?.querySelector?.('img[src*="bot.jpg"], img[src*="bot.png"], img[src*="bot.svg"]');
  }

  function getBotTextContainer(node) {
    if (!findBotAvatar(node)) return null; // ✅ only bot rows
    const bubbles = node.querySelectorAll("div");
    if (!bubbles.length) return null;
    return bubbles[bubbles.length - 1]; // last div = bubble text
  }

  function renderInitialMessageFallback() {
    const row = document.createElement("div");
    row.className = "flex items-start gap-3";
    row.dataset.initial = "true";

    const avatar = document.createElement("img");
    avatar.src = "/static/images/bot.jpg";
    avatar.className = "w-10 h-10 rounded-full shadow";

    const msg = document.createElement("div");
    msg.className = "bg-gradient-to-r from-redbrand to-pink-600 text-white p-3 rounded-xl shadow max-w-[75%]";
    msg.textContent = "👋 Hi, I'm Epicare — your virtual health assistant. How can I help you today?";

    row.appendChild(avatar);
    row.appendChild(msg);
    messagesContainer.appendChild(row);
  }

  // ---------- BEST-VOICE TTS ----------
  let bestVoice = null;
  function cacheBestVoice() {
    const voices = window.speechSynthesis.getVoices();
    const preferred = [
      "Google UK English Female","Google US English",
      "Microsoft Aria Online","Microsoft Jenny Online","Microsoft Zira Desktop",
      "Samantha","Karen","Moira"
    ];
    bestVoice =
      voices.find((v) => preferred.some((n) => v.name.includes(n))) ||
      voices.find((v) => v.lang?.startsWith("en") && v.name?.toLowerCase().includes("female")) ||
      voices.find((v) => v.lang?.startsWith("en")) ||
      voices[0] || null;
  }

  function sanitizeTTS(text) {
    return (text || "")
      .replace(/([\u231A-\uDFFF])/g, "")
      .replace(/__FETCH_FROM_[A-Z]+__/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function speakText(text) {
    if (!window.speechSynthesis || !text) return;
    const synth = window.speechSynthesis;
    const clean = sanitizeTTS(text);
    if (!clean) return;

    const utter = new SpeechSynthesisUtterance(clean);
    utter.voice = bestVoice || null;
    utter.pitch = 1.1;
    utter.rate = 1.05;

    if (synth.speaking) synth.cancel();

    if (isiOS && !window._ttsPrimed) {
      const unlock = () => {
        synth.speak(new SpeechSynthesisUtterance(" "));
        window._ttsPrimed = true;
        document.body.removeEventListener("click", unlock);
      };
      document.body.addEventListener("click", unlock);
    }
    synth.speak(utter);
  }

  function initTTS(text) {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const tryLoad = (a = 0) => {
      const voices = synth.getVoices();
      if (voices.length > 0 || a > 5) {
        cacheBestVoice();
        speakText(text);
      } else {
        setTimeout(() => tryLoad(a + 1), 200);
      }
    };
    tryLoad();
  }
  window.initTTS = initTTS;

  // ---------- SPEECH RECOGNITION ----------
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;
  let micHasSpokenOnce = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      isListening = true;
      micButton?.classList?.add("recording", "text-red-500");
    };
    recognition.onend = () => {
      isListening = false;
      micButton?.classList?.remove("recording", "text-red-500");
    };
    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      isListening = false;
      micButton?.classList?.remove("recording", "text-red-500");
      alert("⚠ Speech recognition error. Try again.");
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        userInput.value = transcript;
        sendButton?.click?.();
      }
    };
  }

  async function ensureMicPermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch {
      alert("⚠ Please allow microphone access to use voice input.");
      return false;
    }
  }

  function toggleRecognition() {
    if (!recognition) {
      alert("⚠ Speech recognition not supported in this browser.");
      return;
    }
    if (!isListening) {
      ensureMicPermission().then((ok) => {
        if (ok) {
          recognition.start();
          if (!micHasSpokenOnce) {
            initTTS("Listening"); // ✅ only first click
            micHasSpokenOnce = true;
          }
        }
      });
    } else {
      recognition.stop();
    }
  }

  micButton?.addEventListener("click", (e) => { e.preventDefault(); toggleRecognition(); });
  micIcon?.addEventListener("click", (e) => { e.preventDefault(); toggleRecognition(); });

  // ---------- BOT TTS ----------
  const speakTimers = new WeakMap();
  const spokenLengths = new WeakMap();

  function scheduleSpeakForBotRow(rowEl) {
    const textEl = getBotTextContainer(rowEl);
    if (!textEl) return;
    const currentLen = (textEl.textContent || "").trim().length;
    const lastLen = spokenLengths.get(textEl) || 0;
    if (currentLen <= lastLen) return;

    spokenLengths.set(textEl, currentLen);
    clearTimeout(speakTimers.get(textEl));

    const t = setTimeout(() => {
      const finalText = (textEl.textContent || "").trim();
      if (finalText) initTTS(finalText);
    }, 400);
    speakTimers.set(textEl, t);
  }

  const botSpeakObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes?.forEach?.((node) => {
        if (node.nodeType === 1 && findBotAvatar(node)) {
          scheduleSpeakForBotRow(node);
        }
      });
      if (m.type === "characterData" || m.type === "childList") {
        const row = m.target?.closest?.(".flex.items-start, .flex");
        if (row && findBotAvatar(row)) {
          scheduleSpeakForBotRow(row);
        }
      }
    }
  });
  botSpeakObserver.observe(messagesContainer, { childList: true, subtree: true, characterData: true });

  // ---------- CLEAR CHAT ----------
  function wireOrCreateClearButton() {
    let clearBtn = document.getElementById("clear-chat");
    if (!clearBtn) {
      clearBtn = document.createElement("button");
      clearBtn.id = "clear-chat";
      clearBtn.textContent = "Clear Chat";
      clearBtn.className =
        "absolute bottom-2 right-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm shadow hidden";
      messagesContainer.parentElement.style.position = "relative";
      messagesContainer.parentElement.appendChild(clearBtn);
    }

    function showBtnIfNeeded() {
      const count = messagesContainer.children.length;
      const hasInitial = [...messagesContainer.children].some((c) => c.dataset?.initial === "true");
      if (count > (hasInitial ? 1 : 0)) clearBtn.classList.remove("hidden");
    }

    const revealObserver = new MutationObserver(() => showBtnIfNeeded());
    revealObserver.observe(messagesContainer, { childList: true });
    showBtnIfNeeded();

    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      let initialNode = [...messagesContainer.children].find((c) => c.dataset?.initial === "true");
      if (initialNode) {
        [...messagesContainer.children].forEach((c) => { if (c !== initialNode) c.remove(); });
      } else {
        messagesContainer.innerHTML = "";
        renderInitialMessageFallback();
      }
      if (Array.isArray(conversationRef)) conversationRef.length = 0;
      clearBtn.classList.add("hidden");
    });
  }

  wireOrCreateClearButton();
});
