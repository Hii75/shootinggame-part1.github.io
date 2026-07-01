let screws = [];
let planks = [];
let holes = [];
let screwStock = 0; // 手持ちのねじの数

let currentStage = 1;
let maxStages = 3;
let stageCleared = false;

function setup() {
  createCanvas(400, 600);
  loadStage(currentStage);
}

function draw() {
  background(40);
  
  // UIの表示
  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text("Stage: " + currentStage, 15, 15);
  
  // 所持ねじの数を視覚的に表示
  text("Screws:", 15, 45);
  for(let i=0; i<screwStock; i++) {
    fill(230, 190, 60);
    ellipse(100 + i*20, 53, 14);
  }

  // すべての板が落ちたかチェック
  if (!stageCleared && checkStageClear()) {
    stageCleared = true;
  }

  // ステージクリア画面
  if (stageCleared) {
    fill(0, 0, 0, 150);
    rectMode(CORNER);
    rect(0, 0, width, height);
    
    fill(255);
    textAlign(CENTER, CENTER);
    if (currentStage < maxStages) {
      textSize(32);
      text("STAGE CLEARED!", width / 2, height / 2 - 20);
      textSize(18);
      text("Click to Next Stage", width / 2, height / 2 + 30);
    } else {
      textSize(36);
      fill(255, 215, 0);
      text("ALL STAGES CLEAR!!", width / 2, height / 2);
    }
    return;
  }

  // ねじ穴の描画
  for (let h of holes) {
    h.display();
  }

  // 板の更新と描画
  for (let plank of planks) {
    plank.update(screws);
    plank.display();
  }

  // ねじの描画
  for (let screw of screws) {
    screw.display();
  }
}

// すべての板が画面下に落ちたかを判定する関数
function checkStageClear() {
  if (planks.length === 0) return false;
  for (let plank of planks) {
    // 板の両端が画面より下に行っていない場合はクリアではない
    if (plank.y1 < height || plank.y2 < height) {
      return false;
    }
  }
  return true;
}

// クリック時の処理
function mousePressed() {
  if (stageCleared) {
    if (currentStage < maxStages) {
      currentStage++;
      loadStage(currentStage);
    }
    return;
  }

  // 1. まず刺さっているねじのクリック判定（引き抜く）
  for (let i = screws.length - 1; i >= 0; i--) {
    if (screws[i].isClicked(mouseX, mouseY)) {
      // ねじを消してストックを増やす
      screws.splice(i, 1);
      screwStock++;
      return; // 1回のアクションで1つだけ
    }
  }

  // 2. 手持ちにねじがある場合、空いている穴のクリック判定（ハメる）
  if (screwStock > 0) {
    for (let h of holes) {
      if (h.isClicked(mouseX, mouseY)) {
        // すでにそこにねじがないかチェック
        let alreadyHasScrew = screws.some(s => dist(s.x, s.y, h.x, h.y) < 5);
        if (!alreadyHasScrew) {
          screws.push(new Screw(h.x, h.y, h.id));
          screwStock--;
          return;
        }
      }
    }
  }
}

// --- ステージ生成 ---
function loadStage(stageNum) {
  screws = [];
  planks = [];
  holes = [];
  screwStock = 0;
  stageCleared = false;

  if (stageNum === 1) {
    // 【ステージ1: 基本のおさらい】
    // 穴の配置
    holes.push(new Hole(120, 200, 1));
    holes.push(new Hole(280, 200, 2));
    holes.push(new Hole(200, 350, 3));
    holes.push(new Hole(200, 450, 4)); // 空の予備穴
    
    // 初期ねじ（穴1, 2, 3に刺さっている）
    screws.push(new Screw(120, 200, 1));
    screws.push(new Screw(280, 200, 2));
    screws.push(new Screw(200, 350, 3));

    // 板(初期X1, 初期Y1, 初期X2, 初期Y2, 依存する穴ID1, 依存する穴ID2)
    planks.push(new Plank(120, 200, 280, 200, 1, 2));
    planks.push(new Plank(200, 350, 200, 450, 3, null)); // 下の穴は最初空いている
    
  } else if (stageNum === 2) {
    // 【ステージ2: T字の連動（片方を外すと回転してもう片方に引っかかる）】
    holes.push(new Hole(100, 250, 1));
    holes.push(new Hole(300, 250, 2));
    holes.push(new Hole(200, 150, 3)); // 中央上の穴
    holes.push(new Hole(200, 350, 4)); // 中央下の予備穴
    
    screws.push(new Screw(100, 250, 1));
    screws.push(new Screw(300, 250, 2));

    // クロスする2つの板
    planks.push(new Plank(100, 250, 300, 250, 1, 2));
    planks.push(new Plank(200, 150, 200, 350, null, null)); // この板はねじをハメないと落ちない
    screwStock = 1; // 最初から1個ねじを持った状態
    
  } else if (stageNum === 3) {
    // 【ステージ3: パズル（ねじの数が足りない！）】
    holes.push(new Hole(80, 200, 1));
    holes.push(new Hole(200, 200, 2));
    holes.push(new Hole(320, 200, 3));
    holes.push(new Hole(140, 350, 4));
    holes.push(new Hole(260, 350, 5));

    // 穴は5つあるが、ねじは2つだけ！
    screws.push(new Screw(80, 200, 1));
    screws.push(new Screw(320, 200, 3));

    // 3枚の板が重なり合っているイメージ
    planks.push(new Plank(80, 200, 200, 200, 1, 2));
    planks.push(new Plank(200, 200, 320, 200, 2, 3));
    planks.push(new Plank(140, 350, 260, 350, 4, 5));
  }
}

