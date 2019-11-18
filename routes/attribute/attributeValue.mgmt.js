/**
 * responsible for managing the vals of an attribute
 * @author Sandeep G
 * @since 20180708
 */

/**
 * @test: lets make something more generic
 * fields:{
 *  _id: '',
 * val: '',
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
    var mongo = require('mongodb');

    /* validating the payload */
    var myobj = {
        val: req.body.val,
        attribute: req.body.attribute,//id of attribute
        create_ts: Date.now(),//getting the current ts
        update_ts: Date.now(),
        status: 1
    }

    /* check the basic validation */
    var myObjFilter = {
        val: ['is_empty'],
        create_ts: [],
        update_ts: [],
        status: [],
    }

    if (!myobj.attribute) {
        response.send({ status: false, msg: "attribute id is a mandatory field" });
    }

    myobj.attribute = new mongo.ObjectID(myobj.attribute);
    console.log(myobj);
    var isExistArray = [
        {
            table: global.data.table.attribute,
            id: myobj.attribute
        }
    ];

    /* check if the attribute id is existing */
    crud.backToBackIsExist(isExistArray).then(function () {
        crud.create(global.data.table.attributevalue, myobj, myObjFilter).then(function (successData) {
            /* every thing is awesome */
            response.send(successData);
        }).catch(function (errorData) {
            /* all is not well */
            response.send(errorData);
        });
    }, function (err) {
        response.send({
            status: false,
            msg: err
        });
    });

}

/*************************************************************************/
/******************************* Update **********************************/
/*************************************************************************/
/**
 * responsible for updating the attributeval
 */
exports.edit = function (req, response) {

    var crud = require('./../util/crud.js');
    /* now call the generic methods to edit */

    /* validating the payload */
    var myobj = {
        id: req.body.id,
        val: req.body.val,
        attribute: req.body.attribute
    }

    /* check the basic validation */
    var myObjFilter = {
        val: ['is_empty'],
        id: ['is_empty'],
        attribute: ['is_empty']
    }
    /* things which you want to update */
    var payloadObj = {
        val: req.body.val,
        attribute: req.body.attribute,
        // status: 1,
        update_ts: Date.now()//getting the current ts
    }

    if (!myobj.attribute) {
        response.send({ status: false, msg: "attribute id is a mandatory field" });
    }

    crud.isExist(global.data.table.attribute, myobj.attribute).then(function () {
        crud.update(global.data.table.attributevalue, myobj, myObjFilter, payloadObj).then(function (successData) {
        /* every thing is awesome */console.log("awesoem");
            response.send(successData);
        }).catch(function (errorData) {
        /* all is not well */console.log("not awesoem");
            response.send(errorData);
        });
    }, function () {
        response.send({
            status: false,
            msg: "attribute id is not existing."
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

    crud.update(global.data.table.attributevalue, myobj, myObjFilter, payloadObj).then(function (successData) {
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

    crud.update(global.data.table.attributevalue, myobj, myObjFilter, payloadObj).then(function (successData) {
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

    var requiredField = {
        val: 1,
        attribute: 1,
        attribute_key: 1,
        lookup: {
            _id: 1,
            name: 1
        }
    };

    var query = [
        {
            $lookup: {
                from: global.data.table.attribute,       // invUnbreakableItem table name
                localField: "attribute",   // name of inventoryItem table field
                foreignField: "_id", // name of invUnbreakableItem table field
                as: "attribute_key"         // array contains the matching items of unbreakable table
            }
        },
        {
            $match: {
                status: {
                    $in: [1]
                }
            }
        }
    ];

    var page, resultperpage;
    try {
        page = parseInt(req.params['page']) || '';
        resultperpage = parseInt(req.params['resultperpage']) || '';

    } catch (e) {
        console.log(e);
    }
    console.log("page", page, resultperpage);
    crud.get(global.data.table.attributevalue, requiredField, query, page, resultperpage, 'attribute_key').then(function (successData) {
        /* every thing is awesome */console.log("awesoem");
        response.send(successData);
    }).catch(function (errorData) {
        /* all is not well */console.log("not awesoem");
        response.send(errorData);
    });
};

exports.detail = function (req, response) {
    var crud = require('./../util/crud.js');

    var requiredField = {
        val: 1,
        attribute: 1,
        attribute_key: 1,
        lookup: {
            name: 1,
            _id: 1
        }
    };

    var id = req.params['id'] || '';
    /* lets create query */
    var mongo = require('mongodb');
    var query = {
        _id: new mongo.ObjectID(id)
    }
    var query = [
        {
            $lookup: {
                from: global.data.table.attribute,       // invUnbreakableItem table name
                localField: "attribute",   // name of inventoryItem table field
                foreignField: "_id", // name of invUnbreakableItem table field
                as: "attribute_key"         // array contains the matching items of unbreakable table
            }
        },
        {
            $match: {
                status: 1,
                _id: new mongo.ObjectID(id)
            }
        }
    ];

    crud.get(global.data.table.attributevalue, requiredField, query, false, false, "attribute_key").then(function (successData) {
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
