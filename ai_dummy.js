var AIDummy = function(board) {
	this.board = board;
};
AIDummy.prototype = {
	name: "Dummy",
	computeMove: function(player, enemy) {
		return {
			col : Math.floor(Math.random() * this.board.size) + 1,
			row : Math.floor(Math.random() * this.board.size) + 1
		};
	}
};
AIRegistry.push(AIDummy);
