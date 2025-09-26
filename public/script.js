let sequence = [];
let score = 0;
let timerInterval;
let config = {};

document.getElementById('play-btn').onclick = startGame;
document.getElementById('hide-btn').onclick = hideNumber;
document.getElementById('recall-btn').onclick = checkRecall;
document.getElementById('result-screen').onclick = nextRound;
document.getElementById('clear-score').onclick = clearScore;

window.onload = function () {
  const sliders = {};
  const sliderConfig = {
    'seq-length': { min: 2, max: 8, step: 1, value: 5, unit: ' digit' },
    'timer': { min: 1, max: 10, step: 1, value: 5, unit: 's' },
    'length-change': { min: 0, max: 3, step: 1, value: 1, unit: ' digit' },
    'timer-change': { min: 0, max: 50, step: 10, value: 20, unit: '%' }
  };

  const wrappers = document.getElementsByClassName('slider-wrapper');
  Array.from(wrappers).forEach(wrapper => {
    const variableName = wrapper.getAttribute('data-var');
    const config = sliderConfig[variableName];

    const slider = document.createElement("input");
    slider.type = 'range';
    slider.min = config.min;
    slider.max = config.max;
    slider.step = config.step;
    slider.value = config.value;

    const output = document.createElement("span");
    output.className = 'demo';
    output.innerHTML = slider.value + config.unit;

    wrapper.appendChild(slider);
    wrapper.appendChild(output);

    sliders[variableName] = slider.value;

    slider.oninput = function () {
      output.innerHTML = this.value + config.unit;
      sliders[variableName] = this.value;
      console.log(`${variableName}: ${this.value}`);
    };
  });

  window.sliderValues = sliders;

  loadLeaderboard();
};

  



function clearScore() {
  clearInterval(timerInterval);  
  score = 0;
  sequence = [];// reset the game state 
  renderScore();
  showScreen('start-screen'); //Go back to home page    
}



function loadLeaderboard() {
  fetch('/leaderboard')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('leaderboard-list');
      list.innerHTML = '';

      if (data.length === 0) {
        list.innerHTML = '<li>No scores yet.</li>';
        return;
      }

      data.forEach((entry) => {
        const li = document.createElement('li');
        li.textContent = `${entry.username} - ${entry.score} pts`; 
        list.appendChild(li);
      });
    });
}

  

function startGame() {
  config = {
    username: document.getElementById('username').value,
    seqLength: parseInt(window.sliderValues['seq-length']),
    timer: parseInt(window.sliderValues['timer']),
    lengthChange: parseInt(window.sliderValues['length-change']),
    timerChange: parseInt(window.sliderValues['timer-change']),
  };
  

  sequence = generateSequence(config.seqLength);
  score = 0;
  showScreen('display-screen');
  renderScore();
  document.getElementById('sequence-display').innerText = sequence.join('');
  startTimer(config.timer, document.getElementById('timer'), () => hideNumber());
}

function generateSequence(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10));
}

function hideNumber() {
  showScreen('recall-screen');
  document.getElementById('recall-input').value = '';
  startTimer(config.timer, document.getElementById('timer-recall'), () => checkRecall());
}

function checkRecall() {
  let input = document.getElementById('recall-input').value;
  if (input === sequence.join('')) {
    score++;
    config.seqLength += config.lengthChange;
    config.timer = Math.max(1, config.timer - Math.floor(config.timerChange / 10));
    displayResult(true);
   } else {
    score = Math.max(0, score - 1);
    displayGameOver();
  }

}

function displayResult(isCorrect) {
  clearInterval(timerInterval);
  showScreen('result-screen');
  const msg = document.getElementById('result-msg');
  msg.innerText = isCorrect ? 'Correct!' : 'Incorrect!';
  msg.style.color = isCorrect ? 'green' : 'red';
  renderScore();

  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: config.username, score }),
  });
  loadLeaderboard(); //update the leaderboard

}

function nextRound() {
  sequence = generateSequence(config.seqLength);
  showScreen('display-screen');
  document.getElementById('sequence-display').innerText = sequence.join('');
  startTimer(config.timer, document.getElementById('timer'), () => hideNumber());
}

function renderScore() {
  document.getElementById('score').innerText = `${score} pts`;
  document.getElementById('score-recall').innerText = `${score} pts`;
}

function startTimer(duration, displayElem, callback) {
  let time = duration;
  clearInterval(timerInterval);
  displayElem.innerText = `${time}s`;
  timerInterval = setInterval(() => {
    time--;
    displayElem.innerText = `${time}s`;
    if (time <= 0) {
      clearInterval(timerInterval);
      callback();
    }
  }, 1000);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.add('active');
    screen.classList.remove('hidden');
  }
}
function displayGameOver() {
    clearInterval(timerInterval);
    showScreen('start-screen');
  }

