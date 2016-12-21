const DEFAULT_REST_HOST_NAME = '127.0.0.1';
const DEFAULT_REST_HOST_PORT = '3000';

var services = angular.module('LEDWAXW3.services', []);
const hcAuthToken = '254406f79c1999af65a7df4388971354f85cfee9';

services.value('version', '1.0');

services.factory('AppAlerts', [ '$rootScope', '$timeout',
	function($rootScope, $timeout) {
		$rootScope.appAlerts = [];
		$rootScope.addAlert = function(type, msg) {
			$rootScope.appAlerts.push({
				type : type,
				msg : msg
			});
			$timeout(function() {
				$rootScope.closeAlert($rootScope.appAlerts.length - 1);
			}, 1250, false);
		};
		$rootScope.closeAlert = function(index) {
			$rootScope.appAlerts.splice(index, 1);
		// console.log('closed alert, remaining = '
		// + $rootScope.appAlerts.length);
		};
		return $rootScope;
	} ]);

services.factory('Settings', [ '$http', function($http) {
	var service = {
		dateFormat : 'M/d/yy h:mm:ss a',
		appConfig : {
		},
		uiState : {
			httpConnected : false,
			socketioConnected : false,
			uploadStatus : {
				uploading : false
			},
			currNav : null,
			currTab : null
		},
		settings : {
			rest_host_name : DEFAULT_REST_HOST_NAME,
			rest_host_port : DEFAULT_REST_HOST_PORT
		}
	};
	service.buildURL = function(host, port, secure) {
		var ret = '';
		ret += (typeof host != undefined ? host : '');
		ret += (typeof port != undefined ? ':' + port : '');
		if (ret.length > 0) {
			ret = (secure ? 'https' : 'http') + '://' + ret;
		}
		return ret;
	};
	service.getRESTHostURL = function() {
		return service.buildURL(service.settings.rest_host_name, service.settings.rest_host_port, false);
	};
	service.setRESTHostURL = function(host, port) {
		if (angular.isDefined(host)) {
			service.settings.rest_host_name = host;
		}
		if (angular.isDefined(port)) {
			service.settings.rest_host_port = port;
		}
	}
	service.retrieveAppConfig = function() {
		var config = {
			method : 'GET',
			url : service.getRESTHostURL() + '/config',
			data : {}
		};
		var promise = $http(config);
		promise.success = function(data) {
			service.appConfig = data.data;
		};
		promise.error = function(data) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		};
		return promise.then(promise.success, promise.error);
	};
	service.retrieveSettings = function() {
		var config = {
			method : 'GET',
			url : service.getRESTHostURL() + '/user/settings',
			data : {}
		};
		var promise = $http(config);
		promise.success = function(data) {
			service.settings = data.data;
		};
		promise.error = function(data) {};
		return promise.then(promise.success, promise.error);
	};
	service.putSettings = function(settings) {
		var config = {
			method : 'POST',
			url : service.getRESTHostURL() + '/settings/user/update',
			data : settings
		};
		var promise = $http(config);
		promise.success = function(data) {};
		promise.error = function(data) {};
		return promise.then(promise.success, promise.error);
	};
	service.saveSettings = function(settings) {
		service.settings = settings;
		return service.putSettings(service.settings);
	};
	return service;
} ]);

