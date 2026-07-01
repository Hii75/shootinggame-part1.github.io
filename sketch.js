let player;
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;
let spawnTimer = 0;

function setup() {
  createCanvas(400, 600);
  player = new Player();
}

function draw() {
  background(20);

  if (gameOver) {
    // ゲームオーバー画面
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 20);
    textSize(18);
    text("Score: " + score, width / 2, height / 2 + 20);
    text("Click to Restart", width / 2, height / 2 + 60);
    return;
  }

  // スコア表示
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);

  // プレイヤーの更新と描画
  player.update();
  player.display();

  // 【調整】マウスを押しっぱなしにしている間、6フレームに1回自動で弾を発射（オート連射）
  if (mouseIsPressed && frameCount % 6 === 0) {
    bullets.push(new Bullet(player.x, player.y));
  }

  // ブロックを生成するタイマー（少しのんびり出てくるように変更）
  spawnTimer++;
  if (spawnTimer >= 50) { 
    enemies.push(new Enemy());
    spawnTimer = 0;
  }

  // 弾の更新と描画
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].display();

    if (bullets[i].isOffscreen()) {
      bullets.splice(i, 1);
    }
  }

  // 敵の更新と描画、および衝突判定
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    enemies[i].display();

    // プレイヤーとの衝突、または画面の一番下まで届いたらゲームオーバー
    if (enemies[i].hitsPlayer(player) || enemies[i].y > height) {
      gameOver = true;
    }

    // 弾との衝突判定
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (enemies[i].hitsBullet(bullets[j])) {
        enemies[i].hp--; 
        bullets.splice(j, 1); 

        if (enemies[i].hp <= 0) {
          score += 1; // 1ブロック撃破で1点
          enemies.splice(i, 1); 
        }
        break; 
      }
    }
  }
}

// ゲームオーバー時のリスタート用クリック判定
function mousePressed() {
  if (gameOver) {
    restartGame();
  }
}

function restartGame() {
  bullets = [];
  enemies = [];
  score = 0;
  gameOver = false;
  spawnTimer = 0;
  player = new Player();
}

// --- クラス定義 ---

class Player {
  constructor() {
    this.x = width / 2;
    this.y = height - 50;
    this.size = 30;
  }

  update() {
    this.x = constrain(mouseX, this.size / 2, width - this.size / 2);
  }

  display() {
    fill(0, 200, 255);
    noStroke();
    rectMode(CENTER);
    rect(this.x, this.y, this.size, this.size, 5);
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 10; // 【調整】弾の速度を少しアップして当てやすく
    this.size = 8;
  }

  update() {
    this.y -= this.speed;
  }

  display() {
    fill(255, 255, 0);
    noStroke();
    ellipse(this.x, this.y, this.size);
  }

  isOffscreen() {
    return this.y < 0;
  }
}

class Enemy {
  constructor() {
    this.size = random(35, 55);
    this.x = random(this.size / 2, width - this.size / 2);
    this.y = -this.size;
    
    // 【調整】落ちてくるスピードを「1〜2」のゆっくりに固定
    this.speed = random(1.0, 2.0);
    
    // 【調整】ブロックのHPを「1〜3」の低めに固定
    this.hp = floor(random(1, 4)); 
  }

  update() {
    this.y += this.speed;
  }

  display() {
    stroke(255);
    strokeWeight(2);
    fill(150, 50, 200); 
    rectMode(CENTER);
    rect(this.x, this.y, this.size, this.size, 4);

    fill(255);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text(this.hp, this.x, this.y);
  }

  hitsBullet(bullet) {
    let d = dist(this.x, this.y, bullet.x, bullet.y);
    return d < (this.size / 2 + bullet.size / 2);
  }

  hitsPlayer(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < (this.size / 2 + player.size / 2);
  }
}
