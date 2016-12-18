'use strict';

angular.module(
	'LEDWAXW3.setup',
	[ 'ngCookies', 'ngSanitize', 'pascalprecht.translate', 'LEDWAXW3.services' ])
	.controller('SetupTabsCtrl', [ '$scope', function($scope) {
		$scope.tabs = $scope.setupTabs;
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
			$scope.getDeviceList = function() {
				let devList = REST_IoT
					.getDevices($scope.userSession.auth_token);
				return devList;
			};
			// setup pagination 
			$scope.totalItems = 0; // rest call is async
			$scope.currentPage = 1;
			$scope.pageSize = 8;
			$scope.freshDevices = [
				{
					name : 'foo',
					type : 'wax'
				},
				{
					name : 'bar',
					type : 'wax'
				},
				{
					name : 'baz',
					type : 'wax'
				},
				{
					name : 'quux',
					type : 'unknown'
				},
				{
					name : 'cinegt',
					type : 'wax'
				}
			];
			// item filtering
			$scope.itemFilter = '';
			$scope.getFilteredDevices = function(query, items, modelName) {
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
			$scope.orderProp = 'name';
			$scope.reverseSort = false;
			$scope.sortBy = function(prop, items, modelName = null) {
				if (prop == $scope.orderProp) {
					$scope.reverseSort = !$scope.reverseSort;
				} else {
					$scope.orderProp = prop;
					$scope.reverseSort = false;
				}
				if (!modelName) {
					console.log('unable to sort, invalid modelName: ' + modelName);
				}
				$scope[modelName] = $scope.groupToPages(
					items, $scope.pageSize,
					$scope.itemFilter, $scope.orderProp,
					$scope.reverseSort);
			};
			// setup pagination
			$scope.groupToPages = function(items, itemsPerPage,
				filterQuery, sortProp, reverseSort) {
				let ret = [];
				// filtering
				let newList = $filter('filter')(items,
					filterQuery);
				$scope.totalItems = newList.length;
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
			$scope.pagedFreshDevices = $scope.groupToPages(
				$scope.freshDevices, $scope.pageSize,
				$scope.itemFilter, $scope.orderProp,
				$scope.reverseSort);
			// build progress bar feature
			$scope.buildPBarUI = function(fName) {
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
			$scope.abortUpload = function() {
				$upload.abort();
				Settings.uiState.uploadStatusGCode.uploading = false;
				$scope.setPBarClass();
			};
			$rootScope.setPhantomStatusReady();
		} ]);