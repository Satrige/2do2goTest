'use strict';
var prodHosts = require('../data/hosts.json');
var os = require('os');
var isProd = (prodHosts.indexOf(os.hostname()) !== -1);
var settings = isProd ? require('../data/config.json').production : require('../data/config.json').development;

var dcConfs = settings.db,
    MongoClient = require('mongodb').MongoClient,
    Collection = require('mongodbext').Collection,
    Step = require('twostep').Step;

var postColl;

exports.initDB = function(callback) {
    Step(function() {
            console.log("First");
            MongoClient.connect(`mongodb://${dcConfs.host}:${dcConfs.port}/reddit`, this.slot());
        },
        function(err, db) {
            if (err) throw err;

            var self = this;

            postColl = new Collection(db, 'posts');
            postColl.createIndex({
                'data.id' : 1
            }, {
                unique : true,
                background : true,
                w : 1
            }, (err, indexName) => {
                if (err) throw err;

                exports.postColl = postColl;
                callback(null, self.slot());
            });
        },
        function(err, data) {
            console.log("thirdt");
            if (err) throw err;

            callback(null, {
                res : 'ok'
            });
        },
        function(err) {
            callback(err, {
                res : 'err',
                descr : 'db_err'
            });
        }
    );
};