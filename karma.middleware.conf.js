module.exports = function(config) {
	config.set({
		basePath : './',
		files : [ 'src/modules/middleware/**/*.js' ],
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
