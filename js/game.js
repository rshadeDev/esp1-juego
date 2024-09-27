const canvas = document.getElementById("fightArena");
const ctx = canvas.getContext("2d");

const player1Stats = JSON.parse(localStorage.getItem("j1Stats"));
const player2Stats = JSON.parse(localStorage.getItem("j2Stats"));
const player1Name = localStorage.getItem("j1Character");
const player2Name = localStorage.getItem("j2Character");


// Configuración de los personajes
const character1 = {
  x: 100,
  y: canvas.height - 200,
  width: 150,
  height: 200,
  speed: player1Stats.speed,
  image: new Image(),
  health: player1Stats.hp,
  maxHealth: player1Stats.hp,
  minDamage: player1Stats.minDamage,
  maxDamage: player1Stats.maxDamage,
  attackSpeed: player1Stats.attackSpeed,
  name: player1Name,
  lastAttackTime: 0,
  attackRange: 200
};

const character2 = {
  x: canvas.width - 250,
  y: canvas.height - 200,
  width: 150,
  height: 200,
  speed: player2Stats.speed,
  image: new Image(),
  health: player2Stats.hp,
  maxHealth: player2Stats.hp,
  minDamage: player2Stats.minDamage,
  maxDamage: player2Stats.maxDamage,
  attackSpeed: player2Stats.attackSpeed,
  name: player2Name,
  lastAttackTime: 0,
  attackRange: 200
};

character1.image.src = `images/sprites/${player1Name.toLowerCase().replace(' ', '-')}-sprite.jpg`;
character2.image.src = `images/sprites/${player2Name.toLowerCase().replace(' ', '-')}-sprite.jpg`;

character1.image.onload = () => drawPlayers();
character2.image.onload = () => drawPlayers();

const keys = {};

window.addEventListener("keydown", (event) => keys[event.key] = true);
window.addEventListener("keyup", (event) => keys[event.key] = false);

//Clase Musica
class GameMusic {
  constructor(audioPath, volume = 0.5, loop = true) {
    this.audio = new Audio(audioPath);
    this.audio.volume = volume;
    this.audio.loop = loop;
  }
  play() {
    this.audio.play();
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0; 
  }

  setVolume(volume) {
    this.audio.volume = volume;
  }
}

const gameMusic = new GameMusic('assets/MortalKumbiat.mp3', 1); 

document.getElementById("startGameBtn").addEventListener("click", () => {
  document.getElementById("startGameContainer").style.display = "none";

  gameMusic.play();

  gameLoop();
});

function movePlayers() {
  // Jugador 1 (W, A, S, D)
  if (keys["w"] && character1.y > 0) character1.y -= character1.speed;
  if (keys["s"] && character1.y < canvas.height - character1.height) character1.y += character1.speed;
  if (keys["a"] && character1.x > 0) character1.x -= character1.speed;
  if (keys["d"] && character1.x < canvas.width - character1.width) character1.x += character1.speed;

  // Jugador 2 (Flechas)
  if (keys["ArrowUp"] && character2.y > 0) character2.y -= character2.speed;
  if (keys["ArrowDown"] && character2.y < canvas.height - character2.height) character2.y += character2.speed;
  if (keys["ArrowLeft"] && character2.x > 0) character2.x -= character2.speed;
  if (keys["ArrowRight"] && character2.x < canvas.width - character2.width) character2.x += character2.speed;
}

function calculateDamage(minDamage, maxDamage) {
  return Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
}

function applyKnockback(attacker, defender) {
  const knockbackDistance = 30; 
  
  const dx = defender.x - attacker.x;
  const dy = defender.y - attacker.y;
  
  const angle = Math.atan2(dy, dx);  

  defender.x += Math.cos(angle) * knockbackDistance;
  defender.y += Math.sin(angle) * knockbackDistance;

  defender.x = Math.max(0, Math.min(canvas.width - defender.width, defender.x));
  defender.y = Math.max(0, Math.min(canvas.height - defender.height, defender.y));
}


function attack(attacker, defender) {
  const currentTime = Date.now();
  if (currentTime - attacker.lastAttackTime >= (1000 / attacker.attackSpeed)) {
    const damage = calculateDamage(attacker.minDamage, attacker.maxDamage);
    defender.health -= damage;
    if (defender.health < 0) defender.health = 0;

    applyKnockback(attacker, defender);

    attacker.lastAttackTime = currentTime;
    updateHealthBars();
    console.log(`${attacker.name} attacked ${defender.name} for ${damage} damage!`);
  }
}


