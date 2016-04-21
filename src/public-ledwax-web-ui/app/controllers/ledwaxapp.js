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
				'Config',
				'REST_IoT',
				function($rootScope, $scope, $route, $window, $location,
						$routeParams, $cookies, $filter, $sanitize, $translate,
						Config, REST_IoT) {
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
					}, {
						active : false,
						path : '/login',
						label : 'NAV_LOGIN'
					} ];
					$scope.goToNav = function(path) {
						$location.url(path);
					};
					$scope.setLangPref = function(langKey) {
						$translate.use(langKey);
					};
					$scope.updateNavState = function(currentContext) {
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
					$rootScope.$on('$routeChangeSuccess', function() {
						$scope.updateNavState($location.url().split("/")[1]);
					});
					$scope.randomLogo = function() {
						$scope.logoSrc = 'img/ledwax_logo_'
								+ Math.floor(Math.random() * 4) + '.png';
					};
					$scope.randomHeaderBg = function() {
						$scope.headerBgClass = 'navbar-bg-'
								+ Math.floor(Math.random() * 5);
					};
					$scope.randomHeaderBg();
					$scope.randomLogo();
					// $scope.updateNavState();
					$rootScope.setPhantomStatusReady = function() {
						$rootScope.phantom_status = 'ready';
					};
					$scope.config = Config;
					$scope.userSession = {
						username : null,
						password : null,
						auth_token : null,
						from_login : false,
						persist : false
					};
					$scope.forms = {
						login : {
							cache : {}
						}
					};
					cookAuthToken = $cookies.get('auth_token');
					if (cookAuthToken) {
						$scope.userSession.auth_token = cookAuthToken;
						$scope.userSession.persist = true;
						$scope.userSession.from_login = false;
					}
				} ]);
