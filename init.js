var contextClass = null,
	context = null,
	source = null,
	jilterTaps = null;

// just leaving these in for reference right now.
// rewrite event handlers as methods of objects and
// dynamically bind them on object init.

// var filterGainHandler = function(e) {
// 	var fraction = parseFloat(e.value) / parseFloat(e.max),
// 		factor = Math.pow(fraction, 2),
// 		gainStage = jilterTaps.gainStages[+e.getAttribute('data-gainstage')];

// 	gainStage.gain.setValueAtTime(factor, context.currentTime);
// }

// var wetDryHandler = function(e) {
// 	var val = parseFloat(e.value),
// 		max = parseFloat(e.max),
// 		fraction = parseFloat(val / max),
// 		wetFactor = Math.pow(fraction, 2),
// 		dryFactor = Math.pow((1 - fraction), 2);

// 	if (val == 0) {
// 		wetFactor = 0;
// 		dryFactor = 1;
// 	} else if (val == 1) {
// 		wetFactor = 1;
// 		dryFactor = 0;
// 	}

// 	jilterTaps.wetGain.gain.setValueAtTime(wetFactor, context.currentTime);
// 	jilterTaps.dryGain.gain.setValueAtTime(dryFactor, context.currentTime);
// }

document.addEventListener('DOMContentLoaded', function() {
    contextClass = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);

    if (contextClass) {
        context = new contextClass();
    }

	// source = context.createMediaElementSource(document.getElementById('source'));
	osc = context.createOscillator();
	osc.frequency.setValueAtTime(436, context.currentTime);
	jilterTaps = new JilterTaps(context);

	osc.connect(jilterTaps.audioIn);
	jilterTaps.connect(context.destination);
});