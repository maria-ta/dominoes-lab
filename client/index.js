const MAX_NUMBER = 7;

/**
 * @type {{ resultTable: string, nextGuesses: number[]}[]}
 */
const guessingStack = []; // { resultTable: string, nextGuesses: []}

let result = [];
let availabilityTable = [];
let takenCardsTable = createZeroFilledArrayOfLength(MAX_NUMBER).map(
    () => createZeroFilledArrayOfLength(MAX_NUMBER).map(
        () => 0
    )
);

let anyCellWasChanged = false;

/**
 * Removes all children nodes from HTML element
 * @param {HtmlElement} element HTML element
 */
function clearElement(element) {
    while (!!element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Displays unutual table on the screen in the element with id 'initial-table'
 * @param {number[][]} initialTable 
 */
function displayInitialTable(initialTable) {
    const element = document.getElementById('initial-table');
    const body = document.createElement('tbody');

    initialTable.forEach((row) => {
        const rowElement = document.createElement('tr');

        row.forEach((cell) => {
            const cellElement = document.createElement('td');
            cellElement.innerText = cell;
            rowElement.appendChild(cellElement);
        });

        body.appendChild(rowElement);
    });

    element.appendChild(body);
}

/** 
 * Creates an array of specified length filled with `0`
 * @param {number} length 
 * @returns {number[]} an array of specified length filled with `0`
 */
function createZeroFilledArrayOfLength(length) {
    return Array.apply(null, Array(length)).map(Number.prototype.valueOf, 0);
}

/**
 * Adds coordinates of `card` to `availability table`.
 * @param {number[]} card in format [number, number]
 * @param {number[]} coordinates1 in format [number, number]
 * @param {number[]} coordinates2 in format [number, number]
 */
function updateAvailabilityOfCard([a, b], [i, j], [x, y]) {
    const card = availabilityTable[Math.min(a, b)][Math.max(a, b)];
    card.quantity += 1;
    if (x > i || y > j) {
        card.coordinates.push([
            [i, j],
            [x, y],
        ]);
    } else {
        card.coordinates.push([
            [x, y],
            [i, j],
        ]);
    }
}

/**
 * Updates result table with card data
 * @param {string[][]} result a result table, where each cell is has following values: ''| 't' | 'l' | 'r' | 'b'
 * @param {number[][]} card [card, cardCoordinates1, cardCoordinates2]
 */
function updateResultWithCoordinates([[a, b], [x, y], [i, j]]) {
    if (result[x][y] || result[i][j]) {
        displayResultTable(initialTable, result);
        throw new Error(`The place is taken already! ${a}-${b} [${x}, ${y}], [${i}, ${j}]. It's ${result[x][y]} and ${result[i][j]}`);
    }
    if (takenCardsTable[Math.min(a, b)][Math.max(a, b)] > 0) {
        displayResultTable(initialTable, result);
        throw new Error(`The card is taken already! ${a}-${b} [${x}, ${y}], [${i}, ${j}].`);
    }
    if (x !== i) {
        //t, b
        if (x > i) {
            result[x][y] = 'b';
            result[i][j] = 't';
        } else {
            result[x][y] = 't';
            result[i][j] = 'b';
        }
    } else {
        //l, r
        if (y > j) {
            result[x][y] = 'r';
            result[i][j] = 'l';
        } else {
            result[x][y] = 'l';
            result[i][j] = 'r';
        }
    }
    takenCardsTable[Math.min(a, b)][Math.max(a, b)] = 1;
}

/**
 * 
 * @returns {{quantity: number; coordinates: number[][]}[]} an array filled with default values for an `availabilityTable`: `{quantity: 0, coordinates: []}`
 */
function createAvailabilityTable() {
    return createZeroFilledArrayOfLength(MAX_NUMBER).map(
        () => createZeroFilledArrayOfLength(MAX_NUMBER).map(
            () => ({quantity: 0, coordinates: []})
        )
    );
}

function solveProblem(initialTable) {
    let counter = 0;

    result = initialTable.map(row => row.map(cell => null));

    do {
        availabilityTable = createAvailabilityTable();
        anyCellWasChanged = false;
    
        initialTable.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (!result[i][j]) {
                    checkCell(i, j);
                }
            });
        });
        availabilityTable.forEach((row, a) => {
            row.forEach((cell, b) => {
                const wasCardTaken = takenCardsTable[Math.min(a, b)][Math.max(a, b)] > 0;
                if (cell.quantity === 1 && !wasCardTaken && !wasPlaceByCoordinatesTaken(cell.coordinates[0])) {
                    updateResultWithCoordinates([[a, b], ...cell.coordinates[0]]);
                    displayResultTable(initialTable, result);
                    anyCellWasChanged = true;
                }
            });
        });

        const noCellWasChanged = !anyCellWasChanged;
        if (noCellWasChanged) {
            if (isProblemSolved()) {
                return result;
            } else {
                guess();
            }
        }

        displayResultTable(initialTable, result);
        counter++;
    } while (anyCellWasChanged && counter < 100);

    return result;
}

