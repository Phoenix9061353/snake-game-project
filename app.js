const canvas = document.getElementById('myCanvas');
const btnStart = document.getElementById('start');
const markPause = document.getElementById('pause');
const ctx = canvas.getContext('2d');

////////////////////////////////////////////////////////
const unit = 20;
const row = canvas.height / unit;
const column = canvas.width / unit;

//初始設定
let snake = [];
const originSnake = function () {
  snake = [];
  snake[0] = { x: 80, y: 0 };
  snake[1] = { x: 60, y: 0 };
  snake[2] = { x: 40, y: 0 };
  snake[3] = { x: 20, y: 0 };
};
originSnake();
let direction = 'Right';
let score = 0;
let highestScore = localStorage.getItem('highestScore')
  ? Number(localStorage.getItem('highestScore'))
  : 0;
class Food {
  constructor() {
    this.x = Math.floor(Math.random() * column) * unit;
    this.y = Math.floor(Math.random() * row) * unit;
  }

  drawFood() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(this.x, this.y, unit, unit);
  }

  pickANewLocation() {
    let overlap = false;
    let new_x;
    let new_y;
    const checkOverlap = function (new_x, new_y) {
      for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === new_x && snake[i].y === new_y) {
          overlap = true;
          return;
        } else {
          overlap = false;
        }
      }
    };

    do {
      new_x = Math.floor(Math.random() * column) * unit;
      new_y = Math.floor(Math.random() * row) * unit;
      checkOverlap(new_x, new_y);
    } while (overlap);

    this.x = new_x;
    this.y = new_y;
  }
}
let myFood = new Food();
myFood.pickANewLocation();
let myGame;
let p = 0;

//鍵盤按鍵Event
const keyEvent = function (e) {
  if (!e.key.startsWith('Arrow') && e.key !== ' ' && e.key !== 's') return;
  if (e.key === ' ' && p !== 1) {
    clearInterval(myGame);
    p = 1;
    markPause.classList.remove('hidden');
    return;
  }
  if (e.key === 's' && p === 1) {
    clearInterval(myGame);
    myGame = setInterval(draw, 100);
    p = 0;
    markPause.classList.add('hidden');
    return;
  }
  //向左時不可向右，向右時不可向左，向下時不可向上，向上時不可向下
  if (p === 0) {
    if (direction !== 'Right' && e.key.substr(5) === 'Left') direction = 'Left';
    if (direction !== 'Left' && e.key.substr(5) === 'Right')
      direction = 'Right';
    if (direction !== 'Up' && e.key.substr(5) === 'Down') direction = 'Down';
    if (direction !== 'Down' && e.key.substr(5) === 'Up') direction = 'Up';
    //為了防止使用者按過快導致蛇的方向快速被轉變，移除此監聽
    window.removeEventListener('keydown', keyEvent);
  }
};
window.addEventListener('keydown', keyEvent);

//分數顯示
document.getElementById('myScore').innerHTML = '分數： ' + score;
document.getElementById('myScore2').innerHTML = '最高分數： ' + highestScore;

//畫出身體
const draw = function () {
  //確認有沒有咬到自己(頭與其他部位是否重疊)
  let body = snake.slice(1);
  const check = body.find((b) => b.x === snake[0].x && b.y === snake[0].y);
  if (check) {
    clearInterval(myGame);
    markPause.innerHTML = '遊戲結束';
    markPause.classList.remove('hidden');
    if (score > highestScore)
      localStorage.setItem('highestScore', JSON.stringify(score));
    return;
  }
  //回歸原始黑布
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //畫出Food
  myFood.drawFood();

  for (let i = 0; i < snake.length; i++) {
    //設定填滿用的顏色
    if (i === 0) {
      ctx.fillStyle = '#CA8EFF';
    } else {
      ctx.fillStyle = '#80FFFF';
    }
    //設定邊框線的顏色
    ctx.strokeStyle = 'white';

    //穿牆
    if (snake[i].x >= canvas.width) snake[i].x = 0;
    if (snake[i].x < 0) snake[i].x = canvas.width - unit;
    if (snake[i].y >= canvas.height) snake[i].y = 0;
    if (snake[i].y < 0) snake[i].y = canvas.height - unit;

    //畫出蛇身(x, y, width, height)
    ctx.fillRect(snake[i].x, snake[i].y, unit, unit);
    ctx.strokeRect(snake[i].x, snake[i].y, unit, unit);
  }
  //依direction決定接下來的頭的前進方向
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;
  if (direction === 'Right') snakeX += unit;
  if (direction === 'Left') snakeX -= unit;
  if (direction === 'Up') snakeY -= unit;
  if (direction === 'Down') snakeY += unit;

  let newHead = { x: snakeX, y: snakeY };

  //有吃到 -> 不 pop，unshift；沒吃到 -> pop + unshift
  if (snakeX === myFood.x && snakeY === myFood.y) {
    myFood.pickANewLocation();
    score++;
    document.getElementById('myScore').innerHTML = '分數： ' + score;
    if (score > highestScore)
      document.getElementById('myScore2').innerHTML = '最高分數： ' + score;
  } else {
    snake.pop();
  }
  snake.unshift(newHead);

  //都確認好了，加回改方向的監聽事件
  window.addEventListener('keydown', keyEvent);
};

//用setInterval讓他畫出來(100ms)
myGame = setInterval(draw, 100);

//reload game
btnStart.addEventListener('click', () => {
  location.reload();
});
