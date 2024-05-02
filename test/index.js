"use strict";

var should = require('chai').should();
var spectrecore = require('../');

describe('#versionGuard', function() {
  it('global._spectrecoreLibVersion should be defined', function() {
    should.equal(global._spectrecoreLibVersion, spectrecore.version);
  });

  it('throw an error if version is already defined', function() {
    (function() {
      spectrecore.versionGuard('version');
    }).should.throw('More than one instance of bitcore');
  });
});
