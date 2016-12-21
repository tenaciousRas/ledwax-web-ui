'use strict';

angular.module('LEDWAXW3.leds', [ 'LEDWAXW3.services' ])
	.controller('LEDsCtrl', [ '$rootScope', '$scope', 'REST_IoT', 'PaginationFilteredSorted', '$timeout',
		function($rootScope, $scope, REST_IoT, PaginationFilteredSorted, $timeout) {
			$scope.LEDWAX_FW_FADE_MODES = [];	// from ledwax-fademode-filter
			$scope.LEDWAX_FW_DISP_MODES = [];	// from ledwax-dispmode-filter
			for (let obj in LEDWAX_FW_FADE_MODES) {
				$scope.LEDWAX_FW_FADE_MODES.push(LEDWAX_FW_FADE_MODES[obj]);
			}
			for (let obj in LEDWAX_FW_DISP_MODES) {
				$scope.LEDWAX_FW_DISP_MODES.push(LEDWAX_FW_DISP_MODES[obj]);
			}
			$scope.getDeviceList = () => {
				let prom = REST_IoT.getStoredDevices($scope.currentCloudHost.id, 'foobar-sessiontoken');
				prom.then((resp) => {
					$scope.itemsStored = resp.data;
					$scope.pagedItemsStored = $scope.groupToPagesStored(
						$scope.itemsStored, $scope.pageSizeStored,
						$scope.itemFilterStored, $scope.orderPropStored,
						$scope.reverseSortStored);
					// create ledstrips pagination and RGB hex colors
					$scope.itemsStored.forEach((el) => {
						// ledstrip pagination
						el.toggleShowDetails = false;
						el.ledstripsPagination = {};
						PaginationFilteredSorted.init(el.ledstripsPagination, '');
						el.ledstripsPagination.pageSize = 1;
						el.ledstripsPagination.pagedLEDStrips = el.ledstripsPagination.groupToPages(
							el.ledwax_device_ledstrips, el.ledstripsPagination.pageSize,
							el.ledstripsPagination.itemFilter, el.ledstripsPagination.orderProp,
							el.ledstripsPagination.reverseSort);
						// set RGB hex colors
						// wrap REST calls in device for scope of device ID
						el.ledwax_device_ledstrips.forEach((strip) => {
							strip.modeColorHex = strip.modeColor.toString(16);
							strip.setColor = (sliderId, modelValue, highValue, pointerType) => {
								REST_IoT.setColor($scope.currentCloudHost.id, 'foobar-sessiontoken', el.deviceId, el.ledstripsPagination.currentPage - 1, modelValue);
							};
							strip.setBrightness = (sliderId, modelValue, highValue, pointerType) => {
								REST_IoT.setBrightness($scope.currentCloudHost.id, 'foobar-sessiontoken', el.deviceId, el.ledstripsPagination.currentPage - 1, modelValue);
							};
							strip.setColorHoldTime = (sliderId, modelValue, highValue, pointerType) => {
								REST_IoT.setColorHoldTime($scope.currentCloudHost.id, 'foobar-sessiontoken', el.deviceId, el.ledstripsPagination.currentPage - 1, modelValue);
							};
							strip.setFadeTime = (sliderId, modelValue, highValue, pointerType) => {
								REST_IoT.setFadeTime($scope.currentCloudHost.id, 'foobar-sessiontoken', el.deviceId, el.ledstripsPagination.currentPage - 1, modelValue);
							};
							strip.setFadeMode = (modelValue) => {
								let fadeModeIdx = -1;
								for (let obj in LEDWAX_FW_FADE_MODES) {
									if (LEDWAX_FW_FADE_MODES[obj] == modelValue) {
										fadeModeIdx = obj.split("_")[2];	// fw_key_#
										break;
									}
								}
								if (fadeModeIdx >= 0) {
									REST_IoT.setFadeMode($scope.currentCloudHost.id, 'foobar-sessiontoken', el.deviceId, el.ledstripsPagination.currentPage - 1, fadeModeIdx);
									strip.fadeMode = fadeModeIdx;
								}
							};
							strip.setDispMode = (modelValue) => {
								let dispModeIdx = -1;
								for (let obj in LEDWAX_FW_DISP_MODES) {
									if (LEDWAX_FW_DISP_MODES[obj] == modelValue) {
										dispModeIdx = obj.split("_")[2];	// fw_key_#
										break;
									}
								}
								if (dispModeIdx >= 0) {
									REST_IoT.setDispMode($scope.currentCloudHost.id, 'foobar-sessiontoken', el.deviceId, el.ledstripsPagination.currentPage - 1, dispModeIdx);
									strip.dispMode = dispModeIdx;
								}
							};
						});
					});
					$rootScope.setPhantomStatusReady();
				}, (err) => {
					$rootScope.setPhantomStatusReady();
				});
			};
			// setup pagination 
			PaginationFilteredSorted.init($scope, 'Stored');
			// setup color pickers
			$scope.dummyColor = "#435af3";
			$scope.cpEventAPI = {
				onChange : function(api, color, $event) {},
				onBlur : function(api, color, $event) {},
				onOpen : function(api, color, $event) {},
				onClose : function(api, color, $event) {},
				onClear : function(api, color, $event) {},
				onReset : function(api, color, $event) {},
				onDestroy : function(api, color) {},
			};
			$scope.cpOptions = {
				format : 'rgb'
			};
			$scope.refreshSlider = () => {
			    $timeout(() => {
			        $scope.$broadcast('rzSliderForceRender');
			    });
			};
			// device details handler
			$scope.toggleDeviceDetailsStored = (device) => {
				device.toggleShowDetails = !device.toggleShowDetails;
				if (device.toggleShowDetails) {
				    $timeout(() => {
				    	$scope.refreshSlider();
				    });
				}
				return false;
			};
			// bootstrap
			$scope.getDeviceList();
		} ]);