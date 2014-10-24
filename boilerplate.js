// boilerplate functions

// setValue: abstracts webaudio value setter methods into one function
// usage:
// setValue(this.delay.delayTime, 1); == this.delay.delayTime.setValueAtTime(1, context.currentTime);
// setValue(this.delay.delayTime, 1, 500); == this.delay.delayTime.linearRampToValueAtTime(1, context.currentTime + 500);
// setValue(this.delay.delayTime, 1, 500, true); == this.delay.delayTime.exponentialRampToValueAtTime(1, context.currentTime + 500);
var setValue = function(param, value, time, exp) {
	var now = this.context.currentTime,
		_time = typeof time == 'number' ? time + now : false,
		_exp = typeof exp == 'boolean' ? exp : false;

	if (_time) {
		if (_exp) {
			param.exponentialRampToValueAtTime(value, _time);
		} else {
			param.linearRampToValueAtTime(value, _time);
		}
	} else {
		param.setValueAtTime(value, now);
	}
}

