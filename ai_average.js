var AIAverage = function(board) {
	this.board = board;
};
AIAverage.prototype = {
	name: "Average Joe",
	computeMove: function(player, enemy) {
		var max_col = Math.floor(this.board.size / 2) + 1;
		var max_row = Math.floor(this.board.size / 2) + 1;
		if (this.board.moves.length > 0) {
			var max_weight = -1;
			for(var row = 1; row <= this.board.size; row++) {
				for(var col = 1; col <= this.board.size; col++) {
					var weightPlayer = this.computeWeight(player, false, col, row);
					var weightEnemy = this.computeWeight(enemy, true, col, row);
//					var weight = weightPlayer + weightEnemy;
					var weight = Math.max(weightPlayer, weightEnemy);
					weight *= 1 + Math.random() / 20;
//					alert(col + " " + row + " " + weight);
//					$("#GMBoard_" + col + "_" + row + " span").empty().append(Math.round(weight * 100));
					if (weight > max_weight) {
						max_col = col;
						max_row = row;
						max_weight = weight;
					}
				}
			}
		}
//		alert(max_col + " " + max_row + " " + max_weight);
		return {
			col: max_col,
			row: max_row
		};
	},
	computeWindowWeight: function(player, isEnemy, pcol, prow, wcol, wrow, dcol, drow) {
		var nones = 0;
		var weight = 0;
		for(var i = 0; i < this.board.stonesToWin; i++) {
			if (!this.board.isValidPos(wcol, wrow)) {
				return 0;
			}
			var cur = this.board.get(wcol, wrow);
			if (cur == this.board.None) {
				nones++;
			} else if (cur == player) {
				weight++;
			} else {
				return 0;
			}
			wcol += dcol;
			wrow += drow;
		}
//		if (nones > this.board.stonesToWin / 2) {
//			return 0;
//		}
		if (weight == this.board.stonesToWin - 1) {
			weight *= (isEnemy) ? 900 : 1000;
		} else {
			weight /= nones;
		}
//		if (isEnemy) {
//			if (weight < this.board.stonesToWin / 2) {
//				weight *= 0.9;
//			} else {
//				weight *= 0.95;
//			}
//		}
		return weight;
	},
	computeWeightDirected: function(player, isEnemy, col, row, dcol, drow) {
		var weight = 0;
		var wcol = col;
		var wrow = row;
		for (var i = 0; i < this.board.stonesToWin; i++) {
			weight += this.computeWindowWeight(player, isEnemy, col, row, wcol, wrow, dcol, drow);
			wcol -= dcol;
			wrow -= drow;
		}
		return weight;
	},
	computeWeight: function(player, isEnemy, col, row) {
		if (this.board.get(col, row) != this.board.None) {
			return -1;
		}
		var weight = 0;
		weight += this.computeWeightDirected(player, isEnemy, col, row, 1, 1);
		weight += this.computeWeightDirected(player, isEnemy, col, row, 1, 0);
		weight += this.computeWeightDirected(player, isEnemy, col, row, 1, -1);
		weight += this.computeWeightDirected(player, isEnemy, col, row, 0, 1);
		return weight;
	}
};
AIRegistry.push(AIAverage);