// --- クラス定義 ---

// ねじ穴クラス
class Hole {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.size = 20;
  }
  display() {
    fill(20);
    stroke(80);
    strokeWeight(2);
    ellipse(this.x, this.y, this.size);
  }
  isClicked(mx, my) {
    return dist(mx, my, this.x, this.y) < this.size / 2 + 5;
  }
}

// ねじクラス
class Screw {
  constructor(x, y, holeId) {
    this.x = x;
    this.y = y;
    this.holeId = holeId; // どの穴に刺さっているか
    this.size = 24;
  }
  display() {
    stroke(130, 100, 30);
    strokeWeight(2);
    fill(230, 190, 60); 
    ellipse(this.x, this.y, this.size);
    stroke(100, 80, 20);
    line(this.x - 5, this.y, this.x + 5, this.y);
    line(this.x, this.y - 5, this.x, this.y + 5);
  }
  isClicked(mx, my) {
    return dist(mx, my, this.x, this.y) < this.size / 2;
  }
}

// 板クラス
class Plank {
  constructor(x1, y1, x2, y2, h1, h2) {
    this.h1 = h1; // 結合する穴のID1
    this.h2 = h2; // 結合する穴のID2
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.w = 26; 
    this.angle = 0;
    this.fallSpeed = 0;
    this.initialLen = dist(x1, y1, x2, y2);
  }

  update(screws) {
    // 現在この板の穴の位置にねじがあるかリアルタイムチェック
    let screw1 = screws.find(s => s.x === this.x1 && s.y === this.y1);
    let screw2 = screws.find(s => s.x === this.x2 && s.y === this.y2);

    // ハメ直しに対応するため、板の近くにあるねじを検知する
    if (!screw1) screw1 = screws.find(s => dist(s.x, s.y, this.x1, this.y1) < 15);
    if (!screw2) screw2 = screws.find(s => dist(s.x, s.y, this.x2, this.y2) < 15);

    if (screw1 && screw2) {
      // 両方固定
      this.x1 = screw1.x;
      this.y1 = screw1.y;
      this.x2 = screw2.x;
      this.y2 = screw2.y;
      this.fallSpeed = 0;
    } 
    else if (screw1 && !screw2) {
      // ねじ1のみ固定（ねじ1を中心に下へ回転）
      this.x1 = screw1.x;
      this.y1 = screw1.y;
      let targetAngle = HALF_PI; 
      this.angle = lerp(this.angle, targetAngle, 0.1);
      this.x2 = this.x1 + cos(this.angle) * this.initialLen;
      this.y2 = this.y1 + sin(this.angle) * this.initialLen;
    } 
    else if (!screw1 && screw2) {
      // ねじ2のみ固定（ねじ2を中心に下へ回転）
      this.x2 = screw2.x;
      this.y2 = screw2.y;
      let targetAngle = HALF_PI;
      this.angle = lerp(this.angle, targetAngle, 0.1);
      this.x1 = this.x2 - cos(this.angle) * this.initialLen;
      this.y1 = this.y2 + sin(this.angle) * this.initialLen;
    } 
    else {
      // 自由落下
      this.fallSpeed += 0.4;
      this.y1 += this.fallSpeed;
      this.y2 += this.fallSpeed;
    }
  }

  display() {
    stroke(100);
    fill(100, 150, 245, 200); 
    strokeWeight(this.w);
    strokeCap(ROUND);
    line(this.x1, this.y1, this.x2, this.y2);
    
    // 板の両端の穴の位置を分かりやすく描画
    strokeWeight(1);
    fill(255, 100);
    ellipse(this.x1, this.y1, 10);
    ellipse(this.x2, this.y2, 10);
  }
}
