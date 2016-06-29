exports.getPluralInput = function() {
    return [{
        id: 1,
        parentId: 0
    }, {
        id: 2,
        parentId: 0
    }, {
        id: 3,
        parentId: 1
    }, {
        id: 4,
        parentId: 1
    }, {
        id: 5,
        parentId: 2
    }, {
        id: 6,
        parentId: 4
    }, {
        id: 7,
        parentId: 5
    }];
};

exports.getPluraOutput = function() {
    return [{
        "id": 2,
        "parentId": 0,
        "children": [{
            "id": 5,
            "parentId": 2,
            "children": [{
                "id": 7,
                "parentId": 5
            }]
        }]
    }, {
        "id": 1,
        "parentId": 0,
        "children": [{
            "id": 3,
            "parentId": 1
        }, {
            "id": 4,
            "parentId": 1,
            "children": [{
                "id": 6,
                "parentId": 4
            }]
        }]
    }];
};

exports.getSingleInput = function() {
    return [{
        id: 1,
        parentId: 0
    }];
};

exports.getSingleOutput = function() {
    return [{
        id: 1,
        parentId: 0
    }];
};