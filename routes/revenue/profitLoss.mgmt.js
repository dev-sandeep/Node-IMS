/**
 * responsible for managing customer invoice
 * @author Gunjan Bothra
 * @since 20180710
 */
// Calculate Unbreakable items selling price
 function unbreakableSP(){
    return new Promise(function (resolve, reject) {
        var sumQuery=[ 
            { $match: {status: 2 } },
               { $group : {
                    _id : null,
                    Price: { $sum: "$sellPrice"},
                    count: { $sum: 1 }
                 }
                }
    ];
        Calculation_CP_SP(global.data.table.invUnbreakableItem, sumQuery).then(function (unbreakableSP) {
            resolve(unbreakableSP);
        });
});
}
// Calculate Unbreakable items cost price
function unbreakableCP(){
    return new Promise(function (resolve, reject) {
        var sumQuery=[ 
            { $match: {
                $and: [ 
                    { $or : [ { status : 2 }, { status : 3 } ] }, 
                    {type: {$eq: 1}}
                ]
        } },
               { $group : {
                    _id : null,
                    Price: { $sum: { $multiply: [ "$purchasePrice", "$sold_qty" ] } },  
                    count: { $sum: 1 }
                 }
                }
    ];
        Calculation_CP_SP(global.data.table.inventoryItem, sumQuery).then(function (unbreakableCP) {
            resolve(unbreakableCP);
        });
});
}
// Calculate breakable items cost price
function breakableCP(){
    return new Promise(function (resolve, reject) {
        var sumQuery=[ 
            { $match: {
                $and: [ 
                    { $or : [ { status : 2 }, { status : 3 } ] }, 
                    {type: {$eq: 2}}
                ]
        } },
               { $group : {
                    _id : null,
                    Price: { $sum: { $multiply: [ "$purchasePrice", "$sold_qty" ] } },  
                    count: { $sum: 1 }
                 }
                }
    ];
        Calculation_CP_SP(global.data.table.inventoryItem, sumQuery).then(function (breakableCP) {
            resolve(breakableCP);
        });
});
}
// Calculate breakable items selling price
function breakableSP(){
    return new Promise(function (resolve, reject) {
        var sumQuery=[ 
            { $group : {
                 _id : null,
                 Price: { $sum: { $multiply: [ "$sellingPrice", "$sold_qty" ] } },  
                 count: { $sum: 1 }
              }
             }
 ];
        Calculation_CP_SP(global.data.table.invBreakableItem, sumQuery).then(function (breakableSP) {
            resolve(breakableSP);
        });
});
}
// Calculate waste items cost price
function totalWasteItem(){
    return new Promise(function (resolve, reject) {
        var sumQuery=[ 
            { $match: {status: 4} },
               { $group : {
                    _id : null,
                    Price: { $sum: { $multiply: [ "$purchasePrice", "$availableQty" ] } },  
                    count: { $sum: 1 }
                 }
                }
    ];
        Calculation_CP_SP(global.data.table.inventoryItem, sumQuery).then(function (breakableSP) {
            resolve(breakableSP);
        });
});
}
// Calculate final profit or loss
exports.profitLoss = function (req, response) {
    var q = require('q');
    var promise1 = unbreakableSP().then(function (successData) {
        return {
            SP:true,
            data:successData
        };
    });
    var promise2 = unbreakableCP().then(function (successData) {
        return {
            SP: false,
            data:successData
        };
    });
    var promise3 = breakableCP().then(function (successData) {
        return {
            SP: false,
            data:successData
        };
    });
    var promise4 = breakableSP().then(function (breakableSP) {
        return {
            SP:true,
            data: breakableSP
        };
    });
    var promise5 = totalWasteItem().then(function (successData) {
        return {
            SP: false,
            data: successData
        };
    });
    q.all([promise1, promise2, promise3, promise5]).then(function(result){
        var totalSellingPrice = 0, totalCostprice = 0; 
        for (var i = 0; i < result.length; i++){
            if(result[i].SP === true &&  result[i].data[0]){
                totalSellingPrice = totalSellingPrice + result[i].data[0].Price;
            }
            else {
                totalCostprice = totalCostprice + result[i].data[0].Price;
            }
        }
        finalProfitLoss = totalSellingPrice - totalCostprice;
        if (finalProfitLoss > 0){
            msg = "there is profit of total amount:"
        } else {
            msg = "there is loss of total amount:"
        }
        response.send({
            status: true,
            message: msg + finalProfitLoss,
            data: finalProfitLoss
        })
    });
}
function Calculation_CP_SP(table, query) {
    return new Promise(function (resolve, reject) {
        var connection = require('./../util/common.js');
      connection.dbConn().then(function (resp) {
        var dbo = resp.obj,
            db = resp.db;
     dbo.collection(table).aggregate(query).toArray(function (err, unbreakableSP) {
        if (err) {reject(err)};
        resolve(unbreakableSP);
       });
    });
    });

}