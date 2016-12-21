'use strict';

const LEDWAX_FW_DISP_MODES = {
		fw_key_0 : 'Solid One Color',
		fw_key_1 : 'Solid Two Colors - Terawatt',
		fw_key_2 : 'Solid Two Colors - Random',
		fw_key_10 : 'Solid Two Colors',
		fw_key_11 : 'Solid Three Colors',
		fw_key_12 : 'Alternating Two Colors',
		fw_key_13 : 'Alternating Two Colors - Terawatt',
		fw_key_14 : 'Alternating Three Colors',
		fw_key_15 : 'Alternating Two Colors - Random',
		fw_key_16 : 'Alternating Three Colors - Random',
		fw_key_20 : 'Rainbow',
		fw_key_21 : 'Rainbow Cycle',
		fw_key_22 : 'Random Candy',
		fw_key_30 : 'Cylon Animation',
		fw_key_31 : 'Dot Animation',
		fw_key_32 : 'Square Animation'
	};

angular.module('LEDWAXW3.ledwaxDisplayMode.filter', []).filter('ledwaxDisplayMode', [ function() {
	return (dispModeConst) => {
		let ret = 'Unknown';
		if (typeof LEDWAX_FW_DISP_MODES['fw_key_' + dispModeConst] != 'undefined') {
			ret = LEDWAX_FW_DISP_MODES['fw_key_' + dispModeConst];
		}
		return ret;
	};
} ]);
