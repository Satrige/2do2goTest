'use strict';
var conform = require('conform');
var stringify = require('csv-stringify');

exports.formatAnsw = function(params, callback) {

    let formatInst = new Formatter(params.formatParams);

    let answ = formatInst.initSettings(params.formatParams);

    if (answ.valid) {
        formatInst.formatData(params.items, callback);
    }
    else {
        callback(new Error('Wrong parameters.'));
    }
};

class Formatter {
    constructor (formatParams) {
        switch (formatParams.format) {
            case 'sql' : 
                this.fomatter = new SQLFormatter();
                break;
            case 'csv' : 
                this.fomatter = new CSVFormatter();
                break;
            default:
                this.fomatter = null;
        }
    }

    initSettings(formatParams) {
        return this.fomatter.initSettings(formatParams);
    }

    formatData(data, callback) {
        if (this.fomatter) {
            this.fomatter.formatData(data, callback);
        }
        else {//Unknown type
            callback(new Error('This file format has not been implemented yet.'));
        }
    }
};

class SQLFormatter {
    constructor() {
        this.schema = {
            properties : {
                'table-name' : {
                    description: 'Name of table',
                    type: 'string',
                    required: true
                },
                'fields' : {
                    description: 'Names of the rows',
                    type: 'array',
                    required: true
                }
            }
        };

        this.tableName = '';
        this.names = [];
        this.numCols = 0;
    }

    initSettings(formatParams) {
        console.dir(formatParams);
        let validData = conform.validate(this.schema , formatParams);
        if (validData.valid) {
            let fields = formatParams['fields'];
            for (let i in fields) {
                if (fields[i] === '') {
                    return {
                        valid : false
                    };
                }
            }

            this.tableName = formatParams['table-name'];
            this.names = formatParams['fields'];
            this.numCols = this.names.length;
        }

        return validData;
    }

    formatData(items, callback) {
        let answStr = `CREATE TABLE IF NOT EXISTS ${this.tableName}(`;

        for (let i = 0; i < this.numCols; ++i) {
            if (i > 0) {
                answStr += ', ';
            }
            answStr += `${this.names[i]} VARCHAR(100) NOT NULL`;
        }
        
        answStr += ');\n';   


        for (let i = 0, len = items.length; i < len; ++i) {
            answStr += `INSERT INTO ${this.tableName} (`;

            for (let j = 0; j < this.numCols; ++j) {
                if (j > 0) {
                    answStr += ', ';
                }
                answStr += `${this.names[j]}`;
            }

            answStr += `) VALUES (`;

            for(let j = 0; j < this.numCols; ++j) {
                if (j > 0) {
                    answStr += ', ';
                }
                answStr += `'${items[i][j]}'`;
            }

            answStr += `);\n`
        }

        callback(null, answStr);
    }
};

class CSVFormatter {
    constructor() {
        this.schema = {
            properties : {
                'csv-delimiter' : {
                    description: 'Delimiter symbol',
                    type: 'string',
                    required: true
                }
            }
        };

        this.delimiter = ',';
    }

    initSettings(formatParams) {
        let validData = conform.validate(this.schema , formatParams);
        if (validData.valid) {
            this.delimiter = formatParams['csv-delimiter'];
        }

        return validData;
    }

    formatData(items, callback) {
        stringify(items, {
            delimiter : this.delimiter
        }, (err, output) => {
            if (err) {
                throw callback(err);
            }
            else {
                callback(null, output);
            }
        });
    }
};

exports.convertCommonForSort = function(items) {
    var answ = [];

    if (items && Array.isArray(items) && items.length > 0) {
        for (let i = 0, len = items.length; i < len; ++i) {
            let curLine = [];
            for (let j in items[i].data) {
                curLine.push(items[i].data[j] + '');
            }

            answ.push(curLine);
        }

        return answ;
    }
    else {
        return items;
    }
};

exports.convertCommonForAggregate = function(items) {
    var answ = [];

    if (items && Array.isArray(items) && items.length > 0) {
        for (let i = 0, len = items.length; i < len; ++i) {
            let curLine = [];
            curLine.push(items[i]._id);
            for (let j in items[i].value) {
                curLine.push(items[i].value[j] + '');
            }

            answ.push(curLine);
        }
        return answ;
    }
    else {
        return items;
    }
};