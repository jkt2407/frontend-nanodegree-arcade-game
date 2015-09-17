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

// return true if input row and col contain an Enemy
Enemy.prototype.checkCollision = function(row,col) {

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

// log this player
Player.prototype.log = function() {
    console.log('player ' +
            ' row=' + this.row +
            ' col=' + this.col +
            ' markedForDeletion=' + this.markedForDeletion
    );
};


// Update the player's position
Player.prototype.update = function(dt) {

    // see if any enemies are in the same grid square
    // as the player; if so, player is dead (reset him)
    for (var i=0; i < allEnemies.length; i++) {
        var enemy = allEnemies[i];
        if (enemy.checkCollision(this.row, this.col)) {
            this.reset();
        }
    }
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
        // pause and invoke the JS debugger
        case 'escape': {
            console.log("escape");
            debugger;
            break;
        }
        // toggle through the various player skins
        case 'home': {
            this.spriteIndex++;
            if (this.spriteIndex > 4) {
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

// global variable is a countdown timer for when next gem is added
var gemCreationTimer = firstGemTimeout;

// if it's time, add a new gem to the game
Player.prototype.addNewGem = function(dt) {
    // decrement our master timer;
    // if we timed out, create a new gem
    gemCreationTimer -= dt;
    if (gemCreationTimer < 0) {
        console.log('Master timer elapsed -- creating a new gem')
        var gem = new Gem();    // the constructor does all the work
    }
}
// remove all gems from the array that are marked for deletion
Player.prototype.removeOldGems = function() {

    // see if any gems are marked for deletion
    var deletionPending = false;
    for (var i=0; i < allGems.length; i++) {
        if (allGems[i].markedForDeletion) {
            deletionPending = true;
            break;
        }
    }
    // if no deletions pending, we are done
    if (!deletionPending) {
        return;
    }

    // make a copy of the current gems array
    var oldArray = allGems.slice(0);
    console.log("We are about to remove those gems marked for deletion");
    logGemArray(oldArray);
    logGemArray(allGems);

    // clear allGems and copy all the objets to it that aren't
    // marked for deletion
    console.log("Clear out allGems array");
    allGems = [];
    logGemArray(allGems);
    for (var j=0; j < oldArray.length; j++) {
        var gem = oldArray.shift();
        if (!gem.markedForDeletion) {
            allGems.push(gem);
        }
    }
    console.log("Finished removing gems marked for deletion.");
    logGemArray(allGems);

};

////////////////////////////////////////////////////////////////////
// Gem class
//
// Gems are created at random and placed on the roadway to be collected
var Gem = function() {

    console.log('Running Gem constructor.')

    // if we already have our maximium number of gems, do nothing
    if (allGems.length >= maxGems) {
        console.log('Already have ' + allGems.length + ' gems, no need for more.');
        return null;
    }

    // set master gem timeout for next gem to appear
    gemCreationTimer = Math.random() * (gemBornMax - gemBornMin) + gemBornMin;
    console.log('Next gem will appear in ' + gemCreationTimer + ' seconds');

    // init row and col, clear delete flag
    this.row = 0;
    this.col = 0;
    this.markedForDeletion = false;

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
    // (we are not allowing multpile gems to occupy the
    // same grid slot, so we must make sure the grid slot
    // is unoccupied - we'll try 10 times to find an empty
    // grid slot.)
    var gemPlaced = false;
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
            logGemArray(allGems);

            // make sure there are no gems there, either
            var index = getIndexOfMatchingGem(gemRow,gemCol);
            if (index >= 0) {
                console.log("Bummer, there's already a gem there. Here's the gem array:");
                logGemArray(allGems);
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
        // set gem to live for the next 10 - 20 seconds
        this.lifeTimer = Math.random() *
            (gemLifetimeMax - gemLifetimeMin) + gemLifetimeMin;

        // remember its position in the grid
        this.row = gemRow;
        this.col = gemCol;

        // push it onto gems array
        allGems.push(this);
        console.log('We just created this gem: ');
        this.log();
        logGemArray(allGems);
    }
    // if we didn't place the gem after 10 tries, return null
    else {
        return null;
    }
};

// update a single gem
Gem.prototype.update = function(dt) {

    // if player has landed on a gem square, collect the gem
    if (this.checkCollision(player.row, player.col)) {
        player.collectGem();
    }
    // decrement gem's lifetime counter
    // if time has elapsed, mark the gem for deletion
    this.deathPanel(dt);
};

// log this gem
Gem.prototype.log = function(index) {
    console.log('gem index=' + index +
            ' row=' + this.row +
            ' col=' + this.col +
            ' markedForDeletion=' + this.markedForDeletion
    );
};

// draw the gem on the screen
Gem.prototype.render = function() {
    this.x = this.col * colWidth + colWidth/4;
    this.y = this.row * rowHeight + rowHeight/4 + 12;
    var img = Resources.get(this.sprite);
    ctx.drawImage(img, this.x, this.y, img.naturalWidth/2, img.naturalHeight/2);
};

// return true if there's a gem at this grid position
Gem.prototype.checkCollision = function(row, col) {

    // iterate through array of gems looking for a match
    if (row == this.row && col == this.col) {
        return true;
    }
    return false;
};

// gem "death panel" decrements each gem's life timeout;
// if time has elapseed, the gem is removed
Gem.prototype.deathPanel = function(dt) {
    // decrement this gem's personal clock
    this.lifeTimer -= dt;

    // if gem has timed out...
    if (this.lifeTimer < 0) {

        // mark it for removal from allGems array
        console.log('We are about to mark this gem for removal:')
        this.log();
        console.log('from this array');
        logGemArray(allGems);
        for (var i=0; i < allGems.length; i++) {
            if (this === allGems[i]) {
                this.markedForDeletion = true;
                break;
            }
        }
    }
};

////////////////////////////////////////////////////////////////////ß
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

// Here's an array where we store the active gems
var allGems = [];

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

// get the index in the gem array of the gem that matches (row,col);
// if no match, return -1
getIndexOfMatchingGem = function(row,col) {
    for (var i=0; i < allGems.length; i++) {
        var gem = allGems[i];
        if (gem.checkCollision(row,col)) {
            return i;
        }
    }
    return -1;
}

// log the contents of the gem array
logGemArray = function(arr) {
    console.log('=============================================================');
    console.log('GEM ARRAY: ' + arr.length + ' elements');
    for (var i=0; i < arr.length; i++) {
           var gem = arr[i];
           gem.log(i);
    }
    console.log('=============================================================');
}
