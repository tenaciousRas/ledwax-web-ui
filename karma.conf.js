module.exports = function(config) {
	config
			.set({
				basePath : './',
				files : [
						'public/app/bower_components/angular/angular.js',
						'public/app/bower_components/angular-route/angular-route.js',
						'public/app/bower_components/angular-mocks/angular-mocks.js',
						'public/app/bower_components/angular-cookies/angular-cookies.js',
						'public/app/bower_components/angular-loader/angular-loader.js',
						'public/app/bower_components/angular-sanitize/angular-sanitize.js',
						'public/app/bower_components/angular-translate/angular-translate.js',
						'public/app/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
						'public/app/bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
						'test-e2e/mocks/*.js', 'public/app/components/**/*.js',
						'public/app/filters/**/*.js', 'public/app/directives/**/*.js',
						'public/app/services/**/*.js', 'public/app/controllers/**/*.js' ],
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
					outputFile : 'test/out_unit.xml',
					suite : 'unit'
				},
				reportSlowerThan : 500
			});
};
