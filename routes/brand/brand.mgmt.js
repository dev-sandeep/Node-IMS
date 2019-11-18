/**
 * responsible for managing the brand data in the database
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
        create_ts: Date.now(),//getting the current ts
        update_ts: Date.now(),
        status: 1
    }

    /* check the basic validation */
    var myObjFilter = {
        name: ['is_empty'],
        create_ts: [],
        update_ts: [],
        status: [],
    }

    crud.create(global.data.table.brand, myobj, myObjFilter).then(function (successData) {
        /* every thing is awesome */
        response.send(successData);
    }).catch(function (errorData) {
        /* all is not well */
        response.send(errorData);
    });
}

/*************************************************************************/
/******************************* Update **********************************/
/*************************************************************************/
/**
 * responsible for updating the brand
 */
exports.edit = function (req, response) {

    var crud = require('./../util/crud.js');
    /* now call the generic methods to edit */

    /* validating the payload */
    var myobj = {
        id: req.body.id,
        name: req.body.name,
    }

    /* check the basic validation */
    var myObjFilter = {
        name: ['is_empty'],
        id: ['is_empty']
    }
    /* things which you want to update */
    var payloadObj = {
        name: req.body.name,
        // status: 1,
        update_ts: Date.now()//getting the current ts
    }

    crud.update(global.data.table.brand, myobj, myObjFilter, payloadObj).then(function (successData) {
        /* every thing is awesome */console.log("awesoem");
        response.send(successData);
    }).catch(function (errorData) {
        /* all is not well */console.log("not awesoem");
        response.send(errorData);
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
        update_ts: Date.now()//getting the current ts
    }

    crud.update(global.data.table.brand, myobj, myObjFilter, payloadObj).then(function (successData) {
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

    crud.update(global.data.table.brand, myobj, myObjFilter, payloadObj).then(function (successData) {
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
        name: 1
    };
    /* getting all the fields with status = 1 */
    var query = { status: 1 };

    var page, resultperpage;
    try {
        page = parseInt(req.params['page']) || '';
        resultperpage = parseInt(req.params['resultperpage']) || '';

    } catch (e) {
        console.log(e);
    }
    console.log("page", page, resultperpage);
    crud.get(global.data.table.brand, requiredField, query, page, resultperpage).then(function (successData) {
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
        name: 1
    };

    var id = req.params['id'] || '';
    /* lets create query */
    var mongo = require('mongodb');
    var query = {
        _id: new mongo.ObjectID(id)
    }
    crud.get(global.data.table.brand, requiredField, query).then(function (successData) {
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
