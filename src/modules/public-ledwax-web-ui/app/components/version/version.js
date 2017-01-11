'use strict';

angular.module('LEDWAXW3.version', [
	'LEDWAXW3.version.interpolate-filter',
	'LEDWAXW3.version.version-directive'
]).value('version', '0.9.0');

angular
	.module('LEDWAXW3.description', [])
	.value(
		'description',
		'LEDWax is an application for interactive control of multiple LED strips using a single Particle Photon IoT device.');