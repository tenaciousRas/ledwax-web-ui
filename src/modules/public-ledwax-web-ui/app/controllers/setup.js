'use strict';

angular.module(
	'LEDWAXW3.setup',
	[ 'ngCookies', 'ngSanitize', 'pascalprecht.translate', 'LEDWAXW3.services' ])
	.controller('SetupTabsCtrl', [ '$rootScope', '$scope', function($rootScope, $scope) {
		$scope.tabs = $scope.setupTabs;
		$scope.getDeviceList(); // invoked twice if placed in SetupCtrl
	} ]).controller(
	'SetupCtrl',
	[ '$rootScope',
		'$scope',
		'$cookies',
		'$sanitize',
		'$translate',
		'$filter',
		'Settings',
		'REST_IoT',
		function($rootScope, $scope, $cookies, $sanitize, $translate, $filter,
			Settings, REST_IoT) {
			$scope.getDeviceList = () => {
				let prom = REST_IoT
					.discoverDevices($scope.currentCloudHost.id, $scope.userSession.auth_token);
				prom.then((resp) => {
					for (var i = 0; i < resp.data.length; i++) {
						resp.data[i].toggleShowDetails = false;
					}
					$scope.devicesFresh = resp.data;
					prom = REST_IoT.getStoredDevices($scope.currentCloudHost.id, 'foobar-sessiontoken');
					prom.then((resp) => {
						$scope.devicesStored = resp.data;
						for (let i = 0; i < $scope.devicesStored.length; i++) {
							for (let j = 0; j < $scope.devicesFresh.length; j++) {
								if ($scope.devicesStored[i].deviceId == $scope.devicesFresh[j].id) {
									$scope.devicesFresh.splice(j, 1);
								}
							}
						}
						$scope.pagedDevicesFresh = $scope.groupToPages(
							$scope.devicesFresh, $scope.pageSizeFresh,
							$scope.itemFilterFresh, $scope.orderPropFresh,
							$scope.reverseSortFresh, 'totalItemsFresh');
						$scope.pagedDevicesStored = $scope.groupToPages(
							$scope.devicesStored, $scope.pageSizeStored,
							$scope.itemFilterStored, $scope.orderPropStored,
							$scope.reverseSortStored, 'totalItemsStored');
						$rootScope.setPhantomStatusReady();
					}, (err) => {
						$rootScope.setPhantomStatusReady();
					});
				}, (err) => {
					$rootScope.setPhantomStatusReady();
				});
			};
			$scope.saveNewDevice = (device) => {
				if (typeof device == 'undefined' || !device) {
					console.log('unable to save, missing param device');
					return;
				}
				let prom = REST_IoT.storeDeviceANDStrips($scope.currentCloudHost.id,
					'foobar-sessiontoken',
					device.id,
					device.numStrips,
					device.name);
				prom.then((resp) => {
					let savedDevice = resp.data;
					// remove from new devices list
					for (let i = 0; i < $scope.devicesFresh.length; i++) {
						if ($scope.devicesFresh[i].id == device.id) {
							$scope.devicesFresh.splice(i, 1);
							break;
						}
					}
					$scope.pagedDevicesFresh = $scope.groupToPages(
						$scope.devicesFresh, $scope.pageSizeFresh,
						$scope.itemFilterFresh, $scope.orderPropFresh,
						$scope.reverseSortFresh, 'totalItemsFresh');
					// add to stored devices list
					savedDevice.deviceNameFW = device.name;
					savedDevice.toggleShowDetails = false;
					delete savedDevice['name'];
					$scope.devicesStored.push(savedDevice);
					$scope.pagedDevicesStored = $scope.groupToPages(
						$scope.devicesStored, $scope.pageSizeStored,
						$scope.itemFilterStored, $scope.orderPropStored,
						$scope.reverseSortStored, 'totalItemsStored');
				});
			};
			$scope.removeStoredDevice = (device) => {
				if (typeof device == 'undefined' || !device) {
					console.log('unable to save, missing param device');
					return;
				}
				let prom = REST_IoT.removeStoredDevice($scope.currentCloudHost.id,
					'foobar-sessiontoken',
					device.deviceId);
				prom.then((resp) => {
					// remove from stored devices list
					let deletedDevice = device;
					for (let i = 0; i < $scope.devicesStored.length; i++) {
						if ($scope.devicesStored[i].id == device.id) {
							deletedDevice = $scope.devicesStored.splice(i, 1);
							break;
						}
					}
					$scope.pagedDevicesStored = $scope.groupToPages(
						$scope.devicesStored, $scope.pageSizeStored,
						$scope.itemFilterStored, $scope.orderPropStored,
						$scope.reverseSortStored, 'totalItemsStored');
					// add to new devices list
					deletedDevice.id = device.deviceId;
					deletedDevice.name = device.deviceNameFW;
					deletedDevice.toggleShowDetails = false;
					delete deletedDevice['deviceId'];
					delete deletedDevice['deviceNameFW'];
					$scope.devicesFresh.push(deletedDevice);
					$scope.pagedDevicesFresh = $scope.groupToPages(
						$scope.devicesFresh, $scope.pageSizeFresh,
						$scope.itemFilterFresh, $scope.orderPropFresh,
						$scope.reverseSortFresh, 'totalItemsFresh');
				});
			};
			// setup pagination 
			$scope.totalItemsFresh = 0; // rest call is async
			$scope.currentPageFresh = 1;
			$scope.pageSizeFresh = 8;
			$scope.totalItemsStored = 0; // rest call is async
			$scope.currentPageStored = 1;
			$scope.pageSizeStored = 8;
			$scope.pagedDevicesFresh = [];
			$scope.pagedDevicesStored = [];
			// item filtering
			$scope.itemFilterFresh = '';
			$scope.itemFilterStored = '';
			$scope.getFilteredDevices = (query, propNameSuffix, items, modelName) => {
				$scope['itemFilter' + propNameSuffix] = query;
				if (!modelName) {
					console.log('unable to sort, invalid modelName: ' + modelName);
				}
				$scope[modelName] = $scope.groupToPages(
					items, $scope['pageSize' + propNameSuffix], query,
					$scope['orderProp' + propNameSuffix], $scope['reverseSort' + propNameSuffix]);
				$scope['currentPage' + propNameSuffix] = 1;
			};
			// setup sorting
			$scope.orderPropFresh = 'name';
			$scope.reverseSortFresh = false;
			$scope.orderPropStored = 'name';
			$scope.reverseSortStored = false;
			$scope.sortBy = (prop, propNameSuffix, items, modelName = null) => {
				if (prop == $scope['orderProp' + propNameSuffix]) {
					$scope['reverseSort' + propNameSuffix] = !$scope['reverseSort' + propNameSuffix];
				} else {
					$scope['orderProp' + propNameSuffix] = prop;
					$scope['reverseSort' + propNameSuffix] = false;
				}
				if (!modelName) {
					console.log('unable to sort, invalid modelName: ' + modelName);
				}
				$scope[modelName] = $scope.groupToPages(
					items, $scope['pageSize' + propNameSuffix],
					$scope['itemFilter' + propNameSuffix], $scope['orderProp' + propNameSuffix],
					$scope['reverseSort' + propNameSuffix]);
			};
			// setup pagination
			$scope.groupToPages = (items, itemsPerPage,
				filterQuery, sortProp, reverseSort, totalItemsPropName) => {
				let ret = [];
				// filtering
				let newList = $filter('filter')(items,
					filterQuery);
				$scope[totalItemsPropName] = newList.length;
				// sorting
				newList = $filter('orderBy')(newList, sortProp,
					reverseSort);
				// grouping
				for (let i = 0; i < newList.length; i++) {
					if (i % itemsPerPage === 0) {
						ret[Math.floor(i / itemsPerPage)] = [ newList[i] ];
					} else {
						ret[Math.floor(i / itemsPerPage)]
							.push(newList[i]);
					}
				}
				return ret;
			};
			// device details handler
			$scope.toggleDeviceDetailsFresh = (device) => {
				device.toggleShowDetails = !device.toggleShowDetails;
				if (!angular.isDefined(device.caps) || device.caps.length < 1) {
					let prom = REST_IoT.getDeviceCaps($scope.currentCloudHost.id, 'foobar-sessiontoken', device.id);
					prom.then((resp) => {
						if (!angular.isDefined(resp.data)) {
							device.caps = [];
						} else {
							device.caps = resp.data;
							for (let i = 0; i < device.caps.vrs.length; i++) {
								if (device.caps.vrs[i].varname == 'numStrips') {
									device.numStrips = device.caps.vrs[i].value;
								}
							}
						}
					});
				}
				return false;
			};
			// device details handler
			$scope.toggleDeviceDetailsStored = (device) => {
				device.toggleShowDetails = !device.toggleShowDetails;
				return false;
			};
			// build progress bar feature
			$scope.buildPBarUI = (fName) => {
				if (Settings.uiState.uploadStatus.uploading) {
					$scope.pBarClass = '';
					$scope.uploadProgress = 100.0
					* Settings.uiState.uploadStatusGCode.loaded
					/ Settings.uiState.uploadStatusGCode.total;
					$scope.uploadFileName = fName;
				} else {
					$scope.pBarClass = 'invisible';
					$scope.uploadProgress = 0;
					$scope.uploadFileName = '';
				}
			};
			$scope.buildPBarUI();
			$scope.abortUpload = () => {
				$upload.abort();
				Settings.uiState.uploadStatusGCode.uploading = false;
				$scope.setPBarClass();
			};
		} ]);