function isProblemSolved() {
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result.length; j++) {
            if (!result[i][j]) {
                return false;
            }
        }
    }
    return true;
}

function wasPlaceByCoordinatesTaken(coordinates) {
    const [[x,y], [i,j]] = coordinates;
    return !!result[x][y] || !!result[i][j];
}

/**
 * 
 * @param {number} i 
 * @param {number} j 
 */
function checkCell(i, j) {
    const row = initialTable[i];
    const cell = row[j];
    // [[a,b], [i,j], [x,y]]
    const allVariants = [];
    let lastVariant = [];
    let numberOfPossibleVariants = 0;
    if (j + 1 < row.length && !result[i][j+1]) {
        const variant = [
            [cell, initialTable[i][j+1]],
            [i, j],
            [i, j + 1]
        ];
        if (initialTable[i][j+1] >= cell) {
            allVariants.push(variant);
        }
        lastVariant = variant;
        numberOfPossibleVariants += 1;

    }
    if (i + 1 < initialTable.length && !result[i+1][j]) {
        const variant = [
            [cell, initialTable[i+1][j]],
            [i, j],
            [i+1, j]
        ];
        if (initialTable[i+1][j] >= cell) {
            allVariants.push(variant);
        }
        lastVariant = variant;
        numberOfPossibleVariants += 1;

    }
    if ( j - 1 >= 0 && !result[i][j-1]) {
        const variant = [
            [cell, initialTable[i][j-1]],
            [i, j],
            [i, j-1]
        ];
        if (initialTable[i][j-1] >= cell) {
            allVariants.push(variant);
        }
        lastVariant = variant;
        numberOfPossibleVariants += 1;

    }
    if (i - 1 >= 0 && !result[i-1][j]) {
        const variant = [
            [cell, initialTable[i-1][j]],
            [i, j],
            [i-1, j]
        ];
        if (initialTable[i-1][j] >= cell) {
            allVariants.push(variant);
        }
        lastVariant = variant;
        numberOfPossibleVariants += 1;
    }

    if (numberOfPossibleVariants === 1) {
        try {
            const [a, b] = lastVariant[0];
            updateResultWithCoordinates(lastVariant);
            displayResultTable(initialTable, result);
            anyCellWasChanged = true;
        } catch (e) {
            console.error('Here we go');
        }
    } else {
        allVariants.forEach(([ab, ij, xy]) => {
            updateAvailabilityOfCard(ab, ij, xy);
        });
    }
}

function guess(except) {
    const [[a,b], cell] = findFirstWithMoreThanOnePossibleVariants(except);
    if (cell) {
        updateGuessingStack([a,b], cell);
        updateResultWithCoordinates([[a, b], ...cell.coordinates[0]]);
        anyCellWasChanged = true;
    } else {
        revert();
    }
}

function revert() {
    if (guessingStack.length) {
        const previousGuess = guessingStack.pop();
        const nextCoordinates = previousGuess.nextGuesses;

        result = JSON.parse(previousGuess.result);
        takenCardsTable = JSON.parse(previousGuess.takenCardsTable);
        availabilityTable = JSON.parse(previousGuess.availabilityTable);

        updateResultWithCoordinates([previousGuess.ab, ...nextCoordinates[0]]);

        nextCoordinates.splice(0, 1);

        if (nextCoordinates.length) {
            const guessingStackItem = {
                ab: previousGuess.ab,
                result: JSON.stringify(result),
                nextGuesses: nextCoordinates,
                except: previousGuess.except,
            }
            guessingStack.push(guessingStackItem);
        } else {
            const [a,b] = previousGuess.ab;
            previousGuess.except.push(`${Math.min(a, b)}${Math.max(a, b)}`);
            guess(previousGuess.except);
        }
    } else {
        console.log('You have no choice :(');
    }
}

