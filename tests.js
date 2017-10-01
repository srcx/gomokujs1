QUnit.module("GMBoard", {
	beforeEach: function() {
		this.board = new GMBoard(19);
	}
});

QUnit.test("new", function(assert) {
	assert.equal(this.board.size, 19);
	assert.equal(this.board.next, this.board.X);
	assert.equal(this.board.winner, this.board.None);
	assert.equal(this.board.stonesToWin, 5);
});

QUnit.test("translatePos", function(assert) {
	assert.equal(this.board.translatePos(0, 0), 0);
	assert.equal(this.board.translatePos(5, 0), 5);
	assert.equal(this.board.translatePos(0, 5), 105);
	assert.equal(this.board.translatePos(5, 5), 110);
});

QUnit.test("get/set", function(assert) {
	assert.equal(this.board.get(0, 3), this.board.Boundary);
	assert.equal(this.board.get(5, 5), this.board.None);
	assert.equal(this.board.get(20, 3), this.board.Boundary);
	this.board.set(5, 5, this.board.X);
	assert.equal(this.board.get(5, 5), this.board.X);
	assert.equal(this.board.get(4, 4), this.board.None);
});

QUnit.test("isValidPos", function(assert) {
	assert.ok(!this.board.isValidPos(-1, -1));
	assert.ok(this.board.isValidPos(0, 0));
	assert.ok(!this.board.isValidPos(0, 21));
	assert.ok(!this.board.isValidPos(21, 21));
	assert.ok(this.board.isValidPos(20, 20));
});

QUnit.test("assertValidPos", function(assert) {
	assert.throws(function() { this.board.assertValidPos(-1, -1); });
	this.board.assertValidPos(0, 0);
	assert.throws(function() { this.board.assertValidPos(0, 21); });
	assert.throws(function() { this.board.assertValidPos(21, 21); });
	this.board.assertValidPos(20, 20);
});

QUnit.test("move", function(assert) {
	assert.equal(this.board.next, this.board.X);
	assert.ok(!this.board.canMove(0, 0));
	assert.throws(function() { this.board.move(0, 0); });
	assert.equal(this.board.next, this.board.X);
	assert.ok(this.board.canMove(1, 1));
	this.board.move(1, 1);
	assert.equal(this.board.next, this.board.O);
	assert.equal(this.board.get(1, 1), this.board.X);
	assert.ok(this.board.canMove(1, 2));
	this.board.move(1, 2);
	assert.equal(this.board.next, this.board.X);
	assert.equal(this.board.get(1, 1), this.board.X);
	assert.equal(this.board.get(1, 2), this.board.O);
	assert.ok(!this.board.canMove(1, 2));
	assert.throws(function() { this.board.move(1, 2); });
	assert.equal(this.board.moves[0].col, 1);
	assert.equal(this.board.moves[0].row, 1);
	assert.equal(this.board.moves[1].col, 1);
	assert.equal(this.board.moves[1].row, 2);
});

function _testMoveToWin(board, dcol, drow, assert) {
	var col = Math.floor(board.size / 2);
	var row = Math.floor(board.size / 2);
	for(var i = 1; i < board.stonesToWin; i++) {
		assert.equal(board.winner, board.None);
		board.move(col, row);
		if (dcol == 0) {
			board.move(col+1, row);
		} else {
			board.move(col, row+1);
		}
		col += dcol;
		row += drow;
	}
	assert.equal(board.winner, board.None);
	board.move(col, row);
	assert.equal(board.winner, board.X);
	assert.equal(board.next, board.None);
	assert.throws(function() { board.move(col, row+1); });
}

QUnit.test("move to win 1", function(assert) {
	_testMoveToWin(this.board, 1, -1, assert);
});

QUnit.test("move to win 2", function(assert) {
	_testMoveToWin(this.board, 1, 0, assert);
});

QUnit.test("move to win 3", function(assert) {
	_testMoveToWin(this.board, 1, 1, assert);
});

QUnit.test("move to win 4", function(assert) {
	_testMoveToWin(this.board, 0, -1, assert);
});

QUnit.test("move to win 5", function(assert) {
	_testMoveToWin(this.board, 0, 1, assert);
});

QUnit.test("move to win 6", function(assert) {
	_testMoveToWin(this.board, -1, -1, assert);
});

QUnit.test("move to win 7", function(assert) {
	_testMoveToWin(this.board, -1, 0, assert);
});

QUnit.test("move to win 8", function(assert) {
	_testMoveToWin(this.board, -1, 1, assert);
});

QUnit.test("move to win 9", function(assert) {
	this.board = new GMBoard(3, 3);
	this.board.move(1, 1);
	this.board.move(1, 2);
	this.board.move(3, 1);
	this.board.move(3, 2);
	this.board.move(2, 1);
	assert.equal(this.board.winner, this.board.X);
	assert.equal(this.board.winningLine.col1, 3);
	assert.equal(this.board.winningLine.row1, 1);
	assert.equal(this.board.winningLine.col2, 1);
	assert.equal(this.board.winningLine.row2, 1);
});

QUnit.test("move to draw 1", function(assert) {
	this.board = new GMBoard(3, 5);
	this.board.move(1,1);
	assert.equal(this.board.winner, this.board.Draw);
	assert.equal(this.board.next, this.board.None);
});

QUnit.test("move to draw 2", function(assert) {
	this.board = new GMBoard(1);
	assert.equal(this.board.winner, this.board.None);
	assert.equal(this.board.next, this.board.X);
	this.board.move(1, 1);
	assert.equal(this.board.winner, this.board.Draw);
	assert.equal(this.board.next, this.board.None);
});

QUnit.test("move to draw 3", function(assert) {
	this.board = new GMBoard(3, 3);
	this.board.move(1,1);
	this.board.move(1,2);
	this.board.move(1,3);
	this.board.move(3,1);
	this.board.move(3,2);
	this.board.move(2,1);
	this.board.move(2,2);
	this.board.move(3,3);
	assert.equal(this.board.winner, this.board.Draw);
	assert.equal(this.board.next, this.board.None);
});
