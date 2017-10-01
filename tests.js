module("GMBoard", {
	setup: function() {
		board = new GMBoard(19);
	}
});

test("new", function() {
	equal(board.size, 19);
	equal(board.next, board.X);
	equal(board.winner, board.None);
	equal(board.stonesToWin, 5);
});

test("translatePos", function() {
	equal(board.translatePos(0, 0), 0);
	equal(board.translatePos(5, 0), 5);
	equal(board.translatePos(0, 5), 105);
	equal(board.translatePos(5, 5), 110);
});

test("get/set", function() {
	equal(board.get(0, 3), board.Boundary);
	equal(board.get(5, 5), board.None);
	equal(board.get(20, 3), board.Boundary);
	board.set(5, 5, board.X);
	equal(board.get(5, 5), board.X);
	equal(board.get(4, 4), board.None);
});

test("isValidPos", function() {
	ok(!board.isValidPos(-1, -1));
	ok(board.isValidPos(0, 0));
	ok(!board.isValidPos(0, 21));
	ok(!board.isValidPos(21, 21));
	ok(board.isValidPos(20, 20));
});

test("assertValidPos", function() {
	raises(function() { board.assertValidPos(-1, -1); });
	board.assertValidPos(0, 0);
	raises(function() { board.assertValidPos(0, 21); });
	raises(function() { board.assertValidPos(21, 21); });
	board.assertValidPos(20, 20);
});

test("move", function() {
	equal(board.next, board.X);
	ok(!board.canMove(0, 0));
	raises(function() { board.move(0, 0); });
	equal(board.next, board.X);
	ok(board.canMove(1, 1));
	board.move(1, 1);
	equal(board.next, board.O);
	equal(board.get(1, 1), board.X);
	ok(board.canMove(1, 2));
	board.move(1, 2);
	equal(board.next, board.X);
	equal(board.get(1, 1), board.X);
	equal(board.get(1, 2), board.O);
	ok(!board.canMove(1, 2));
	raises(function() { board.move(1, 2); });
	equal(board.moves[0].col, 1);
	equal(board.moves[0].row, 1);
	equal(board.moves[1].col, 1);
	equal(board.moves[1].row, 2);
});

function _testMoveToWin(dcol, drow) {
	var col = Math.floor(board.size / 2);
	var row = Math.floor(board.size / 2);
	for(var i = 1; i < board.stonesToWin; i++) {
		equal(board.winner, board.None);
		board.move(col, row);
		if (dcol == 0) {
			board.move(col+1, row);
		} else {
			board.move(col, row+1);
		}
		col += dcol;
		row += drow;
	}
	equal(board.winner, board.None);
	board.move(col, row);
	equal(board.winner, board.X);
	equal(board.next, board.None);
	raises(function() { board.move(col, row+1); });
}

test("move to win 1", function() {
	_testMoveToWin(1, -1);
});

test("move to win 2", function() {
	_testMoveToWin(1, 0);
});

test("move to win 3", function() {
	_testMoveToWin(1, 1);
});

test("move to win 4", function() {
	_testMoveToWin(0, -1);
});

test("move to win 5", function() {
	_testMoveToWin(0, 1);
});

test("move to win 6", function() {
	_testMoveToWin(-1, -1);
});

test("move to win 7", function() {
	_testMoveToWin(-1, 0);
});

test("move to win 8", function() {
	_testMoveToWin(-1, 1);
});

test("move to win 9", function() {
	board = new GMBoard(3, 3);
	board.move(1, 1);
	board.move(1, 2);
	board.move(3, 1);
	board.move(3, 2);
	board.move(2, 1);
	equal(board.winner, board.X);
	equal(board.winningLine.col1, 3);
	equal(board.winningLine.row1, 1);
	equal(board.winningLine.col2, 1);
	equal(board.winningLine.row2, 1);
});

test("move to draw 1", function() {
	board = new GMBoard(3, 5);
	board.move(1,1);
	equal(board.winner, board.Draw);
	equal(board.next, board.None);
});

test("move to draw 2", function() {
	board = new GMBoard(1);
	equal(board.winner, board.None);
	equal(board.next, board.X);
	board.move(1, 1);
	equal(board.winner, board.Draw);
	equal(board.next, board.None);
});

test("move to draw 3", function() {
	board = new GMBoard(3, 3);
	board.move(1,1);
	board.move(1,2);
	board.move(1,3);
	board.move(3,1);
	board.move(3,2);
	board.move(2,1);
	board.move(2,2);
	board.move(3,3);
	equal(board.winner, board.Draw);
	equal(board.next, board.None);
});