services.factory('REST_IoT', [ '$http', 'Settings',
	function($http, Settings) {
		var service = {
			hostURL : Settings.getRESTHostURL()
		};
		service.init = function() {
			if (service.hostURL == null) {
				service.hostURL = '';
			}
		};
		service.init();
		service.setHostURL = function(url) {
			if (!angular.isDefined(url)) {
				throw 'missing param: url';
			}
			service.hostURL = url;
		};
		service.defaultRESTResp = {
			code : 511,
			error : true,
			error_description : "unknown error"
		};
		service.defaultSuccessCallback = function(response) {
			if (angular.isDefined(response.error)) {
				ret = {
					code : response.status,
					error : true,
					error_description : response.error_description
				};
			} else {
				ret = {
					code : response.status,
					data : response.data,
					error : false,
					error_description : null
				};
			}
			return ret;
		};
		service.defaultErrorCallback = function(response) {
			ret = {
				code : response.status,
				error : true,
				error_description : response.status_text
			};
			return ret;
		};
		service.serverLogin = function(cloudid, username, password) {
			var ret = service.defaultRESTResp;
			if (!angular.isDefined(userName)) {
				ret.error_description = 'missing param: username';
				return ret;
			}
			if (!angular.isDefined(password)) {
				ret.error_description = 'missing param: password';
				return ret;
			}
			if (!angular.isDefined(cloudid)) {
				ret.error_description = 'missing param: cloudid';
				return ret;
			}
			var successCallback = function(response) {
				if (angular.isDefined(response.body.error)) {
					ret = {
						code : response.body.code,
						error : true,
						error_description : response.body.error_description
					};
				} else {
					ret = {
						code : 200,
						error : false,
						cookietoken : response.body.data.cookietoken
					};
				}
				return ret;
			};
			var errorCallback = function(response) {
				ret = {
					code : 511,
					error : true,
					cookietoken : null
				};
				return ret;
			};
			$http.defaults.headers.post = {
				particleCloudId : cloudid,
				username : username,
				password : password
			};
			var config = {
				method : 'POST',
				url : service.hostURL + '/user/login',
				data : {
					username : username,
					password : password,
					particleCloudId : cloudid
				}
			};
			return $http(config).then(
				successCallback, errorCallback);
		};
		service.discoverDevices = function(cloudId, authToken) {
			var ret = service.defaultRESTResp;
			if (!angular.isDefined(cloudId)) {
				ret.error_description = "missing param: cloudid";
				return ret;
			}
			var successCallback = (response) => {
				if (angular.isDefined(response.error)) {
					ret = {
						code : response.status,
						error : true,
						error_description : response.error_description
					};
				} else {
					ret = {
						code : response.status,
						data : response.data,
						error : false,
						error_description : null
					};
				}
				return ret;
			};
			var errorCallback = service.defaultErrorCallback;
			var config = {
				method : 'GET',
				url : service.hostURL + '/devices/discoverDevices?particleCloudId=' + cloudId
					+ '&authtoken=' + hcAuthToken
			};
			let prom = $http(config).then(successCallback, errorCallback);
			return prom;
		};
		service.getStoredDevices = function(cloudId, sessionToken) {
			var ret = service.defaultRESTResp;
			if (!angular.isDefined(cloudId)) {
				ret.error_description = "missing param: cloudid";
				return ret;
			}
			if (!angular.isDefined(sessionToken)) {
				ret.error_description = "missing param: session token";
				return ret;
			}
			var successCallback = (response) => {
				if (angular.isDefined(response.error)) {
					ret = {
						code : response.status,
						error : true,
						error_description : response.error_description
					};
				} else {
					ret = {
						code : response.status,
						data : response.data,
						error : false,
						error_description : null
					};
				}
				return ret;
			};
			var errorCallback = service.defaultErrorCallback;
			var config = {
				method : 'GET',
				url : service.hostURL + '/devices/retrieveAllStoredDevices?particleCloudId=' + cloudId
					+ '&sessiontoken=' + hcAuthToken
			};
			let prom = $http(config).then(
				successCallback, errorCallback);
			return prom;
		};
		service.getDeviceCaps = function(cloudId, sessionToken, deviceId) {
			var ret = service.defaultRESTResp;
			if (!angular.isDefined(cloudId)) {
				ret.error_description = "missing param: cloud id";
				return ret;
			}
			if (!angular.isDefined(sessionToken)) {
				ret.error_description = "missing param: session token";
				return ret;
			}
			if (!angular.isDefined(deviceId)) {
				ret.error_description = "missing param: device id";
				return ret;
			}
			var successCallback = service.defaultSuccessCallback;
			var errorCallback = service.defaultErrorCallback;
			var config = {
				method : 'GET',
				url : service.hostURL + '/devices/discoverCaps?particleCloudId=' + cloudId + '&deviceId=' + deviceId
					+ '&authtoken=' + hcAuthToken
			};
			let prom = $http(config).then(
				successCallback, errorCallback);
			return prom;
		};
		service.getNumberOfStrips = function(authToken, deviceId) {
			var ret = service.defaultRESTResp;
			if (!angular.isDefined(deviceId)) {
				ret.error_description = "missing param: device id";
				return ret;
			}
			var successCallback = service.defaultSuccessCallback;
			var errorCallback = service.defaultErrorCallback;
			var config = {
				method : 'GET',
				url : service.hostURL + '/devices/getNumStrips?particleCloudId=' + cloudId + '&deviceId=' + deviceId
					+ '&authtoken=' + hcAuthToken
			};
			return $http(config).then(
				successCallback, errorCallback);
		};
		service.storeDeviceANDStrips = function(cloudId, sessionToken, deviceId, numStrips, deviceNameFW) {
			var ret = service.defaultRESTResp;
			if (!angular.isDefined(cloudId)) {
				ret.error_description = "missing param: cloud id";
				return ret;
			}
			if (!angular.isDefined(sessionToken)) {
				ret.error_description = "missing param: session token";
				return ret;
			}
			if (!angular.isDefined(deviceId)) {
				ret.error_description = "missing param: device id";
				return ret;
			}
			if (!angular.isDefined(numStrips)) {
				ret.error_description = "missing param: number of strips";
				return ret;
			}
			if (!angular.isDefined(deviceNameFW)) {
				ret.error_description = "missing param: device name FW";
				return ret;
			}
			var successCallback = service.defaultSuccessCallback;
			var errorCallback = service.defaultErrorCallback;
			var config = {
				method : 'POST',
				url : service.hostURL + '/devices/saveDeviceANDLEDStrips',
				data : {
					particleCloudId : cloudId,
					deviceId : deviceId,
					numStrips : numStrips,
					authtoken : hcAuthToken,
					deviceNameFW : deviceNameFW
				}
			};
			let prom = $http(config).then(
				successCallback, errorCallback);
			return prom;
		};
		service.removeStoredDevice = function(cloudId, sessionToken, deviceId) {
			var ret = service.defaultRESTResp;
			if (!angular.isDefined(cloudId)) {
				ret.error_description = "missing param: cloud id";
				return ret;
			}
			if (!angular.isDefined(sessionToken)) {
				ret.error_description = "missing param: session token";
				return ret;
			}
			if (!angular.isDefined(deviceId)) {
				ret.error_description = "missing param: device id";
				return ret;
			}
			var successCallback = service.defaultSuccessCallback;
			var errorCallback = service.defaultErrorCallback;
			var config = {
				method : 'POST',
				url : service.hostURL + '/devices/deleteDevice',
				data : {
					particleCloudId : cloudId,
					deviceId : deviceId,
					sessiontoken : hcAuthToken
				}
			};
			let prom = $http(config).then(
				successCallback, errorCallback);
			return prom;
		};
		service.setColor = function(cloudId, sessionToken, deviceId, ledStripIndex, color) {
			var ret = service.defaultRESTResp;
			if (!angular.isDefined(cloudId)) {
				ret.error_description = "missing param: cloud id";
				return ret;
			}
			if (!angular.isDefined(sessionToken)) {
				ret.error_description = "missing param: session token";
				return ret;
			}
			if (!angular.isDefined(deviceId)) {
				ret.error_description = "missing param: device id";
				return ret;
			}
			if (!angular.isDefined(ledStripIndex)) {
				ret.error_description = "missing param: led strip index";
				return ret;
			}
			if (!angular.isDefined(color)) {
				ret.error_description = "missing param: color";
				return ret;
			}
			var successCallback = service.defaultSuccessCallback;
			var errorCallback = service.defaultErrorCallback;
			var config = {
				method : 'POST',
				url : service.hostURL + '/devices/setColor',
				data : {
					particleCloudId : cloudId,
					deviceId : deviceId,
					stripIndex : ledStripIndex,
					sessiontoken : hcAuthToken,
					color24Bit : color
				}
			};
			let prom = $http(config).then(
				successCallback, errorCallback);
			return prom;
		};
		service.setBrightness = function(cloudId, sessionToken, deviceId, ledStripIndex, brightness) {
			var ret = service.defaultRESTResp;
			if (!angular.isDefined(cloudId)) {
				ret.error_description = "missing param: cloud id";
				return ret;
			}
			if (!angular.isDefined(sessionToken)) {
				ret.error_description = "missing param: session token";
				return ret;
			}
			if (!angular.isDefined(deviceId)) {
				ret.error_description = "missing param: device id";
				return ret;
			}
			if (!angular.isDefined(ledStripIndex)) {
				ret.error_description = "missing param: led strip index";
				return ret;
			}
			if (!angular.isDefined(brightness)) {
				ret.error_description = "missing param: brightness";
				return ret;
			}
			var successCallback = service.defaultSuccessCallback;
			var errorCallback = service.defaultErrorCallback;
			var config = {
				method : 'POST',
				url : service.hostURL + '/devices/setBrightness',
				data : {
					particleCloudId : cloudId,
					deviceId : deviceId,
					stripIndex : ledStripIndex,
					sessiontoken : hcAuthToken,
					brightness : brightness
				}
			};
			let prom = $http(config).then(
				successCallback, errorCallback);
			return prom;
		};
		service.setColorHoldTime = function(cloudId, sessionToken, deviceId, ledStripIndex, holdTime) {
			var ret = service.defaultRESTResp;
			if (!angular.isDefined(cloudId)) {
				ret.error_description = "missing param: cloud id";
				return ret;
			}
			if (!angular.isDefined(sessionToken)) {
				ret.error_description = "missing param: session token";
				return ret;
			}
			if (!angular.isDefined(deviceId)) {
				ret.error_description = "missing param: device id";
				return ret;
			}
			if (!angular.isDefined(ledStripIndex)) {
				ret.error_description = "missing param: led strip index";
				return ret;
			}
			if (!angular.isDefined(holdTime)) {
				ret.error_description = "missing param: hold time";
				return ret;
			}
			var successCallback = service.defaultSuccessCallback;
			var errorCallback = service.defaultErrorCallback;
			var config = {
				method : 'POST',
				url : service.hostURL + '/devices/setMultiColorHoldTime',
				data : {
					particleCloudId : cloudId,
					deviceId : deviceId,
					stripIndex : ledStripIndex,
					sessiontoken : hcAuthToken,
					holdTime : holdTime
				}
			};
			let prom = $http(config).then(
				successCallback, errorCallback);
			return prom;
		};
		service.setFadeTime = function(cloudId, sessionToken, deviceId, ledStripIndex, fadeTimeInterval) {
			var ret = service.defaultRESTResp;
			if (!angular.isDefined(cloudId)) {
				ret.error_description = "missing param: cloud id";
				return ret;
			}
			if (!angular.isDefined(sessionToken)) {
				ret.error_description = "missing param: session token";
				return ret;
			}
			if (!angular.isDefined(deviceId)) {
				ret.error_description = "missing param: device id";
				return ret;
			}
			if (!angular.isDefined(ledStripIndex)) {
				ret.error_description = "missing param: led strip index";
				return ret;
			}
			if (!angular.isDefined(fadeTimeInterval)) {
				ret.error_description = "missing param: fade time";
				return ret;
			}
			var successCallback = service.defaultSuccessCallback;
			var errorCallback = service.defaultErrorCallback;
			var config = {
				method : 'POST',
				url : service.hostURL + '/devices/setLEDFadeTimeInterval',
				data : {
					particleCloudId : cloudId,
					deviceId : deviceId,
					stripIndex : ledStripIndex,
					sessiontoken : hcAuthToken,
					fadeTimeInterval : fadeTimeInterval
				}
			};
			let prom = $http(config).then(
				successCallback, errorCallback);
			return prom;
		};
		service.setFadeMode = function(cloudId, sessionToken, deviceId, ledStripIndex, fadeMode) {
			var ret = service.defaultRESTResp;
			if (!angular.isDefined(cloudId)) {
				ret.error_description = "missing param: cloud id";
				return ret;
			}
			if (!angular.isDefined(sessionToken)) {
				ret.error_description = "missing param: session token";
				return ret;
			}
			if (!angular.isDefined(deviceId)) {
				ret.error_description = "missing param: device id";
				return ret;
			}
			if (!angular.isDefined(ledStripIndex)) {
				ret.error_description = "missing param: led strip index";
				return ret;
			}
			if (!angular.isDefined(fadeMode)) {
				ret.error_description = "missing param: fade mode";
				return ret;
			}
			var successCallback = service.defaultSuccessCallback;
			var errorCallback = service.defaultErrorCallback;
			var config = {
				method : 'POST',
				url : service.hostURL + '/devices/setLEDFadeMode',
				data : {
					particleCloudId : cloudId,
					deviceId : deviceId,
					stripIndex : ledStripIndex,
					sessiontoken : hcAuthToken,
					fadeMode : fadeMode
				}
			};
			let prom = $http(config).then(
				successCallback, errorCallback);
			return prom;
		};
		service.setDispMode = function(cloudId, sessionToken, deviceId, ledStripIndex, dispMode) {
			var ret = service.defaultRESTResp;
			if (!angular.isDefined(cloudId)) {
				ret.error_description = "missing param: cloud id";
				return ret;
			}
			if (!angular.isDefined(sessionToken)) {
				ret.error_description = "missing param: session token";
				return ret;
			}
			if (!angular.isDefined(deviceId)) {
				ret.error_description = "missing param: device id";
				return ret;
			}
			if (!angular.isDefined(ledStripIndex)) {
				ret.error_description = "missing param: led strip index";
				return ret;
			}
			if (!angular.isDefined(dispMode)) {
				ret.error_description = "missing param: disp mode";
				return ret;
			}
			var successCallback = service.defaultSuccessCallback;
			var errorCallback = service.defaultErrorCallback;
			var config = {
				method : 'POST',
				url : service.hostURL + '/devices/setDispMode',
				data : {
					particleCloudId : cloudId,
					deviceId : deviceId,
					stripIndex : ledStripIndex,
					sessiontoken : hcAuthToken,
					dispMode : dispMode
				}
			};
			let prom = $http(config).then(
				successCallback, errorCallback);
			return prom;
		};
		return service;
	} ]);

