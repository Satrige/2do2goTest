'use strict';
var _ = require('underscore');

exports.reformJSON = function(inputData, callback) {
	if (inputData) {
		var sortFunc = function(a, b) {
			return (a.parentId >= b.parentId);
		}
		let sortedData = inputData.sort(sortFunc);
		sortedData = makeTree(sortedData);


		let output = [];

		for (let i in sortedData) {
			if (sortedData[i].parentId === 0) {
				output.push(sortedData[i]);
			}
		}

		callback(null, output);
	}
	else {
		callback(new Error('Wrong input'));
	}
};

var makeTree = function(inputNodes) {
	let parent = null;

	for (let i = inputNodes.length - 1; i >= 0; --i) {
		parent = _.find(inputNodes, function(obj) {
			return obj.id === inputNodes[i].parentId;
		});

		if (parent) {
			!parent.children && (parent.children = []);

			parent.children.push(inputNodes[i]);
		}
	}

	return inputNodes;
};