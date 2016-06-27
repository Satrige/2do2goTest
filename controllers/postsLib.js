'use strict';

var dbLib = require('./dbLib');
var Step = require('twostep').Step;
var http = require('http');
var conform = require('conform');

exports.sortArticles = function(params, callback) {
    let dataInst = new DataForSort(params);

    Step(function() {
            dataInst.setupData(this.slot());
        },
        function(err, answ) {
            if (err) throw err;

            dataInst.insertIntoDB(this.slot());
        },
        function(err, insertedIds) {
            if (err) throw err;

            dataInst.performAction(insertedIds, this.slot());
        },
        function(err, sortedData) {
            if (err) throw err;

            callback(null, sortedData);

            return;
        },
        function(err) {
            callback(err);
        }
    );
};

exports.aggregateArticles = function(params, callback) {
    let dataInst = new DataForAggregate(params);

    Step(function() {
            dataInst.setupData(this.slot());
        },
        function(err, answ) {
            if (err) throw err;

            dataInst.insertIntoDB(this.slot());
        },
        function(err, insertedIds) {
            if (err) throw err;

            dataInst.performAction(insertedIds, this.slot());
        },
        function(err, aggrData) {
            if (err) throw err;

            callback(null, aggrData);

            return;
        },
        function(err) {
            console.log(`Handle an error: ${err.message}`);
            callback(err);
        }
    );
};

class DataPosts {
    constructor(params) {
        this.url = params.url || '';
        this.posts = [];
    }

    verifyData(inputData) {
        if (!inputData || !Array.isArray(inputData) || !inputData.length < 0) {
            return false;
        }

        var curValidStatus = null;

        for (let i in inputData) {
            curValidStatus = conform.validate(inputData[i].data, this.postSchema);

            if (!curValidStatus.valid) {
                return false;
            }
        }

        return true;
    }

    getData(callback) {
        var postsRaw = '';

        http.get(this.url, (res) => {
            res.on('data', (chunk) => {
                postsRaw += chunk
            });

            res.on('end', () => {
                callback(null, postsRaw);
            });
        }).on('error', (err) => {
            callback(err);
        });
    }

    setupData(callback) {
        var self = this;
        Step(
            function() {
                self.getData(this.slot());
            },
            function(err, data) {
                if (err) throw err;

                var parsedData = JSON.parse(data);

                this.pass(parsedData);
            },
            function(err, parsedData) {
                if (err) throw err;

                if (self.verifyData(parsedData.data.children)) {
                    self.posts = parsedData.data.children;
                    callback(null);
                }
                else {
                    callback(new Error('Wrong input file format'));
                }
            },
            function(err) {
                console.log('Error occured: ', err.stack || err);
                callback(err);
            }
        );
    }

    insertIntoDB(callback) {
        if (this.posts && this.posts.length > 0) {

            var insertedIds = [],
                self = this;

            Step(
                function() {
                    var len = self.posts.length,
                        counter = len;

                    for (let i = 0; i < len; ++i) {
                        let curPost = self.posts[i],
                            outterId = curPost.data.id;

                        insertedIds.push(outterId);

                        dbLib.postColl.findOneAndUpsert({
                            'data.id': outterId
                        }, curPost, (err, upsertResult) => {
                            if (err) throw err;

                            if (--counter === 0) {
                                callback(null, insertedIds);
                            }
                        });
                    }
                },
                function(err) {
                    callabck(err);
                }
            );

        } else {
            callback(Error("Posts object is empty!"));
        }
    }
};

class DataForSort extends DataPosts {
    constructor(params) {
        super(params);

        this.sortInfo = {
            field: params.field || 'score',
            order: params.order || 'DESC'
        }

        this.postSchema = {
            properties: {
                id: {
                    description: 'id',
                    type: 'string',
                    required: true
                },
                created: {
                    description: 'creation time',
                    type: 'number',
                    required: true
                },
                score: {
                    description: 'score',
                    type: 'number',
                    required: true
                },
                title: {
                    description: 'title',
                    type: 'string',
                    required: true
                }
            }
        };
    }

    performAction(postIndexes, callback) {
        if (postIndexes && Array.isArray(postIndexes) && postIndexes.length > 0) {
            var sortObj = {};
            sortObj['data.' + this.sortInfo.field] = (this.sortInfo.order === 'ASC') ? 1 : -1;

            dbLib.postColl.find({
                'data.id' : {
                    '$in' : postIndexes
                }
            }, {
                'data.id' : 1,
                'data.title' : 1,
                'data.created' : 1,
                'data.score' : 1,
            })
            .sort(sortObj)
            .toArray(callback);
        }
        else {
            callback(new Error('Wrong params'));
        }
    }
}

class DataForAggregate extends DataPosts {
    constructor(params) {
        super(params);
        this.order = params.order || 'DESC';

        this.postSchema = {
            properties: {
                domain: {
                    description: 'domain',
                    type: 'string',
                    required: true
                },
                score: {
                    description: 'score',
                    type: 'number',
                    required: true
                }
            }
        };
    }

    sortByScore(data) {
        var self = this;
        if (data && Array.isArray(data)) {
            return data.sort( function(a, b) {
                if (self.order === 'DESC') {
                    return (a.value.totalScores >= b.value.totalScores) ? -1 : 1;
                }
                else {
                    return (a.value.totalScores >= b.value.totalScores) ? 1 : -1;
                }
            });
        }
        else {
            return data;
        }
    }

    performAction(postIndexes, callback) {
        if (postIndexes && Array.isArray(postIndexes) && postIndexes.length > 0) {

            var mapFunc = function() {
                emit(this.data.domain, +this.data.score);
            };

            var reduceFunc = function(key, values) {
                return {
                    total : values.length,
                    totalScores : Array.sum(values)
                };
            };

            var finalizeFunction = function(key, reducedVal) {
                if (typeof reducedVal === 'number') {
                    return {
                        total : 1,
                        totalScores : reducedVal
                    }
                }
                else {
                    return reducedVal;
                }
            };


            var options = {
                query: {
                   'data.id' : {
                        '$in' : postIndexes
                    }
                },
                out: {
                    inline: 1
                },
                verbose: true,
                finalize : finalizeFunction
            };

            dbLib.postColl.mapReduce(
                mapFunc,
                reduceFunc,
                options,
                (err, output) => {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, this.sortByScore(output));
                    }
                }
            );
        }
        else {
            callback(new Error('Wrong params for aggregation'));
        }
    }
}
