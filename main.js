var GMBoard = function(size, stonesToWin) {
	this.size = size;
	this.data = new Array();
	this.moves = new Array();
	this.None = 0;
	this.X = 1;
	this.O = 2;
	this.Boundary = -1;
	this.next = this.X;
	this.Draw = -1;
	this.winner = this.None;
	this.stonesToWin = (stonesToWin == undefined) ? 5 : stonesToWin;
	
	for(var i = 0; i <= this.size + 1; i++) {
		for(var j = 0; j <= this.size + 1; j++) {
			var val = this.None;
			if ((i == 0) || (i == this.size + 1) || (j == 0) || (j == this.size + 1)) {
				val = this.Boundary;
			}
			this.set(i, j, val);
		}
	}
};
GMBoard.prototype = {
	isValidPos: function(col, row) {
		return ((col >= 0) && (col <= (this.size + 1)) && (row >= 0) && (row <= (this.size + 1)));
	},
	assertValidPos: function(col, row) {
		if (!this.isValidPos(col, row)) {
			throw("Invalid board position: [" + col + "," + row + "]");
		}
    },
    translatePos: function(col, row) {
		this.assertValidPos(col, row);
		return (row * (this.size + 2)) + col;
	},
	set: function(col, row, val) {
		this.data[this.translatePos(col, row)] = val;
	},
    get: function(col, row) {
		return this.data[this.translatePos(col, row)];
	},
	canMove: function(col, row) {
		if ((this.next != this.X) && (this.next != this.O)) {
			return false;
		}
		var cur = this.get(col, row);
		if (cur != this.None) {
			return false;
		}
		return true;
	},
	move: function(col, row) {
		if ((this.next != this.X) && (this.next != this.O)) {
			throw("No player is next: " + this.next);
		}
		var cur = this.get(col, row);
		if (cur != this.None) {
			throw("Square already occupied: [" + col + "," + row + "]");
		}
		this.set(col, row, this.next);
		this.moves.push({ col: col, row: row });
		if (this.isWinningPos(col, row)) {
			this.winner = this.next;
			this.next = this.None;
		} else if (this.isDraw()) {
			this.winner = this.Draw;
			this.next = this.None;
		} else {
			this.next = (this.next == this.X) ? this.O : this.X;
		}
	},
	isDrawLine: function(col, row, dcol, drow) {
		var last = this.None;
		var len = 0;
		var lenNone = 0;
		for (var i = 0; i < this.size; i++) {
//			$("#GMBoard_" + col + "_" + row + " span").append("*");
			var square = this.get(col, row);
			if ((square == last) || (square == this.None)) {
				len++;
				if (len >= this.stonesToWin) {
					return false;
				}
			} else {
				last = square;
				len = lenNone + 1;
			}
			if (square == this.None) {
				lenNone++;
			} else {
				lenNone = 0;
			}
			if (square == this.Boundary) {
				return true;
			}
			col += dcol;
			row += drow;
		}
		return true;
	},
	isDraw: function() {
		for (var row = 1; row <= this.size; row++) {
			if (!this.isDrawLine(1, row, 1, 0)) {
				return false;
			}
			if (!this.isDrawLine(1, row, 1, 1)) {
				return false;
			}
			if (!this.isDrawLine(1, row, 1, -1)) {
				return false;
			}
		}
		for (var col = 1; col <= this.size; col++) {
			if (!this.isDrawLine(col, 1, 0, 1)) {
				return false;
			}
			if (col > 1) {
				if (!this.isDrawLine(col, 1, 1, 1)) {
					return false;
				}
				if (!this.isDrawLine(col, this.size, 1, -1)) {
					return false;
				}
			}
		}
		return true;
	},
	computeSameStoneLength: function(col, row, dcol, drow) {
		var length = 0;
		var cur = this.get(col, row);
		for(var i = 1; i < this.stonesToWin; i++) {
			col += dcol;
			row += drow;
			if (this.get(col, row) != cur) {
				break;
			}
			length++;
		}
		return length;
	},
	isWinningPosDirected: function(col, row, dcol, drow) {
		var length = 1 + this.computeSameStoneLength(col, row, dcol, drow) + this.computeSameStoneLength(col, row, -dcol, -drow);
		return (length >= this.stonesToWin);
	},
	isWinningPos: function(col, row) {
		if (this.isWinningPosDirected(col, row, 1, -1)) {
			return true;
		}
		if (this.isWinningPosDirected(col, row, 1, 0)) {
			return true;
		}
		if (this.isWinningPosDirected(col, row, 1, 1)) {
			return true;
		}
		if (this.isWinningPosDirected(col, row, 0, -1)) {
			return true;
		}
		return false;
	},
	toString: function() {
		var ret = "";
		for(var row = 0; row <= this.size + 1; row++) {
			for(var col = 0; col <= this.size + 1; col++) {
				var val = this.get(col, row);
				switch (val) {
				case this.None : ret += " "; break;
				case this.X : ret += "X"; break;
				case this.O : ret += "O"; break;
				case this.Boundary : ret += "#"; break;
				default: ret += val;
				}
			}
			ret += "\n";
		}
		return ret;
	}
};

