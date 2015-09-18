	/*
	 * Keep global constants in one place, rather then sprinkle "magic numbers"
	 * throughout the code
	 */
// global constants

// canvas
var scoreboardHeight = 100;		// height of scoreboard at top of screen
var numRows = 6;				// number of rows in game
var numCols = 5;				// number of cols in game
var rowHeight = 83;				// height of a single row (doesn't include margin)
var colWidth = 101;				// width of a single column
var playerHomeRow = 5;			// where player starts out
var playerHomeCol = 2;			// where player starts out

// enemies
var numEnemies = 3;				// number of simultaneous enemies

// player
var numPlayerSprites = 5;		// number of player personas
var spriteTopMargin = 50;		// height of transparent area at the top of each sprite
var numPlayerLives = 4;			// how many times you can die until game over

// gems
var numGems = 4;				// number of simultaneous gems allowed
var numGemTypes = 3;			// number of gem types
var gemState = {				// enum of gem states
  ASLEEP: 1,					// hidden, waiting to time out and wake up
  AWAKE: 2						// visible, waiting to be gathered
};
var gemSleepTimeMin = 2;		// min number of seconds before a gem appears
var gemSleepTimeMax = 5;		// max number of seconds before a gem appears
var gemAwakeTimeMin = 10;		// min number of seconds a gem stays onscreen
var gemAwakeTimeMax = 20;		// max number of seconds a gem stays onscreen

// points
var waterPoints = 100;			// points for reaching the water
var gemPoints =					// points for collecting a gem
    	[100, 250, 500];		// point value of each gem type
