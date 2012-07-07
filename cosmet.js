var cosmet = window.cosmet || {};


cosmet.StatsService = function(host) {
	this.host_ = host;
};


cosmet.GtvCosmet = function() {
	this.root_ = null;
};

cosmet.GtvCosmet.prototype.start = function() {
	this.root_ = $('.cosmet');

	this.stats_ = new cosmet.StatsServer('');
};
