'use strict';

angular.module('LEDWAXW3.leds', [ 'LEDWAXW3.services' ])
	.controller('LEDsCtrl', [ '$rootScope', '$scope', 'REST_IoT', 'PaginationFilteredSorted', '$timeout',
		function($rootScope, $scope, REST_IoT, PaginationFilteredSorted, $timeout) {
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
							strip.modeColorHex = strip.modeColor.toString(16);;
							strip.setColor = (sliderId, modelValue, highValue, pointerType) => {
								REST_IoT.setColor($scope.currentCloudHost.id, 'foobar-sessiontoken', el.deviceId, el.ledstripsPagination.currentPage - 1, modelValue);
							}
							strip.setBrightness = (sliderId, modelValue, highValue, pointerType) => {
								REST_IoT.setBrightness($scope.currentCloudHost.id, 'foobar-sessiontoken', el.deviceId, el.ledstripsPagination.currentPage - 1, modelValue);
							}
							strip.setColorHoldTime = (sliderId, modelValue, highValue, pointerType) => {
								REST_IoT.setColorHoldTime($scope.currentCloudHost.id, 'foobar-sessiontoken', el.deviceId, el.ledstripsPagination.currentPage - 1, modelValue);
							}
							strip.setFadeTime = (sliderId, modelValue, highValue, pointerType) => {
								REST_IoT.setFadeTime($scope.currentCloudHost.id, 'foobar-sessiontoken', el.deviceId, el.ledstripsPagination.currentPage - 1, modelValue);
							}
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