function updateGuessingStack([a, b], cell) {
    const cellCoordinatesCopy = JSON.parse(JSON.stringify(cell.coordinates));
    cellCoordinatesCopy.splice(0, 1);
    const guessingStackItem = {
        ab: [a,b],
        result: JSON.stringify(result),
        takenCardsTable: JSON.stringify(takenCardsTable),
        availabilityTable: JSON.stringify(availabilityTable),
        nextGuesses: cellCoordinatesCopy,
        except: []
    }
    guessingStack.push(guessingStackItem);
}

function findFirstWithMoreThanOnePossibleVariants(except) {
    except = except || [];
    for (let n = 2; n < 100; n++) {
        for (let a = 0; a < availabilityTable.length; a++) {
            const row = availabilityTable[a];
            for (let b = 0; b < row.length; b++) {
                const cell = row[b];
                const wasCardTaken = takenCardsTable[Math.min(a, b)][Math.max(a, b)] > 0;
                const shouldNotSkipThisCell = !(except.includes(`${a}${b}`) || except.includes(`${b}${a}`));
                if (cell.quantity === n && !wasCardTaken && shouldNotSkipThisCell) {
                    return [[a, b], cell];
                }
            }
        }
    }
    return [[null, null], null];
}

/**
 * Displays result table on the screen
 * @param {number[][]} initialTable a table with numbers
 * @param {(''| 't' | 'l' | 'r' | 'b') [][]} resultTable a result table, where each cell is has following values: ''| 't' | 'l' | 'r' | 'b'
 * @param {string} id an optional id for HTML element (by default is 'result-table')
 */
function displayResultTable(initialTable, resultTable, id) {
    const body = document.createElement('tbody');
    const element = document.getElementById(id || 'result-table');

    clearElement(element);

    resultTable.forEach((row, i) => {
        const rowElement = document.createElement('tr');

        row.forEach((cell, j) => {
            const cellElement = document.createElement('td');
            cellElement.innerText = initialTable[i][j];
            cellElement.classList.add(cell);
            if (cell) {
                cellElement.classList.add('completed');
            }
            rowElement.appendChild(cellElement);
        });

        body.appendChild(rowElement);
    });

    element.appendChild(body);
}

/**
 * Displays cards availability table on the screen
 */
 function displayTakenCardsTable() {
    const body = document.createElement('tbody');
    const element = document.getElementById('availability-table');
    const firstRowElement = document.createElement('tr');
    const cornerCell = document.createElement('td');

    clearElement(element);

    firstRowElement.appendChild(cornerCell);

    for (let i = 0; i < MAX_NUMBER; i++) {
        const cellElement = document.createElement('td');
        cellElement.innerText = i;
        firstRowElement.appendChild(cellElement);
    }
    body.appendChild(firstRowElement);

    takenCardsTable.forEach((row, i) => {
        const rowElement = document.createElement('tr');
        const firstCell = document.createElement('td');
        firstCell.innerText = i;
        rowElement.appendChild(firstCell);

        row.forEach((cell, j) => {
            const cellElement = document.createElement('td');
            if (j >= i) {
                const cssClass = cell > 0 ? 'taken' : 'not-taken';
                cellElement.innerText = cell > 0 ? '+' : '0';
                cellElement.classList.add(cssClass);
            }
            rowElement.appendChild(cellElement);
        });

        body.appendChild(rowElement);
    });

    element.appendChild(body);
}

const initialTable = [
    [4, 6, 2, 5, 5, 2, 0, 1],
    [0, 4, 4, 0, 0, 1, 6, 3],
    [2, 4, 4, 1, 1, 3, 1, 5],

    [2, 5, 0, 2, 2, 2, 0, 0],
    
    [5, 3, 3, 6, 4, 1, 3, 5],
    [1, 4, 1, 4, 5, 6, 6, 5],
    [6, 6, 3, 0, 3, 3, 6, 2],
];
const expectedResultTable = [
    ['l', 'r', 't', 'l', 'r', 't', 't', 't'],
    ['t', 't', 'b', 'l', 'r', 'b', 'b', 'b'],
    ['b', 'b', 't', 'l', 'r', 't', 't', 't'],

    ['l', 'r', 'b', 'l', 'r', 'b', 'b', 'b'],
    
    ['t', 't', 'l', 'r', 't', 't', 'l', 'r'],
    ['b', 'b', 'l', 'r', 'b', 'b', 'l', 'r'],
    ['l', 'r', 'l', 'r', 'l', 'r', 'l', 'r'],
];


displayInitialTable(initialTable);
displayResultTable(initialTable, expectedResultTable, 'expected-result-table');
solveProblem(initialTable);

displayTakenCardsTable();
