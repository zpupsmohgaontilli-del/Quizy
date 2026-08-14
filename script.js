// ==========================================
// 1. PASTE YOUR APPS SCRIPT URL HERE
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycby9ijHFBO9SbVTzijnZNRwDzshNpdQuoGhMHXEMndaPl4hXycg-hp_hU3qNZl8FMrqJyQ/exec".trim();

// Offline Fallback Questions (Ensures the app NEVER fails even if offline)
const fallbackQuestions = [
  { question: "महाराष्ट्राची राजधानी कोणती आहे?", answer: "मुंबई" },
  { question: "भारताचे राष्ट्रपती कोण आहेत?", answer: "द्रौपदी मुर्मू" },
  { question: "महाराष्ट्रातील सर्वात उंच शिखर कोणते आहे?", answer: "कलसुबाई (1646 मीटर)" },
  { question: "सूर्यमालेतील सर्वात मोठा ग्रह कोणता आहे?", answer: "गुरू (Jupiter)" }
];

let questionsList = [];
let currentQuestion = null;
let timerInterval = null;
let timeLeft = 60;
let streak = 0;
let isFlipped = false;

// ==========================================
// 2. BULLETPROOF DATA FETCHER
// ==========================================
async function loadQuestions() {
  const qElement = document.getElementById('question');
  
  // If user hasn't replaced placeholder URL yet
  if (!API_URL || API_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
    console.warn("Using offline fallback questions.");
    questionsList = fallbackQuestions;
    nextQuestion();
    return;
  }

  try {
    // Explicitly follow Google Script HTTP redirects
    const response = await fetch(API_URL, {
      method: "GET",
      mode: "cors",
      redirect: "follow",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      questionsList = data;
      nextQuestion();
    } else {
      console.warn("Sheet is empty, loading fallback questions.");
      questionsList = fallbackQuestions;
      nextQuestion();
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    // Graceful recovery: loads built-in questions so the class continues seamlessly
    questionsList = fallbackQuestions;
    nextQuestion();
  }
}

// ==========================================
// 3. TIMER SYSTEM
// ==========================================
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 60;
  updateTimerUI();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      const timerText = document.getElementById('timer-text');
      const app = document.getElementById('app');
      const avatar = document.getElementById('student-avatar');

      if (timerText) timerText.innerText = "0";
      if (app) {
        app.classList.add('shake');
        setTimeout(() => app.classList.remove('shake'), 500);
      }
      if (avatar) avatar.innerText = "🤯";
    }
  }, 1000);
}

function updateTimerUI() {
  const timerText = document.getElementById('timer-text');
  const timerBar = document.getElementById('timer-bar');
  
  if (timerText) timerText.innerText = timeLeft;
  if (timerBar) {
    const percentage = Math.max(0, (timeLeft / 60) * 100);
    timerBar.style.width = percentage + "%";

    if (percentage > 50) {
      timerBar.style.backgroundColor = "var(--accent)";
    } else if (percentage > 20) {
      timerBar.style.backgroundColor = "var(--warning)";
    } else {
      timerBar.style.backgroundColor = "var(--danger)";
    }
  }
}

// ==========================================
// 4. INTERACTIVE CARD FLIP & CONFETTI
// ==========================================
function flipCard() {
  if (!currentQuestion) return;
  
  const card = document.getElementById('card');
  const avatar = document.getElementById('student-avatar');

  if (card) {
    card.classList.toggle('is-flipped');
    isFlipped = card.classList.contains('is-flipped');
  }

  if (isFlipped) {
    if (avatar) {
      avatar.innerText = "🥳";
      avatar.classList.add('character-happy');
    }

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 }
      });
    }
  } else {
    if (avatar) {
      avatar.innerText = "🧑‍🎓";
      avatar.classList.remove('character-happy');
    }
  }
}

// ==========================================
// 5. NEXT QUESTION PICKER
// ==========================================
function nextQuestion() {
  if (!questionsList || questionsList.length === 0) return;

  if (isFlipped) {
    streak++;
    const streakElem = document.getElementById('streak');
    if (streakElem) streakElem.innerText = streak;
  }

  const card = document.getElementById('card');
  const avatar = document.getElementById('student-avatar');

  if (card) card.classList.remove('is-flipped');
  if (avatar) {
    avatar.innerText = "🤔";
    avatar.classList.remove('character-happy');
  }
  isFlipped = false;

  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * questionsList.length);
    currentQuestion = questionsList[randomIndex];

    const qElem = document.getElementById('question');
    const aElem = document.getElementById('answer');

    if (qElem) qElem.innerText = currentQuestion.question;
    if (aElem) aElem.innerText = currentQuestion.answer;

    if (avatar) avatar.innerText = "🧑‍🎓";
    startTimer();
  }, 250);
}

// Initialize
loadQuestions();
