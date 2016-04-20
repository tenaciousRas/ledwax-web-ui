'use strict';

describe('LEDWAXW3.version module', function() {
  beforeEach(module('LEDWAXW3.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
