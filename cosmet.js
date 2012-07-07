var cosmet = window.cosmet || {};


cosmet.StatsService = function(host) {
	this.host_ = host;
};

cosmet.StatsService.prototype.getUrl = function(opt_timestamp) {
	if (opt_timestamp && opt_timestamp > 0) {
		return this.host_ + '/getData?timestamp=' + opt_timestamp;
	}
	return this.host_ + '/getData';
};

cosmet.StatsService.prototype.fetch = function(callback, opt_timestamp) {
	$.ajax(this.getUrl(opt_timestamp), {
		error: this.onError_.bind(this, callback),
		success: this.onSuccess_.bind(this, callback),
		dataType: 'json'
	});
};

cosmet.StatsService.prototype.onError_ = function(callback, xhr, textStatus, error) {
	window.console.log('ERROR: ' + textStatus);
};

cosmet.StatsService.prototype.onSuccess_ = function(callback, data, textStatus, xhr) {
	results = [];
	data['results'].forEach(function(item) {
		if (item.length > 0) {
			item.forEach(function(item) {
				results.push(item);
			}, this);
		} else {
			results.push(item);
		}
	}, this);

	callback(results);
};





cosmet.GtvCosmet = function() {
	this.root_ = null;
};

cosmet.GtvCosmet.prototype.start = function() {
	this.root_ = $('.cosmet');

	this.stats_ = new cosmet.StatsService('http://128.40.111.232/cosmet');
	// this.stats_ = new cosmet.StatsService('http://localhost:8000');

	this.stats_.fetch(function(data) {
		var chart = data.map(function(entry) {
			return ['i', '' + entry.watts];
		}, this);
		chart.unshift(['a', 'b']);

		var opts = {
		  title: 'Power usage history',
		  vAxis: { title: 'Watts consumed' },
		  isStacked: false
		};

		var chart = new google.visualization.SteppedAreaChart(document.getElementById('graph'));
		chart.draw(chart, opts);

		window.console.log('AAAA');
	}, undefined);
};
