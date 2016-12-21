'use strict';

const LEDWAX_FW_STRIP_TYPES = {
	fw_key_1 : 'WS2801 Strip',
	fw_key_2 : 'WS2811 Strip',
	fw_key_3 : 'WS2812 Strip',
	fw_key_10 : 'Native PWM LED(s)',
	fw_key_11 : 'Integrated LED Strip'
};

angular.module('LEDWAXW3.ledwaxStripType.filter', []).filter('ledwaxStripType', [ function() {
	return (typeConst) => {
		let ret = 'Unknown';
		if (typeof LEDWAX_FW_STRIP_TYPES['fw_key_' + typeConst] != 'undefined') {
			ret = LEDWAX_FW_STRIP_TYPES['fw_key_' + typeConst];
		}
		return ret;
	};
} ]);