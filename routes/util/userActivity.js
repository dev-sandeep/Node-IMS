/**
 * generic code to update user activity table when active time is more than 5 minutes
 * @author Gunjan Bothra
 * @since 20180417
 */
module.exports = {
    /**
     * generic code to update user activity table
     * dbo
     * res - response of CRUD operation
     * 
     */
    updateUserActivity: function (dbo, res, req) {

        return new Promise(function (resolve, reject) {
            var mongo = require('mongodb');
            var tsDiff;
            // console.log("hello");
            if (res[0].update_ts) {
                tsDiff = Date.now() - res[0].update_ts;
            } else {
                tsDiff = Date.now() - res[0].start_time;
            }
            var minute = 5 * 60 * 1000 // converting 5minutes into miliseconds
            if (tsDiff > minute) {
                console.log("kya chal rha h");
                var myQuery = { _id: new mongo.ObjectID(res[0]._id) },
                    newvalues = { $set: { status: "2", update_ts: Date.now() } },
                    userStatus = "Inactive",
                    message = "User Activity updated";
                update(dbo, myQuery, newvalues, userStatus, message, resolve);

            } else {
                console.log("kya haal h");
                var myQuery = { _id: new mongo.ObjectID(res[0]._id) },
                    newvalues = { $set: { update_ts: Date.now() } },
                    userStatus = "Active",
                    message = "User Already logged in";

                update(dbo, myQuery, newvalues, userStatus, message, resolve);
                // return;
            }
        });
    }
}

function update(dbo, myQuery, newvalues, userStatus, message, resolve) {
    dbo.collection("user_activity").updateOne(myQuery, newvalues, function (err, res) {
        if (err) throw err;
        resolve({
            status: true,
            message: message,
            userStatus: userStatus,
            data: []
        });
    });
}        