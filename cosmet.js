var cosmet = window.cosmet || {};


cosmet.StatsService = function(host) {
	this.host_ = host;
};

cosmet.StatsService.prototype.getUrl = function(opt_timestamp) {
	//if (opt_timestamp && opt_timestamp > 0) {
	//	return this.host_ + '/getData.php?timestamp=' + opt_timestamp;
	//}
	return this.host_ + '/getData.php';
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
	this.pressure = 950;
};

cosmet.GtvCosmet.prototype.getPressure = function() {
	add = Math.floor(Math.random() * 1.2);
	this.pressure += add;
	return this.pressure;
}

cosmet.GtvCosmet.prototype.handleLastData_ = function(data) {
	if (!data) {
		console.log('No data!');
		return;
	}
	var minSum = 0;
	var minNum = 0;

	data.results.forEach(function(entry) {
			var watts = parseInt(entry.watts)
			minSum += watts;
			minNum += 1;
	});

	var avg = minSum / minNum;

	var trend = avg > this.hourAverage ? 'up' : 'down';

	var lastKwh = (this.hourAverage * 24 / 1000).toFixed(1);
	var predKwh = (avg * 24 / 1000).toFixed(1);

	var diff = (Math.abs(predKwh/lastKwh - 1) * 100).toFixed(1);

	var watts = parseInt(data.results[0].watts)

	$('#watt').html(watts.toFixed(0) + ' W');
	$('#watt-avg').html(this.hourAverage.toFixed(0) + ' W');

	$('#pred').html(predKwh + ' kW/h');
	$('#pred-trend').html(trend + ' ' + diff + '%');

	$("#temp").html(data.results[0].temp + "&deg;C");
	$("#pressure").html('' + this.getPressure() + "mb");
};

cosmet.GtvCosmet.prototype.handleHourData_ = function(data) {
	var hourSum = 0;
	var hourNum = 0;

	var lastStart = 0;
	var lastCount = 0;
	var chart = [];

	data.forEach(function(entry) {
			var watts = parseInt(entry.watts)
			if (lastStart < (entry.timestamp - 1 * 60)) {
				lastStart = entry.timestamp;
				lastCount = 1;
				chart.push(watts);
			} else {
				lastCount += 1;
				var from = chart[chart.length - 1];
				var diff = watts - from;
				var wdiff = diff / lastCount;
				chart[chart.length - 1] += wdiff;
			}
			hourSum += watts;
			hourNum += 1;
	}, this);

	this.hourAverage = hourSum / hourNum;

	$('#graph').html('<img src="' + this.chartUrl(chart) + '"/>');
};

cosmet.GtvCosmet.prototype.chartUrl = function(data) {
	var max = 0;
	data.forEach(function(val) {
		if (val > max) {
			max = val;
		}
	});
	max = Math.ceil((1 + max) / 100) * 100;

	var chart = data.map(function(i) { return i.toFixed(2); });

	return 'http://chart.apis.google.com/chart' +
		'?chf=a,s,000000|bg,s,000000|c,s,676767' +
		'&chxr=0,0,' + max + 
		'&chxs=0,D7D7D7,11.5,0,l,BDBDBD' +
		'&chxt=r' +
		'&chbh=a,0,0' +
		'&chs=600x225' +
		'&cht=bvg' +
		'&chco=A2C180' +
		'&chds=0,' + max +
		'&chd=t:' + chart.join(',');
};

cosmet.GtvCosmet.prototype.loadLast_ = function() {
	$("#time").html(new XDate().toString("H:mm:ss")); 
	// var url = 'getLast.php?timestamp=' + Math.floor(new Date().getTime() / 1000);
	var url = 'http://192.168.145.243:8000/getLast.php';
	$.ajax({
		dataType: 'json',
		url: url,
		success: this.handleLastData_.bind(this)
	});
};

cosmet.GtvCosmet.prototype.loadData_ = function() {
	this.stats_.fetch(this.handleHourData_.bind(this), undefined);
};

cosmet.GtvCosmet.prototype.start = function() {
	// this.stats_ = new cosmet.StatsService('http://128.40.111.232/cosmet');
	this.stats_ = new cosmet.StatsService('http://192.168.145.243:8000');
	this.loadData_();
	$(document).everyTime(1000, this.loadLast_.bind(this));
	$(document).everyTime(60000, this.loadData_.bind(this));
};
