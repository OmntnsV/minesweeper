let player = {};
document.getElementById('field').addEventListener('click', event => game.onClick(event));

function proceedFromWelcome() {

    if (nameValidation() && yearValdation()) {
        closeForm();}

    function nameValidation() {
        const nameRegex = /^[A-Za-zА-Яа-яЁёҐґЄєІіЇїЎўІіЇїЎўҐґ‘ ]+$/;
        const name = document.getElementById('welcome_input_name');
        const nameInitialValue = name.value;

        if (nameInitialValue === '') {
            //test for empty string
            console.log('empty name');
            displayInputError(true, 'Введіть імʼя');
            return false;
        }

        if (!nameRegex.test(nameInitialValue)) {
            //test for prohibited characters
            console.log('invalid name');
            displayInputError(true, 'Імʼя має недопустимі символи');
            return false;
        }
        if (nameInitialValue.split(' ').length > 3) {
            //test for more than 3 words
            console.log('invalid name');
            displayInputError(true, 'Імʼя має містити не більше 3 слів');
            return false;
        }
        player.name = nameInitialValue;
        return true;
    }

    function yearValdation() {
        const year = document.getElementById("welcome_input_age");
        const yearInitialValue = year.value;
        const currentYear = new Date().getFullYear();
        const age = currentYear - year;

        if (isNaN(yearInitialValue)) {
            //test for NaN
           console.log('invalid input');
           displayInputError(false, 'Введена інформація повинна бути числом');
           return false;
       }
       if (yearInitialValue.length !== 4) {
           //test for 4 digits
           console.log('invalid input digits');
           displayInputError(false, 'Невірна кількість символів');
           return false;
       }
       if (Number(yearInitialValue) > currentYear || age > 65) {
           //test for year range
           console.log(currentYear);
           console.log('invalid year');
           displayInputError(false, 'Невірно введений рік');
           return false;
       }
       player.age = age;
        return true;
       }
        

    function displayInputError(isName, errorMassage) {
        // If true => displays error for name, else for year
        if (isName) {
            const nameError = document.getElementById('name_error');
            nameError.style.display = 'block';
            nameError.innerHTML = errorMassage;
        } else {
            const yearError = document.getElementById('year_error');
            yearError.style.display = 'block';
            yearError.innerHTML = errorMassage;
        }
    }

    //success

    function closeForm() {
        document.getElementById('settings_bar').classList.add('settings_bar-shortening_animation');
        const welcomeForm = document.getElementById('settings_welcome');
        welcomeForm.classList.add('settings_welcome-fadeout_animation');
        setTimeout(() => {
            welcomeForm.style.display = 'none';
            document.getElementById('main_screen').style.width = '80vw';
            document.getElementById('settings_start').style.display = 'flex';
            document.getElementById('settings_info').style.opacity = '1';
        }, 500);
    }
}

function toggleInfo() {
    const popover = document.getElementById('popover');
    popover.style.display = (popover.style.display === 'block') ? 'none' : 'block';
  }

//
//
// Game
//
//
let game;

function startGame() {
    if (document.getElementById('flagButton')) document.getElementById('flagButton').remove();
    const fieldSize = document.getElementById('settings_size').value;
    const difficulty = document.getElementById('settings_difficulty').value;

    game = new Game(fieldSize, difficulty);
    game.onStart();

    const flagButton = document.createElement('button');
    flagButton.id = 'flagButton';
    flagButton.innerHTML = '🚩';
    flagButton.onclick = () => game.toggleFlag();
    document.querySelector('#game').append(flagButton);
    flagButton.focus();
}

function onClick(cell) {
    if (cell.mine) {
        game.onDeath();
    } else {
        game.checkNear(cell);
        cell.opened = true;
        game.refresh();
    };
}


class Cell {
    constructor(coordinates) {
        this.x = coordinates['x'];
        this.y = coordinates['y'];
        this.mine = false;
        this.indicator = 0;
        this.opened = false;
        this.flagged = false;
    }
}

class Game {
    constructor(fieldSize, difficulty) {
        this.fieldSize = fieldSize;
        this.difficulty = difficulty;
        this.flagMode = false;
        this.field = Game.fieldGenereator(this.fieldSize, this.difficulty);
        this.divField = document.getElementById('field');

    }

    onClick = (event) => {
        
        event.stopPropagation();
        const targetDOM = event.target;
        // console.log(targetDOM);
        if (!targetDOM.classList.contains('field_cell') || targetDOM.classList.contains('opened') || event.currentTarget === targetDOM) return;
            const cellCoordinates = {
            'x': targetDOM.id.split('_')[0],
            'y': targetDOM.id.split('_')[1]
        };
        const cell = game.field[cellCoordinates['y']][cellCoordinates['x']];
        if (!game.flagMode) {
            cell.flagged ? null : onClick(cell);
        } else {
            cell.flagged = !cell.flagged;
            game.refresh();
        }
    }

