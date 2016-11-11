const DEFAULT_REST_HOST_IP = '127.0.0.1';
const DEFAULT_REST_HOST_PORT = '3000';

var services = angular.module('LEDWAXW3.services', []);

services.value('version', '1.0');

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
			rest_host_ip : DEFAULT_REST_HOST_IP,
			rest_host_port : DEFAULT_REST_HOST_PORT
		}
	};
	service.retrieveAppConfig = function() {
		var config = {
			method : 'GET',
			url : 'config',
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
			url : 'user/settings',
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
			url : 'settings/user/update',
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
	service.getIoTURL = function() {
		var ret = 'http://';
		ret += (service.settings.iot_host_ip == null ? '' : service.settings.iot_host_ip);
		ret += (service.settings.iot_host_port == null ? '' : ':' + service.settings.iot_host_port);
		return ret;
	}
	service.setIoTURL = function(ip, port) {
		if (angular.isDefined(ip)) {
			service.settings.iot_host_ip = ip;
		}
		if (angular.isDefined(port)) {
			service.settings.iot_host_port = port;
		}
	}

	return service;
} ]);

services
	.factory(
		'REST_IoT',
		[
			'$http',
			'Settings',
			function($http, Settings) {
				var service = {
					hostURL : Settings.getIoTURL()
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
				service.serverLogin = function(username, password) {
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
								auth_token : null
							};
						}
						return ret;
					};
					var errorCallback = function(response) {
						ret = {
							code : 511,
							error : true,
							auth_token : null
						};
						return ret;
					};
					$http.defaults.headers.post = {
						username : username,
						password : password
					};
					$http.post(service.hostURL + '/user/login').then(
						successCallback, errorCallback);
				};
				service.discoverDevices = function(authToken) {
					var ret = {
						code : 511,
						error : true,
						error_description : "unknown error"
					};
					if (!angular.isDefined(authToken)) {
						ret.error_description = "The access token was not found";
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
					};
					var errorCallback = function(response) {
						ret = {
							code : response.body.code,
							error : true,
							error_description : response.body.error_description
						};
						return ret;
					};
					$http.defaults.headers.get = {
						Authorization : authToken
					};
					$http.get(service.hostURL + '/devices/discoverDevices').then(successCallback,
						errorCallback);
				};
				service.getDeviceCaps = function(authToken,
					deviceId) {
					var ret = {
						code : 511,
						error : true,
						error_description : "unknown error"
					};
					if (!angular.isDefined(authToken)) {
						ret.error_description = "The access token was not found";
						return ret;
					}
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
					$http.defaults.headers.get = {
						Authorization : authToken
					};
					$http.get(service.hostURL + '/devices/discoverCaps' + deviceId).then(
						successCallback, errorCallback);
				};
				service.getNumberOfStrips = function(authToken,
					deviceId) {
					var ret = {
						code : 511,
						error : true,
						error_description : "unknown error"
					};
					if (!angular.isDefined(authToken)) {
						ret = {
							code : 511,
							error : true,
							error_description : "The access token was not found"
						};
						return ret;
					}
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
					$http.defaults.headers.get = {
						Authorization : authToken
					};
					$http.get(
						service.hostURL + '/v1/devices/' + deviceId
						+ '/numStrips').then(
						successCallback, errorCallback);
				};
				return service;
			} ]);