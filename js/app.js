////////////////////////////////////////////////////////////////////
// Enemy class
//
// Enemies constructor
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    // Set initial position and speed
    this.reset();
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
    this.y = this.row * rowHeight - rowHeight/4 + scoreboardHeight;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// reset an enemy's position and speed
Enemy.prototype.reset = function () {

    // enemy goes on a random row from 1-3
    this.row = Math.floor( Math.random() * 3 + 1 );
    //console.log("Enemy row = " + this.row);

    // enemy starts at 200 pixels offscreen left
    this.x = -200;

    // enemy speed is determined randomly
    this.increment = 150 + (Math.random() * 400);
}

// return true if input row and col contain an Enemy
Enemy.prototype.enemyFoundIn = function(row,col) {

    // compute row and column of this enemy's head and tail
    // make them be 1/3 of the way into a column before
    // a collision is detected
    var enemyRow = this.row;
    var enemyTailCol = Math.floor( (this.x - colWidth/3) / colWidth );
    var enemyHeadCol = enemyTailCol + 1;

    // see if input row and column are the same as this enemy's
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
// The one and only Player (our hero) - constructor
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

// log this player
Player.prototype.log = function() {
    console.log('player ' +
            ' row=' + this.row +
            ' col=' + this.col
    );
};

// Update the player
Player.prototype.update = function(dt) {

    // see if any enemies are in the same grid square
    // as the player; if so, player is dead (reset him)
    for (var i=0; i < allEnemies.length; i++) {
        var enemy = allEnemies[i];
        if (enemy.enemyFoundIn(this.row, this.col)) {
            this.reset();
        }
    }
};

// draw the player on the screen
// note that we use a fudge factor to center the player vertically
Player.prototype.render = function() {
    this.x = this.col * colWidth;
    this.y = this.row * rowHeight - 12 + scoreboardHeight;
    ctx.drawImage(Resources.get(this.sprite[this.spriteIndex]), this.x, this.y);
};

// handle keyboard input
Player.prototype.handleInput = function(keyCode) {
    //console.log(keyCode);
    switch(keyCode) {
        // pause and invoke the JS debugger
        case 'escape': {
            debugger;
            break;
        }
        // toggle through the various player sprites
        case 'home': {
            this.spriteIndex++;
            if (this.spriteIndex >= numPlayerSprites) {
                this.spriteIndex = 0;
            }
            player.render();
            break;
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
    player.row = playerHomeRow;
    player.col = playerHomeCol;
};

////////////////////////////////////////////////////////////////////
// Gem class
//
// Gem constructor
var Gem = function() {
    // reset gem and start it sleeping
    this.reset();
};

// update a single gem
Gem.prototype.update = function(dt) {

    // decrement gem's timer, see if we have timed out yet
    this.timer -= dt;
    if (this.timer > 0)
        return;

    // we have timed out, were we sleeping?
    switch (this.gemStatus) {

        // no, go to sleep
        default:
        case gemState.AWAKE: {
            this.reset();
            break;
        }

        // yes, wake up
        case gemState.ASLEEP: {
            this.awaken();
            break;
        }
    }
};

// log this gem
Gem.prototype.log = function() {
    console.log('GEM state=' + this.gemStatus + ' type=' + this.gemType +
        ' timer=' + this.timer +' row=' + this.row + ' col=' + this.col);
};

// draw the gem on the screen
Gem.prototype.render = function() {
    // if it's asleep don't draw it
    if (this.gemStatus == gemState.ASLEEP) {
        return;
    }
    // draw the gem (scale it down by half so it looks better)
    this.x = this.col * colWidth + colWidth/4;
    this.y = this.row * rowHeight + rowHeight/4 + 12 + scoreboardHeight;
    var img = Resources.get(this.sprite);
    ctx.drawImage(img, this.x, this.y, img.naturalWidth/2, img.naturalHeight/2);
};

// return true if there's a gem at this grid position
Gem.prototype.gemFoundIn = function(row, col) {

    // iterate through array of gems looking for a match
    for (var i=0; i < numGems; i++) {
        var gem = allGems[i];
        if (gem.gemStatus == gemState.ASLEEP) continue;
        if (row == gem.row && col == gem.col) {
            return true;
        }
    }
    return false;
};

// reset gem and put it to sleep
Gem.prototype.reset = function() {

    // set timeout for when this gem will wake up
    this.timer = Math.random() * (gemSleepTimeMax - gemSleepTimeMin)
                 + gemSleepTimeMin;

    // set gem type randomly
    this.gemType =  Math.floor( Math.random() * numGemTypes );

    // pick an image for this gem type
    switch (this.gemType) {
        default:
        case 0: {
            this.sprite = 'images/gem-orange.png';
            break;
        }
        case 1: {
            this.sprite = 'images/gem-green.png';
            break;
        }
        case 2: {
            this.sprite = 'images/gem-blue.png';
            break;
        }
    }

    // go to sleep for a while
    this.gemStatus = gemState.ASLEEP;
};

// wake a gem up by positioning it and making it visible
Gem.prototype.awaken = function() {

    // pick a random row and column for the gem
    // (we are not allowing multpile gems to occupy the
    // same grid slot, so we must make sure the grid slot
    // is unoccupied - we'll try 10 times to find an empty
    // grid slot.)
    var gemPlaced = false;
    this.row = -1;
    this.col = -1;
    for (var i = 0; i < 10; i++) {

        // pick a random row from 1 to 3
        var gemRow = Math.floor( Math.random() * 3 + 1 );

        // pick a random col from 0 to numCols - 1
        var gemCol = Math.floor( Math.random() * numCols );
        console.log("We will place the new gem at row "
            + gemRow + ", col " + gemCol);
        console.log("Let's see if there's anything on that square.")

        // is it an empty grid square? if so, claim it and stop looking.
        // make sure the player is not on that square, nor any gems
        if (player.row == gemRow && player.col == gemCol) {
            console.log('Whoops, the player is already at row ' + player.row
                + ', col ' + player.col);
        } else {
            console.log("Cool, the player isn't there. Player is at row " +
                player.row + ', col ' + player.col);

            // make sure there are no gems there, either
            // if we find one, continue to iterate
            if (this.gemFoundIn(gemRow, gemCol) ) {
                console.log("Bummer, there's already a gem there.");
                debugger;
                continue;
            } else {
                console.log("Awesome, no other gem is there, either.");
                gemPlaced = true;
                break;
            }
        }
    }

    // if we placed the gem, do some housekeeping
    if (gemPlaced) {
        // set gem to stay awake for the next 10 - 20 seconds
        this.timer = Math.random() *
            (gemAwakeTimeMax - gemAwakeTimeMin) + gemAwakeTimeMin;
        this.gemStatus = gemState.AWAKE;

        // remember its position in the grid
        this.row = gemRow;
        this.col = gemCol;
    }
    // if we didn't place the gem after 10 tries, go back to sleep
    else {
        debugger;
        this.reset();
    }
};

////////////////////////////////////////////////////////////////////ß
// Initialization
//
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];

// Place the player object in a variable called player
var player;

// Gems get an array of their own
var allGems = [];

var instantiateObjects = function() {

    // create enemies
    for (var i=0; i < numEnemies; i++) {
        allEnemies[i] = new Enemy();
    }

    // create Player
    player = new Player();

    // create gems
    for (var i=0; i < numGems; i++) {
        allGems[i] = new Gem();
    }
}

////////////////////////////////////////////////////////////////////
// Utilities
//
// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        27: 'escape',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

