
const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");


const CONFIG = {
  GRAVITY: 2000,
  JUMP_SPEED: 700,
  MOVE_SPEED: 240,
  MAX_JUMPS: 3,
  FALL_GRAVITY_RATE: 2,

  
  FLUTTER_DURATION: 0.5,       // 踏ん張り時間
  FLUTTER_SPEED: 250,          // 踏ん張り開始時の上昇力
  FLUTTER_GRAVITY_RATE: 0.25,  // 踏ん張り中の重力
};

const TARGET_HEIGHT = 64;

// プレイヤー
const player = {
  x: 80,
  y: 20,
  w: 32,
  h: 32,
  vy: 0,
  isGrounded: false,
  jumpsLeft: CONFIG.MAX_JUMPS,
  flutterTimer: 0
};

// 床
const floor = {
  x: 0,
  y: 320,
  w: 640,
  h: 40
};

// キー入力
const keys = {};

document.addEventListener("keydown", (e) => {
  // キーの長押しによる連続ジャンプを防ぐ
  if (keys[e.code]) return;

  keys[e.code] = true;

  // ジャンプ処理
  if (e.code === "Space" && player.jumpsLeft > 0) {

    if (player.jumpsLeft === CONFIG.MAX_JUMPS) {
      // 1回目：通常ジャンプ
      player.vy = -CONFIG.JUMP_SPEED;
    } else {
      // 2回目：踏ん張りジャンプ
      player.vy = -CONFIG.FLUTTER_SPEED;
      player.flutterTimer = CONFIG.FLUTTER_DURATION;
    }

    player.jumpsLeft--;
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// 床との衝突判定
function collideWithFloor() {
  if (player.y + player.h > floor.y) {
    player.y = floor.y - player.h;
    player.vy = 0;
    player.isGrounded = true;

    // ジャンプ回数を回復
    player.jumpsLeft = CONFIG.MAX_JUMPS;

    // 踏ん張り状態を解除
    player.flutterTimer = 0;

  } else {
    player.isGrounded = false;
  }
}

// 更新処理
function update(dt) {

  // 左右移動
  if (keys["ArrowRight"]) {
    player.x = player.x + CONFIG.MOVE_SPEED * dt;
  }

  if (keys["ArrowLeft"]) {
    player.x = player.x - CONFIG.MOVE_SPEED * dt;
  }

  // 踏ん張り時間を減らす
  if (player.flutterTimer > 0) {
    player.flutterTimer -= dt;
  }

  // 重力の計算
  let g;

  if (player.flutterTimer > 0) {
    // 踏ん張り中：重力を弱くする
    g = CONFIG.GRAVITY * CONFIG.FLUTTER_GRAVITY_RATE;

  } else {
    // 通常時：落下中なら重力を強くする
    g = player.vy > 0
      ? CONFIG.GRAVITY * CONFIG.FALL_GRAVITY_RATE
      : CONFIG.GRAVITY;
  }

  // 速度を更新
  player.vy = player.vy + g * dt;

  // 位置を更新
  player.y = player.y + player.vy * dt;

  // 床との衝突判定
  collideWithFloor();
}

// 描画処理
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 床
  ctx.fillStyle = "#203060";
  ctx.fillRect(floor.x, floor.y, floor.w, floor.h);

  // 目印の線
  ctx.fillStyle = "#ff6b6b";
  ctx.fillRect(
    0,
    floor.y - TARGET_HEIGHT,
    canvas.width,
    2
  );

  // プレイヤー
  if (player.flutterTimer > 0) {
    // 踏ん張り中はピンク色
    ctx.fillStyle = "#ff9ed0";
  } else {
    ctx.fillStyle = player.isGrounded
      ? "#7ef5e1"
      : "#ffd166";
  }

  ctx.fillRect(
    player.x,
    player.y,
    player.w,
    player.h
  );

  // 情報表示
  ctx.fillStyle = "#e8eeff";
  ctx.font = "14px monospace";

  ctx.fillText(
    "vy = " + player.vy.toFixed(0) +
    "   jumpsLeft = " + player.jumpsLeft,
    10,
    20
  );

  // 踏ん張り状態の表示
  if (player.flutterTimer > 0) {
    ctx.fillText("FLUTTER!", 10, 40);
  }
}

// ゲームループ
let last = performance.now();

function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.033);

  last = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
