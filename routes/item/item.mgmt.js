/**
 * responsible for managing the item data in the database
 * @author Sandeep G
 * @since 20180412
 */


/**
 * @test: lets make something more generic
 * fields:{
 *  _id: '',
 * name: '',
 * model: ''
 * }
 */


/*************************************************************************/
/******************************* Create **********************************/
/*************************************************************************/

/**
 * responsible for signing up/ adding up user in the system
 */
exports.create = function (req, response) {
    var crud = require('./../util/crud.js');
    /* now call the generic method to create */

    /* validating the payload */
    var myobj = {
        name: req.body.name,
        model: req.body.model,//id of model
        create_ts: Date.now(),//getting the current ts
        update_ts: Date.now(),
        status: 1,
        attributeVal: req.body.attrval//comma sepereated values for attribute
    }

    /* check the basic validation */
    var myObjFilter = {
        name: ['is_empty'],
        model: ['is_empty'],
        create_ts: [],
        update_ts: [],
        status: [],
        attributeVal: []
    }

    if (!myobj.model) {
        response.send({ status: false, msg: "model id is a mandatory field" });
    }

    var isExistArray = [], attributeValArr = [];
    /* if there is some values in attribute value then create isExistArray */
    if (myobj.attributeVal) {
        attributeValArr = myobj.attributeVal.split(",");
        for (var i = 0; i < attributeValArr.lengt; i++) {
            isExistArray.push({
                table: global.data.table.attributeVal,
                id: attributeValArr[i]
            });
        }
    }

    isExistArray.push({
        table: global.data.table.model,
        id: myobj.model
    });

    crud.backToBackIsExist(isExistArray).then(function () {
        crud.create(global.data.table.item, myobj, myObjFilter).then(function (successData) {
            /* every thing is awesome */
            response.send(successData);
        }).catch(function (errorData) {
            /* all is not well */
            response.send(errorData);
        });
    }, function () {
        response.send({
            status: false,
            msg: "one or more passed attribute or the passed model is not existing."
        });
    });
}

/*************************************************************************/
/******************************* Update **********************************/
/*************************************************************************/
/**
 * responsible for updating the item
 */
exports.edit = function (req, response) {

    var crud = require('./../util/crud.js');
    /* now call the generic methods to edit */

    /* validating the payload */
    var myobj = {
        id: req.body.id,
        name: req.body.name,
        model: req.body.model,
        attributeVal: req.body.attrval//comma sepereated values for attribute
    }

    /* check the basic validation */
    var myObjFilter = {
        name: ['is_empty'],
        id: ['is_empty'],
        model: ['is_empty'],
        attributeVal: []
    }
    /* things which you want to update */
    var payloadObj = {
        name: req.body.name,
        model: req.body.model,
        attributeVal: req.body.attrval,
        // status: 1,
        update_ts: Date.now()//getting the current ts
    }

    console.log(payloadObj);

    if (!myobj.model) {
        response.send({ status: false, msg: "model id is a mandatory field" });
    }

    var isExistArray = [], attributeValArr = [];
    /* if there is some values in attribute value then create isExistArray */
    if (myobj.attributeVal) {
        attributeValArr = myobj.attributeVal.split(",");
        for (var i = 0; i < attributeValArr.lengt; i++) {
            isExistArray.push({
                table: global.data.table.attributeVal,
                id: attributeValArr[i]
            });
        }
    }

    isExistArray.push({
        table: global.data.table.model,
        id: myobj.model
    });

    crud.backToBackIsExist(isExistArray).then(function () {
        crud.update(global.data.table.item, myobj, myObjFilter, payloadObj).then(function (successData) {
        /* every thing is awesome */console.log("awesoem");
            response.send(successData);
        }).catch(function (errorData) {
        /* all is not well */console.log("not awesoem");
            response.send(errorData);
        });
    }, function () {
        response.send({
            status: false,
            msg: "model id is not existing."
        });
    });
}

/*************************************************************************/
/******************************* Update Status****************************/
/*************************************************************************/
/**
 * change the status
 */
