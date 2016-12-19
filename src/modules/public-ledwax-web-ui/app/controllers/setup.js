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
					$scope.freshDevices = resp.data;
					$scope.pagedFreshDevices = $scope.groupToPages(
						$scope.freshDevices, $scope.pageSizeFresh,
						$scope.itemFilter, $scope.orderProp,
						$scope.reverseSort, 'totalItemsFresh');
					prom = REST_IoT.getStoredDevices($scope.currentCloudHost.id, 'foobar-sessiontoken');
					prom.then((resp) => {
						$scope.storedDevices = resp.data;
						$scope.pagedStoredDevices = $scope.groupToPages(
							$scope.storedDevices, $scope.pageSizeStored,
							$scope.itemFilter, $scope.orderProp,
							$scope.reverseSort, 'totalItemsStored');
						$rootScope.setPhantomStatusReady();
					}, (err) => {
						$rootScope.setPhantomStatusReady();
					});
				}, (err) => {
					$rootScope.setPhantomStatusReady();
				});
			};
			// setup pagination 
			$scope.totalItemsFresh = 0; // rest call is async
			$scope.currentPageFresh = 1;
			$scope.pageSizeFresh = 8;
			$scope.totalItemsStored = 0; // rest call is async
			$scope.currentPageStored = 1;
			$scope.pageSizeStored = 8;
			$scope.pagedFreshDevices = [];
			$scope.pagedStoredDevices = [];
			// item filtering
			$scope.itemFilter = '';
			$scope.getFilteredDevices = (query, items, modelName) => {
				$scope.itemFilter = query;
				if (!modelName) {
					console.log('unable to sort, invalid modelName: ' + modelName);
				}
				$scope[modelName] = $scope.groupToPages(
					items, $scope.pageSize, query,
					$scope.orderProp, $scope.reverseSort);
				$scope.currentPage = 1;
			};
			// setup sorting
			$scope.orderPropFresh = 'name';
			$scope.reverseSortFresh = false;
			$scope.orderPropStored = 'name';
			$scope.reverseSortStored = false;
			$scope.sortBy = (prop, orderPropName, reversePropName, items, modelName = null) => {
				if (prop == $scope[orderPropName]) {
					$scope[reversePropName] = !$scope.reverseSort;
				} else {
					$scope[orderPropName] = prop;
					$scope[reversePropName] = false;
				}
				if (!modelName) {
					console.log('unable to sort, invalid modelName: ' + modelName);
				}
			//$scope[modelName] = $scope.groupToPages(
			//	items, $scope.pageSize,
			//	$scope.itemFilter, $scope.orderProp,
			//	$scope.reverseSort);
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
			$scope.toggleDeviceDetais = (device) => {
				device.toggleShowDetails = !device.toggleShowDetails;
				if (!angular.isDefined(device.caps) || device.caps.length < 1) {
					let prom = REST_IoT.getDeviceCaps($scope.currentCloudHost.id, 'foobar-sessiontoken', device.id);
					prom.then((resp) => {
						if (!angular.isDefined(resp.data)) {
							device.caps = [];
						} else {
							device.caps = resp.data;
						}
					});
				}
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