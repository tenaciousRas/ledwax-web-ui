'use strict';

angular.module('LEDWAXW3.humanReadableByteCount.filter', []).filter('humanReadableByteCount', [ function() {
	return (bytes, si) => {
		var unit = si ? 1000 : 1024;
		if (bytes < unit) {
			return bytes + " B";
		}
		var exp = Math.floor(Math.log(bytes) / Math.log(unit));
		var pre = (si ? "kMGTPE" : "KMGTPE").charAt(exp - 1) + (si ? "" : "i");
		return (bytes / Math.pow(unit, exp)).toFixed(3) + pre;
	};
} ]);