services.factory('PaginationFilteredSorted', [ '$filter',
	function($filter) {
		let service = {
			suffixes : [],
			pagingVars : {}
		};
		service.init = ($scope, suffix) => {
			service.suffixes.push(suffix);
			// item paging
			$scope['totalItems' + suffix] = 0; // rest call is async so start @ 0
			$scope['currentPage' + suffix] = 1;
			$scope['pageSize' + suffix] = 8;
			$scope['pagedItems' + suffix] = [];
			// item filtering
			$scope['itemFilter' + suffix] = '';
			$scope['itemFilterStored' + suffix] = '';
			// setup sorting
			$scope['orderPropFresh' + suffix] = 'name';
			$scope['reverseSortFresh' + suffix] = false;
			$scope['orderPropStored' + suffix] = 'name';
			$scope['reverseSortStored' + suffix] = false;
			// setup methods
			$scope['sortBy' + suffix] = (prop, items, modelName = null) => {
				if (prop == $scope['orderProp' + suffix]) {
					$scope['reverseSort' + suffix] = !$scope['reverseSort' + suffix];
				} else {
					$scope['orderProp' + suffix] = prop;
					$scope['reverseSort' + suffix] = false;
				}
				if (!modelName) {
					console.log('unable to sort, invalid modelName: ' + modelName);
				}
				$scope[modelName] = $scope.groupToPages(
					items, $scope['pageSize' + suffix],
					$scope['itemFilter' + suffix], $scope['orderProp' + suffix],
					$scope['reverseSort' + suffix]);
			};
			// pagination
			$scope['groupToPages' + suffix] = (items, itemsPerPage, filterQuery, sortProp, reverseSort) => {
				let ret = [];
				// filtering
				let newList = $filter('filter')(items,
					filterQuery);
				$scope['totalItems' + suffix] = newList.length;
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
		};
		return service;
	} ]);