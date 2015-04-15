/**
 * Adds a pause and unpause method to Gator.
 * This allows you to enable or disable Gator's event dispatching without having
 * to remove bindings.
 *
 * Inspired by mousetrap-pause
 *
 * @author Arne Lottmann
 */
/* global Gator:true */
Gator = (function(Gator) {
	var self = Gator;
	var _originalHandleEvent = self._handleEvent;
	var enabled = true;

	self._handleEvent = function(id, e, type) {
		if (!enabled) {
			return true;
		}
		return _originalHandleEvent(id, e, type);
	};

	self.pause = function() {
		enabled = false;
	};

	self.unpause = function() {
		enabled = true;
	};

	return self;
})(Gator);
