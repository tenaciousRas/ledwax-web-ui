const DEFAULT_REST_HOST_NAME = '127.0.0.1';
const DEFAULT_REST_HOST_PORT = '3000';

var services = angular.module('LEDWAXW3.services', []);

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
		service.serverLogin = function(cloudid, username, password) {
			var ret = {
				code : 511,
				error : true,
				error_description : "unknown error"
			};
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
				cloudid : cloudid,
				username : username,
				password : password
			};
			var config = {
				method : 'POST',
				url : service.hostURL + '/user/login',
				data : {
					username : username,
					password : password,
					cloudid : cloudid
				}
			};
			return $http(config).then(
				successCallback, errorCallback);
		};
		service.discoverDevices = function(cloudId, authToken) {
			var ret = {
				code : 511,
				error : true,
				error_description : "unknown error"
			};
			var successCallback = function(response) {
				if (angular.isDefined(response.body.error)) {
					ret = {
						code : response.body.code,
						error : true,
						error_description : response.body.error_description
					};
				} else {
					ret = {
						code : response.body.code,
						data : response.body.data,
						error : false,
						error_description : response.body.error_description
					};
				}
				return ret;
			};
			var errorCallback = function(response) {
				ret = {
					code : response.body.code,
					error : true,
					error_description : response.body.error_description
				};
				return ret;
			};
			var config = {
				method : 'GET',
				url : service.hostURL + '/devices/discoverDevices?cloudId=' + cloudId
					+ '&authtoken=' + authToken
			};
			return $http(config).then(
				successCallback, errorCallback);
		};
		service.getDeviceCaps = function(authToken,
			deviceId) {
			var ret = {
				code : 511,
				error : true,
				error_description : "unknown error"
			};
			if (!angular.isDefined(deviceId)) {
				ret.error_description = "The device id was not found";
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
						code : response.body.code,
						data : response.body.data,
						error : false,
						error_description : response.body.error_description
					};
				}
				return ret;
			};
			var errorCallback = function(response) {
				ret = {
					code : response.body.code,
					error : true,
					error_description : response.body.error_description
				};
				return ret;
			};
			var config = {
				method : 'GET',
				url : service.hostURL + '/devices/discoverCaps?deviceId=' + deviceId
					+ '&authtoken=' + authToken
			};
			return $http(config).then(
				successCallback, errorCallback);
		};
		service.getNumberOfStrips = function(deviceId) {
			var ret = {
				code : 511,
				error : true,
				error_description : "unknown error"
			};
			if (!angular.isDefined(deviceId)) {
				ret = {
					code : 511,
					error : true,
					error_description : "The device id was not found"
				};
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
						code : response.body.code,
						data : response.body.data,
						error : false,
						error_description : response.body.error_description
					};
				}
				return ret;
			};
			var errorCallback = function(response) {
				ret = {
					code : response.body.code,
					error : true,
					error_description : response.body.error_description
				};
				return ret;
			};
			var config = {
				method : 'GET',
				url : service.hostURL + '/devices/getNumStrips?deviceId=' + deviceId
			};
			return $http(config).then(
				successCallback, errorCallback);
		};
		return service;
	} ]);