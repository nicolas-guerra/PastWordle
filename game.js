document.addEventListener('DOMContentLoaded', () => {
  let solution, currentRow = 0, currentCol = 0;
  let validWords = new Set();

  // 1) Load valid guess list
  fetch('valid_words.txt')
    .then(r => r.text())
    .then(txt => {
      txt.split('\n')
        .map(w => w.trim().toUpperCase())
        .filter(w => w.length === 5)
        .forEach(w => validWords.add(w));
      console.log(`Loaded ${validWords.size} valid words`);
      startGame();
    })
    .catch(err => console.error('Could not load valid_words.txt:', err));

  function startGame() {
    // 2) Fetch past answers and pick a random solution
    fetch('wordle_answers.csv')
      .then(r => r.text())
      .then(text => {
        const rows = text.split('\n').slice(1)
                         .map(r => r.split(','))
                         .filter(cols => cols.length >= 3);
        const words = rows.map(cols => cols[2].trim().toUpperCase());
        solution = words[Math.floor(Math.random() * words.length)];
        console.log('Solution:', solution);
        initGame();
      })
      .catch(err => console.error('Could not load wordle_answers.csv:', err));

    // Route physical keyboard to handlers
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter') onEnter();
      else if (e.key === 'Backspace') onDel();
      else {
        const k = e.key.toUpperCase();
        if (/^[A-Z]$/.test(k)) onKey(k);
      }
    });

    function initGame() {
      // Build grid
      const grid = document.getElementById('grid');
      for (let r = 0; r < 6; r++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let c = 0; c < 5; c++) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          row.appendChild(cell);
        }
        grid.appendChild(row);
      }

      // Build on-screen keyboard
      const layout = ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
      const keyboard = document.getElementById('keyboard');
      layout.forEach((line, i) => {
        const row = document.createElement('div');
        row.className = 'keyboard-row';
        if (i === 2) row.appendChild(createKey('ENTER', onEnter));
        line.split('').forEach(l => row.appendChild(createKey(l, () => onKey(l))));
        if (i === 2) row.appendChild(createKey('DEL', onDel));
        keyboard.appendChild(row);
      });

      // Hook up 'Play again?' button
      document.getElementById('playAgain')
        .addEventListener('click', () => location.reload());
    }

    function createKey(label, handler) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.id = 'key-' + label;
      btn.addEventListener('click', handler);
      return btn;
    }

    function onKey(letter) {
      if (currentCol < 5) {
        const cell = document.querySelectorAll('.row')[currentRow]
                          .children[currentCol];
        cell.textContent = letter;
        currentCol++;
      }
    }

    function onDel() {
      if (currentCol > 0) {
        currentCol--;
        const cell = document.querySelectorAll('.row')[currentRow]
                          .children[currentCol];
        cell.textContent = '';
      }
    }

    function onEnter() {
      if (currentCol < 5) return;
      const rowEls = document.querySelectorAll('.row')[currentRow].children;
      const guess = Array.from(rowEls).map(c => c.textContent).join('');

      // Validate guess
      if (!validWords.has(guess)) {
        // Shake row
        const rowEl = document.querySelectorAll('.row')[currentRow];
        rowEl.classList.add('shake');
        setTimeout(() => rowEl.classList.remove('shake'), 500);
        return;
      }

      // Compute result array
      const solArr = solution.split('');
      const result = Array(5).fill('grey');
      const used = [];
      // Greens
      for (let i = 0; i < 5; i++) {
        if (guess[i] === solArr[i]) {
          result[i] = 'green';
          used.push(i);
        }
      }
      // Yellows
      for (let i = 0; i < 5; i++) {
        if (result[i] === 'grey') {
          const idx = solArr.findIndex((l,j) => l === guess[i] && !used.includes(j));
          if (idx > -1) {
            result[i] = 'yellow';
            used.push(idx);
          }
        }
      }

      // Reveal with flip animation
      for (let i = 0; i < 5; i++) {
        flipCell(rowEls[i], result[i], guess[i], i * 350);
      }

      // After all flips, advance or end
      const totalDelay = 5 * 350 + 300;
      setTimeout(() => {
        if (guess === solution) showEnd('🎉 You won!');
        else if (currentRow === 5) showEnd(`Game over – the word was ${solution}`);
        else {
          currentRow++;
          currentCol = 0;
        }
      }, totalDelay);
    }

    function flipCell(cell, color, letter, delay) {
      setTimeout(() => {
        cell.classList.add('flip');      
        setTimeout(() => {
          cell.classList.remove('flip');
          cell.classList.add(color);
          updateKey(letter, color);
        }, 300);
      }, delay);
    }

    function updateKey(letter, color) {
      const key = document.getElementById('key-' + letter);
      if (!key) return;
      if (color === 'green') key.classList = 'green';
      else if (color === 'yellow' && !key.classList.contains('green')) key.classList = 'yellow';
      else if (color === 'grey' && !key.classList.contains('green') && !key.classList.contains('yellow'))
        key.classList = 'grey';
    }

    function showEnd(message) {
      document.getElementById('endMessage').textContent = message;
      document.getElementById('endModal').classList.remove('hidden');
    }
  }
});