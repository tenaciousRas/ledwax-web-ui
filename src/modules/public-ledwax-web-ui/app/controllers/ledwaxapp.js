'use strict';

angular.module(
	'LEDWAXW3.app',
	[ 'ngRoute', 'ngCookies', 'ngSanitize', 'pascalprecht.translate',
		'LEDWAXW3.services' ])
	.controller(
		'AppCtrl',
		[
			'$rootScope',
			'$scope',
			'$route',
			'$window',
			'$location',
			'$routeParams',
			'$cookies',
			'$filter',
			'$sanitize',
			'$translate',
			'AppAlerts',
			'Settings',
			'REST_IoT',
			($rootScope, $scope, $route, $window, $location,
				$routeParams, $cookies, $filter, $sanitize, $translate,
				AppAlerts, Settings, REST_IoT) => {
				$scope.topnav = [ {
					active : false,
					path : '/leds',
					label : 'NAV_LEDS'
				}, {
					active : false,
					path : '/setup',
					label : 'NAV_SETUP'
				}, {
					active : false,
					path : '/about',
					label : 'NAV_ABOUT'
				} ];
				$scope.updateNavState = (currentContext) => {
					$scope.topNavClasses = [];
					var i = 0;
					// console.log(currentContext[1]);
					for (i = 0; i < $scope.topnav.length; i++) {
						if ($scope.topnav[i].path == '/' + currentContext) {
							$scope.topnav[i].active = true;
							$scope.topNavClasses[i] = 'active';
						} else {
							$scope.topnav[i].active = false;
							$scope.topNavClasses[i] = '';
						}
					}
				};
				// app alerts
				$scope.informUser = (msg) => {
					AppAlerts.addAlert('success', msg);
				};
				$scope.alertUser = (msg) => {
					AppAlerts.addAlert('danger', msg);
				};
				var p = Settings.retrieveAppConfig();
				p.then(() => {
					$scope.appConfig = Settings.appConfig;
					Settings.uiState.httpConnected = true;
					if (!angular.isDefined($scope.appConfig.cloudHosts) || $scope.appConfig.cloudHosts.length < 1) {
						$scope.alertUser("No cloud hosts are configured.  Are you sure the REST API is setup?");
					} else {
						$scope.informUser("Got application configuration from web server.");
						$scope.cloudHosts = $scope.appConfig.cloudHosts;
						// FIXME should be stored in user settings or cookie
						$scope.currentCloudHost = $scope.cloudHosts[0];
					}
				});
				/* unused */
				$scope.randomLogo = () => {
					$scope.logoSrc = 'img/ledwax_logo_'
						+ Math.floor(Math.random() * 4) + '.png';
				};
				$scope.randomHeaderBg = () => {
					$scope.headerBgClass = 'navbar-bg-'
					+ Math.floor(Math.random() * 5);
				};
				$scope.randomHeaderBg();
				$scope.randomLogo();
				$rootScope.setPhantomStatusReady = () => {
					$rootScope.phantom_status = 'ready';
				};
				/* end unused */
				$scope.config = Settings.appConfig;
				$scope.userSession = {
					username : null,
					sessiontoken : null,
					from_login : false,
					persist : false
				};
				$scope.forms = {
					login : {
						cache : {}
					}
				};
				let cookSessToken = $cookies.get('sessiontoken');
				if (cookSessToken && !cookSessToken == '') {
					$scope.userSession.sessiontoken = cookSessToken;
					$scope.userSession.from_login = false;
					$scope.userSession.persist = true;
					$scope.topnav.push({
						active : false,
						path : '/logout',
						label : 'NAV_LOGOUT'
					});
				} else {
					$scope.topnav.push({
						active : false,
						path : '/login',
						label : 'NAV_LOGIN'
					});
				}
				$scope.goToNav = (path) => {
					$location.url(path);
				};
				$rootScope.$on('$routeChangeSuccess', () => {
					let route = $location.url().split("/")[1];
					$scope.updateNavState(route);
				});
				$scope.setLangPref = (langKey) => {
					$translate.use(langKey);
				};
				// persist tabs in views
				$scope.setupTabs = [ {
					title : 'New Devices',
					include : 'partials/tab_newdevices.html',
					disabled : false
				}, {
					title : 'Stored Devices',
					include : 'partials/tab_storeddevices.html',
					disabled : false
				} ];
			} ]);