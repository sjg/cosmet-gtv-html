var cosmet = window.cosmet || {};


cosmet.GraphView = function() {
};


cosmet.GtvCosmet = function() {
	this.root_ = null;
};

cosmet.GtvCosmet.prototype.start = function() {
	this.root_ = $('.cosmet');
};