var AIRegistry = new Array();
var GMBoardUI = function(board, stateElem, playerX, playerO) {
	this.Human = "Human";
	this.board = board;
	this.stateElem = stateElem;
	this.playerX = (playerX == this.Human) ? this.Human : new AIRegistry[parseInt(playerX)](this.board);
	this.playerO = (playerO == this.Human) ? this.Human : new AIRegistry[parseInt(playerO)](this.board);
};
GMBoardUI.prototype = {
	squareElementId: function(col, row) {
		return "GMBoard_" + col + "_" + row;
    },
	build: function(elem) {
		var _ui = this;
		var rootElem = document.createElement("table");
		elem.appendChild(rootElem);
		for(var row = 1; row <= this.board.size; row++) {
			var rowElem = document.createElement("tr");
			rootElem.appendChild(rowElem);
			for(var col = 1; col <= this.board.size; col++) {
				var squareElem = document.createElement("td");
				rowElem.appendChild(squareElem);
				squareElem.setAttribute("id", this.squareElementId(col, row));
				$(squareElem).data("col", col);
				$(squareElem).data("row", row);
				$(squareElem).click(function() {
					if (_ui.isHumanNext()) {
						var col = $(this).data('col');
						var row = $(this).data('row');
						if (_ui.board.canMove(col, row)) {
							_ui.board.move(col, row);
							_ui.updateUI(col, row);
						}
					}
				});
			}
		}
		return rootElem;
	},
	isHumanNext: function() {
		if (this.board.next == this.board.X) {
			return this.playerX == this.Human;
		}
		return this.playerO == this.Human;
	},
	playNext: function() {
		if (this.board.next != this.board.None) {
			if (!this.isHumanNext()) {
				var _ui = this;
				setTimeout(function() {
					var coors = _ui.computeAIMove(_ui.board.next);
					if (_ui.board.canMove(coors.col, coors.row)) {
						_ui.board.move(coors.col, coors.row);
					}
					_ui.updateUI(coors.col, coors.row);
				}, 100);
			}
		}
	},
	computeAIMove: function() {
		var ai, enemy;
		if (this.board.next == this.board.X) {
			ai = this.playerX;
			enemy = this.board.O;
		} else {
			ai = this.playerO;
			enemy = this.board.X;
		}
		return ai.computeMove(this.board.next, enemy);
	},
	updateUI: function(col, row) {
		this.refreshSquare(col, row);
		this.refreshState();
		this.playNext();
	},
	renderSquare: function(square) {
		var debug_span = '<span></span>';
		switch (square) {
		case this.board.None : return '<img src="square_none.png"></img>' + debug_span;
		case this.board.X : return '<img src="square_x.png"></img>' + debug_span;
		case this.board.O : return '<img src="square_o.png"></img>' + debug_span;
		default: throw("Unknown square content: " + square);
		}
	},
	refreshSquare: function(col, row) {
		var squareElem = document.getElementById(this.squareElementId(col, row));
		var val = this.board.get(col, row);
		squareElem.innerHTML = this.renderSquare(val);
	},
	refreshState: function() {
		if (this.board.winner == this.board.Draw) {
			this.stateElem.innerHTML = "Game over! Draw " + this.renderSquare(this.board.None);
		} else if (this.board.winner != this.board.None) {
			this.stateElem.innerHTML = "Game over! Winner is " + this.renderSquare(this.board.winner);
		} else {
			this.stateElem.innerHTML = "Next is " + this.renderSquare(this.board.next);
		}
	},
	refreshBoard: function() {
		for(var row = 1; row <= this.board.size; row++) {
			for(var col = 1; col <= this.board.size; col++) {
				this.refreshSquare(col, row);
			}
		}
	}
};
