/**
 * all the generic code create, update and delete
 * @author Sandeep G
 * @since 20180402
 */
module.exports = {
    /**
     * generic code to create a document
     */
    create: function (tableName, myobj, myObjFilter) {
        return new Promise(function (resolve, reject) {
            var validateLib = require('./formValidator.js');
            var MongoClient = require('mongodb').MongoClient;
            var url = global.baseUrl;

            MongoClient.connect(url, function (err, db) {
                if (err) {
                    reject(err);
                }
                /* the name of the collection goes here */
                var dbo = db.db("ERP");
                if (!Array.isArray(myobj)) {
                    //  console.log("go here");
                    var checkValidate = validateLib.validate(myobj, myObjFilter);
                    if (Object.keys(checkValidate).length != 0) {
                        reject(checkValidate);
                        console.log("ERROR_CREATE: #1");
                        return;
                    }
                }
                else {
                    //Validate multiple line items

                    var finalData = [];
                    for (i = 0; i < myobj.length; i++) {
                        var checkValidate = validateLib.validate(myobj[i], myObjFilter);
                        if (Object.keys(checkValidate).length != 0) {
                            finalData.push(checkValidate);
                        }
                    }
                    if (finalData.length != 0) {
                        reject("array" + finalData);
                        console.log("ERROR_CREATE: #2");
                        return;
                    }

                }

                /**
                 * now send the db request to save the data
                 */
                dbo.collection(tableName).insert(myobj, function (err, res) {

                    if (err) {
                        console.log("ERROR_CREATE", tableName, myobj);
                        console.log("ERROR_CREATE: " + err);
                        //console.log(err);
                        reject(err);
                        return;
                    };

                    // db.close();
                    // console.log("tableName: " + tableName);
                    resolve({
                        status: true,
                        message: tableName + " Created",
                        data: [myobj]
                    });
                });
            });
        });
    },

    update: function (tableName, myobj, myObjFilter, payloadObj) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var MongoClient = require('mongodb').MongoClient;
            var validateLib = require('./formValidator.js');

            var url = global.baseUrl;

            MongoClient.connect(url, function (err, db) {
                if (err) {
                    reject(err);
                };
                /* the name of the collection goes here */
                var dbo = db.db("ERP");

                /**
                 * now send the db request to save the data
                 */
                var mongo = require('mongodb');

                var checkValidate = validateLib.validate(myobj, myObjFilter);
                if (Object.keys(checkValidate).length != 0) {
                    reject(checkValidate);
                }

                /* check if the id is passed */
                if (!myobj.id) {
                    reject({ msg: "id is not passed" });
                }
                var myQuery = { _id: new mongo.ObjectID(myobj.id) };

                payloadObj = createSetObjectForUpdate(payloadObj);

                var newvalues = {
                    $set: payloadObj
                };
                // console.log(payloadObj);

                /* just a basic check if the id is existing */
                // console.log(tableName, myQuery, newvalues, myobj);
                self.isExist(tableName, myobj.id).then(function () {
                    dbo.collection(tableName).updateOne(myQuery, newvalues, function (err, res) {
                        if (err) {
                            console.log("update document Fail" + err);
                            reject(err);
                            return;
                        }
                        console.log("1 document updated");
                        // db.close();
                        resolve({
                            status: true,
                            message: tableName + " updated",
                            data: []
                        });
                    });
                }, function () {
                    // console.log("bekar");
                    reject({
                        status: false,
                        message: 'invalid id'
                    })
                });


                /**
                 * to create a payload object such that use only those params 
                 * which has a value(or passed by user while updating)
                 * @param {*} payloadObject 
                 */
                function createSetObjectForUpdate(payloadObject) {
                    var finalObj = {};
                    for (var obj in payloadObject) {
                        if (payloadObject[obj]) {
                            finalObj[obj] = payloadObject[obj];
                        }
                    }
                    return finalObj;
                }
            });
        });

    },

    delete: function (tableName, myobj) {
        return new Promise(function (resolve, reject) {
            var MongoClient = require('mongodb').MongoClient;
            // var validateLib = require('./formValidator.js');

            var url = global.baseUrl;

            MongoClient.connect(url, function (err, db) {
                if (err) {
                    reject(err);
                };
                /* the name of the collection goes here */
                var dbo = db.db("ERP");

                /**
                 * now send the db request to save the data
                 */
                var mongo = require('mongodb');

                /* check if the id is passed */
                if (!myobj.id || !myobj.id > 0) {
                    reject({ status: false, msg: "id is not passed" });
                }
                var myQuery = { _id: new mongo.ObjectID(myobj.id) };
                console.log(myQuery, tableName);
                dbo.collection(tableName).deleteOne(myQuery, function (err, res) {
                    if (err) {
                        reject(err);
                    }
                    // console.log("1 document deleted");
                    db.close();
                    resolve({
                        status: true,
                        message: tableName + ": 1 document deleted",
                        data: []
                    });
                });
            });
        });

    },

    /**
     * responsible for getting a complete list or implement pagination depending upon the params
     */
    get: function (tableName, requiredField, query, pageNo, limit, foreignFieldAbbreviation) {
        var superSelf = this;
        superSelf.requiredField = requiredField;
        return new Promise(function (resolve, reject) {

            requiredField = requiredField || {};
            query = query || {};
            var connection = require('./common.js');
            connection.dbConn().then(function (resp) {
                var
                    dbo = resp.obj,
                    db = resp.db;

                if (pageNo && limit) {
                    dbo.collection(tableName).find(query).skip((pageNo - 1) * limit).limit(limit).project(requiredField).toArray(function (err, res) {
                        // dbo.collection(tableName).find(query).skip((pageNo - 1) * limit).limit(limit).project(requiredField).toArray(function (err, res) {
                        if (err) { reject(err); }
                        dbo.collection(tableName).find(query).count(function (e, count) {
                            if (e) { reject(e); }
                            // db.close();
                            resolve({
                                status: true,
                                message: "results for: " + tableName,
                                count: count,
                                data: res,
                            });
                        });
                    });
                } else if (foreignFieldAbbreviation && query) {
                    console.log(query);
                    console.log(tableName);
                    // dbo.collection(tableName).aggregate(query).toArray(function (err, res) {
                    dbo.collection(tableName).aggregate(query).project(requiredField).toArray(function (err, res) {
                        if (err) { reject(err); }
                        /* updating query to get count */
                        console.log("GET CALL:", res);
                        query.push({
                            $group: {
                                "_id": null,
                                "count": { "$sum": 1 }
                            }
                        });


                        dbo.collection(tableName).aggregate(query).toArray(function (e, count) {
                            if (e) { reject(e); }
                            db.close();

                            var data = superSelf.lookUpGetHelper(res, foreignFieldAbbreviation, superSelf.requiredField);
                            if (data && data.length > 0) {
                                console.log(":FILTERING!");
                            }
                            else {
                                console.log("NO FILTER");
                            }
                            res.data = data;
                            resolve({
                                status: true,
                                message: "results for: " + tableName,
                                count: count,
                                data: res,
                            });
                        });
                    });
                }
                else {
                    dbo.collection(tableName).find(query).project(requiredField).toArray(function (err, res) {
                        if (err) { reject(err); }
                        dbo.collection(tableName).find(query).count(function (e, count) {
                            if (e) { reject(e); }
                            // db.close();
                            if (count > 0) {
                                resolve({
                                    status: true,
                                    message: "results for: " + tableName,
                                    count: count,
                                    data: res,
                                });
                            } else {
                                resolve({
                                    status: false,
                                    message: "Data not found"
                                });
                            }
                        });
                    });
                }
            });
            /////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////
        });
    },
    /**
     * responsible for filtering the data
     */
    lookUpGetHelper: function (data, foreignFieldName, requiredForeignField) {
        if (!data || data.length == 0 || !requiredForeignField.lookup) {
            console.log("fail");
            return data;
        }
        var childData, foreignData = [];
        /* first convert requiredField Object in to array */
        var requiredFieldArr = [];
        for (var key in requiredForeignField.lookup) {
            if (requiredForeignField.lookup[key])
                requiredFieldArr.push(key);
        }

        /* now traverse the data */
        for (var i = 0; i < data.length; i++) {
            foreignData = data[i][foreignFieldName];
            if (!foreignData) {
                console.log("FILTER ERROR: NO FOREIGN DATA");
                return data;
            }
            /* traverse the child data */
            for (var j = 0; j < foreignData.length; j++) {
                childData = foreignData[j];
                if (!childData) {
                    console.log("FILTER ERROR: NO CHILD DATA");
                    return data;
                }
                /* traverse the child data */
                for (var key in childData) {
                    if (requiredFieldArr.indexOf(key) == -1)
                        delete childData[key];
                }
            }
        }
        console.log("==========FINAL FILTERED DATA============");
        console.log(data);
        return data;
    },

    isExist: function (tableName, id, customCondition) {
        return new Promise(function (resolve, reject) {
            var MongoClient = require('mongodb').MongoClient;

            var url = global.baseUrl;
            MongoClient.connect(url, function (err, db) {
                if (err) {
                    reject(err);
                };

                if (!id || !id > 0) {
                    reject({ status: false, msg: "id is not passed" });
                }

                var mongo = require('mongodb');
                var myQuery;

                /* change the query if customField is existing */
                if (customCondition) {
                    myQuery = customCondition;
                } else {/* normal query */
                    myQuery = { _id: new mongo.ObjectID(id) };
                }
                console.log(myQuery);

                var dbo = db.db("ERP");
                dbo.collection(tableName).find(myQuery).toArray(function (err, res) {
                    console.log("xxxxxxxxxxxxxxxxxxxxxxIS-EXISTSxxxxxxxxxxxxxxxxxxxxxxxx", myQuery, tableName);
                    //     console.log(res);
                    //     console.log(err);
                    if (err) reject(err);
                    if (res.length > 0) {
                        console.log("PASS");
                        resolve(true);
                    }
                    else {
                        reject(false);
                    }

                });
            });
        });
    },

    /**
     * responnsible for back to back cheking is exist
     * @param isExistArray Array
     * @example [{table: 'shop', id: 'xxxxx'}, {table: 'brand', id: 'xxxxx'}] 
     */
    backToBackIsExist: function (isExistArray) {
        var self = this, i = 0, tableName, id;
        var maxLen = isExistArray.length;
        // console.log(isExistArray);
        return new Promise(function (resolve, reject) {

            function check(i) {
                tableName = isExistArray[i].table;
                id = isExistArray[i].id;

                /* now call the isExist with promise */
                self.isExist(tableName, id).then(function () {
                    i++;

                    /* this is where recursion occurs */
                    if (i < maxLen) {
                        check(i);
                    } else {
                        resolve({ status: true, message: "Everything is awesome!" });
                    }
                }, function () {
                    console.log("FAIL-E-BACKTOBACK");
                    reject({ status: false, message: "invalid " + tableName + " id." });
                });

            }
            /* initiate checking */
            if (maxLen > 0)
                check(0);
        });
    },
}