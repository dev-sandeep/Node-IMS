/**
 * responsible for validating the Inventory Master fields
 * @since 20180624
 * @author Gunjan Bothra
 */
exports.sellerValidate = function (req, response) {
    var formValidator = require('./../util/formValidator.js');
    var connection = require('./common.js');
    connection.dbConn().then(function (resp) {
        var dbo = resp.obj,
            db = resp.db;
            myobj = {
                sellerId: req.body.sellerId,
                address: req.body.address,
                orderDate: req.body.orderDate,
                totalAmount: req.body.totalAmount,
                userId: req.body.userId
            }
            var objValid = {
                sellerId: ["is_empty"],
                address: ["is_empty"],
                orderDate: ["is_empty"],
                totalAmount: ["is_empty"],
                userId: ["is_empty"]
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
            else {
                response.send("Validated all fields");
            }
    });

}