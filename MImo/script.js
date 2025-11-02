document.addEventListener("DOMContentLoaded", () => {
  // --- Prevent running on upload.html ---
  const arenaCheck = document.querySelector(".game-container");
  if (!arenaCheck) return;

  // --- Core elements ---
  const timerBar = document.getElementById("timer-bar");
  const readyScreen = document.getElementById("ready-screen");
  const questionDisplay = document.getElementById("question-text");
  const scoreEls = document.querySelectorAll(".top-bar .score");
  const options = document.querySelectorAll(".option");
  const gameOver = document.getElementById("game-over");
  const title = document.getElementById("game-over-title");
  const summary = document.getElementById("game-over-summary");
  const playAgainBtn = document.getElementById("play-again");
  const backUploadBtn = document.getElementById("back-upload");

  // --- State ---
  let time = 10;
  let countdown = null;
  let p1Ready = false;
  let p2Ready = false;
  let qIndex = 0;
  let player1Health = 50;
  let player2Health = 50;
  let selectedAnswer = null;

  // --- Load questions from localStorage or fallback ---
  const stored = localStorage.getItem("generatedQuestions");
  const questions = stored
    ? JSON.parse(stored)
    : [
        {
          text: "Default Q1: Which shape has 3 sides?",
          options: ["Square", "Triangle", "Circle", "Star"],
          answer: "Triangle",
        },
        {
          text: "Default Q2: Which is round?",
          options: ["Square", "Triangle", "Circle", "Star"],
          answer: "Circle",
        },
      ];

  // === GAME FLOW ===
  function startGame() {
    readyScreen.style.display = "none";
    qIndex = 0;
    player1Health = 50;
    player2Health = 50;
    loadQuestion();
    startTimer();
  }

   function loadQuestion() {
    if (qIndex >= questions.length) {
      endGame();
      return;
    }
    const q = questions[qIndex];
    questionDisplay.textContent = q.text;
    options.forEach((btn, i) => {
      btn.textContent = q.options[i] || "N/A";
      btn.classList.remove("selected");
    });
    selectedAnswer = null;
  }

  function startTimer() {
    clearInterval(countdown);
    time = 10;
    timerBar.style.width = "100%";
    countdown = setInterval(() => {
      time -= 0.1;
      timerBar.style.width = `${Math.max(0, (time / 10) * 100)}%`;
      if (time <= 0) {
        clearInterval(countdown);
        evaluateAnswers();
        qIndex++;
        loadQuestion();
        startTimer();
      }
    }, 100);
  }

  function evaluateAnswers() {
    const correct = questions[qIndex].answer;
    if (selectedAnswer !== correct) {
      player1Health -= 10;
      animateDamage(scoreEls[0]);
    }
    scoreEls[0].textContent = player1Health;
    scoreEls[1].textContent = player2Health;
    if (player1Health <= 0 || player2Health <= 0) endGame();
  }

  function animateDamage(el) {
    el.classList.add("damaged");
    setTimeout(() => el.classList.remove("damaged"), 500);
  }

  // === FINAL GAME OVER SCREEN ===
  function endGame() {
    clearInterval(countdown);

    setTimeout(() => {
      let winnerText = "";
      if (player1Health > player2Health) winnerText = "🏆 Player 1 Wins!";
      else if (player2Health > player1Health) winnerText = "🏆 Player 2 Wins!";
      else winnerText = "🤝 It's a Tie!";

      title.textContent = winnerText;
      summary.textContent = `Final Health — Player 1: ${player1Health} | Player 2: ${player2Health}`;
      gameOver.classList.remove("hidden");
      document.querySelector(".game-container").style.filter = "blur(5px)";
    }, 400);
  }

  // === BUTTON EVENTS ===
  options.forEach((btn) => {
    btn.addEventListener("click", () => {
      options.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedAnswer = btn.textContent;
    });
  });

  const r1 = document.getElementById("ready-p1");
  const r2 = document.getElementById("ready-p2");

  if (r1)
    r1.addEventListener("click", () => {
      p1Ready = true;
      r1.disabled = true;
      r1.textContent = "✅ Ready!";
      checkReady();
    });

  if (r2)
    r2.addEventListener("click", () => {
      p2Ready = true;
      r2.disabled = true;
      r2.textContent = "✅ Ready!";
      checkReady();
    });

  function checkReady() {
    if (p1Ready && p2Ready) startGame();
  }

  // === GAME OVER BUTTONS ===
  if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => location.reload());
  }

  if (backUploadBtn) {
    backUploadBtn.addEventListener("click", () => {
      window.location.href = "upload.html";
    });
  }
});