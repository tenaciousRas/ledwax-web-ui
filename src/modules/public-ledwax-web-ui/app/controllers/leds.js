'use strict';

angular.module('LEDWAXW3.leds', [ 'LEDWAXW3.services' ])
	.controller('LEDsCtrl', [ '$rootScope', '$scope', 'REST_IoT', 'PaginationFilteredSorted', '$timeout',
		function($rootScope, $scope, REST_IoT, PaginationFilteredSorted, $timeout) {
			$scope.LEDWAX_FW_FADE_MODES = []; // from ledwax-fademode-filter
			$scope.LEDWAX_FW_DISP_MODES = []; // from ledwax-dispmode-filter
			for (let obj in LEDWAX_FW_FADE_MODES) {
				$scope.LEDWAX_FW_FADE_MODES.push(LEDWAX_FW_FADE_MODES[obj]);
			}
			for (let obj in LEDWAX_FW_DISP_MODES) {
				$scope.LEDWAX_FW_DISP_MODES.push(LEDWAX_FW_DISP_MODES[obj].name);
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
						// wrap REST calls in device for scope of device ID
						el.ledwax_device_ledstrips.forEach((strip) => {
							// strip-scoped props and funcs
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
										fadeModeIdx = obj.split("_")[2]; // fw_key_#
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
									if (LEDWAX_FW_DISP_MODES[obj].name == modelValue) {
										dispModeIdx = obj.split("_")[2]; // fw_key_#
										break;
									}
								}
								if (dispModeIdx >= 0) {
									REST_IoT.setDispMode($scope.currentCloudHost.id, 'foobar-sessiontoken', el.deviceId, el.ledstripsPagination.currentPage - 1, dispModeIdx);
									strip.dispMode = dispModeIdx;
									strip.buildModeColorProps(strip);
								}
							};
							// setup mode colors
							strip.buildModeColorProps = (strip) => {
								strip.numModeColors = LEDWAX_FW_DISP_MODES['fw_key_' + strip.dispMode].numModeColors;
								strip.modeColorArray = [];
								for (let i = 0; i < strip.numModeColors; i++) {
									let c = {
										hex : '#000000'
									};
									if (strip.modeColor[i]) {
										c.hex = strip.modeColor[i];
									}
									// setup color picker handlers
									c.cpEventAPI = {
										onChange : (event, ngModel) => {
											// console.log('onClose for index ' + i + ', ' + ngModel + ', ' + JSON.stringify(event));
											REST_IoT.setColor($scope.currentCloudHost.id,
												'foobar-sessiontoken',
												el.deviceId,
												el.ledstripsPagination.currentPage - 1,
												i,
												ngModel);
											strip.modeColor[i] = ngModel;
											strip.modeColorArray[i].hex = ngModel;
											console.log(strip.modeColor);
											console.log(strip.modeColorArray);
										},
										onBlur : (event, ngModel) => {
										},
										onOpen : (event, ngModel) => {
										},
										onClose : (event, ngModel) => {
										},
										onClear : (event, ngModel) => {
										},
										onReset : (event, ngModel) => {
										},
										onDestroy : (event, ngModel) => {
										},
									};
									c.cpOptions = {
											"case" : "lower",
											"alpha" : true,
											"lightness" : true,
											"inline" : false,
											"swatch" : true,
											"swatchOnly" : false,
											"close" : {
												"show" : false
											},
											"reset" : {
												"show" : false
											},
											"placeholder" : c.hex
										};
									if (strip.numPixColors == 3) {
										c.cpOptions.format = 'hex';
									}
									strip.modeColorArray.push(c);
								}
							};
							// parse color from particle var
							strip.modeColor = JSON.parse(strip.modeColor);
							// props for template output
							strip.buildModeColorProps(strip);
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