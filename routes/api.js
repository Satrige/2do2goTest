'use strict';
var express = require('express');
var router = express.Router();
var postsLib = require('../controllers/postsLib');
var formatLib = require('../controllers/formatLib');
var parseLib = require('../controllers/parseLib');
var Step = require('twostep').Step;
var conform = require('conform');

var inputSchemaSort = {
    properties: {
        url: {
            description: 'the url the object should be stored at',
            type: 'string',
            pattern: 'https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}([-a-zA-Z0-9@:%_\+.~#?&//=]*)',
            required: true
        },
        field: {
            description: 'the field for sorting. Maybe "score" or "created".',
            type: 'string',
            default: 'created'
        },
        order: {
            description: 'sort order. Maybe "ASC" or "DESC".',
            type: 'string',
            default: 'ACS'
        },
        format : {
        	description: 'output format. Maybe "CSV" or "SQL".',
        	type: 'string',
            default: 'CSV'
        }
    }
};

router.get('/sort', function(req, res, next) {
    Step(function() {
            var validInfo = conform.validate(req.query, inputSchemaSort);
            if (validInfo.valid) {
                this.pass(req.query);
            } else {
                throw new Error('wrong_params');
            }
        },
        function(err, params) {
        	if (err) throw err;
            
            postsLib.sortArticles(params, this.slot());
        }, 
        function(err, sortedItems) {
        	if (err) throw err;

            formatLib.formatAnsw({
            	formatParams : req.query,
            	items : formatLib.convertCommonForSort(sortedItems)
            }, this.slot());
        }, 
        function(err, answ) {
        	if (err) throw err;

        	res.json({
    			res : 'ok',
    			answ : answ
    		});
        },
        function(err) {
            res.json({
                res: 'err',
                descr: 'Something went wrong. Please, try to change some parameters.'
            })
        }
    );
});

router.get('/agr', function(req, res, next) {
    Step(function() {
            var validInfo = conform.validate(req.query, inputSchemaSort);
            if (validInfo.valid) {
                this.pass(req.query);
            } else {
                throw new Error('wrong_params');
            }
        },
        function(err, params) {
            if (err) throw err;
            
            postsLib.aggregateArticles(params, this.slot());
        }, 
        function(err, sortedItems) {
            if (err) throw err;

            formatLib.formatAnsw({
                formatParams : req.query,
                items : formatLib.convertCommonForAggregate(sortedItems)
            }, this.slot());
        }, 
        function(err, answ) {
            if (err) throw err;

            res.json({
                res : 'ok',
                answ : answ
            });
        },
        function(err) {
            res.json({
                res: 'err',
                descr: 'Something went wrong. Please, try to change some parameters.'
            })
        }
    );
});

var inputSchemaChild = {
    properties: {
        id: {
            description: 'element id',
            type: 'number',
            required: true
        },
        parentId : {
            description: 'parent id',
            type: 'number',
            required: true
        }
    }
};

var parseAndValidate = function(input, callback) {
    if (!input) {
        callback(new Error('Wrong input'));
        return;
    }

    input = input
        .replace(/\'/g, '')
        .replace(/\"/g, '')
        .replace(/\;/g, '')
        .replace(/id/g, '"id"')
        .replace(/parentId/g, '"parentId"');


    try {
        var parsedData = JSON.parse(input);
    }
    catch(e) {
        callback(new Error('Wrong input'));
        return;
    }

    if (!parsedData || !Array.isArray(parsedData) || !parsedData.length > 0) {
        callback(new Error('Wrong input'));
        return;
    }

    var validStatus = null;

    for (let i in parsedData) {
        validStatus = conform.validate(parsedData[i], inputSchemaChild);
        if (!validStatus.valid) {
            callback(new Error(`Wrong element: ${JSON.stringify(parsedData[i], null, 4)}`));
            return;
        }

        if (parsedData[i].id <= parsedData[i].parentId) {
            callback(new Error(`Wrong element: ${JSON.stringify(parsedData[i], null, 4)}`));
            return;
        }
    }

    callback(null, parsedData);
};

router.get('/child', function(req, res, next) {
    Step(function() {
            parseAndValidate(req.query['child-json'], this.slot());
        },
        function(err, parsedData) {
            if (err) throw err;

            parseLib.reformJSON(parsedData, this.slot());
        }, 
        function(err, output) {
            if (err) throw err;

            res.json({
                res : 'ok',
                answ : output
            });
        },
        function(err) {
            res.json({
                res: 'err',
                descr: err.message
            });
        }
    );
});

router.get('*', function(req, res, next) {
    res.json({
        res : 'err',
        answ : 'not_implemented_yet'
    });
});


module.exports = router;