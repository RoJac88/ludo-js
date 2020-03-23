class Game {
  constructor(page) {
    this.ctx = page.canvas.getContext('2d');
  };
};

export class Token {
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
      this.itinerary = [];
      this.callback = () => null;
      tokens[color].push(this);
      gameObjects.push(this);
    }
  };
  canMove(n) {
    let r = true;
    if (sixCount >= 3) {
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
  walkSteps(n) {
    let hasFinished = false;
    const step = n / Math.abs(n);
    for (let i = step; Math.abs(i) <= Math.abs(n); i += step) {
      let target = [];
      const s = this.steps;
      if (s + i >= this.path.length) {
        target = getTokenEndPosition(this.color, this.index);
        hasFinished = true;
      } else {
        const sqId = this.path[s + i];
        target = getSquarePosition(sqId);
      }
      this.itinerary.push([...target, step]);
    }
    if (hasFinished) {
      this.finished = true;
      this.player.score += 1;
      this.shrinking = true;
      this.player.redrawScore();
    }
  };
  move() {
    if (this.shrinking) {
      this.size -= 0.1;
      if (this.size < 5) {
        this.size = 5;
        this.shrinking = false;
      }
    }
    if (this.itinerary.length > 0) {
      this.target = this.itinerary[0];
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
          const move = this.itinerary.shift();
          if (move[2]) {
            this.steps += move[2];
          } else {
            this.steps += 1;
          }
          if (this.itinerary.length === 0) {
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
  };
  reset() {
    if (this.steps >= 0) {
      this.callback = () => {
        this.steps = -1;
        this.callback = () => null;
      }
      this.itinerary.push(getTokenStartPosition(this.color, this.index));
    }
  };
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
    } /* else {
      ctx.fillStyle = 'white';
      if (this.color === 'yellow') {
        ctx.fillStyle = 'black';
      }
      ctx.font = '12px Helvetica';
      ctx.fillText((this.steps), this.x-5, this.y+6);
    } */
  };
};

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
  };
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
  };
  hasTokensHome() {
    let r = false;
    this.tokens.forEach((t) => {
      if (t.steps == -1) {
        r = true;
      }
    })
    return r;
  };
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
          const sqSixBonus = (s * safety / 10);
          const previousDs = tokensInRange(_token);
          if (previousDs.length > 0) {
            previousDs.forEach((distance) => {
              score += baseDistanceBonus;
              score += (7 - distance) * safety;
            })
          }
          if (s === 5 && this.hasTokensHome()) {
            score += 1 * safety; // vacate sq6 bonus
          }
          if (s === -1) {
            score += baseDistanceBonus * 3; // exit home bonus
          }
          if (s <= 52 && s + d > 52) {
            score += baseDistanceBonus; 
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
                  score -= baseDistanceBonus + sqSixBonus;
                }
                if (p.color === 'yelow' && oldSq === '19') {
                  score -= baseDistanceBonus + sqSixBonus;
                }
                if (p.color === 'blue' && oldSq === '32') {
                  score -= baseDistanceBonus + sqSixBonus;
                }
                if (p.color === 'red' && oldSq === '45') {
                  score -= baseDistanceBonus + sqSixBonus;
                }
              }
            });
          }
          _token.steps += d; // Simulate token movement.
          const victim = checkKill(_token);
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
                score -= baseDistanceBonus + sqSixBonus;
              }
              if (p.color === 'yelow' && newSq === '19') {
                score -= baseDistanceBonus + sqSixBonus;
              }
              if (p.color === 'blue' && newSq === '32') {
                score -= baseDistanceBonus + sqSixBonus;
              }
              if (p.color === 'red' && newSq === '45') {
                score -= baseDistanceBonus + sqSixBonus;
              }
            }
          });
          const nextDs = tokensInRange(_token);
          if (nextDs.length > 0) {
            nextDs.forEach((distance) => {
              score -= baseDistanceBonus;
              score -= (7 - distance) * safety;
            });
          }
          moveScores.push({
            'id': id,
            'num': _token.index + 1,
            'score': score,
            'steps': s
          });
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
  };
};