    toggleFlag() {
        this.flagMode = !this.flagMode;
        const flagButton = document.getElementById('flagButton');
        this.flagMode ? flagButton.style.backgroundColor = '#ddd9d1' : flagButton.style.backgroundColor = '#fff';
    }

    onStart() {
        this.divField.innerHTML = '';
        this.divField.style.display = 'grid';
        this.divField.style.gridTemplateColumns = `repeat(${this.fieldSize}, 1fr)`;
        this.divField.style.gridTemplateRows = `repeat(${this.fieldSize}, 1fr)`;
        this.divField.style.padding = '25px';
        game.refresh();
    }

    onDeath() {
        this.divField.innerHTML = '';
        this.field.forEach(row => {
            row.forEach(cell => {
                if (cell.mine) {
                    cell.opened = true;
                }
            });
        });
        this.divField.removeEventListener('click', this.onClick);
        this.refresh();
    }

    onWin() {
        this.divField.innerHTML = '';
        this.divField.style.display = 'flex';
        this.divField.style.textAlign = 'center';
        const divWin = document.createElement('div');
        divWin.innerHTML = 'Вітаємо!<br>Оскільки ви досягли необхідного віку та успішно виконали тренувальне завдання, ви можете звернутися до <a href="http://www.google.com/maps/search/?api=1&query=найближчий+військкоммат" style="display: inline;" target="_blank">найближчого центру надання винагороди</a> за відмінні результати.';
        this.divField.appendChild(divWin);
    }

    refresh() {
        this.divField.innerHTML = '';
        let cellsLeft = 0;
        for (let row of this.field) {
            for (let cell of row) {
                if (!cell.opened && !cell.flagged) cellsLeft++;
                if (cell.mine && !cell.flagged) cellsLeft++;
                if (!cell.mine && cell.flagged) cellsLeft++;
                const cellElement = document.createElement('div');
                cellElement.classList.add('field_cell');
                cellElement.id = `${cell.x}_${cell.y}`;

                if (cell.opened) {
                    cellElement.classList.add('opened');
                    cellElement.innerText = cell.indicator === 0 || cell.mine ? '' : cell.indicator;
                    cellElement.classList.add(`number-${cell.indicator}`);
                };
                if (cell.mine & cell.opened) {
                    cellElement.classList.add('mine')
                    cellElement.innerText = '💣';
                };
                if (cell.flagged) cellElement.innerText = '🚩';
                this.divField.appendChild(cellElement);
            }
        }
        try {
            document.getElementById('flagButtton').focus()
        } catch (error) {
            
        }
        if (cellsLeft === 0) this.onWin();
    }

    checkNear(cell) {
        if (cell.indicator !== 0) return;
        for (let j = 1; j >= -1; j--) {
            for (let i = 1; i >= -1; i--) {
                try {
                    if (game.field[cell.y - j] == undefined ||
                        game.field[cell.x - i] == undefined )continue;
                    const currentCell = game.field[cell.y - j][cell.x - i]
                    if (!currentCell.opened && !currentCell.mine) {
                        currentCell.opened = true;
                        if (currentCell.indicator === 0) this.checkNear(currentCell);
                    };
                } catch (e) {
                    console.log(e);
                    break;
                }
            }
        }
    }

    static difficultyProportion = {
        1: 0.8,
        2: 1.2,
        3: 2,
    }

    static fieldGenereator(fieldSize, difficulty) {
        //creating field
        const field = [];
        for (let i = 0; i < fieldSize; i++) {
            let row = [];
            for (let j = 0; j < fieldSize; j++) {
                row.push(new Cell({'y': i, 'x': j}));
            }
            field.push(row);
        }
        //generating mines
        let countMines = Math.floor(Game.difficultyProportion[difficulty] * Number(fieldSize) * 2);
        const minesCoordinates = [];
        for (let i = 0; i < countMines; i++) {
            const randomX = Math.floor(Math.random() * (fieldSize));
            const randomY = Math.floor(Math.random() * (fieldSize));
            for (let coordinates of minesCoordinates) {
                if (coordinates[0] === randomX && coordinates[1] === randomY) {
                    i--;
                    break;
                }
            }
            minesCoordinates.push([randomX, randomY]);
            field[randomY][randomX].mine = true;
        }
        //setting the indicators;
        for (let row of field) {
            for (let cell of row) {
                let minesAround = 0;
                for (let j = 1; j >= -1; j--) {
                    for (let i = 1; i >= -1; i--) {
                        try {
                            if (field[cell.y - j] == undefined ||
                                field[cell.x - i] == undefined ) continue;
                            if (field[cell.y - j][cell.x - i].mine) minesAround++;
                        } catch (e) {
                            console.log(e);
                            continue;
                        }
                    }
                }
                cell.indicator = minesAround;
            }
        }
        return field;
    }
}

function setupFieldStyle() {
    this.divField.innerHTML = '';
    this.divField.style.gridTemplateColumns = `repeat(${fieldSize}, 1fr)`;
    this.divField.style.gridTemplateRows = `repeat(${fieldSize}, 1fr)`;
}
