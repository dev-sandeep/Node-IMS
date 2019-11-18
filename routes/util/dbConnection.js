/*
 * To create database connection
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



// return new Promise(function (resolve, reject) {
//         var randomNumber = Math.floor((Math.random() * 10) + 1)
//         if (randomNumber <= 5) {
//             resolve(randomNumber)
//         } else {
//             reject(randomNumber)
//         }
//     })