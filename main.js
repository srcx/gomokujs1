function sgn(x) {
	return (x > 0) ? 1 : (x < 0) ? -1 : 0;
}
function isInt(num) {
	return typeof num === 'number' && num % 1 == 0;
}
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
	this.winningLine = { col1: -1, row1: -1, col2: -1, row2: -1 };
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
		var length1 = this.computeSameStoneLength(col, row, dcol, drow);
		this.winningLine.col1 = col + dcol * length1;
		this.winningLine.row1 = row + drow * length1;
		var length2 =  + this.computeSameStoneLength(col, row, -dcol, -drow);
		this.winningLine.col2 = col - dcol * length2;
		this.winningLine.row2 = row - drow * length2;
		var length = 1 + length1 + length2;
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
		this.winningLine = { col1: -1, row1: -1, col2: -1, row2: -1 };
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
var GMBoardUI = function(board, stateLeft, stateMiddle, stateRight, playerX, playerO, mbox, lastMsgRef, netStateCB, netRestartCB) {
	this.Human = "Human";
	this.RemoteHuman = "Remote Human";
	this.board = board;
	this.stateLeft = stateLeft;
	this.stateMiddle = stateMiddle;
	this.stateRight = stateRight;
	this.playerX = this._player(playerX);
	this.playerO = this._player(playerO);
	this.remotePlay = false;
	this.netStateCB = netStateCB;
	if (mbox != null) {
		this.remotePlay = true;
		this.mms = new MMService("", mbox);
		this.localPlayer = (playerX == this.Human) ? this.board.X : this.board.O;
		this.remotePlayer = (playerX == this.RemoteHuman) ? this.board.X : this.board.O;
		var _ui = this;
		this.procHandle = this.mms.startProcessing(lastMsgRef[0], this.remotePlayer, function(msg) {
			lastMsgRef[0] = msg.msgid;
			var msgParts = msg.content.split(/ /);
			if (msgParts[0] == "move") {
				if (_ui.board.next == _ui.remotePlayer) {
					var col = parseInt(msgParts[1]);
					var row = parseInt(msgParts[2]);
					if (_ui.board.canMove(col, row)) {
						_ui.board.move(col, row);
						_ui.updateUI(col, row);
					}
				}
			} else if (msgParts[0] == "resign") {
		    	_ui.board.next = _ui.board.None;
		    	_ui.board.winner = _ui.localPlayer;
		    	_ui.refreshState();
			} else if (msgParts[0] == "restart") {
				netRestartCB();
			}
		}, 500);
	}
};
GMBoardUI.prototype = {
	_player: function(player) {
		if (player == this.Human || player == this.RemoteHuman) {
			return player;
		}
		var aiIndex = parseInt(player);
		if (isInt(aiIndex) && aiIndex < AIRegistry.length) {
			return new AIRegistry[aiIndex](this.board);
		}
		return this.Human;
	},
	squareElementId: function(col, row) {
		return "GMBoard_" + col + "_" + row;
    },
	build: function(rootElem) {
		var _ui = this;
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
							if (_ui.remotePlay) {
								_ui.mms.send(_ui.board.next, "move " + col + " " + row);
							}
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
		if (this.board.next == this.board.None) {
			return false;
		}
		if (this.board.next == this.board.X) {
			return this.playerX == this.Human;
		}
		return this.playerO == this.Human;
	},
	isAINext: function() {
		if (this.board.next == this.board.None) {
			return false;
		}
		if (this.board.next == this.board.X) {
			return (this.playerX != this.Human) && (this.playerX != this.RemoteHuman);
		}
		return (this.playerO != this.Human) && (this.playerO != this.RemoteHuman);
	},
	playNext: function() {
		if (this.board.next != this.board.None) {
			if (this.isAINext()) {
				var _ui = this;
				this.aiTimeout = setTimeout(function() {
					var coors = _ui.computeAIMove(_ui.board.next);
					if (_ui.board.canMove(coors.col, coors.row)) {
						_ui.board.move(coors.col, coors.row);
					}
					_ui.updateUI(coors.col, coors.row);
				}, 100);
			}
		}
	},
	resign: function() {
		if (this.remotePlay) {
			this.mms.send(this.localPlayer, "resign");
	    	this.board.next = this.board.None;
	    	this.board.winner = this.remotePlayer;
	    	this.refreshState();
	    	return true;
		}
		return false;
	},
	restart: function() {
		if (this.remotePlay) {
			this.mms.send(this.localPlayer, "restart");
		}
	},
	stop: function() {
		if (this.aiTimeout != undefined) {
			clearTimeout(this.aiTimeout);
		}
		if (this.procHandle != undefined) {
			this.mms.stopProcessing(this.procHandle);
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
		var debug_span = '';//'<span></span>';
		switch (square) {
		case this.board.None : return '<img src="square_none.png">' + debug_span;
		case this.board.X : return '<img src="square_x.png" alt="X">' + debug_span;
		case this.board.O : return '<img src="square_o.png" alt="O">' + debug_span;
		default: throw("Unknown square content: " + square);
		}
	},
	refreshSquare: function(col, row) {
		var val = this.board.get(col, row);
		var squareElem = $('#' + this.squareElementId(col, row));
		squareElem.empty();
		squareElem.append(this.renderSquare(val));
	},
	getPlayerName: function(player) {
		if ((player == this.Human) || (player == this.RemoteHuman)) {
			return player;
		}
		return player.name;
	},
	highlightWinningLine: function() {
		var col = this.board.winningLine.col1;
		var row = this.board.winningLine.row1;
		var dcol = sgn(this.board.winningLine.col2 - col);
		var drow = sgn(this.board.winningLine.row2 - row);
		for(var i = 1; i <= this.board.stonesToWin; i++) {
			$("#" + this.squareElementId(col, row)).addClass("winning_square");
			col += dcol;
			row += drow;
		}
	},
	refreshState: function() {
		this.stateLeft.empty().append(this.renderSquare(this.board.X)).append(" ");
		if (this.board.next == this.board.X) {
			this.stateLeft.append("<b>" + this.getPlayerName(this.playerX) + "</b>");
		} else {
			this.stateLeft.append(this.getPlayerName(this.playerX));
		}
		
		this.stateRight.empty();
		if (this.board.next == this.board.O) {
			this.stateRight.append("<b>" + this.getPlayerName(this.playerO) + "</b>");
		} else {
			this.stateRight.append(this.getPlayerName(this.playerO));
		}
		this.stateRight.append(" ").append(this.renderSquare(this.board.O));
		
		if (this.board.winner == this.board.Draw) {
			this.stateMiddle.empty().append("<b>Game over! Draw</b>");
		} else if (this.board.winner != this.board.None) {
			this.stateMiddle.empty().append("<b>Game over! Winner is " + this.renderSquare(this.board.winner) + "</b>");
			this.highlightWinningLine();
		} else if (this.isHumanNext()) {
			this.stateMiddle.empty().append("Your turn");
		} else if (this.isAINext()) {
			this.stateMiddle.empty().append("Computer's turn");
		} else {
			this.stateMiddle.empty().append("Other player's turn");
		}
		this.netStateCB();
	},
	refreshBoard: function() {
		for(var row = 1; row <= this.board.size; row++) {
			for(var col = 1; col <= this.board.size; col++) {
				this.refreshSquare(col, row);
			}
		}
	}
};

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

function checkLocalStorage() {
	try {
		return window.localStorage;
	} catch (e) {
		return undefined;
	}
}

function GMSaveSettings(settings) {
	var json = "{";
	var first = true;
	for (var key in settings) {
		if (!first) {
			json += ',';
		} else {
			first = false;
		}
		json += '"' + key + '":"' + settings[key] + '"';
	}
	json += "}";
	if (checkLocalStorage()) {
		localStorage['settings'] = json;
	} else {
		createCookie('settings', json, 30);
	}
}

function GMLoadSettings() {
	var json;
	if (checkLocalStorage()) {
		json = localStorage["settings"];
	} else {
		json = readCookie("settings");
	}
	if (json == null) {
		return null;
	}
	try {
		return $.parseJSON(json);
	} catch (e) {
		alert(e);
		return null;
	}
}

function gup(name) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if (results == null) {
	    return null;
	} else {
	    return results[1];
	}
}
