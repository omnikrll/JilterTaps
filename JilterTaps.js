// first we're going to want a class for a delay line, so that when we're
// constructing the FilterTaps we can just instantiate a bunch of TapLines

var StereoPanner = (function(context) {
    var StereoPanner = function(context) {
    	this.context = context;
    	this.audioIn = context.createGain();
        this.splitter = context.createChannelSplitter(2);
        this.gainL = context.createGain();
        this.gainR = context.createGain();
        this.merger = context.createChannelMerger(2);
        this.compressor = context.createDynamicsCompressor();
        this.audioOut = context.createGain();

        this.init();
    }

    StereoPanner.prototype.constructor = StereoPanner;

    StereoPanner.prototype.init = function() {
        var self = this;

        self.audioIn.connect(self.splitter);

        self.splitter.connect(self.gainL);
        self.splitter.connect(self.gainR);

        self.gainL.connect(self.merger);
        self.gainR.connect(self.merger);

        self.merger.connect(self.compressor);

        self.merger.connect(self.audioOut);
    }

    StereoPanner.prototype.connect = function(node) {
        this.audioOut.connect(node);
    }

    return StereoPanner;
})();

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
		// init function
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

	TapLine.prototype.setDelayTime = function(time) {
		var now = this.context.currentTime;
		this.delay.delayTime.setValueAtTime(time, now);		
	}

	TapLine.prototype.setFeedback = function(level) {
		var now = this.context.currentTime;
		this.feedback.gain.setValueAtTime(level, now);
	}

	TapLine.prototype.setFilterFrequency = function(freq) {
		var now = this.context.currentTime;
		this.filter.frequency.setValueAtTime(freq, now);
	}

	TapLine.prototype.setFilterQ = function(q) {
		var now = this.context.currentTime;
		this.filter.Q.setValueAtTime(q, now);
	}

	TapLine.prototype.connect = function(node) {
		this.audioOut.connect(node);
	}

	return TapLine;

})();

var FilterTaps = (function(context) {

	var FilterTaps = function(context) {
		// constructor
		this.context = context;
		this.audioIn = this.context.createGain();
		this.tapLines = [];
		this.baseDelayTime = 0.1;
		this.gainStage = this.context.createGain();
		this.audioOut = this.context.createGain();

		this.init();
	}

	FilterTaps.prototype.constructor = FilterTaps;

	FilterTaps.prototype.init = function() {
		var self = this,
			context = self.context;

		self.makeTapLines();
		// init;
	}

	FilterTaps.prototype.makeTapLines = function() {
		var self = this,
			context = self.context,
			timeFactors = [19, 106, 288, 34, 1, 7],
			filterFreqs = [831, 1319, 1480, 1976, 988, 831],
			baseDelayTime = self.baseDelayTime;
			baseQ = 0.39;

		var makeTapLine = function(i) {
			var time = timeFactors[i] * baseDelayTime,
				freq = filterFreqs[i],
				tapLine = new TapLine(context);

			tapLine.setDelayTime(time);
			tapLine.setFeedback(0.4);
			tapLine.setFilterFrequency(freq);
			tapLine.setFilterQ(baseQ);

			return tapLine;
		}

		for (var i=0, ii=timeFactors.length; i<ii; i++) {
			var tapLine = makeTapLine(i);

			tapLine.connect(self.gainStage);
			self.tapLines.push(tapLine);
		}
	}

	FilterTaps.prototype.connect = function(node) {
		this.audioOut.connect(node);
	}

	return FilterTaps;

})();