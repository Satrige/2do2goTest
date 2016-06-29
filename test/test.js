'use strict';
var assert = require('chai').assert,
	expect = require('chai').expect,
	helpers = require('./helpers'),
	parseLib = require('../controllers/parseLib');

describe('Tree task', function() {
	describe('Single item', function() {
		var inputData = helpers.getSingleInput();

		parseLib.reformJSON(inputData, function(err, output) {
	        it('should return null when there were no errors', function(done) {
	            assert.equal(null, err);

	            done();
	        });

	        var correctOutput = helpers.getSingleOutput();

	        it('should return equal of correct answer', function(done) {
	            expect(correctOutput).to.eql(output);

	            done();
	        });
		});
	});

	describe('Several items', function() {
		var inputData = helpers.getPluralInput();

		parseLib.reformJSON(inputData, function(err, output) {
	        it('should return null when there were no errors', function(done) {
	            assert.equal(null, err);

	            done();
	        });

	        var correctOutput = helpers.getPluraOutput();

	        it('should return equal of correct answer', function(done) {
	            expect(correctOutput).to.eql(output);

	            done();
	        });
		});
	});
});
