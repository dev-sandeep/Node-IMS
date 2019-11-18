/**
 * responsible for managing the search autoComplete  - Seller, Customer, Product, Shop, User
 * @author Gunjan Bothra
 * @since 20180620
 */

exports.sellerSearch = function (req, response) {
    var myQuery = { sellerName: new RegExp('^' + req.query.name) }; 
    autoSearch(global.data.table.seller, myQuery).then(function (successData) {
        response.send(successData);
    });
}
exports.customerSearch = function (req, response) {
    var myQuery = { customerName: new RegExp('^' + req.query.name) }; 
    autoSearch(global.data.table.customer, myQuery).then(function (successData) {
        response.send(successData);
    });
}
exports.productSearch = function (req, response) {
    var myQuery = { product: new RegExp('^' + req.query.name) }; 
    autoSearch(global.data.table.product, myQuery).then(function (successData) {
        response.send(successData);
    });
}
exports.shopSearch = function (req, response) {
    var myQuery = { name: new RegExp('^' + req.query.name) }; 
    autoSearch(global.data.table.shop, myQuery).then(function (successData) {
        response.send(successData);
    });
}
exports.userSearch = function (req, response) {
    var myQuery = { name: new RegExp('^' + req.query.name) }; 
    autoSearch(global.data.table.userInfo, myQuery).then(function (successData) {
        response.send(successData);
    });
}
function autoSearch(tableName, myQuery) {
    return new Promise(function (resolve, reject) {
       
    var connection = require('./common.js');
    connection.dbConn().then(function (resp) {
        var dbo = resp.obj,
            db = resp.db;
    
       
        // search(dbo,global.data.table.seller,myQuery)
        dbo.collection(tableName).find(myQuery).toArray(function (err, res) {
            if (err) { reject(err); }
            if (res.length > 0) {
                dbo.collection(tableName).find(myQuery).count(function (e, count) {
                    if (e) { reject(e); }
                    // db.close();
                    resolve({
                        status: true,
                        message: "Search sucessful",
                        count: count,
                        data: res,
                    });
                });
            } else {
                resolve({
                    status: false,
                    message: "Data not found",
                    data: []
                });
            }
    });
});
    });
}