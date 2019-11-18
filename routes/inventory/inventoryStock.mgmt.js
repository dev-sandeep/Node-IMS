/**
 * responsible for managing inventory stock
 * @author Gunjan Bothra
 * @since 20180707
 */
exports.get = function (req, response) {
    var connection = require('./../util/common.js');
            connection.dbConn().then(function (resp) {
                var dbo = resp.obj,
                    db = resp.db;
        var productId = req.params['productId'];
        var joinQuery = [
            {
                $lookup: {
                    from: global.data.table.invUnbreakableItem,       // invUnbreakableItem table name
                    localField: "_id",   // name of inventoryItem table field
                    foreignField: "inv_it_id", // name of invUnbreakableItem table field
                    as: "unbreakableStock"         // array contains the matching items of unbreakable table
                }
            },
            { $match: { $and: [ { productId: { $eq: productId } }, { status: { $eq: 1 } } ] } },
            // { $group: {
            //         "_id": "inv_it_id",
            //         "count": { "$sum": 1 }
            //     }
            // },
            // define which fields are you want to fetch
            // {
            //     $project: {
            //         _id: 1,
            //         email: 1,
            //         uname: 1,
            //         phone: "$user_info.phone",
            //         role: "$user_role.role",
            //     }
            // }
        ]
        dbo.collection(global.data.table.inventoryItem).aggregate(joinQuery).toArray(function (err, res) {
            if (err) {
                console.log("error" + err);
                throw err};
            //     console.log("hello");
            response.send({ result: res });
            db.close();
        });
    });
// });
},
// to find out available stock in inventory
exports.getAvailableStock = function (req, response) {
    var connection = require('./../util/common.js');
    connection.dbConn().then(function (resp) {
        var dbo = resp.obj,
            db = resp.db;
    var productId = req.params['productId'];
    var sumQuery=[ 
        { $match: {
            $and: [ { productId: { $eq: productId } }, { status: { $eq: 1 } } ]
    } },
    { $group: { 
              _id: null,
              availableQuantity: { $sum: "$availableQty" },
              count: { $sum: 1 }
            } }
];
     dbo.collection(global.data.table.inventoryItem).aggregate(sumQuery).toArray(function (err, res) {
        if (err) {
            console.log("error" + err);
            throw err};
        response.send({ result: res });
        db.close();
     });
    });
    
}

exports.getBreakableAvailableStock = function (req, response) {
    var connection = require('./../util/common.js');
    connection.dbConn().then(function (resp) {
        var dbo = resp.obj,
            db = resp.db;
    var productId = req.params['productId'];
    var sumQuery=[ 
        { $match: {
            $and: [ 
                { productId: { $eq: productId } }, 
               { $or : [ { status : 1 }, { status : 2 } ] },
                {type: {$eq: 2}}
            ]
    } },
  ];

     dbo.collection(global.data.table.inventoryItem).aggregate(sumQuery).toArray(function (err, res) {
        if (err) {
            console.log("error" + err);
            throw err};
            if(res.length > 0) {
                var countQuery=[ 
                    { $match: {
                        $and: [ 
                            { productId: { $eq: productId } }, 
                           { $or : [ { status : 1 }, { status : 2 } ] },
                            {type: {$eq: 2}}
                        ]
                } },
              
                { $group: { 
                          _id: null,
                          availableQuantity: { $sum: "$availableQty" },
                          count: { $sum: 1 }
                        } }
            ];
            dbo.collection(global.data.table.inventoryItem).aggregate(countQuery).toArray(function (err, count) {
                if (err) {
                    console.log("error" + err);
                    throw err};
                response.send({
                    status: true,
                    message: "results for: " + global.data.table.inventoryItem,
                    count: count,
                    data: res,
                });
                });
            }
        
        db.close();
     });
    });
    
}
