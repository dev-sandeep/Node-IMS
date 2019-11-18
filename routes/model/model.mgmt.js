/**
 * responsible for managing the model data in the database
 * @author Sandeep G
 * @since 20180412
 */


/**
 * @test: lets make something more generic
 * fields:{
 *  _id: '',
 * name: '',
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
        brand: req.body.brand,//od of brand
        create_ts: Date.now(),//getting the current ts
        update_ts: Date.now(),
        status: 1
    }

    /* check the basic validation */
    var myObjFilter = {
        name: ['is_empty'],
        brand: ['is_empty'],
        create_ts: [],
        update_ts: [],
        status: [],
    }

    if (!myobj.brand) {
        response.send({ status: false, msg: "brand id is a mandatory field" });
    }

    var isExistArray = [
        {
            table: global.data.table.brand,
            id: myobj.brand
        }
    ];

    /* check if the brand id is existing */
    crud.backToBackIsExist(isExistArray).then(function () {
        crud.create(global.data.table.model, myobj, myObjFilter).then(function (successData) {
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
 * responsible for updating the model
 */
exports.edit = function (req, response) {

    var crud = require('./../util/crud.js');
    /* now call the generic methods to edit */

    /* validating the payload */
    var myobj = {
        id: req.body.id,
        name: req.body.name,
        brand: req.body.brand
    }

    /* check the basic validation */
    var myObjFilter = {
        name: ['is_empty'],
        id: ['is_empty'],
        brand: ['is_empty']
    }
    /* things which you want to update */
    var payloadObj = {
        name: req.body.name,
        brand: req.body.brand,
        // status: 1,
        update_ts: Date.now()//getting the current ts
    }

    if (!myobj.brand) {
        response.send({ status: false, msg: "brand id is a mandatory field" });
    }

    crud.isExist(global.data.table.brand, myobj.brand).then(function () {
        crud.update(global.data.table.model, myobj, myObjFilter, payloadObj).then(function (successData) {
        /* every thing is awesome */console.log("awesoem");
            response.send(successData);
        }).catch(function (errorData) {
        /* all is not well */console.log("not awesoem");
            response.send(errorData);
        });
    }, function () {
        response.send({
            status: false,
            msg: "brand id is not existing."
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

    crud.update(global.data.table.model, myobj, myObjFilter, payloadObj).then(function (successData) {
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

    crud.update(global.data.table.model, myobj, myObjFilter, payloadObj).then(function (successData) {
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
        name: 1,
        brand: 1
    };

    var query = { status: 1 };

    var page, resultperpage;
    try {
        page = parseInt(req.params['page']) || '';
        resultperpage = parseInt(req.params['resultperpage']) || '';

    } catch (e) {
        console.log(e);
    }
    console.log("page", page, resultperpage);
    crud.get(global.data.table.model, requiredField, query, page, resultperpage).then(function (successData) {
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
        name: 1,
        brand: 1
    };

    var id = req.params['id'] || '';
    /* lets create query */
    var mongo = require('mongodb');
    var query = {
        _id: new mongo.ObjectID(id)
    }
    crud.get(global.data.table.model, requiredField, query).then(function (successData) {
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
