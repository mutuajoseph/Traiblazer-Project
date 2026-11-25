"use strict";

// A small collection of reassurance messages for the feelings selector.
const feelingMessages = {
  kcse: {
    title: "The KCSE expectation pressure is exhausting.",
    body: "Your grades reflect how you took an exam on a particular morning, not your intrinsic human value. Take a pause; you don’t have to carry your family’s future on your shoulders right now.",
  },
  fog: {
    title: "Brain fog is a safety switch, not laziness.",
    body: "When your brain takes in too much information without enough rest, it stops absorbing data. Give your eyes a short break. Staring blankly at a page only deepens exhaustion.",
  },
  dorm: {
    title: "Boarding loneliness is real and painful.",
    body: "Being surrounded by other students yet feeling isolated is a common high school paradox. You are not broken for craving home and a little quiet safety.",
  },
  panic: {
    title: "Your heart is racing to protect you.",
    body: "Panic can feel terrifying. Try dropping your shoulders away from your ears and letting your belly soften. If this keeps happening, tell a trusted adult or counsellor.",
  },
  judgment: {
    title: "It can feel intimidating to ask an adult for help.",
    body: "It is understandable to worry about being judged. You deserve to be listened to without academic bias, and can choose someone who feels safe to you.",
  },
  numb: {
    title: "Numbness can be your mind asking for a pause.",
    body: "When stress stays high for a long time, it can be hard to feel much at all. You don’t have to force happiness right now. Just being present is enough.",
  },
};
const feelingPills = document.querySelectorAll(".feeling-pill");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackBody = document.getElementById("feedback-body");

// Update the supportive note and clearly mark the selected feeling.
feelingPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    feelingPills.forEach((item) => item.setAttribute("aria-pressed", "false"));
    pill.setAttribute("aria-pressed", "true");
    const message = feelingMessages[pill.dataset.feeling];
    feedbackTitle.textContent = message.title;
    feedbackBody.textContent = message.body;
  });
});

const spectrumLevels = {
  1: {
    title: "State 1: Normal Revision Tension",
    text: "You feel tired after 2 hours of calculus, but a 30-minute nap or conversation leaves you refreshed. Motivation returns with mild encouragement.",
  },
  2: {
    title: "State 2: Chronic Overload",
    text: "You wake up tired before dawn preps begin, feel irritable over small things, and find it harder to retain notes. Rest and talking to someone can help.",
  },
  3: {
    title: "State 3: Possible Burnout",
    text: "Ongoing numbness, morning nausea, or dreading school can be signs you need support. Consider speaking to a trusted adult or one of the helplines below.",
  },
};
const stressSlider = document.getElementById("stress-slider");
stressSlider.addEventListener("input", () => {
  const level = spectrumLevels[stressSlider.value];
  document.getElementById("spectrum-title").textContent = level.title;
  document.getElementById("spectrum-copy").textContent = level.text;
});

// Guide the breathing ring through a gentle 4–4–6 second rhythm.
const breathRing = document.getElementById("breath-ring");
const breathPhase = document.getElementById("breath-phase");
const breathCount = document.getElementById("breath-count");
const breathToggle = document.getElementById("breath-toggle");
const breathNote = document.getElementById("breath-note");
const breathPhases = [
  { name: "Breathe in", className: "is-inhale", seconds: 4 },
  { name: "Hold gently", className: "is-hold", seconds: 4 },
  { name: "Breathe out", className: "is-exhale", seconds: 6 },
];
let breathInterval = null;
let phaseIndex = 0;
let secondsLeft = 0;
let elapsedSeconds = 0;
function updateBreathDisplay() {
  breathPhase.textContent = breathPhases[phaseIndex].name;
  breathCount.textContent = `${secondsLeft}s`;
  breathRing.className = `breath-orbit ${breathPhases[phaseIndex].className}`;
}
function stopBreathing(resetMessage) {
  window.clearInterval(breathInterval);
  breathInterval = null;
  breathToggle.innerHTML =
    '<span aria-hidden="true">◌</span> Begin paced breathing';
  breathToggle.setAttribute("aria-pressed", "false");
  breathRing.className = "breath-orbit";
  breathPhase.textContent = "Ready?";
  breathCount.textContent = "Tap start";
  if (resetMessage)
    breathNote.textContent =
      "A gentle reminder: you can pause or stop at any time.";
}
function startBreathing() {
  phaseIndex = 0;
  secondsLeft = breathPhases[0].seconds;
  elapsedSeconds = 0;
  breathNote.textContent =
    "Follow the circle for one minute. Pause whenever you need.";
  breathToggle.innerHTML = "Pause breathing";
  breathToggle.setAttribute("aria-pressed", "true");
  updateBreathDisplay();
  breathInterval = window.setInterval(() => {
    elapsedSeconds += 1;
    secondsLeft -= 1;
    if (elapsedSeconds >= 60) {
      stopBreathing(false);
      breathNote.textContent =
        "You made space for a full minute. Take that calm with you.";
      return;
    }
    if (secondsLeft <= 0) {
      phaseIndex = (phaseIndex + 1) % breathPhases.length;
      secondsLeft = breathPhases[phaseIndex].seconds;
    }
    updateBreathDisplay();
  }, 1000);
}
breathToggle.addEventListener("click", () => {
  if (breathInterval) {
    stopBreathing(false);
    breathNote.textContent = "Paused. Restart whenever you feel ready.";
  } else {
    startBreathing();
  }
});
document
  .getElementById("breath-reset")
  .addEventListener("click", () => stopBreathing(true));

// The anonymous note form is a front-end demo; it does not send or store notes.
const noteDialog = document.getElementById("note-dialog");
const noteForm = document.getElementById("note-form");
const noteMessage = document.getElementById("note-message");
document.querySelectorAll("[data-open-note]").forEach((button) => {
  button.addEventListener("click", () => {
    noteForm.reset();
    document.getElementById("note-feedback").textContent = "";
    noteDialog.showModal();
    noteMessage.focus();
  });
});
document
  .querySelector(".dialog-close")
  .addEventListener("click", () => noteDialog.close());
document
  .querySelector(".dialog-cancel")
  .addEventListener("click", () => noteDialog.close());
noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  noteDialog.close();
  const toast = document.getElementById("toast");
  toast.textContent =
    "Thank you for sharing a little hope. This demo does not send or store notes.";
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 4200);
});

// A discreet exit control takes the visitor to a neutral search page.
document.getElementById("calm-link").addEventListener("click", () => {
  window.location.replace("https://www.google.com/");
});
