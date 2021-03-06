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
    if (this.x > NUM_COLS * COL_WIDTH) {
        this.reset();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {

    // enemy's x coordinate is computed in update() above.
    // now compute enemy's y coordinate based on its row,
    // and draw this enemy.
    this.y = this.row * ROW_HEIGHT - ROW_HEIGHT/4 + SCOREBOARD_HEIGHT;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// reset an enemy's position and speed
Enemy.prototype.reset = function () {

    // reset enemy goes on a random row from 1-3
    this.row = Math.floor( Math.random() * 3 + 1 );

    // enemy starts offscreen left
    this.x = -200;

    // enemy speed is a constant, determined randomly
    this.increment = 150 + (Math.random() * 400);
};

///////////////////////////////////////////////////////////
//
// Enemy helper functions
//
// if input row and col contain an Enemy, return that enemy
// otherwise, return null
var findEnemy = function(row,col) {

    // iterate through all enemies on our enemies list
    for (var i=0; i < allEnemies.length; i++) {
        var enemy = allEnemies[i];

        // compute row and column of this enemy's head and tail
        // make the enemy be 1/3 of the way into a column before
        // a collision is detected there
        var enemyRow = enemy.row;
        var enemyTailCol = Math.floor( (enemy.x + COL_WIDTH/3) / COL_WIDTH );
        var enemyHeadCol = Math.floor( (enemy.x + COL_WIDTH - COL_WIDTH/3) / COL_WIDTH );

        // see if input row and column are the same as this enemy's
        if (row == enemyRow && (col == enemyHeadCol || col == enemyTailCol)) {
            return enemy;
        }
    }
    // no enemy found in the requested row and column
    return null;
};

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

    // set the player's grid coordinates and life count
    this.reset();
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
    // as the player; if so, player is dead, count one
    // life lost
    var enemy = findEnemy(this.row, this.col);
    if (enemy !== null) {

        // decrement life count and check for end of game
        this.loseOneLife();
    }

    // see if there's a gem on this square, and if so, collect it
    var gem = findGem(this.row, this.col);
    if (gem !== null)
    {
        // collect the appropriate points award
        this.points += GEM_POINTS[ gem.gemType ];

        // put gem to sleep for a bit
        gem.reset();
    }

    // if player reached the water, give him points
    // and send him home (back to the grass)
    if (this.row <= 0) {
        this.points += WATER_POINTS;
        this.sendHome();
    }
};

// draw the player on the screen
// note that we use a fudge factor to center the player vertically
Player.prototype.render = function() {
    this.x = this.col * COL_WIDTH;
    this.y = this.row * ROW_HEIGHT - 12 + SCOREBOARD_HEIGHT;
    ctx.drawImage(Resources.get(this.sprite[this.spriteIndex]), this.x, this.y);
};

// handle keyboard input
Player.prototype.handleInput = function(keyCode) {

    switch(keyCode) {
        // pause and invoke the JS debugger
        case 'escape': {
            //debugger;
            break;
        }
        // toggle through the various player sprites
        case 'home': {
            this.spriteIndex++;
            if (this.spriteIndex >= NUM_PLAYER_SPRITES) {
                this.spriteIndex = 0;
            }
            player.render();
            scoreboard.render();
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
            if (this.col > NUM_COLS - 1) {
                this.col = NUM_COLS - 1;
            }
            break;
        }
        // move player one square up
        case 'up': {
            this.row--;
            if (this.row <= 0) {
                this.row = 0;
            }
            break;
        }
        // move player one square down
        case 'down': {
            this.row++;
            if (this.row > NUM_ROWS - 1) {
                this.row = NUM_ROWS - 1;
            }
            break;
        }
    }
};

// reset the player
Player.prototype.reset = function() {
    this.livesLeft = NUM_PLAYER_LIVES;
    this.points = 0;
    this.sendHome();
};

// send the player back to his home position
Player.prototype.sendHome = function() {
    this.row = PLAYER_HOME_ROW;
    this.col = PLAYER_HOME_COL;
};

// the player lost a life, send him home and decrement lives left
Player.prototype.loseOneLife = function() {
    this.sendHome();
    this.livesLeft--;

    // if he lost his last life, game over
    if (this.livesLeft <= 0) {

        if (window.confirm("Game over! Do you want to play again?")) {
            // yes, start a new game
            reset();
        } else {
            // no, go to udacity website
            window.location.href = "http://www.udacity.com";
        }
    }
};

////////////////////////////////////////////////////////////////////
// Gem class
//
// Gem constructor
var Gem = function() {
    // reset gem and start it sleeping (i.e. hidden)
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
        case GEM_STATE.AWAKE: {
            this.reset();
            break;
        }

        // yes, wake up
        case GEM_STATE.ASLEEP: {
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
    if (this.gemStatus == GEM_STATE.ASLEEP) {
        return;
    }

    // draw the gem (scale it down by half so it looks better)
    this.x = this.col * COL_WIDTH + COL_WIDTH/4;
    this.y = this.row * ROW_HEIGHT + ROW_HEIGHT/4 + 12 + SCOREBOARD_HEIGHT;
    var img = Resources.get(this.sprite);
    ctx.drawImage(img, this.x, this.y, img.naturalWidth/2, img.naturalHeight/2);

    // draw its point value on top
    var gemTextX = this.col * COL_WIDTH + COL_WIDTH/2;
    var gemTextY = this.row * ROW_HEIGHT + ROW_HEIGHT/2 +
        SPRITE_TOP_MARGIN + 12 + SCOREBOARD_HEIGHT;
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.font = "700 20px Arial";
    ctx.textAlign = "center";
    ctx.lineWidth = 2;
    ctx.strokeText(GEM_POINTS[this.gemType], gemTextX, gemTextY);
    ctx.fillText(GEM_POINTS[this.gemType], gemTextX, gemTextY);
};

// reset gem and put it to sleep
Gem.prototype.reset = function() {

    // set timeout for when this gem will wake up
    this.timer = Math.random() * (GEM_SLEEP_TIME_MAX - GEM_SLEEP_TIME_MIN) +
        GEM_SLEEP_TIME_MIN;

    // set gem type randomly
    var rand = Math.random();

    // force an unequal distrubtion: 50% orange, 30% green, 20% blue
    if (rand < 0.5) {
        this.gemType = 0;   // orange
        this.sprite = 'images/gem-orange.png';

    } else if (rand < 0.80) {
        this.gemType = 1;   // green
        this.sprite = 'images/gem-green.png';

    } else {
        this.gemType = 2;   // blue
        this.sprite = 'images/gem-blue.png';
    }

    // go to sleep for a while
    this.gemStatus = GEM_STATE.ASLEEP;
};

// wake a gem up by positioning it and making it visible
Gem.prototype.awaken = function() {

    // pick a random row and column for the gem
    // (we are not allowing multpile gems to occupy the
    // same grid slot, so we must make sure the grid slot
    // is unoccupied - we'll try 10 times to find an empty
    // grid slot.)
    var gemPlaced = false;
    var gemRow = -1;
    var gemCol = -1;
    this.row = -1;
    this.col = -1;
    for (var i = 0; i < 10; i++) {

        // pick a random row from 1 to 3
        gemRow = Math.floor( Math.random() * 3 + 1 );

        // pick a random col from 0 to NUM_COLS - 1
        gemCol = Math.floor( Math.random() * NUM_COLS );

        // is it an empty grid square? if so, claim it and stop looking.
        // make sure the player is not on that square, nor any gems
        if (player.row == gemRow && player.col == gemCol) {

            // the player's on that square, try again
            continue;

        } else {

            // make sure there are no gems there, either
            // if we find one, continue to iterate
            if (findGem(gemRow, gemCol) === null) {

                // no gems found, either, looks like we have our square
                gemPlaced = true;
                break;

            } else {
                // bummer, there's already a gem theres;
                continue;
            }
        }
    }

    // if we placed the gem, do some housekeeping
    if (gemPlaced) {
        // set gem to stay awake for the next 10 - 20 seconds
        this.timer = Math.random() *
            (GEM_AWAKE_TIME_MAX - GEM_AWAKE_TIME_MIN) + GEM_AWAKE_TIME_MIN;
        this.gemStatus = GEM_STATE.AWAKE;

        // remember its position in the grid
        this.row = gemRow;
        this.col = gemCol;
    }
    // if we didn't place the gem after 10 tries, go back to sleep
    else {
        this.reset();
    }
};

//////////////////////////////////////////////////////////////////
//
// Gem helper functions
//
// if there's a gem at this grid position, return it
// if not, return null
var findGem = function(row, col) {

    // iterate through array of gems looking for a match
    for (var i=0; i < NUM_GEMS; i++) {
        var gem = allGems[i];
        if (gem.gemStatus == GEM_STATE.ASLEEP) {
            // don't count sleeper
            continue;
        }
        if (row == gem.row && col == gem.col) {
            return gem;
        }
    }
    return null;
};


////////////////////////////////////////////////////////////////////
// Scoreboard class
//
// Scoreboard constructor
var Scoreboard = function() {
    // initialize scorebord location
    this.x = 0;
    this.y = SPRITE_TOP_MARGIN;
    this.width = NUM_COLS * COL_WIDTH;
    this.height = SCOREBOARD_HEIGHT;
};

// draw the scoreboardupdate a single gem
Scoreboard.prototype.render = function() {

    // draw background
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "rgb(206,218,255)";
    ctx.fill();
    ctx.strokeStyle = "rgb(80,80,80)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // draw background rect for player icon
    var scoreboardMargin = 10;
    var rectX = this.x + scoreboardMargin;
    var rectY = this.y + scoreboardMargin;
    var rectHeight = this.height - 2 * scoreboardMargin;
    var rectWidth = rectHeight;
    ctx.beginPath();
    ctx.rect(rectX, rectY, rectWidth, rectHeight);
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fill();
    ctx.strokeStyle = "rgb(80,80,80)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // draw player icon (75% size)
    var img = Resources.get(player.sprite[player.spriteIndex]);
    var iconWidth = img.naturalWidth * 0.75;
    var iconHeight = img.naturalHeight * 0.75;
    var iconX = rectX + (rectWidth - iconWidth) / 2;
    var iconY = rectY + (rectHeight - iconHeight - SPRITE_TOP_MARGIN * 0.75) / 2;
    ctx.drawImage(img, iconX, iconY, iconWidth, iconHeight);

    // draw "HOME" help text
    ctx.fillStyle = "rgb(145,145,145)";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PRESS HOME", rectX + rectWidth / 2, rectY + rectHeight - 3);

    // draw number of lives left
    var lifeWidth = img.naturalWidth * 0.5;
    var lifeHeight = img.naturalHeight * 0.5;
    var lifeX = this.x + rectWidth + 2 * scoreboardMargin;
    var lifeY = this.y + (this.height - lifeHeight - SPRITE_TOP_MARGIN * 0.5) / 2 + 6;
    for (var i=0; i < NUM_PLAYER_LIVES; i++) {
        if (i >= player.livesLeft) {  // draw lives that are gone as ghosts
            ctx.save();
            ctx.globalAlpha = 0.2;
        }
        ctx.drawImage(img, lifeX, lifeY, lifeWidth, lifeHeight);
        if (i >= player.livesLeft) {
            ctx.restore();
        }
        lifeX += lifeWidth - 10;
    }

    // draw point total
    ctx.font = "40pt Courier";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgb(145,145,145)";
    ctx.fillText(player.points, this.x + this.width - scoreboardMargin,
                    this.y + this.height * 0.7);

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

// Scoreboard is an object, too
var scoreboard;

// this function is called once at startup to create our obects
var instantiateObjects = function() {

    // create enemies
    for (var i=0; i < NUM_ENEMIES; i++) {
        allEnemies[i] = new Enemy();
    }

    // create Player
    player = new Player();

    // create gems
    for (i=0; i < NUM_GEMS; i++) {
        allGems[i] = new Gem();
    }

    // create scoreboard
    scoreboard = new Scoreboard();
}
;
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

