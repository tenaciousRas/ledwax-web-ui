'use strict';

const LEDWAX_FW_FADE_MODES = {
		fw_key_0 : 'Whole Strip',
		fw_key_1 : 'Pixel-by-Pixel'
	};

angular.module('LEDWAXW3.ledwaxFadeMode.filter', []).filter('ledwaxFadeMode', [ function() {
	return (fadeModeConst) => {
		let ret = 'Unknown';
		if (typeof LEDWAX_FW_FADE_MODES['fw_key_' + fadeModeConst] != 'undefined') {
			ret = LEDWAX_FW_FADE_MODES['fw_key_' + fadeModeConst];
		}
		return ret;
	};
} ]);
