/**
 * responsible for logout user in the system
 * @param {*} req 
 * @param {*} response
 */
exports.logout = function (req, response) {
        
    var MongoClient = require('mongodb').MongoClient;
    var url = global.baseUrl;

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("ERP");
        console.log(req);
    //    var token = localStorage.getItem('token');
    var token = "9f98d75f1514ba95d8ad89d2cbfb3f03d599ffb8";
    
        validateUserSession(req, dbo, response,token).then(function (res) {
            var mongo = require('mongodb');
            var myQuery = { _id: new mongo.ObjectID(res[0]._id) };
            var newvalues = { $set: { status: "2", 
                                    end_time: Date.now(), 
                                    update_ts: Date.now()
                                } };
            dbo.collection("user_activity").updateOne(myQuery, newvalues, function (err, res) {
                if (err) throw err;
                console.log("User logged out successfully");
                response.send("User logged out successfully");
            });
        }, function (err) {//DB or technical error
            console.log('Caught an error!', err);
        });
    });        
}
function validateUserSession(req, dbo, response, token){
    return new Promise(function (resolve, reject) {
        console.log(token);
        var myQuery = { token: token, status: "1" };
        dbo.collection("user_activity").find(myQuery).toArray(function (err, res) {
            if (err) reject(err);
           
            if (res.length > 0) {
                resolve(res);
            }
            else {
                response.send({
                    status: false,
                    message: "User is automatically logged out due to timeout",
                    data: []
                });
                return;
            }
        });
    });
}