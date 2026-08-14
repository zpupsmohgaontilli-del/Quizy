const API_URL = "https://script.google.com/macros/s/AKfycby9ijHFBO9SbVTzijnZNRwDzshNpdQuoGhMHXEMndaPl4hXycg-hp_hU3qNZl8FMrqJyQ/exec";
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
      document.getElementById('question').innerText = "कोणतेही प्रश्न सापडले नाहीत. कृपया Google Sheet तपासा.";
    }
  } catch (error) {
    document.getElementById('question').innerText = "डेटा लोड करताना त्रुटी आली! API URL तपासा.";
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
      if (avatar) avatar.innerText = "🤯";
      
      setTimeout(() => document.getElementById('app').classList.remove('shake'), 500);
    }
  }, 1000);
}

function updateTimerUI() {
  const timerText = document.getElementById('timer-text');
  const timerBar = document.getElementById('timer-bar');
  
  if (timerText) timerText.innerText = timeLeft;
  if (timerBar) {
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
}

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

function nextQuestion() {
  if (questionsList.length === 0) return;

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

    document.getElementById('question').innerText = currentQuestion.question;
    document.getElementById('answer').innerText = currentQuestion.answer;

    if (avatar) avatar.innerText = "🧑‍🎓";
    startTimer();
  }, 250);
}

// Initial fetch on page load
async function loadQuestions() {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      mode: "cors",
      redirect: "follow"
    });
    
    questionsList = await response.json();
    
    if (questionsList.length > 0) {
      nextQuestion();
    } else {
      document.getElementById('question').innerText = "कोणतेही प्रश्न सापडले नाहीत. कृपया Google Sheet तपासा.";
    }
  } catch (error) {
    document.getElementById('question').innerText = "डेटा लोड करताना त्रुटी आली! API URL तपासा.";
    console.error("Fetch Error:", error);
  }
}
