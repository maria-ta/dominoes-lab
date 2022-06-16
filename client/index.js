const BASE_URL = '';
const HTML_IDS = {
  inputTable: 'input-table',
  inputTableCell: 'input-table-cell',
  takenCardsTable: 'taken-cards-table',
  takenCardCell: 'taken-card-cell',
  submitButton: 'submit',
};
const CONTROL_KEYS_CALLBACKS = {
  w: combineWithTop,
  d: combineWithRight,
  s: combineWithBottom,
  a: combineWithLeft,
  c: clearPosition,
};

let conditions;
let initialTable = {
  numbers: [],
  positions: [],
};
let takenCardsTable;

function get(url) {
  return fetch(url).then((response) => response.json());
}

function post(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((response) => response.json());
}

function createArrayOfLengthFilledWith0(length) {
  return [...Array(length)].map(Number.prototype.valueOf, 0);
}

function getConditions() {
  return get(`${BASE_URL}/conditions`);
}

function hasNumber(i, j) {
  const value = initialTable.numbers[i][j];
  return !!value || value === 0;
}

function hasPosition(i, j) {
  const position = initialTable.positions[i][j];
  return !!position;
}

function isCardTaken(a, b) {
  return takenCardsTable[Math.max(a, b)][Math.min(a, b)];
}

function markAsTaken(a, b, isTaken = true) {
  takenCardsTable[Math.max(a, b)][Math.min(a, b)] = isTaken;
}

function getInputTableCellId(i, j) {
  return `${HTML_IDS.inputTableCell}-${i}-${j}`;
}

function rerenderTakenCard(a, b) {
  const [i, j] = [Math.max(a, b), Math.min(a, b)];
  const cell = document.getElementById(getTakenCardCellId(i, j));
  if (isCardTaken(i, j)) {
    cell.classList.add('selected');
  } else {
    cell.classList.remove('selected');
  }
}

function rerenderPosition(i, j) {
  const cell = document.getElementById(getInputTableCellId(i, j));
  const position = initialTable.positions[i][j];
  if (position) {
    cell.classList.add(position);
  } else {
    cell.classList.remove('t');
    cell.classList.remove('r');
    cell.classList.remove('b');
    cell.classList.remove('l');
  }
}

function clearPosition(i, j) {
  const position = initialTable.positions[i][j];

  let anotherPosition;
  switch (position) {
    case 't': {
      anotherPosition = [i - 1, j];
      break;
    }
    case 'r': {
      anotherPosition = [i, j - 1];
      break;
    }
    case 'b': {
      anotherPosition = [i + 1, j];
      break;
    }
    case 'l': {
      anotherPosition = [i, j + 1];
      break;
    }
  }
  const [x, y] = anotherPosition;

  initialTable.positions[x][y] = null;
  initialTable.positions[i][j] = null;
  rerenderPosition(x, y);
  rerenderPosition(i, j);

  const a = initialTable.numbers[i][j];
  const b = initialTable.numbers[x][y];
  markAsTaken(a, b, false);
  rerenderTakenCard(a, b);
}

function combineWithTop(i, j) {
  const [x, y] = [i - 1, j];
  const hasSpaceOnTop = (i, j) => {
    const hasCellOnTop = i > 0;
    return hasCellOnTop && hasNumber(x, y) && !hasPosition(x, y);
  };
  const couldBeCombinedWithTop = (i, j) => {
    const cell = initialTable.numbers[i][j];
    const topCell = initialTable.numbers[x][y];
    return !hasPosition(i, j) && !isCardTaken(cell, topCell);
  };

  if (hasSpaceOnTop(i, j) && couldBeCombinedWithTop(i, j)) {
    const a = initialTable.numbers[i][j];
    const b = initialTable.numbers[x][y];
    markAsTaken(a, b, true);
    rerenderTakenCard(a, b);
    initialTable.positions[i][j] = 'b';
    initialTable.positions[x][y] = 't';
    rerenderPosition(i, j);
    rerenderPosition(x, y);
  }
}

function combineWithBottom(i, j) {
  const [x, y] = [i + 1, j];
  const hasSpaceOnBottom = (i, j) => {
    const hasCellOnBottom = i < conditions.height - 1;
    return hasCellOnBottom && hasNumber(x, y) && !hasPosition(x, y);
  };
  const couldBeCombinedWithBottom = (i, j) => {
    const cell = initialTable.numbers[i][j];
    const bottomCell = initialTable.numbers[x][y];
    return !hasPosition(i, j) && !isCardTaken(cell, bottomCell);
  };

  if (hasSpaceOnBottom(i, j) && couldBeCombinedWithBottom(i, j)) {
    const a = initialTable.numbers[i][j];
    const b = initialTable.numbers[x][y];
    markAsTaken(a, b, true);
    rerenderTakenCard(a, b);
    initialTable.positions[i][j] = 't';
    initialTable.positions[x][y] = 'b';
    rerenderPosition(i, j);
    rerenderPosition(x, y);
  }
}

