/**
 * all the common functions like db connection, insert etc.
 * @author Sandeep G
 * @since 20180323
 */
module.exports = {
    /**
     * responsible for creating a db connection
     */
    dbConn: function () {
        return new Promise(function (resolve, reject) {
            var MongoClient = require('mongodb').MongoClient;
            var url = global.baseUrl;
            
            MongoClient.connect(url, function (err, db) {
                if (err) {
                    reject(err);
                }

                /* the name of the collection goes here */
                var dbo = db.db("ERP");
                resolve({ obj: dbo, db: db });
            });
        })
    }
}