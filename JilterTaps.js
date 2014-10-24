var JilterTaps = (function(context) {

	var JilterTaps = function(context) {
		this.context = context;
		this.audioIn = this.context.createGain();
		this.tapLines = [];
		this.baseDelayTime = 0.1;
		this.summingBus = this.context.createGain();
		this.dryLevel = this.context.createGain();
		this.audioOut = this.context.createGain();

		this.init();
	}

	JilterTaps.prototype.constructor = JilterTaps;

	JilterTaps.prototype.init = function() {
		var self = this,
			context = self.context;

		self.makeTapLines();
		// init;
	}

	JilterTaps.prototype.makeTapLines = function() {
		var self = this,
			context = self.context,
			timeFactors = [19, 106, 288, 34, 1, 7],
			filterFreqs = [831, 1319, 1480, 1976, 988, 831],
			baseDelayTime = self.baseDelayTime;
			baseQ = 0.39;

		var getDelayTime = function(i) {
			var t = timeFactors[i];
			return t * baseDelayTime;
		}

		var getFilterFreq = function(i) {
			var f = filterFreqs[i];
			return f;
		}

		var makeTapLine = function(i) {
			var time = getDelayTime(i),
				freq = getFilterFreq(i),
				tapLine = new TapLine(context);

			console.log(i, time, freq);

			tapLine.setDelayTime(time);
			tapLine.setFeedback(0.4);
			tapLine.setFilterFrequency(freq);
			tapLine.setFilterQ(baseQ);
			tapLine.setLevel((1/6));

			return tapLine;
		}

		for (var i=0, ii=timeFactors.length; i<ii; i++) {
			var x = i,
				tapLine = makeTapLine(x);

			tapLine.connect(self.summingBus);
			self.tapLines.push(tapLine);
		}
	}

	JilterTaps.prototype.connect = function(node) {
		this.audioOut.connect(node);
	}

	return JilterTaps;

})();