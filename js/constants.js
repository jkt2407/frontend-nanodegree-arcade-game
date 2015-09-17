	/*
	 * Keep global constants in one place, rather then sprinkle "magic numbers"
	 * throughout the code
	 */
// global constants
var numRows = 6;			// number of rows in game
var numCols = 5;			// number of cols in game
var rowHeight = 83;			// height of a single row
var colWidth = 101;			// width of a single column
var playerHomeRow = 5;		// where player starts out
var playerHomeCol = 2;		// where player starts out
var firstGemTimeout = 2;	// number of seconds before first gem appears
var gemBornMin = 2;			// min numer of seconds before a new gem appears
var gemBornMax = 5;			// max numer of seconds before a new gem appears
var gemLifetimeMin = 10;	// min number of seconds a gem stays onscreen
var gemLifetimeMax = 20;	// max number of seconds a gem stays onscreen
var gemTypes = 3;			// number of gem types
var maxGems = 4;			// number of simultaneous gems allowed