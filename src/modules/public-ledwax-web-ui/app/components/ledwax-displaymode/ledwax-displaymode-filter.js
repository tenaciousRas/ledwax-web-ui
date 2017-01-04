'use strict';

const LEDWAX_FW_DISP_MODES = {
		fw_key_0 : {name: 'Solid One Color', numModeColors: 1},
		fw_key_1 : {name: 'Solid Two Colors - Terawatt', numModeColors: 2},
		fw_key_2 : {name: 'Solid Two Colors - Random', numModeColors: 2},
		fw_key_10 : {name: 'Solid Two Colors', numModeColors: 2},
		fw_key_11 : {name: 'Solid Three Colors', numModeColors: 3},
		fw_key_12 : {name: 'Alternating Two Colors', numModeColors: 2},
		fw_key_13 : {name: 'Alternating Two Colors - Terawatt', numModeColors: 2},
		fw_key_14 : {name: 'Alternating Three Colors', numModeColors: 3},
		fw_key_15 : {name: 'Alternating Two Colors - Random', numModeColors: 2},
		fw_key_16 : {name: 'Alternating Three Colors - Random', numModeColors: 3},
		fw_key_20 : {name: 'Rainbow', numModeColors: 0},
		fw_key_21 : {name: 'Rainbow Cycle', numModeColors: 0},
		fw_key_22 : {name: 'Random Candy', numModeColors: 0},
		fw_key_30 : {name: 'Cyclon Animation', numModeColors: 1},
		fw_key_31 : {name: 'Dot Animation', numModeColors: 1},
		fw_key_32 : {name: 'Square Animation', numModeColors: 1}
	};

angular.module('LEDWAXW3.ledwaxDisplayMode.filter', []).filter('ledwaxDisplayMode', [ function() {
	return (dispModeConst) => {
		let ret = 'Unknown';
		if (typeof LEDWAX_FW_DISP_MODES['fw_key_' + dispModeConst] != 'undefined') {
			ret = LEDWAX_FW_DISP_MODES['fw_key_' + dispModeConst].name;
		}
		return ret;
	};
} ]);
