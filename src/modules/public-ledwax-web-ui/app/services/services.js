const DEFAULT_IOT_HOST_IP = '127.0.0.1';
const DEFAULT_IOT_HOST_PORT = '3000';

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
			uploadStatus : { uploading : false },
			currNav : null,
			currTab : null
		},
		settings : {
			iot_host_ip : DEFAULT_IOT_HOST_IP,
			iot_host_port : DEFAULT_IOT_HOST_PORT
		}
	};
	service.retrieveAppConfig = function() {
		var config = {
			method : 'GET',
			url : 'rest/appconfig',
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
		promise.then(promise.success, promise.error);
		return promise;
	};
	service.retrieveSettings = function() {
		var config = {
			method : 'GET',
			url : 'rest/user/settings',
			data : {}
		};
		var promise = $http(config);
		promise.success = function(data) {
			service.settings = data.data;
		};
		promise.error = function(data) {};
		promise.then(promise.success, promise.error);
		return promise;
	};
	service.putSettings = function(settings) {
		var config = {
			method : 'POST',
			url : 'rest/settings/user/update',
			data : settings
		};
		var promise = $http(config);
		promise.success = function(data) {};
		promise.error = function(data) {};
		promise.then(promise.success, promise.error);
		return promise;
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
						ret = {
							code : 511,
							error : true,
							error_description : 'missing param: username'
						};
						return ret;
					}
					if (!angular.isDefined(password)) {
						ret = {
							code : 511,
							error : true,
							error_description : 'missing param: password'
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
								code : 200,
								error : false,
								auth_token : null
							};
						}
					};
					var errorCallback = function(response) {
						ret = {
							code : 511,
							error : false,
							auth_token : null
						};
					};
					$http.defaults.headers.post = {
						grant_type : 'password',
						username : username,
						password : password
					};
					$http.post(service.hostURL + '/user/login').then(
						successCallback, errorCallback);
					return ret;
				};
				service.getDevices = function(authToken) {
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
								error : true,
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
					};
					$http.defaults.headers.get = {
						Authorization : authToken
					};
					$http.get(service.hostURL + '/v1/devices').then(successCallback,
						errorCallback);
					return ret;
				};
				service.getDeviceDetails = function(authToken,
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
								error : true,
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
					};
					$http.defaults.headers.get = {
						Authorization : authToken
					};
					$http.get(service.hostURL + '/v1/devices/' + deviceId).then(
						successCallback, errorCallback);
					return ret;
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
								error : true,
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
					};
					$http.defaults.headers.get = {
						Authorization : authToken
					};
					$http.get(
						service.hostURL + '/v1/devices/' + deviceId
						+ '/numStrips').then(
						successCallback, errorCallback);
					return ret;
				};
				return service;
			} ]);