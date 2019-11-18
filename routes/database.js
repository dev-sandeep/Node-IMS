
/*
 * Example to create database connection
 */

exports.connectionTest = function (req, res) {
    var mongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/retail";

    mongoClient.connect(url, function (err, db) {
        if (err) throw err;
        console.log("Database connected!");
        res.send("Database connected!");
        db.close();
    });
};

/**
 * Example to make a get call
 */
exports.getData = function (req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/retail";

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("retail");
        dbo.collection("inventory").findOne({}, function (err, result) {
            if (err) throw err;
            res.send({ result: result });
            db.close();
        });
    });
};

/**
 * Example to make a post call
 */
exports.postData = function (req, response) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        /* the name of the collection goes here */
        var collectionName = "userrole";

        var dbo = db.db("retail");
        var date = new Date();
        var dateStr = date.toLocaleTimeString();
        var objectId = require('mongodb').ObjectID;

        var mongo = require('mongodb');
        var testId = new objectId();

        /* the @tobe inserted data goes here */
        var myobj = {
            // email: 'allexmclen@mail.com',
            userId: objectId("5a9816b52774ea4b88eef18e"),
            role: 'admin'
        };
        // myobj = { "productName": "Washing Machine", "Price": "25000", "Brand": "Samsung" };
        dbo.collection(collectionName).insertOne(myobj, function (err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            response.send("1 document inserted");
            db.close();
        });
    });
}
//Insert data through postman client
exports.post = function (req, response) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        /* the name of the collection goes here */
        var dbo = db.db("retail");

        var myobj = {
            item: req.body.item,
            qty: req.body.qty,
            size: req.body.size,
            tags: req.body.tags
        }
        console.log(myobj);

        dbo.collection("inventory").save(myobj, function (err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            response.send("Product Created");
            db.close();
        });
    });
}
//Update data through postman client
exports.put = function (req, response) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("retail");
        var id = req.params.product_id;

        /* to compare the objectId */
        var mongo = require('mongodb');
        var myQuery = { _id: new mongo.ObjectID(id) };

        var newvalues = {
            $set: {
                item: req.body.item,
                qty: req.body.qty,
                size: req.body.size,
                tags: req.body.tags
            }
        };

        dbo.collection("inventory").updateOne(myQuery, newvalues, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
            response.send("1 Record updated");
            db.close();
        });
    });
}
/**
 * Example to run a query
 */
exports.queryParam = function (req, response) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("retail");
        var itemName = req.params['item'];

        var myQuery = { item: itemName };

        /* .project() : for selecting the rows in the result */
        dbo.collection("inventory").find(myQuery).project({ item: 1 }).toArray(function (err, res) {
            if (err) throw err;
            response.send({ result: res });
            db.close();
        });
    });
}

/**
 * Example to run a query
 */
exports.joinData = function (req, response) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("retail");
        var itemName = req.params['item'];

        var joinQuery = {
            $lookup: {
                from: 'product',
                localField: 'item',
                foreignField: 'productName',
                as: 'product'
            }
        }

        /* .project() : for selecting the rows in the result */
        dbo.collection("inventory").aggregate([joinQuery]).toArray(function (err, res) {
            if (err) throw err;
            response.send({ result: res });
            db.close();
        });
    });
}


/**
 * Example to run a query to join the data and show result from multiple collection
 */
exports.joinDataMustiple = function (req, response) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("retail");
        var itemName = req.params['item'];

        /**
         * join the data from - user, userinfo, userrole
         * with userId as the common link
         */
        var joinQuery = [

            // Join with user_info table
            {
                $lookup: {
                    from: "userinfo",       // other table name
                    localField: "userId",   // name of users table field
                    foreignField: "userId", // name of userinfo table field
                    as: "user_info"         // alias for userinfo table
                }
            },
            { $unwind: "$user_info" },     // $unwind used for getting data in object or for one record only

            // Join with user_role table
            {
                $lookup: {
                    from: "userrole",
                    localField: "userId",
                    foreignField: "userId",
                    as: "user_role"
                }
            },
            { $unwind: "$user_role" },

            // define some conditions here 
            {
                $match: {
                    $and: [{ "uname": "allex" }]
                }
            },

            // define which fields are you want to fetch
            {
                $project: {
                    _id: 1,
                    email: 1,
                    uname: 1,
                    phone: "$user_info.phone",
                    role: "$user_role.role",
                }
            }
        ]

        /* .project() : for selecting the rows in the result */
        dbo.collection("user").aggregate(joinQuery).toArray(function (err, res) {
            if (err) throw err;
            response.send({ result: res });
            db.close();
        });
    });
}


/**
 * Responsible for sorting the data
 */
exports.sortData = function (req, response) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("retail");
        var itemName = req.params['item'];

        var mySort = { item: 1 };

        /* .project() : for selecting the rows in the result */
        dbo.collection("inventory").find().sort(mySort).toArray(function (err, res) {
            if (err) throw err;
            response.send({ result: res });
            db.close();
        });
    });
}

/**
 * Example to update the data
 */
exports.updateData = function (req, response) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("retail");
        var id = req.params['id'];

        /* to compare the objectId */
        var mongo = require('mongodb');
        var myQuery = { _id: new mongo.ObjectID(id) };

        var newvalues = { $set: { itemId: 2 } };

        dbo.collection("inventory").updateOne(myQuery, newvalues, function (err, res) {
            if (err) throw err;
            response.send("1 Record updated");
            db.close();
        });
    });
}