function combineWithRight(i, j) {
  const [x, y] = [i, j + 1];
  const hasSpaceOnRight = (i, j) => {
    const hasCellOnRight = j < conditions.width - 1;
    return hasCellOnRight && hasNumber(x, y) && !hasPosition(x, y);
  };
  const couldBeCombinedWithRight = (i, j) => {
    const cell = initialTable.numbers[i][j];
    const rightCell = initialTable.numbers[x][y];
    return !hasPosition(i, j) && !isCardTaken(cell, rightCell);
  };

  if (hasSpaceOnRight(i, j) && couldBeCombinedWithRight(i, j)) {
    const a = initialTable.numbers[i][j];
    const b = initialTable.numbers[x][y];
    markAsTaken(a, b, true);
    rerenderTakenCard(a, b);
    initialTable.positions[i][j] = 'l';
    initialTable.positions[x][y] = 'r';
    rerenderPosition(i, j);
    rerenderPosition(x, y);
  }
}

function combineWithLeft(i, j) {
  const [x, y] = [i, j - 1];
  const hasSpaceOnLeft = (i, j) => {
    const hasCellOnLeft = j > 0;
    return hasCellOnLeft && hasNumber(x, y) && !hasPosition(x, y);
  };
  const couldBeCombinedWithLeft = (i, j) => {
    const cell = initialTable.numbers[i][j];
    const leftCell = initialTable.numbers[x][y];
    return !hasPosition(i, j) && !isCardTaken(cell, leftCell);
  };

  if (hasSpaceOnLeft(i, j) && couldBeCombinedWithLeft(i, j)) {
    const a = initialTable.numbers[i][j];
    const b = initialTable.numbers[x][y];
    markAsTaken(a, b, true);
    rerenderTakenCard(a, b);
    initialTable.positions[i][j] = 'r';
    initialTable.positions[x][y] = 'l';
    rerenderPosition(i, j);
    rerenderPosition(x, y);
  }
}

function keyDownOnCell(i, j, event) {
  const key = event.key;
  const isControlKey = Object.keys(CONTROL_KEYS_CALLBACKS).includes(key);
  if (isControlKey) {
    CONTROL_KEYS_CALLBACKS[key](i, j);
  }
}

function changeCellValue(i, j, event) {
  const value = event.target.value;
  if (value < conditions.minCellValue) {
    event.target.value = conditions.minCellValue;
  } else if (value > conditions.maxCellValue) {
    event.target.value = conditions.maxCellValue;
  }
  initialTable.numbers[i][j] = event.target.value;
}

function createInputTable() {
  const table = document.getElementById(HTML_IDS.inputTable);
  for (let i = 0; i < conditions.height; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < conditions.width; j++) {
      const cell = document.createElement('td');
      const input = document.createElement('input');
      cell.setAttribute('id', getInputTableCellId(i, j));
      cell.setAttribute('id', getInputTableCellId(i, j));
      input.setAttribute('type', 'number');
      input.setAttribute('step', 1);
      input.setAttribute('min', conditions.minCellValue);
      input.setAttribute('max', conditions.maxCellValue);
      input.addEventListener('keydown', (event) => {
        keyDownOnCell(i, j, event);
      });
      input.addEventListener('input', (event) => {
        changeCellValue(i, j, event);
      });
      cell.appendChild(input);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

function setupInitialTable() {
  initialTable.numbers = createArrayOfLengthFilledWith0(conditions.height).map(
    () => {
      return createArrayOfLengthFilledWith0(conditions.width).map(() => null);
    },
  );
  initialTable.positions = createArrayOfLengthFilledWith0(
    conditions.height,
  ).map(() => {
    return createArrayOfLengthFilledWith0(conditions.width).map(() => null);
  });
}

function submitInitialTable() {
  post(`${BASE_URL}/solve`, { initialTable: initialTable.numbers });
}

function getTakenCardsTableSize() {
  return conditions.maxCellValue - conditions.minCellValue + 1;
}

function getTakenCardCellId(i, j) {
  return `${HTML_IDS.takenCardCell}-${i}-${j}`;
}

function createTakenCardsTable() {
  const size = getTakenCardsTableSize();
  const table = document.getElementById(HTML_IDS.takenCardsTable);

  const firstRow = document.createElement('tr');
  const firstCell = document.createElement('td');
  firstRow.appendChild(firstCell);
  for (let j = 0; j < size; j++) {
    const cell = document.createElement('td');
    cell.innerText = j;
    firstRow.appendChild(cell);
  }
  table.appendChild(firstRow);

  for (let i = 0; i < size; i++) {
    const row = document.createElement('tr');
    const firstCell = document.createElement('td');
    firstCell.innerText = i;
    row.appendChild(firstCell);
    for (let j = 0; j < size; j++) {
      const cell = document.createElement('td');
      cell.setAttribute('id', getTakenCardCellId(i, j));
      if (i < j) {
        cell.classList.add('inactive');
      }
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

function setupTakenCardsTable() {
  const size = getTakenCardsTableSize();
  takenCardsTable = createArrayOfLengthFilledWith0(size).map(() => {
    return createArrayOfLengthFilledWith0(size);
  });
}

getConditions().then((response) => {
  conditions = response;
  setupInitialTable();
  createInputTable();
  setupTakenCardsTable();
  createTakenCardsTable();
});

document.getElementById(HTML_IDS.submitButton).addEventListener('click', () => {
  submitInitialTable();
});
