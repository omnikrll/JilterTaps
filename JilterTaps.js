// first we're going to want a class for a delay line, so that when we're
// constructing the JilterTaps we can just instantiate a bunch of TapLines

var TapLine = (function(context) {

	var TapLine = function(context) {
		this.context = context;
		this.audioIn = this.context.createGain();
		this.delay = this.context.createDelay();
		this.feedback = this.context.createGain();
		this.filter = this.context.createBiquadFilter();
		this.gainStage = this.context.createGain();
		this.panner = new StereoPanner(context);
		this.audioOut = this.context.createGain();

		this.init();
	}

	TapLine.prototype.constructor = TapLine;

	TapLine.prototype.init = function() {
		var self = this,
			context = self.context;

		self.filter.type = "bandpass";

		self.audioIn.connect(self.delay);
		self.delay.connect(self.filter);
		self.delay.connect(self.feedback);
		self.feedback.connect(self.delay);
		self.filter.connect(self.gainStage);
		self.gainStage.connect(self.panner.audioIn);
		self.panner.connect(self.audioOut);

		self.audioOut.connect(context.destination);
	}

	TapLine.prototype.getDelayTime = function() {
		 return this.delay.delayTime.value;
	}

	TapLine.prototype.setDelayTime = function(time, decay, exp) {
		var now = this.context.currentTime,
			_decay = typeof decay == 'number' ? decay : false,
			_exp = typeof exp == 'boolean' ? exp : false;

		if (_decay) {
			if (_exp) {
				this.delay.delayTime.exponentialRampToValueAtTime(time, _decay);
			} else {
				this.delay.delayTime.linearRampToValueAtTime(time, _decay);
			}
		} else {
			this.delay.delayTime.setValueAtTime(time, now);		
		}
	}

	TapLine.prototype.getFeedback = function() {
		return this.feedback.gain.value;
	}

	TapLine.prototype.setFeedback = function(level, decay, exp) {
		var now = this.context.currentTime,
			_decay = typeof decay == 'number' ? decay : false,
			_exp = typeof exp == 'boolean' ? exp : false;

		if (_decay) {
			if (_exp) {
				this.feedback.gain.exponentialRampToValueAtTime(level, _decay);
			} else {
				this.feedback.gain.linearRampToValueAtTime(level, _decay);
			}
		} else {
			this.feedback.gain.setValueAtTime(level, now);
		}
	}

	TapLine.prototype.getFilterFrequency = function() {
		return this.filter.frequency.value;
	}

	TapLine.prototype.setFilterFrequency = function(freq, decay, exp) {
		var now = this.context.currentTime;
			_decay = typeof decay == 'number' ? decay : false,
			_exp = typeof exp == 'boolean' ? exp : false;

		if (_decay) {
			if (_exp) {
				this.filter.frequency.exponentialRampToValueAtTime(freq, now);
			} else {
				this.filter.frequency.linearRampToValueAtTime(freq, now);
			}
		} else {
			this.filter.frequency.setValueAtTime(freq, now);
		}
	}

	TapLine.prototype.getFilterQ = function() {
		return this.filter.Q.value;
	}

	TapLine.prototype.setFilterQ = function(q) {
		var now = this.context.currentTime;
			_decay = typeof decay == 'number' ? decay : false,
			_exp = typeof exp == 'boolean' ? exp : false;

		if (_decay) {
			if (_exp) {
				this.filter.Q.exponentialRampToValueAtTime(q, _decay);
			} else {
				this.filter.Q.linearRampToValueAtTime(q, _decay);
			}
		} else {
			this.filter.Q.setValueAtTime(q, now);	
		}
	}

	TapLine.prototype.getLevel = function() {
		return this.gainStage.gain.value;
	}

	TapLine.prototype.setLevel = function(level, time, exp) {
		var now = this.context.currentTime;
			_decay = typeof decay == 'number' ? decay : false,
			_exp = typeof exp == 'boolean' ? exp : false;

		if (_decay) {
			if (_exp) {
				this.gainStage.gain.exponentialRampToValueAtTime(level, _decay);
			} else {
				this.gainStage.gain.linearRampToValueAtTime(level, _decay);
			}
		} else {
			this.gainStage.gain.setValueAtTime(level, now);	
		}
	}

	TapLine.prototype.connect = function(node) {
		this.audioOut.connect(node);
	}

	return TapLine;

})();

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