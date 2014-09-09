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