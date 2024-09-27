document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");
  const startBattleBtn = document.getElementById("start-battle-btn");
  let firstSelected = null;
  let secondSelected = null;

  const stats = {
    "Liu Kang": {
      hp: 200,
      minDamage: 20,
      maxDamage: 25,
      attackSpeed: 30,
      speed: 5,
      attackRange: 200
    },
    "Scorpion": {
      hp: 150,
      minDamage: 23,
      maxDamage: 27,
      attackSpeed: 50,
      speed: 8,
      attackRange: 220
    },
    "Sub Zero": {
      hp: 200,
      minDamage: 18,
      maxDamage: 22,
      attackSpeed: 30,
      speed: 6,
      attackRange: 180
    },
    "Sektor": {
      hp: 270,
      minDamage: 24,
      maxDamage: 28,
      attackSpeed: 15,
      speed: 3,
      attackRange: 250
    },
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const characterName = card.querySelector(".card-name").textContent;
      console.log("Personaje seleccionado:", characterName);
      
      // deseleccionar J1
      if (firstSelected === card) {
        removeIndicator(card, "j1-indicator");
        card.classList.remove("j1");
        clearStats("j1");
        firstSelected = null;
        toggleStartBattleBtn();
        return;
      }

      // deseleccionar J2
      if (secondSelected === card) {
        removeIndicator(card, "j2-indicator");
        card.classList.remove("j2");
        clearStats("j2");
        secondSelected = null;
        toggleStartBattleBtn();
        return;
      }

      // Seleccion J1
      if (!firstSelected && card !== secondSelected) {
        firstSelected = card;
        card.classList.add("j1");
        addIndicator(card, "J1", "j1-indicator", "left");
        updateStats("j1", characterName, stats[characterName]);
      }

      // Seleccion J2
      else if (!secondSelected && card !== firstSelected) {
        secondSelected = card;
        card.classList.add("j2");
        addIndicator(card, "J2", "j2-indicator", "right");
        updateStats("j2", characterName, stats[characterName]);
      }

      toggleStartBattleBtn();
    });
  });

  startBattleBtn.addEventListener("click", () => {
    if (firstSelected && secondSelected) {
      const j1Character = firstSelected.querySelector(".card-name").textContent;
      const j2Character = secondSelected.querySelector(".card-name").textContent;

      // Guardar las estadísticas de los personajes seleccionados en localStorage
      localStorage.setItem("j1Stats", JSON.stringify(stats[j1Character]));
      localStorage.setItem("j2Stats", JSON.stringify(stats[j2Character]));
      localStorage.setItem("j1Character", j1Character);
      localStorage.setItem("j2Character", j2Character);

      // Redireccionar a la pantalla de pelea
      window.location.href = "../game.html"; // Asegúrate de que esta sea la ruta correcta al archivo de pelea
    }
  });

  function addIndicator(card, player, className, position) {
    const indicator = document.createElement("div");
    indicator.textContent = player;
    indicator.classList.add("indicator", className);
    if (position === "left") {
      indicator.style.left = "10px";
      indicator.style.right = "auto";
    } else if (position === "right") {
      indicator.style.right = "10px";
      indicator.style.left = "auto";
    }
    card.appendChild(indicator);
  }

  function removeIndicator(card, className) {
    const indicator = card.querySelector(`.${className}`);
    if (indicator) {
      indicator.remove();
    }
  }

  function updateStats(player, name, characterStats) {
    document.getElementById(`${player}-name`).textContent =
      `Personaje: ${name}`;
    document.getElementById(`${player}-hp`).textContent =
      `HP: ${characterStats.hp}`;
    document.getElementById(`${player}-damage`).textContent =
      `Damage: ${characterStats.minDamage}-${characterStats.maxDamage}`;
    document.getElementById(`${player}-attack-speed`).textContent =
      `AS: ${characterStats.attackSpeed}`;
    document.getElementById(`${player}-speed`).textContent =
      `Velocidad: ${characterStats.speed}`;
    document.getElementById(`${player}-attack-range`).textContent =
      `Rango de ataque: ${characterStats.attackRange}`;
  }

  // Limpiar las estadísticas del jugador cuando se deselecciona un personaje
  function clearStats(player) {
    document.getElementById(`${player}-name`).textContent = `Personaje:`;
    document.getElementById(`${player}-hp`).textContent = `HP:`;
    document.getElementById(`${player}-damage`).textContent = `Damage:`;
    document.getElementById(`${player}-attack-speed`).textContent = `AS:`;
    document.getElementById(`${player}-speed`).textContent = `Velocidad:`;
    document.getElementById(`${player}-attack-range`).textContent = `Rango de ataque:`;
  }

  function toggleStartBattleBtn() {
    if (firstSelected && secondSelected) {
      startBattleBtn.classList.remove("hidden");
    } else {
      startBattleBtn.classList.add("hidden");
    }
  }
});
