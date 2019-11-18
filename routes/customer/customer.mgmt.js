/**
 * responsible for managing the customer data in the database
 * @author Sandeep G
 * @since 20180619
 */

/**
 * {name:'', address: '', city: '', phone: '', email: '' }
 */

/**
* responsible for signing up/ adding up user in the system
*/
exports.create = function (req, response) {
    var crud = require('./../util/crud.js');
    /* now call the generic method to create */

    /* validating the payload */
    var myobj = {
        name: req.body.name,
        address: req.body.address,//id of model
        city: req.body.city,
        phone: req.body.phone,
        email: req.body.email,
        create_ts: Date.now(),//getting the current ts
        update_ts: Date.now(),
        status: 1
    }

    /* check the basic validation */
    var myObjFilter = {
        name: ['is_empty'],
        address: [],//id of model
        city: [],
        phone: ['is_empty', 'isMobile'],
        email: ['is_empty', 'isEmail'],
        create_ts: [],
        update_ts: [],
        status: [],
    }

    /* check if the phone id is existing */
    crud.isExist(global.data.table.customer, myobj.phone, { $or: [{ phone: myobj.phone }, { email: myobj.email }] }).then(function () {
        response.send({
            status: false,
            msg: "phone or email already exists for another user."
        });
    }, function () {
        crud.create(global.data.table.customer, myobj, myObjFilter).then(function (successData) {
            /* every thing is awesome */
            response.send(successData);
        }).catch(function (errorData) {
            /* all is not well */
            response.send(errorData);
        });
    });
}

/*************************************************************************/
/******************************* Update **********************************/
/*************************************************************************/
/**
 * responsible for updating the customer
 */
exports.edit = function (req, response) {

    var crud = require('./../util/crud.js');
    /* now call the generic methods to edit */

    /* validating the payload */
    var myobj = {
        id: req.body.id,
        name: req.body.name,
        address: req.body.address,//id of model
        city: req.body.city,
        phone: req.body.phone,
        email: req.body.email,
        create_ts: Date.now(),//getting the current ts
        update_ts: Date.now(),
        status: 1
    }

    /* check the basic validation */
    var myObjFilter = {
        id: ['is_empty'],
        name: ['is_empty'],
        address: [],//id of model
        city: [],
        phone: ['is_empty', 'isMobile'],
        email: ['is_empty', 'isEmail'],
        create_ts: [],
        update_ts: [],
        status: [],
    }
    /* things which you want to update */
    var payloadObj = {
        name: req.body.name,
        address: req.body.address,//id of model
        city: req.body.city,
        phone: req.body.phone,
        email: req.body.email,
        // status: 1,
        update_ts: Date.now()//getting the current ts
    }

    if (!myobj.id) {
        response.send({ status: false, msg: "id is a mandatory field" });
    }

    var mongo = require('mongodb');
    /* now get the details of a customer based on the ID */
    var customerId = new mongo.ObjectID(myobj.id);
    var query = {
        _id: customerId
    }
    crud.get(global.data.table.customer, {}, query).then(function (successData) {
        /* every thing is awesome */
        if (successData.data.length == 0) {
            return;
        }

        var data = successData.data[0];
        /* now check if the email or mobile got changed */
        var isMobileChanged = false, isEmailChanged = false;
        if (req.body.phone != data.phone)
            isMobileChanged = true;

        if (req.body.email != data.email)
            isEmailChanged = true;

        /* check if any one or both phone and email changed */
        console.log(isMobileChanged, isEmailChanged);
        if (!isMobileChanged && !isEmailChanged) {
            console.log("first condition...");
            updateFields();
        } else {
            var qry = {
                $and: [
                    { _id: { $ne: customerId } },
                    { $or: [{ phone: myobj.phone }, { email: myobj.email }] }
                ],
            };
            console.log("other condition...", qry);
            crud.isExist(global.data.table.customer, myobj.phone, qry).then(function () {
                response.send({
                    status: false,
                    msg: "phone or email already exists for another user."
                });
            }, function () {
                /* update now */
                updateFields();
            });
        }

        function updateFields() {
            crud.update(global.data.table.customer, myobj, myObjFilter, payloadObj).then(function (successData) {
                /* every thing is awesome */
                response.send(successData);
            }).catch(function (errorData) {
                /* all is not well */
                response.send(errorData);
            });
        }

    }).catch(function (errorData) {
        /* all is not well */
        response.send(errorData);
    });

    // return;

    // crud.isExist(global.data.table.customer, myobj.phone, { $or: [{ phone: myobj.phone }, { email: myobj.email }, { $not: { id: customerId } }] }).then(function () {
    //     response.send({
    //         status: false,
    //         msg: "phone or email already exists for another user."
    //     });
    // }, function () {
    //     crud.update(global.data.table.customer, myobj, myObjFilter, payloadObj).then(function (successData) {
    //     /* every thing is awesome */console.log("awesoem");
    //         response.send(successData);
    //     }).catch(function (errorData) {
    //     /* all is not well */console.log("not awesoem");
    //         response.send(errorData);
    //     });
    // });
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

    crud.update(global.data.table.customer, myobj, myObjFilter, payloadObj).then(function (successData) {
        /* every thing is awesome */console.log("status updated");
        response.send(successData);
    }).catch(function (errorData) {
        /* all is not well */console.log("status not updated");
        response.send(errorData);
    });
}


/*************************************************************************/
/******************************* GET Call*********************************/
/*************************************************************************/
exports.get = function (req, response) {
    var crud = require('./../util/crud.js');

    var requiredField = {
        "name": 1,
        "address": 1,
        "city": 1,
        "phone": 1,
        "email": 1
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
    crud.get(global.data.table.customer, requiredField, query, page, resultperpage).then(function (successData) {
        /* every thing is awesome */console.log("awesoem");
        response.send(successData);
    }).catch(function (errorData) {
        /* all is not well */console.log("not awesoem");
        response.send(errorData);
    });
};

exports.detail = function (req, response) {
    console.log("hello");
    var crud = require('./../util/crud.js');
    var requiredField = {};

    var id = req.params['id'] || '';
    /* lets create query */
    var mongo = require('mongodb');
    var query = {
        _id: new mongo.ObjectID(id)
    }
    console.log(query);
    crud.get(global.data.table.customer, requiredField, query).then(function (successData) {
        /* every thing is awesome */
        response.send(successData);
    }).catch(function (errorData) {
        /* all is not well */
        response.send(errorData);
    });
};

////////////////////////////////////////////////////////
////////////////////////END/////////////////////////////
////////////////////////////////////////////////////////
