module(function($provide) {
  $provide.service('REST_IoT', function() {
		serverLogin = function() {
			return {foo : "bar"};
		};
		getDevices = function() {
			return {bar : "baz"};
		};
//    this.isNumber = jasmine.createSpy('isNumber').andCallFake(function(num) {
//      //a fake implementation
//    });
//    this.isDate = jasmine.createSpy('isDate').andCallFake(function(num) {
//      //a fake implementation
//    });
  });
});