exports.stausChange = function (req, response) {

    var crud = require('./../util/crud.js');
    /* now call the generic methods to edit */

    /* validating the payload */
    var myobj = {
        id: req.body.id,
        status: parseInt(req.body.status),
        ts: Date.now()//getting the current ts
    }

    /* check the basic validation */
    var myObjFilter = {
        status: ['is_empty'],
        ts: [],
        id: ['is_empty']
    }
    /* things which you want to update */
    var payloadObj = {
        status: parseInt(req.body.status),
        ts: Date.now()//getting the current ts
    }

    crud.update(global.data.table.item, myobj, myObjFilter, payloadObj).then(function (successData) {
        /* every thing is awesome */console.log("status updated");
        response.send(successData);
    }).catch(function (errorData) {
        /* all is not well */console.log("status not updated");
        response.send(errorData);
    });
}

/*************************************************************************/
/******************************* Delete **********************************/
/*************************************************************************/

/**
 * responsible to delete
 */
exports.delete = function (req, response) {
    var crud = require('./../util/crud.js');
    /* now call the generic methods to edit */
    if (!req.body.id) {
        response.send({
            status: false,
            message: "id is a mandatory field"
        });
    }
    /* validating the payload */
    var myobj = {
        id: req.body.id,
    }

    /* check the basic validation */
    var myObjFilter = {
        id: ['is_empty']
    }
    /* things which you want to update */
    var payloadObj = {
        status: parseInt(5),
        update_ts: Date.now()//getting the current ts
    }

    crud.update(global.data.table.item, myobj, myObjFilter, payloadObj).then(function (successData) {
        /* every thing is awesome */console.log("awesoem");
        response.send(successData);
    }).catch(function (errorData) {
        /* all is not well */console.log("not awesoem");
        response.send(errorData);
    });
}


/*************************************************************************/
/******************************* GET Call*********************************/
/*************************************************************************/
exports.get = function (req, response) {
    var crud = require('./../util/crud.js');
    var mongo = require('mongodb');
    var self = this;
    var requiredField = {
        name: 1,
        model: 1
    };

    var query = { status: 1 };

    var page, resultperpage;
    try {
        page = parseInt(req.params['page']) || '';
        resultperpage = parseInt(req.params['resultperpage']) || '';

    } catch (e) {
        console.log(e);
    }
    /**
     * responsible for getting the key pair value of attribute-value
     */
    function getAttributeVal(attribValArray) {
        return new Promise(function (resolve, reject) {
            attributeArray = attribValArray || [];
            if (attributeArray && attributeArray.length > 0) {
                for (var ctr = 0; ctr < attributeArray.length; ctr++) {
                    // attributeArray[ctr] = new mongo.ObjectID(attributeArray[ctr]);
                }
            }

            console.log("attributeArray", attributeArray);

            /* creating the query */
            var query = [
                {
                    $lookup: {
                        from: global.data.table.attribute,
                        localField: "attribute",
                        foreignField: "_id",
                        as: "attribute_key"
                    }
                },
                {
                    $match: {
                        status: {
                            $in: [1]
                        },
                        // _id: {
                        //     $in: attributeArray
                        // }
                    }
                }
            ];

            /* now call the api */
            crud.get(global.data.table.attributevalue, [], query, false, false, 'attribute_key').then(function (successData) {
                console.log("LOADING THE ATTEIBVAL DATA------------------>>>>");
                console.log(successData);
            }).catch(function (errorData) {
                console.log("error occurred while fetching the atteibute and attribute value");
            });
        });
    }
    crud.get(global.data.table.item, requiredField, query, page, resultperpage).then(function (successData) {
        /* every thing is awesome */console.log("awesoem");
        // getAttributeVal([new mongo.ObjectID('5b53250b5106df0248e25574')]);
        response.send(successData);
    }).catch(function (errorData) {
        /* all is not well */console.log("not awesoem");
        response.send(errorData);
    });
};

exports.detail = function (req, response) {
    var crud = require('./../util/crud.js');

    var requiredField = {
        name: 1,
        model: 1
    };

    var id = req.params['id'] || '';
    /* lets create query */
    var mongo = require('mongodb');
    var query = {
        _id: new mongo.ObjectID(id)
    }
    crud.get(global.data.table.item, requiredField, query).then(function (successData) {
        /* every thing is awesome */console.log("awesoem");
        response.send(successData);
    }).catch(function (errorData) {
        /* all is not well */console.log("not awesoem");
        response.send(errorData);
    });
};

////////////////////////////////////////////////////////
////////////////////////END/////////////////////////////
////////////////////////////////////////////////////////
