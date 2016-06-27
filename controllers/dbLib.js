'use strict';
var MongoClient = require('mongodb').MongoClient,
    Collection = require('mongodbext').Collection,
    Step = require('twostep').Step;

var postColl;


exports.initDB = function(callback) {
    var dbConfs = global.settings.db;

    Step(function() {
            console.log("First");
            MongoClient.connect(`mongodb://${dbConfs.host}:${dbConfs.port}/reddit`, this.slot());
        },
        function(err, db) {
            console.log("Second");
            if (err) throw err;

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
                callback(null, this.slot());
            });
        },
        function(err, data) {
            console.log("Third");
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