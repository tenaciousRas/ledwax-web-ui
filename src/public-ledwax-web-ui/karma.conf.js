module.exports = function(config) {
	config
			.set({
				basePath : './',
				files : [
						'app/bower_components/angular/angular.js',
						'app/bower_components/angular-route/angular-route.js',
						'app/bower_components/angular-mocks/angular-mocks.js',
						'app/bower_components/angular-cookies/angular-cookies.js',
						'app/bower_components/angular-loader/angular-loader.js',
						'app/bower_components/angular-sanitize/angular-sanitize.js',
						'app/bower_components/angular-translate/angular-translate.js',
						'app/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
						'app/bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
						'e2e-tests/mocks/*.js', 'app/components/**/*.js',
						'app/filters/**/*.js', 'app/directives/**/*.js',
						'app/services/**/*.js', 'app/controllers/**/*.js' ],
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
					outputFile : 'test_out/unit.xml',
					suite : 'unit'
				},
				reportSlowerThan : 500
			});
};
