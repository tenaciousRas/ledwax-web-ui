module.exports = function(config) {
	config
			.set({
				basePath : './',
				files : [
						'src/modules/public-ledwax-web-ui/app/bower_components/angular/angular.js',
						'src/modules/public-ledwax-web-ui/app/bower_components/angular-route/angular-route.js',
						'src/modules/public-ledwax-web-ui/app/bower_components/angular-mocks/angular-mocks.js',
						'src/modules/public-ledwax-web-ui/app/bower_components/angular-cookies/angular-cookies.js',
						'src/modules/public-ledwax-web-ui/app/bower_components/angular-loader/angular-loader.js',
						'src/modules/public-ledwax-web-ui/app/bower_components/angular-sanitize/angular-sanitize.js',
						'src/modules/public-ledwax-web-ui/app/bower_components/angular-translate/angular-translate.js',
						'src/modules/public-ledwax-web-ui/app/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
						'src/modules/public-ledwax-web-ui/app/bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
						'test-e2e/mocks/*.js', 'src/modules/public-ledwax-web-ui/app/components/**/*.js',
						'src/modules/public-ledwax-web-ui/app/filters/**/*.js', 'src/modules/public-ledwax-web-ui/app/directives/**/*.js',
						'src/modules/public-ledwax-web-ui/app/services/**/*.js', 'src/modules/public-ledwax-web-ui/app/controllers/**/*.js' ],
				autoWatch : true,
				frameworks : [ 'jasmine' ],
				browsers : [ 'Firefox' ],
				reporters : [ 'progress', 'junit' ],
				port : 9876,
				colors : true,
				logLevel : config.LOG_INFO,
				captureTimeout : 15000,
				singleRun : false,
				plugins : [ 'karma-chrome-launcher', 'karma-firefox-launcher',
						'karma-jasmine', 'karma-junit-reporter' ],
				junitReporter : {
					outputFile : 'test/out_web_unit.xml',
					suite : 'unit'
				},
				reportSlowerThan : 500
			});
};
