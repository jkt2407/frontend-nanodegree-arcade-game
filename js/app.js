// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    // Set initial row and column for enemy (will be changed by reset())
    this.row = 0;
    this.col = 0;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.increment * dt;

    // if enemy went offscreen right, reset it
    if (this.x > numCols * colWidth) {
        this.reset();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    this.y = this.row * rowHeight - rowHeight/4;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// reset a single enemy
Enemy.prototype.reset = function () {

    // enemy goes on a random row from 1-3
    this.row = Math.floor( Math.random() * 3 + 1 );
    console.log("Enemy row = " + this.row);

    // enemy starts at 200 pixels offscreen left
    this.x = -200;

    // enemy speed is determined randomly
    this.increment = 50 + (Math.random() * 400);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {

    // the image/sprite for the player
    this.sprite = 'images/char-boy.png';

    // the player's grid coordinates
    this.row = 0;
    this.col = 0;
};

// Update the player's position
Player.prototype.update = function() {

};

// draw the player on the screen
// note that we use a fudge factor to
// center the player vertically
Player.prototype.render = function() {
    this.x = this.col * colWidth;
    this.y = this.row * rowHeight - 12;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// handle keyboard input
Player.prototype.handleInput = function(keyCode) {
    console.log(keyCode);
    switch(keyCode) {
        case 'left': {
            this.col--;
            if (this.col < 0) {
                this.col = 0;
            }
            break;
        }
        case 'right': {
            this.col++;
            if (this.col > numCols - 1) {
                this.col = numCols - 1;
            }
            break;
        }
        case 'up': {
            this.row--;
            if (this.row < 0) {
                this.row = 0;
            }
            break;
        }
        case 'down': {
            this.row++;
            if (this.row > numRows - 1) {
                this.row = numRows - 1;
            }
        }
    }
};

// reset the player
Player.prototype.reset = function() {
    player.row = 4;
    player.col = 2;
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
allEnemies = [];
allEnemies[0] = new Enemy();
allEnemies[1] = new Enemy();
allEnemies[2] = new Enemy();    // video shows a max of three enemies

// Place the player object in a variable called player
player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
