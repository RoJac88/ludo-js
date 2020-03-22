let turn = 0;
let players = [];
let currentPlayer = 0;
let status = "";
let gameDice = 0;
let diceRolling = true;
let tokens = {
  'green': [],
  'yellow': [],
  'red': [],
  'blue': []
};
let gameObjects = [];
let sixes = 0;
let enumSquares = false;
let drawDest = -1;
let form = [
  {
    name: '',
    color: ''
  },
  {
    name: '',
    color: ''
  },
  {
    name: '',
    color: ''
  },
  {
    name: '',
    color: ''
  }
]

function formValid() {
  let n_players = 0;
  let colors = {
    'red': 0,
    'green': 0,
    'blue': 0,
    'yellow': 0
  };
  form.forEach((p) => {
    if (p.name.length > 0) {
      n_players += 1;
      colors[p.color] += 1;
    }
  })
  if (n_players >= 2) {
    if (colors['red'] < 2 && colors['green'] < 2 && colors['blue'] < 2 && colors['yellow'] < 2) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function updateForm(i) {
  let pid = i + 1;
  let r = {
    name: '',
    color: ''
  }
  let name = document.getElementById(`p${pid}-name`);
  let color = document.getElementById(`p${pid}-color`);
  let button = document.getElementById('start'); 
  let head = document.getElementById(`p${pid}-h`);
  r.name = name.value;
  r.color = color.value;
  form[i] = r;
  button.disabled = !formValid();
  head.classList.remove('score-red', 'score-yellow', 'score-green', 'score-blue');
  head.classList.add(`score-${r.color}`);
}

function adjustCanvas() {
  const board = document.getElementsByClassName("board");
  const canvas = document.getElementById("gameBoard");
  canvas.style.left = board[0].offsetLeft+'px';
  canvas.style.top = board[0].offsetTop+'px';
  for (i = 0; i <= 3; i ++) {
    updateForm(i);
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function toggleSquares() {
  enumSquares = !enumSquares;
  const squares = [...document.getElementsByClassName("square")];
  squares.forEach((sq) => {
    let id = sq.id;
    if (enumSquares) {
      sq.innerText = id;
      sq.style.textAlign = 'center';
    } else {
      sq.innerText = '';
    }
  })
}

function updateStatus(message) {
  status = message;
  let el = document.getElementById('status');
  el.style.paddingLeft = '10px';
  el.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  el.style.borderLeft = '5px solid';
  el.style.borderRadius = '20px';
  el.style.borderColor = players[currentPlayer].color;
  el.innerText = message;
}

function checkKill(token) {
  let r = false;
  let otherTokens = gameObjects.map((el) => {
    if (el.color && el.color != token.color) {
      return el;
    } else {
      return null;
    }
  });
  otherTokens.forEach((t) => {
    if (t && t.steps >= 0) {
      if (token.path[token.steps] === t.path[t.steps] && !t.finished) {
        r = t;
      }
    }
  })
  return r;
}

function tokensInRange(token) {
  let distances = [];
  if (token.steps < 0) return distances;
  let _t = {...token};
  for (let i = 1; i < 7; i++) {
    _t.steps -= 1;
    if (_t.steps < -0) {
      _t.steps = 51;
    }
    let collision = checkKill(_t);
    if (collision && collision.steps + i <= 51) {
      distances.push(i);
      }
  }
  return distances;
}

function nextMove() {
  const diceButton = document.getElementById('roll');
  diceRolling = true;
  diceButton.disabled = false;
  if (gameDice !== 6) {
    currentPlayer += 1;
  } else {
    if (sixes >= 3) {
      currentPlayer += 1;
      sixes = 0;
    }
  }
  if (currentPlayer >= players.length) {
    currentPlayer = 0;
  }
  updateStatus(`${players[currentPlayer].name}, roll the dice!`);
  turn += 1;
  if (players[currentPlayer].bot) {
    let timeout;
    if (players[currentPlayer].name === 'RANDOM') {
      timeout = 600;
    } else {
      timeout = 1200;
    }
    setTimeout(() => {
      clickDice();
    }, timeout);
  }
}

function getSquarePosition(square) {
  const canvas = document.getElementById('gameBoard');
  const sq = document.getElementById(square);
  return [sq.offsetLeft - canvas.offsetLeft + 13, sq.offsetTop - canvas.offsetTop + 14]
}

function getTokenStartPosition(color, index) {
  const greens = [[48.5, 49], [143,49], [48.5,143], [143, 143]];
  const yellows = [[337, 49], [431, 49], [337, 143], [431, 143]];
  const reds = [[48.5, 336], [143,336], [48.5, 430], [143, 430]];
  const blues = [[337, 336], [431, 336], [337, 430], [431, 430]]; 
  switch (color) {
    case 'green':
      return greens[index];
    case 'yellow':
      return yellows[index];
    case 'red':
      return reds[index];
    case 'blue':
      return blues[index];
    default:
      throw new Error('No such color');
  }
}

function getTokenEndPosition(color, index) {
  const center = 480/2;
  const greens = [[center-30, center-15], [center-30,center-5], [center-30,center+5], [center-30, center+15]];
  const yellows = [[center-15, center-30], [center-5, center-30], [center+5, center-30], [center+15, center-30]];
  const reds = [[center-15, center+30], [center-5, center+30], [center+5, center+30], [center+15, center+30]];
  const blues = [[center+30, center-15], [center+30, center-5], [center+30, center+5], [center+30, center+15]]; 
  switch (color) {
    case 'green':
      return greens[index];
    case 'yellow':
      return yellows[index];
    case 'red':
      return reds[index];
    case 'blue':
      return blues[index];
    default:
      throw new Error('No such color');
  }
}

function getPath(color) {
  let result = [];
  switch (color) {
    case 'green':
      for (let  i = 1; i <= 52; i++) {
        result.push(i.toString());
      }
      result.push(result[0])
      for (let i = 1; i <= 5; i++) {
        result.push(`g${i.toString()}`);
      }
      return result;
    case 'yellow':
      for (let  i = 14; i <= 52; i++) {
        result.push(i.toString());
      }
      for (let i = 1; i <= 14; i++) {
        result.push(i.toString());
      }
      for (let i = 1; i <= 5; i++) {
        result.push(`y${i.toString()}`);
      }
      return result;
    case 'red':
      for (let  i = 40; i <= 52; i++) {
        result.push(i.toString());
      }
      for (let i = 1; i <= 40; i++) {
        result.push(i.toString());
      }
      for (let i = 1; i <= 5; i++) {
        result.push(`r${i.toString()}`);
      }
      return result;
    case 'blue':
      for (let  i = 27; i <= 52; i++) {
        result.push(i.toString());
      }
      for (let i = 1; i <= 27; i++) {
        result.push(i.toString());
      }
      for (let i = 1; i <= 5; i++) {
        result.push(`b${i.toString()}`);
      }
      return result;
    default:
      throw new Error('No such color');
  }
}

function openTokenSelection(n) {
  n += 1;
  const button = document.getElementById(`move-${n}`);
  button.disabled = false;
  button.style.display = 'block';
}

function updateMoveScore(score, color) {
  if (!color) {
    color = 'white';
  }
  const moveContainer = document.getElementsByClassName('move-score-container')[0];
  const moveTitle = document.getElementsByClassName('move-title')[0];
  const moveScore = document.getElementById('move-score');
  moveTitle.style.color = color;
  moveScore.innerText = score;
  moveContainer.style.borderColor = color;
  if (color === 'green') {
    moveContainer.style.backgroundColor = 'whitesmoke';
  } else {
    moveContainer.style.backgroundColor = 'rgba(8 ,8 ,8, 0)';
  }
  moveScore.style.color = color;
  if (moveContainer.style.display !== 'initial') {
    moveContainer.style.display = 'initial';
  }
}

function inputMove(i) {
  stopDrawDestination();
  let player = players[currentPlayer];
  player.tokens.forEach((token) => {
    token.showNumber = false;
  })
  let token = player.tokens[i];
  const movers = [...document.getElementsByClassName('mover')];
    movers.forEach((e) => {
      e.disabled = true;
      e.style.display = 'none';
    })
  token.callback = () => {
    let kill = checkKill(token);
    if (kill) {
      kill.reset();
    }
    nextMove();
    token.callback = () => null;
  }
  token.advanceSteps(gameDice);
}

function startDrawDestination(n) {
  drawDest = n;
}

function stopDrawDestination() {
  drawDest = -1;
}

function drawDice(n) {
  const diceElement = document.getElementById(`d${n}`);
  const diceElements = document.getElementsByClassName('d');
  [...diceElements].forEach((el) => {
    el.style.display = 'none';
  });
  diceElement.style.display = 'block';
}

function clickDice() {
  diceRolling = false;
  const button = document.getElementById('roll');
  button.disabled = true;
  if (players[currentPlayer].name === 'BEAST') {
    gameDice = 6;
    drawDice(6);
  }
  if (gameDice === 6) {
    sixes += 1
  } else {
    sixes = 0;
  }
  let noMoves = true;
  for (let i = 0; i <= 3; i++) {
    let token = players[currentPlayer].tokens[i];
    if (token.canMove(gameDice)) {
      openTokenSelection(i);
      noMoves = false;
      token.showNumber = true;
    }
  }
  if (noMoves) {
    updateStatus(`${players[currentPlayer].name} cannot move!`);
    setTimeout(() => {
      nextMove();
    }, 800);
  } else {
    updateStatus(`${players[currentPlayer].name}, select a token to move.`);
    if (players[currentPlayer].bot) {
      let timeout;
      let moveTokenButtons = [];
      let buttons = [...document.getElementsByClassName('mover')];
      buttons.forEach((b) => {
        if (b.style.display !== 'none') {
          moveTokenButtons.push(b);
        }
      })
    if (players[currentPlayer].name === 'RANDOM') {
      timeout = 600;
    } else {
      if (moveTokenButtons.length > 1) {
        timeout = 1000;
      } else {
        timeout = 800;
      }
    }
      setTimeout(() => {
        players[currentPlayer].pickToken();
      }, timeout);
    }
  }
}

function checkWin() {
  let r = false;
  players.forEach((p) => {
    if (p.score >= 4) {
      r = p;
    }
  })
  return r;
}

class Token {
  constructor(color, index, player) {
    if (tokens[color][index]) {
      return tokens[color][index];
    } else {
      this.player = player;
      this.steps = -1;
      this.path = getPath(color);
      this.color = color;
      this.index = index;
      this.showNumber = false;
      this.finished = false;
      this.size = 10;
      const position = getTokenStartPosition(color, index);
      this.x = position[0];
      this.y = position[1];
      this.target = [this.x, this.y];
      this.hspeed = 0;
      this.vspeed = 0;
      this.shrinking = false;
      this.itnerary = [];
      this.callback = () => null;
      tokens[color].push(this);
      gameObjects.push(this);
    }
  };
  canMove(n) {
    let r = true;
    if (sixes >= 3) {
      r = false;
    }
    if (this.steps < 0 && gameDice !== 6) {
      r = false;
    }
    if (this.finished) {
      r = false;
    }
    this.player.tokens.forEach((t) => {
      if (!t.finished && this.steps + n === t.steps) {
        r = false;
      }
    })
    return r;
  };
  advanceSteps(n) {
    let i = 1;
    let hasFinished = false;
    while (i <= n) {
      let target = [];
      if (this.steps + i >= this.path.length) {
        target = getTokenEndPosition(this.color, this.index);
        hasFinished = true;
      } else {
        let sqId = this.path[this.steps + i];
        target = [...getSquarePosition(sqId)];
      }
      this.itnerary.push(target);
      i++;
    }
    if (hasFinished) {
      this.finished = true;
      this.player.score += 1;
      this.shrinking = true;
      this.player.redrawScore();
    }
  }
  move() {
    if (this.shrinking) {
      this.size -= 0.1;
      if (this.size < 5) {
        this.size = 5;
        this.shrinking = false;
      }
    }
    if (this.itnerary.length > 0) {
      this.target = this.itnerary[0];
      if (this.target !== [this.x, this.y]) {
        if (this.hspeed === 0 && this.vspeed === 0) {
          this.hspeed = (this.target[0] - this.x) / 8;
          this.vspeed = (this.target[1] - this.y) / 8;
        }
        if (Math.abs(this.x - this.target[0]) <= Math.abs(this.hspeed)) {
          this.x = this.target[0];
          this.hspeed = 0;
        }
        if (Math.abs(this.y - this.target[1]) <= Math.abs(this.vspeed)) {
          this.y = this.target[1];
          this.vspeed = 0;
        }
        if (this.hspeed === 0 && this.vspeed === 0) {
          this.itnerary.shift();
          this.steps += 1;
          if (this.itnerary.length === 0) {
            this.callback();
          }
        }
        this.x += this.hspeed;
        this.y += this.vspeed;
      } else {
        this.hspeed = 0;
        this.vspeed = 0;
      }
    }
  }
  reset() {
    if (this.steps >= 0) {
      this.callback = () => {
        this.steps = -1;
        this.callback = () => null;
      }
      this.itnerary.push(getTokenStartPosition(this.color, this.index));
    }
  }
  draw(ctx) {
    ctx.strokeStyle = 'black';
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fill();
    if (players[currentPlayer].color === this.color && drawDest === this.index) {
      const d = gameDice;
      let p;
      let gSize = this.size;
      if ((this.steps + d < this.path.length)) {
        p = getSquarePosition(this.path[this.steps + d]);
      } else {
        p = getTokenEndPosition(this.color, this.index);
        gSize = this.size / 2;
      }
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(...p, gSize, 0, 2 * Math.PI);
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(...p);
      ctx.strokeStyle = 'silver';
      ctx.stroke();
    }
    if (this.showNumber) {
      ctx.fillStyle = 'white';
      if (this.color === 'yellow') {
        ctx.fillStyle = 'black';
      }
      ctx.font = '18px Helvetica';
      ctx.fillText((this.index+1), this.x-5, this.y+6);
    }
  }
}

class Player {
  constructor(name, color) {
    this.name = name;
    if (name === 'BOT' || name === 'HAL' || name === 'RANDOM') {
      this.bot = true;
      } else {
      this.bot = false;
    }
    this.color = color;
    this.score = 0;
    this.stepsWalked = -4;
    this.tokens = [];
    for (let i = 0; i <= 3; i++) {
      this.tokens.push(new Token(color, i, this));
    }
    const pid = document.createElement('div');
    pid.innerText = this.name + ': ';
    const points = document.createElement('span');
    points.id = `score-${this.color}`;
    points.innerText = this.score;
    pid.appendChild(points);
    pid.classList.add('socre', `score-${color}`);
    pid.id = 'p-'+this.color;
    pid.style.display = 'block';
    document.getElementById('players').appendChild(pid);
    players.push(this);
  }
  updateStepsWaled() {
    let n = 0;
    this.tokens.forEach((t) => {
      n += t.steps;
    })
    this.stepsWalked = n;
  }
  redrawScore() {
    const score = document.getElementById(`score-${this.color}`);
    score.innerText = this.score;
  }
  redrawTokens(c) {
    this.tokens.forEach((t) => {
      t.draw(c);
    })
  }
  hasTokensHome() {
    let r = false;
    this.tokens.forEach((t) => {
      if (t.steps == -1) {
        r = true;
      }
    })
    return r;
  }
  pickToken() {
    let moveTokenButtons = [];
    let buttons = [...document.getElementsByClassName('mover')];
    buttons.forEach((b) => {
      if (b.style.display !== 'none') {
        moveTokenButtons.push(b);
      }
    })
    let pick;
    if (this.name !== 'RANDOM') {
      const safety = 10;
      const killBonus = 300;
      const baseDistanceBonus = safety * 10;
      if (moveTokenButtons.length > 0) {
        let movableTokens = moveTokenButtons.map((b) => {
          let index = parseInt(b.id.charAt(5) - 1);
          let t = this.tokens[index];
          return t;
        })
        let moveScores = [];
        const d = gameDice;
        console.log(`Turn: ${turn}: ${this.color} rolls ${d}`);
        for (let id = 0; id < movableTokens.length; id++) {
          const _token = { ...movableTokens[id] };
          let score = 0;
          const s = _token.steps;
          const previousDs = tokensInRange(_token);
          if (previousDs.length > 0) {
            previousDs.forEach((distance) => {
              score += baseDistanceBonus;
              score += (7 - distance) * safety;
            })
          }
          if (s === 5) {
            score += 1 * safety; // vacate sq6 bonus
          }
          if (s === -1) {
            score += baseDistanceBonus * 3; // exit home bonus
          }
          if (s <= 52 && s + d > 52) {
            score += baseDistanceBonus * 3; // enter safe square bonus
          }
          if (s > 52) {
            score = (s - 52) * (safety * -1) + 1; // inside safe zone
          }
          const oldSq = _token.path[_token.steps];
          if (oldSq) {
            players.forEach((p) => {
              // Check if square six is dangerous.
              if (p.color !== _token.color && p.hasTokensHome()) {
                if (p.color === 'green' && oldSq === '6') {
                  score -= baseDistanceBonus + safety;
                }
                if (p.color === 'yelow' && oldSq === '19') {
                  score -= baseDistanceBonus + safety;
                }
                if (p.color === 'blue' && oldSq === '32') {
                  score -= baseDistanceBonus + safety;
                }
                if (p.color === 'red' && oldSq === '45') {
                  score -= baseDistanceBonus + safety;
                }
              }
            })
          }
          _token.steps += d; // Simulate token movement.
          let victim = checkKill(_token);
          if (victim) {
            if (victim.player.bot && victim.player.name !== 'RANDOM') {
              score -= victim.player.stepsWalked+4;
              score -= victim.steps/10;
              score -= killBonus*1.5;
            } else {
              score += victim.player.stepsWalked+4;
              score += victim.steps/10;
              score += killBonus;
            }
          }
          const newSq = _token.path[_token.steps];
          players.forEach((p) => {
            // Check if square six is dangerous.
            if (p.color !== _token.color && p.hasTokensHome()) {
              if (p.color === 'green' && newSq === '6') {
                score -= baseDistanceBonus + safety;
              }
              if (p.color === 'yelow' && newSq === '19') {
                score -= baseDistanceBonus + safety;
              }
              if (p.color === 'blue' && newSq === '32') {
                score -= baseDistanceBonus + safety;
              }
              if (p.color === 'red' && newSq === '45') {
                score -= baseDistanceBonus + safety;
              }
            }
          })
          const nextDs = tokensInRange(_token);
          if (nextDs.length > 0) {
            nextDs.forEach((distance) => {
              score -= baseDistanceBonus;
              score -= (7 - distance) * safety;
            })
          }
          moveScores.push({
            'id': id,
            'num': _token.index + 1,
            'score': score,
            'steps': s
          })
        }
        moveScores.sort((a, b) => {
          if (a.score < b.score) return 1;
          if (a.score > b.score) return -1;
          if (a.steps < b.steps) return 1;
          if (a.steps > b.steps) return -1;
          return 0;
        })
        pick = moveScores[0]['id'];
        const moveSc = moveScores[0].score;
        updateMoveScore(moveSc, this.color);
      }
    } else {
      pick = getRandomInt(0, moveTokenButtons.length-1);
    }
    moveTokenButtons[pick].classList.add('bot-select');
    let n = parseInt(moveTokenButtons[pick].id.charAt(5) - 1);
    startDrawDestination(n);
    let timeout;
    if (this.name === 'RANDOM') {
      timeout = 400;
    } else {
      if (moveTokenButtons.length > 1) {
        timeout = 2400;
      } else {
        timeout = 800;
      }
    }
    setTimeout(() => {
      moveTokenButtons[pick].classList.remove('bot-select');
      startDrawDestination(n);
      moveTokenButtons[pick].click();
    }, timeout);
  }
}

function formSubmit(e) {
  e.preventDefault();
  document.getElementById('game-form').style.display = 'none';
  startGame();
}

function startGame() {
  const canvas = document.getElementById("gameBoard");
  const ctx = canvas.getContext('2d');
  adjustCanvas();

  form.forEach((p) => {
    if (p.name.length > 0) {
      new Player(p.name, p.color);
    }
  });

  players.forEach((p) => {
    p.redrawScore();
  });

  updateStatus(`${players[currentPlayer].name}, roll the dice!`);

  function updateCanvas(c) {
    c.clearRect(0, 0, canvas.clientWidth, canvas.height);
    c.globalAlpha = 1;
    gameObjects.forEach((gameobj) => {
      gameobj.draw(c);
    });
  }

  function gameLoop() {
    gameObjects.forEach((gameObj) => {
      gameObj.move();
    });
    players.forEach((p) => {
      p.updateStepsWaled();
    });
    if (diceRolling) {
      gameDice = getRandomInt(1,6);
      drawDice(gameDice);
    }
    updateCanvas(ctx);
    const winner = checkWin();
    if (winner) {
      ctx.fillStyle = 'rgba(2, 2, 2, 0.6)';
      ctx.fillRect(60, 60, 350, 110);
      ctx.fillStyle = winner.color;
      ctx.font = '44px Helvetica';
      ctx.fontWeight = 'bolder';
      ctx.fillText(`${winner.name} wins!`, 65, 120, 335);
      diceRolling = false;
      gameDice = 0;
      drawDice(0);
      const diceButton = document.getElementById('roll');
      diceButton.disabled = true;
      currentPlayer = players.indexOf(winner);
      updateStatus(`${winner.name} wins!`);
    }
    players[currentPlayer].redrawTokens(ctx);
    requestAnimationFrame(gameLoop);
  }

  updateCanvas(ctx);
  gameLoop();

  if (players[currentPlayer].bot) {
    setTimeout(() => {
      clickDice();
    }, 800);
  }
}
