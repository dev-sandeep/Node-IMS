/**
 * User Authentication to perform before any action
 * @author Gunjan Bothra
 * @since 20180425
 */
module.exports = {
    /**
     * req
     */
    userAuthentication: function (req) {
        return new Promise(function (resolve, reject) {
        var token = req.headers.token;
        if(!token){
            reject("token not found");
        }
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            /* the name of the collection goes here */
            var dbo = db.db("ERP");
            var myQuery = { token: token,
                status: "1" };
                console.log(myQuery);
            dbo.collection("user_activity").find(myQuery).toArray(function (err, res) {
                if (err) {
                    reject(err);
                };
                if (res.length > 0) {
          //      console.log("Token matched");
                var userActivity = require('./../util/userActivity.js');
                userActivity.updateUserActivity(dbo, res, req).then(function (res) {
                    console.log("Process success");
                    if (res.userStatus === "Active") {
                        resolve();
                    } else {
                        reject("Session is logged out");
                    }
                }, function (err) {//DB or technical error
                    console.log('Caught an error!', err);
                });
                }
                else {
                    reject("token not found in db");
                }
        });
    });
});
            }
        }

        