function checkAttackRange(char1, char2) {
  const dx = char2.x - char1.x;
  const dy = char2.y - char1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= char1.attackRange;
}

function drawPlayers() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(character1.image, character1.x, character1.y, character1.width, character1.height);
  ctx.drawImage(character2.image, character2.x, character2.y, character2.width, character2.height);

  // Dibujar rango de ataque (opcional, para depuración)
  ctx.beginPath();
  ctx.arc(character1.x + character1.width / 2, character1.y + character1.height / 2, character1.attackRange, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(character2.x + character2.width / 2, character2.y + character2.height / 2, character2.attackRange, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)';
  ctx.stroke();
}

function updateHealthBars() {
  updateHealthBar("player1HealthBar", "player1HealthText", character1);
  updateHealthBar("player2HealthBar", "player2HealthText", character2);
}

function updateHealthBar(barId, textId, character) {
  const healthBar = document.getElementById(barId);
  const healthText = document.getElementById(textId);
  const healthPercentage = (character.health / character.maxHealth) * 100;
  healthBar.style.width = healthPercentage + "%";
  healthText.textContent = `${character.health}/${character.maxHealth}`;
}

function updatePlayerNames() {
  document.getElementById("player1Name").textContent = character1.name;
  document.getElementById("player2Name").textContent = character2.name;
}

//Clase Buffos
class Buff {
  constructor(x, y, radius, type, color, effect) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.type = type;
    this.color = color;
    this.effect = effect;
    this.active = true;

    this.image = new Image();
    this.image.src = buffImages[type];
  }

  draw(ctx) {
    if (this.active) {
      ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }
  }

  checkCollision(character) {
    const dx = this.x - (character.x + character.width / 2);
    const dy = this.y - (character.y + character.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.radius + character.width / 2) {
      this.effect(character);
      this.active = false;
      return true;
    }
    return false;
  }
}

const buffs = [];	
const buffImages = {
  cura: "images/buffs/Heal.png",
  velocidad: "images/buffs/speed.png",
  fuerza: "images/buffs/strenght.png"
};

const buffTypes = [
  { type: 'cura', color: 'green', effect: (character) => character.health = Math.min(character.health + 80, character.maxHealth) },
  { type: 'velocidad', color: 'yellow', effect: (character) => character.speed += 30 },
  { type: 'fuerza', color: 'red', effect: (character) => {
      character.minDamage += 10;
      character.maxDamage += 20;
    } 
  }
];

function spawnBuff() {
  const buffType = buffTypes[Math.floor(Math.random() * buffTypes.length)];
  const buff = new Buff(
    Math.random() * (canvas.width - 30),
    Math.random() * (canvas.height - 30),
    30,
    buffType.type,
    buffType.color,
    buffType.effect
  );
  buffs.push(buff);

  setTimeout(() => {
    const index = buffs.indexOf(buff);
    if (index !== -1) buffs.splice(index, 1);
  }, 10000);
}


function drawBuffs() {
  buffs.forEach(buff => buff.draw(ctx));
}

function checkBuffCollision(character) {
  buffs.forEach(buff => {
    if (buff.active && buff.checkCollision(character)) {
      updateHealthBars(); 
    }
  });
}


function gameLoop() {
  movePlayers();

  if (checkAttackRange(character1, character2)) {
    if (keys["e"]) attack(character1, character2);
  }
  
  if (checkAttackRange(character2, character1)) {
    if (keys["p"]) attack(character2, character1);
  }

  checkBuffCollision(character1);
  checkBuffCollision(character2);

  drawPlayers();
  drawBuffs();

  if (character1.health > 0 && character2.health > 0) {
    requestAnimationFrame(gameLoop);
  } else {
    endGame();
  }
}

function endGame() {
  const winner = character1.health > 0 ? character1.name : character2.name;
  setTimeout(() => {
    alert(`Game over! ${winner} wins!`);
    window.location.href = "../index.html";
    gameMusic.stop();
  }, 500);

}

setInterval(spawnBuff, 5000);

updatePlayerNames();
updateHealthBars();
gameLoop();
