'use strict';

angular.module(
		'LEDWAXW3.version',
		[ 'LEDWAXW3.version.interpolate-filter',
				'LEDWAXW3.version.version-directive' ])

.value('version', '0.1');
angular
		.module('LEDWAXW3.description', [])
		.value(
				'description',
				'LEDWax is an application for LED control of multiple strips using a single MCU');