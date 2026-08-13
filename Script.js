const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";

let questionsList = [];
let currentQuestion = null;
let timerInterval = null;
let timeLeft = 60;
let streak = 0;
let isFlipped = false;

async function loadQuestions() {
  try {
    const response = await fetch(API_URL);
    questionsList = await response.json();
    if (questionsList.length > 0) {
      nextQuestion();
    } else {
      document.getElementById('question').innerText = "कोणतेही प्रश्न सापडले नाहीत.";
    }
  } catch (error) {
    document.getElementById('question').innerText = "कनेक्शन एरर! कृपया URL तपासा.";
    console.error(error);
  }
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 60;
  updateTimerUI();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById('timer-text').innerText = "0";
      document.getElementById('app').classList.add('shake');
      
      const avatar = document.getElementById('student-avatar');
      avatar.innerText = "🤯";
      
      setTimeout(() => document.getElementById('app').classList.remove('shake'), 500);
    }
  }, 1000);
}

function updateTimerUI() {
  const timerText = document.getElementById('timer-text');
  const timerBar = document.getElementById('timer-bar');
  
  timerText.innerText = timeLeft;
  const percentage = (timeLeft / 60) * 100;
  timerBar.style.width = percentage + "%";

  if (percentage > 50) {
    timerBar.style.backgroundColor = "var(--accent)";
  } else if (percentage > 20) {
    timerBar.style.backgroundColor = "var(--warning)";
  } else {
    timerBar.style.backgroundColor = "var(--danger)";
  }
}

function flipCard() {
  if (!currentQuestion) return;
  
  const card = document.getElementById('card');
  const avatar = document.getElementById('student-avatar');

  card.classList.toggle('is-flipped');
  isFlipped = card.classList.contains('is-flipped');

  if (isFlipped) {
    avatar.innerText = "🥳";
    avatar.classList.add('character-happy');

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 }
    });
  } else {
    avatar.innerText = "🧑‍🎓";
    avatar.classList.remove('character-happy');
  }
}

function nextQuestion() {
  if (questionsList.length === 0) return;

  if (isFlipped) {
    streak++;
    document.getElementById('streak').innerText = streak;
  }

  const card = document.getElementById('card');
  const avatar = document.getElementById('student-avatar');

  card.classList.remove('is-flipped');
  avatar.innerText = "🤔";
  avatar.classList.remove('character-happy');
  isFlipped = false;

  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * questionsList.length);
    currentQuestion = questionsList[randomIndex];

    document.getElementById('question').innerText = currentQuestion.question;
    document.getElementById('answer').innerText = currentQuestion.answer;

    avatar.innerText = "🧑‍🎓";
    startTimer();
  }, 250);
}

loadQuestions();
