var services = angular.module('LEDWAXW3.services', []);

services.factory('Config', [ function() {
	var service = {
		iot_host_ip : null,
		iot_host_port : null
	};
	service.getIoTURL = function() {
		var ret = '';
		ret += (service.iot_host_ip == null ? '' : service.iot_host_ip);
		ret += (service.iot_host_port == null ? '' : ':'
				+ service.iot_host_port);
		return ret;
	}
	return service;
} ]);

services
		.factory(
				'REST_IoT',
				[
						'$http',
						'Config',
						function($http, Config) {
							var service = {
								hostURL : Config.getIoTURL()
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
								$http.post('/oauth/token').then(
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
								$http.get('/v1/devices').then(successCallback,
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
								$http.get('/v1/devices/' + deviceId).then(
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
										'/v1/devices/' + deviceId
												+ '/numStrips').then(
										successCallback, errorCallback);
								return ret;
							};
							return service;
						} ]);