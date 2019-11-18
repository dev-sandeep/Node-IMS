/**
 * responsible for managing the user in the system
 * @author Gunjan
 * @since 20180314
 */
//Global variable declaration
var myobj = {};
var uniqid = require('uniqid');
var sha1 = require('node-sha1');
var mongo = require('mongodb');
var validator = require('validator');
/**
 * responsible for signing up/ adding up user in the system
 */
exports.addUser = function (req, response) {
    var MongoClient = require('mongodb').MongoClient;
    var url = global.baseUrl;
 //   var validator = require('validator');
    var formValidator = require('./../util/formValidator.js');
    // var sha1 = require('node-sha1');

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        /* the name of the collection goes here */
        var dbo = db.db("ERP");

        /* ALL THE MAJOR VALIDATIONS GOES HERE */
        myobj = {
            name: req.body.name,
            uname: req.body.uname,//mail id or any unique identity
            password: req.body.password,
            status: parseInt(req.body.status),//by default active
            comments: req.body.comments,
            user_type: req.body.user_type,
            admin_id: req.body.admin_id
        }
        var objValid = {
            name: ["is_empty"],
            uname: ["is_empty", "isEmail"],//mail id or any unique identity
            password: ["is_empty", "isPassword"],
            status: ["is_empty"],//by default active
            comments: ["is_empty"],
            user_type: ["is_empty"],
            admin_id: ["is_empty"]
        }

        var finalArray = formValidator.validate(myobj, objValid);
        if (Object.keys(finalArray).length != 0) {
            response.send({
                status: false,
                message: "Error occurred in validation.",
                data: [finalArray]
            });
            return;
        }
        console.log("Hey");
        /* EVERYTHING IS VALID, LETS PROCCED! */

        /* If entered user name satisfy the condition then wil check if user already exist or not */
        var myQuery = { uname: myobj.uname };
        dbo.collection("user_info").find(myQuery).toArray(function (err, res) {
            if (err) throw err;
            if (res.length > 0) {
                response.send({
                    status: false,
                    message: "User Already Exist",
                    data: []
                });
                return;
            }
            /* now the username is non-existing, lets save the data */
            else {
                /* lets HASH the passwd */
                myobj.password = sha1(myobj.password);
                dbo.collection("user_info").save(myobj, function (err, res) {
                    if (err) {
                        console.log(err);
                        return;
                    };
                
                    response.send({
                        status: true,
                        message: "User created successfully",
                        data: [myobj]
                    });
                    console.log("User created successfully");
                });
            }
        });
    });
}



/**
 * responsible for signing up/ adding up user in the system
 */
exports.login = function (req, response) {
    var MongoClient = require('mongodb').MongoClient;
    var url = global.baseUrl;
    var self = this;
    MongoClient.connect(url, function (err, db) {
        if (err) { throw err; }
        var dbo = db.db("ERP");

        loginValidation(req, dbo).then(function (res) {
            userActivityValidation(res, dbo, req).then(function (res) {
                console.log(res);
                response.send(res);
            }, function (err) {//DB or technical error
                console.log('Caught an error!', err);
                response.send(err);
            });
        }, function (err) {//DB or technical error
            console.log('Caught an error!', err);
            response.send(err);
        });
    });
}

function userActivityValidation(userResponse, dbo, req) {
    return new Promise(function (resolve, reject) {
        // var mongo = require('mongodb');
        var myQuery = { usid: new mongo.ObjectID(userResponse[0]._id),
                        status: "1" };
        dbo.collection("user_activity").find(myQuery).toArray(function (err, res) {
            if (err) {
                reject(err);
            };
            if (res.length > 0) {
                var userActivity = require('./../util/userActivity.js');
                userActivity.updateUserActivity(dbo, res, req).then(function (res) {
                
                  //  console.log(res.status);
                    if (res.userStatus === "Inactive") {
                    insertUserActivity(dbo, userResponse, req, resolve);
                    }
                    else {resolve(res);}
                }, function (err) {//DB or technical error
                    console.log('Caught an error!', err);
                    return;
                 //   reject(err);
                });
            } else {
                insertUserActivity(dbo, userResponse, req, resolve);
            }
       });
        
    });
}
// Insert data in user activity table when user login
function insertUserActivity(dbo, userResponse, req, resolve) {

 //   var ipAddress = getIP(req);
    var ipAddress = req.ip;
    var token = sha1(uniqid(Date.now()));
    var activityObj = {
        usid: new mongo.ObjectID(userResponse[0]._id),
        shid: "",
        ip_address: ipAddress,
        start_time: Date.now(),//by default active
        end_time: "",
        status: "1", // it indicates user is logged in
        create_ts: Date.now(),
        update_ts: "",
        token: token
    }
    dbo.collection("user_activity").save(activityObj, function (err, res) {
        if (err) {
            console.log(err);
            reject(err);
        };
        
        response.writeHead(200, { 
            'Content-Type': 'text/plain',
             'token': activityObj.token
        });
        console.log(response);

        // response.send({
        //     status: true,
        //     message: "User activity updated successfully",
        //     data: [activityObj]
        // });
        // console.log(activityObj);
        
        response.json({
            status: true,
            message: "User activity updated successfully",
            data: [activityObj]
        });
        // return;
    });
}

/*
 * 
 * @param {*} dbo  
 * @param {*} req 
 */
function loginValidation(req, dbo) {
    return new Promise(function (resolve, reject) {
        var formValidator = require('./../util/formValidator.js');
        var userLoginData = {
            uname: req.body.uname,
            password: req.body.password
        }
        var objValid = {
            uname: ["is_empty"],//mail id or any unique identity
            password: ["is_empty"]
        }
        var finalArray = formValidator.validate(userLoginData, objValid);
        if (Object.keys(finalArray).length != 0) {
            reject({
                status: false,
                message: "Enter all login information",
                data: [finalArray]
            });
            return;
        }
       
        userLoginData.password = sha1(userLoginData.password);

        dbo.collection("user_info").find(userLoginData).toArray(function (err, res) {
            if (err) reject(err);

            if (res.length > 0) {
                resolve(res);
            }
            // Entered login information is not correct
            else {
                reject({
                    status: false,
                    message: "Enter correct user name and password",
                    data: []
                });
                return;
            }

        });
    });
}

exports.get = function (req, response) {
    var crud = require('./../util/crud.js');

    var requiredField = {
        // name: 1
    };

    var query = {};

    var page, resultperpage;
    try {
        page = parseInt(req.params['page']) || '';
        resultperpage = parseInt(req.params['resultperpage']) || '';

    } catch (e) {
        console.log(e);
    }
    console.log("page", page, resultperpage);
    crud.get(global.data.table.userInfo, requiredField, query, page, resultperpage).then(function (successData) {
        /* every thing is awesome */console.log("awesoem");
        response.send(successData);
    }).catch(function (errorData) {
        /* all is not well */console.log("not awesoem");
        response.send(errorData);
    });
};