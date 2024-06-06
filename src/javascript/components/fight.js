import { controls } from '../../constants/controls';

export async function fight(firstFighter, secondFighter) {
  return new Promise((resolve) => {
    firstFighter.currentHealth = firstFighter.health;
    secondFighter.currentHealth = secondFighter.health;
    firstFighter.critical = true;
    secondFighter.critical = true;

    const firstFighterHealthBar = document.getElementById('left-fighter-indicator');
    const secondFighterHealthBar = document.getElementById('right-fighter-indicator');

    const criticalKeySet = new Set();

    const handleKeyDown = (e) => {
      switch (e.code) {
        case controls.PlayerOneBlock:
          firstFighter.block = true;
          break;
        case controls.PlayerTwoBlock:
          secondFighter.block = true;
          break;
        case controls.PlayerOneAttack:
          if (!firstFighter.block) {
            attackEnemy(firstFighter, secondFighter, getDamage, secondFighterHealthBar);
          }
          break;
        case controls.PlayerTwoAttack:
          if (!secondFighter.block) {
            attackEnemy(secondFighter, firstFighter, getDamage, firstFighterHealthBar);
          }
          break;
      }

      criticalKeySet.add(e.code);

      if (
        checkCriticalHitCombination(criticalKeySet, controls.PlayerOneCriticalHitCombination) &&
        firstFighter.critical
      ) {
        attackEnemyCritical(firstFighter, secondFighter, criticalHit, secondFighterHealthBar);
        firstFighter.critical = false;
        setTimeout(() => (firstFighter.critical = true), 10000);
      }

      if (
        checkCriticalHitCombination(criticalKeySet, controls.PlayerTwoCriticalHitCombination) &&
        secondFighter.critical
      ) {
        attackEnemyCritical(secondFighter, firstFighter, criticalHit, firstFighterHealthBar);
        secondFighter.critical = false;
        setTimeout(() => (secondFighter.critical = true), 10000);
      }

      if (firstFighter.currentHealth <= 0) {
        cleanup();
        resolve(secondFighter);
      }

      if (secondFighter.currentHealth <= 0) {
        cleanup();
        resolve(firstFighter);
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case controls.PlayerOneBlock:
          firstFighter.block = false;
          break;
        case controls.PlayerTwoBlock:
          secondFighter.block = false;
          break;
      }

      criticalKeySet.delete(e.code);
    };

    const cleanup = () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  });
}

function checkCriticalHitCombination(pressedKeys, combination) {
  return combination.every((key) => pressedKeys.has(key));
}

export function attackEnemy(attacker, defender, damage, hpBar) {
  if (defender.block) {
    return;
  } else {
    defender.currentHealth -= damage(attacker, defender);
    if (defender.currentHealth < 0) {
      defender.currentHealth = 0;
    }
    hpBar.style.width = `${(defender.currentHealth / defender.health) * 100}%`;
  }
}

export function attackEnemyCritical(attacker, defender, damage, hpBar) {
  defender.currentHealth -= damage(attacker, defender);
  if (defender.currentHealth < 0) {
    defender.currentHealth = 0;
  }
  hpBar.style.width = `${(defender.currentHealth / defender.health) * 100}%`;
}

export function getDamage(attacker, defender) {
  const damage = getHitPower(attacker) - getBlockPower(defender);
  return damage >= 0 ? damage : 0;
}

export function getHitPower(fighter) {
  const criticalHitChance = Math.random() + 1;
  return fighter.attack * criticalHitChance;
}

export function getBlockPower(fighter) {
  const dodgeChance = Math.random() + 1;
  return fighter.defense * dodgeChance;
}

export function criticalHit(fighter) {
  return fighter.attack * 2;
}
