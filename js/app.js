////////////////////////////////////////////////////////////////////
// Enemy class
//
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

    // if enemy went offscreen right, reset it to offscreen left
    if (this.x > numCols * colWidth) {
        this.reset();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {

    // compute enemy's y coordinate based on its row,
    // subtracting a little fudge factor to center it vertically
    this.y = this.row * rowHeight - rowHeight/4;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// reset a single enemy
Enemy.prototype.reset = function () {

    // enemy goes on a random row from 1-3
    this.row = Math.floor( Math.random() * 3 + 1 );
    //console.log("Enemy row = " + this.row);

    // enemy starts at 200 pixels offscreen left
    this.x = -200;

    // enemy speed is determined randomly
    this.increment = 150 + (Math.random() * 400);
}

Enemy.prototype.checkCollision = function(row,col) {

    // compute row and column of this enemy's head and tail
    // make them be 1/3 of thwe way intoa ocolum before
    // a collision is detected
    var enemyRow = this.row;
    var enemyTailCol = Math.floor( (this.x - colWidth/3) / colWidth );
    var enemyHeadCol = enemyTailCol + 1;

    // see if row and column are the same as this enemy's
    if (row == enemyRow && (col == enemyHeadCol || col == enemyTailCol + 1)) {
        //console.log("COLLISION!");
        //console.log('enemy paint position is x=' + this.x);
        //console.log('enemy head is in [' + enemyRow + ',' + enemyHeadCol + ']');
        //console.log('enemy tail is in [' + enemyRow + ',' + enemyTailCol + ']');
        //console.log('player is in cell [' + row + ',' + col + ']');
        return true;
    }

    return false;
}

////////////////////////////////////////////////////////////////////
// Player class
//
// Our hero
var Player = function() {

    // the array of images/sprites for the player
    this.sprite = [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ];

    // the index into sprite[] of the player image
    // we are currently using
    this.spriteIndex = 0;

    // the player's grid coordinates
    this.row = 0;
    this.col = 0;
};

// Update the player's position
// and check for collision with an enemy
Player.prototype.update = function() {

    // we don't need to update position since it was
    // already done in handleInput()

    // see if any enemies are in the same grid square
    // as the player
    allEnemies.forEach(function(enemy) {
        if (enemy.checkCollision(player.row, player.col)) {
            player.reset();
        }
    });
};

// draw the player on the screen
// note that we use a fudge factor to center the player vertically
Player.prototype.render = function() {
    this.x = this.col * colWidth;
    this.y = this.row * rowHeight - 12;
    ctx.drawImage(Resources.get(this.sprite[this.spriteIndex]), this.x, this.y);
};

// handle keyboard input
Player.prototype.handleInput = function(keyCode) {
    console.log(keyCode);
    switch(keyCode) {
        // iterate thruogh all the sprite images
        case 'home': {
            this.spriteIndex++;
            if (this.spriteIndex > 4) {
                this.spriteIndex = 0;
            }
            player.render();
            break
        }
        // move player one square left
        case 'left': {
            this.col--;
            if (this.col < 0) {
                this.col = 0;
            }
            break;
        }
        // move player one square right
        case 'right': {
            this.col++;
            if (this.col > numCols - 1) {
                this.col = numCols - 1;
            }
            break;
        }
        // move player one square up
        case 'up': {
            this.row--;
            if (this.row < 0) {
                this.row = 0;
            }
            break;
        }
        // move player one square down
        case 'down': {
            this.row++;
            if (this.row > numRows - 1) {
                this.row = numRows - 1;
            }
            break;
        }
    }
};

// reset the player
Player.prototype.reset = function() {
    player.row = 5;
    player.col = 2;
};

////////////////////////////////////////////////////////////////////
// Gem class
//
// Gems are created at random and placed on the roadway to be collected
var Gem = function() {

    // init row and col
    this.row = 0;
    this.col = 0;

    // set gem type randomly 0, 1 or 2
    this.gemType =  Math.floor( Math.random() * gemTypes );

    // pick an an image and point value for this gem
    switch (this.gemType) {
        default:
        case 0: {
            this.sprite = 'images/gem-orange.png';
            this.points = 100;
            break;
        }
        case 1: {
            this.sprite = 'images/gem-green.png';
            this.points = 200;
            break;
        }
        case 2: {
            this.sprite = 'images/gem-blue.png';
            this.points = 500;
            break;
        }
    }

    // pick a random row and column for the gem
    // (make sure it's unoccupied - we'll try 10 times to find an
    // empty grid space)
    var gemPlaced = false;
    for (var i = 0; i < 10; i++) {

        // pick a random row from 1 to 3
        var gemRow = Math.floor( Math.random() * 3 + 1 );

        // pick a random col from 0 to numCols - 1
        var gemCol = Math.floor( Math.random() * numCols );

        // is it an empty grid slot? if so, claim it and stop looking
        if (!this.checkCollision(gemRow, gemCol)) {
            this.row = gemRow;
            this.col = gemCol;
            allGems.push(this);
            gemPlaced = true;
            break;
        }
    }

    // if we didn't place the gem after 10 tries, return null
    if (!gemPlaced) {
        return null;
    }
};

// draw the gem on the screen
// note that we use a fudge factor to center the player vertically
Gem.prototype.render = function() {
    this.x = this.col * colWidth;
    this.y = this.row * rowHeight - 12;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// return true if there's a gem at this row and column
Gem.prototype.checkCollision = function(row,col) {

    // iterate through array of gems looking for a match
    allGems.forEach(function(gem) {
        if (gem.row == row && gem.col == col) {
            return true;
        }
    });
    return false;
};

////////////////////////////////////////////////////////////////////
// Initialization
//
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
allEnemies[0] = new Enemy();
allEnemies[1] = new Enemy();
allEnemies[2] = new Enemy();    // video shows a max of three enemies

// Place the player object in a variable called player
var player = new Player();

// add a couple of gems for the hell of it
var allGems = [];
var foo = new Gem();
foo = new Gem();
foo = new Gem();
foo = new Gem();


////////////////////////////////////////////////////////////////////
// Utilities
//
// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
