/**
 * responsible for managing customer invoice
 * @author Gunjan Bothra
 * @since 20180709
 */
exports.create = function (req, response) {
    var crud = require('./../util/crud.js');
    var aTableStatus = [];

    //Master Data 
    var customerData = req.body.data[0].customerData;
    var myobj = {
        name: customerData.name,
        billingAddress: customerData.billingAddress,
        shippingAddress: customerData.shippingAddress,
        tax: customerData.tax,
        orderDate: Date(customerData.orderDate),
        deliveryDate: Date(customerData.deliveryDate),
        contact: customerData.contact,
        sellerShop: customerData.sellerShop,
        paymentMode: customerData.paymentMode,
        payStatus: customerData.payStatus,
        totalAmount: customerData.totalAmount,
        create_ts: Date.now(),//getting the current ts
        update_ts: Date.now(),
    }

    /* check the basic validation */
    var myObjFilter = {
        name: ["is_empty"],
        billingAddress: ["is_empty"],
        shippingAddress: ["is_empty"],
        tax: ["is_empty"],
        orderDate: ["is_empty"],
        deliveryDate: ["is_empty"],
        contact: ["is_empty"],
        sellerShop: ["is_empty"],
        paymentMode: ["is_empty"],
        payStatus: ["is_empty"],
        totalAmount: ["is_empty"],
        create_ts: [],//getting the current ts
        update_ts: [],
    }
    crud.create(global.data.table.customerInvoice, myobj, myObjFilter).then(function (successData) {
        // console.log("Invoice inserted");
        var insertStatus = {
            status: "new",
            msg: "Insert Successful",
            pendingTransaction: myobj
        }
        aTableStatus.push({
            tableName: global.data.table.customerInvoice,
            id: myobj._id,
            data: [insertStatus]
        });
        var items = customerData.bsid;
        var unbreakableItem = [], breakableItem = [];
        if (items) {
            for (var i = 0; i < items.length; i++) {
                if (parseInt(items[i].type) === 1) {
                    unbreakableItem.push(items[i]);
                } else {
                    breakableItem.push(items[i]);
                }
            }
            var aUniqueId = [];
            for (var j = 0; j < unbreakableItem.length; j++) {
                var aData = unbreakableItem[j].inventoryId;
                for (var k = 0; k < aData.length; k++) {
                    aUniqueId.push({
                        type: unbreakableItem[j].type,
                        uniqueNo: aData[k].uniqueNo,
                        sellPrice: parseInt(aData[k].sellPrice),
                        warrenty: parseInt(aData[k].warrenty),
                        availableInShop: aData[k].availableInShop,
                        soldQuantity: parseFloat(aData[k].soldQuantity)
                    })
                }
            }
            var aTotalItems = aUniqueId.concat(breakableItem);
            console.log(aTotalItems);
        }
        rollBackTransactionsUnbreakable(aTotalItems, aUniqueId, myobj._id, aTableStatus, response);

    });
}

/**
 * aUniqueId : Array contains unbreakable item table fields like uniqueNo, sellPrice ,warrenty, availableShop
 * unbreakableItem: array of unbreakable item from table inventory_item
 * sellerID : newly generated invoice seller Id
 * aTableStatus: stores information like table name, key field id and table data for rollback purpose
 */

function rollBackTransactionsUnbreakable(aTotalItems, aUniqueId, sellerID, aTableStatus, response) {
    var crud = require('./../util/crud.js');
    var ctr = 0;
    var connection = require('./../util/common.js');
    connection.dbConn().then(function (resp) {
        var dbo = resp.obj,
            db = resp.db;
        function recursive(aTotalItems) {
            if (parseInt(aTotalItems[ctr].type) === 1) {
                var sStatusText = "inProcess";
                var myQuery = {
                    uniqueNo: aUniqueId[ctr].uniqueNo,
                    status: 1
                };
                //read unbreakable item table based on unique no and status
                readPromise(myQuery, dbo, aTableStatus, sStatusText, global.data.table.invUnbreakableItem).then(function (statusData) {
                    // console.log("read sahi h");
                    // if (ctr === 1) {
                    //     //  console.log("First read passed");
                    //     statusData.item[0]._id = "5b41f0000738985c585100f6";
                    // }
                    //update unbreakable item table
                    updatePromise(aUniqueId[ctr], sellerID, statusData.item).then(function () {
                        var mongo = require('mongodb');
                        var query = { _id: new mongo.ObjectID(statusData.item[0].inv_it_id) };
                        readPromise(query, dbo, aTableStatus, sStatusText, global.data.table.inventoryItem).then(function (itemData) {


                            updateInventoryItemPromise(itemData.item, global.data.table.inventoryItem, aTotalItems[ctr]).then(function () {
                                ctr++;
                                if (aTotalItems.length > ctr)
                                    recursive(aTotalItems);

                            }, function (errorData) {

                                // console.log("Update Fail" + ctr);
                                rollback(aTableStatus);
                            });

                        }, function (errorData) {

                            // console.log("Update Fail" + ctr);
                            rollback(aTableStatus);
                        });

                        /* cond: to stop recursion */


                    }, function (errorData) {
                        // console.log(errorData);
                        console.log("Read Update Fail" + ctr);
                        // console.log(rollBackData);
                        rollback(aTableStatus);
                    });
                }, function (errorData) {
                    // console.log("Read Fail");
                    rollback(aTableStatus);
                });
            } else if (parseInt(aTotalItems[ctr].type) === 2) {
                console.log("type 2");
                var sStatusText = "inProcess";
                var mongo = require('mongodb');
                var myQuery = {
                    $and: [
                        { "bsid": new mongo.ObjectID(aTotalItems[ctr].bs_id) },
                        { $or: [{ "status": 1 }, { "status": 3 }] },
                        { "type": 2 },
                        { "availableQty": { $gte: parseFloat(aTotalItems[ctr].soldQuantity) } }
                    ],

                };

                //read unbreakable item table based on unique no and status
                readPromise(myQuery, dbo, aTableStatus, sStatusText, global.data.table.inventoryItem).then(function (itemData) {
                    console.log("read Success" + itemData.item[0].sold_qty);
                    updateInventoryItemPromise(itemData.item, global.data.table.inventoryItem, aTotalItems[ctr]).then(function () {
                        // console.log("continue with insert" + itemData.item);
                        var myobj = {
                            inv_it_id: new mongo.ObjectID(itemData.item[0]._id),
                            sellInvoiceID: sellerID,
                            sellPrice: aTotalItems[ctr].sellPrice,
                            sold_qty: aTotalItems[ctr].soldQuantity,
                            create_ts: Date.now(),//getting the current ts
                            update_ts: Date.now()
                        }

                        /* check the basic validation */
                        var myObjFilter = {
                            inv_it_id: ["is_empty"],
                            sellInvoiceID: ["is_empty"],
                            sellPrice: ["is_empty"],
                            sold_qty: ["is_empty"],
                            create_ts: [],//getting the current ts
                            update_ts: []
                        }
                        // console.log(myobj);
                        crud.create(global.data.table.invBreakableItem, myobj, myObjFilter).then(function (successData) {
                            console.log("creation is successful");
                            // console.log(successData);
                            var insertStatus = {
                                status: "new",
                                msg: "Insert Successful",
                                pendingTransaction: myobj
                            }
                            aTableStatus.push({
                                tableName: global.data.table.invBreakableItem,
                                // id: myobj._id,
                                data: [insertStatus]
                            });
                            ctr++;
                            if (aTotalItems.length > ctr) {
                                recursive(aTotalItems);
                            }
                            if (aTotalItems.length === ctr) {
                                for (i = 0; i < aTableStatus.length; i++) {
                                    aTableStatus[i].data[0].status = "completed";
                                }
                            }
                            response.send("All data updated successfully:");
                        }, function (errorData) {

                            // console.log("Update Fail" + ctr);
                            rollback(aTableStatus);
                        });

                    }, function (errorData) {

                        // console.log("Update Fail" + ctr);
                        rollback(aTableStatus);
                    });

                }, function (errorData) {

                    // console.log("Update Fail" + ctr);
                    rollback(aTableStatus);
                });
            }
        }
        recursive(aTotalItems);
    });
}

function readPromise(myQuery, dbo, aTableStatus, sStatusText, tableName) {
    return new Promise(function (resolve, reject) {

        dbo.collection(tableName).find(myQuery).toArray(function (err, item) {

            if (err) {
                reject(aTableStatus);
            }
            if (item.length > 0) {
                var getStatus = {
                    status: sStatusText,
                    msg: "data found",
                    pendingTransaction: item
                }
                aTableStatus.push({
                    tableName: tableName,
                    id: item[0]._id,
                    data: [getStatus]
                });
                resolve({
                    item: item,
                    aTableStatus: aTableStatus
                });
            }
            else {
                var getStatus = {
                    status: "fail",
                    msg: "Stock sold out",
                    data: []
                }
                reject(getStatus);
            }
        });
    });
}

function updatePromise(aUniqueId, sellerID, item) {
    return new Promise(function (resolve, reject) {
        var crud = require('./../util/crud.js');
        var mongo = require('mongodb');
        var myobj = {
            id: item[0]._id,
            uniqueNo: aUniqueId.uniqueNo,
            sellPrice: aUniqueId.sellPrice,
            warrenty: aUniqueId.warrenty
        }
        /* check the basic validation */
        var myObjFilter = {
            id: ['is_empty'],
            uniqueNo: ['is_empty'],
            sellPrice: ['is_empty'],
            warrenty: ['is_empty']
        }
        /* things which you want to update */
        var payloadObj = {
            sellPrice: aUniqueId.sellPrice,
            warrenty: aUniqueId.warrenty,
            status: 2,
            sellInvoiceID: sellerID,
            update_ts: Date.now()//getting the current ts
        }
        crud.update(global.data.table.invUnbreakableItem, myobj, myObjFilter, payloadObj).then(function (updateResponse) {
            resolve(updateResponse);
        }).catch(function (errorData) {
            reject(errorData);
            return;
        });
    });
}
function updateInventoryItemPromise(item, tableName, aTotalItems) {
    return new Promise(function (resolve, reject) {
        var sold_qty, status;
        var crud = require('./../util/crud.js');
        var mongo = require('mongodb');
        // console.log(item);
        var myobj = {
            id: item[0]._id,
            bsid: item[0].bsid,
            purchasePrice: item[0].purchasePrice,
            initialQty: item[0].initialQty
        }
        // /* check the basic validation */
        var myObjFilter = {
            id: ['is_empty'],
            bsid: ['is_empty'],
            purchasePrice: ['is_empty'],
            initialQty: ['is_empty']
        }

        // /* things which you want to update */
        // sold_qty = parseFloat(item[0].sold_qty) + parseFloat(aTotalItems.soldQuantity);
        console.log("soldqty" + item[0]);
        // console.log("soldqty" + aTotalItems.soldQuantity);
        sold_qty = item[0].sold_qty + aTotalItems.soldQuantity;
        console.log(sold_qty);
        if (sold_qty === item[0].initialQty)
            status = 2;
        if (item[0].initialQty > sold_qty)
            status = 3;
        // console.log(parseInt(item[0].initialQty - sold_qty));
        var payloadObj = {
            availableQty: item[0].initialQty - sold_qty,
            status: status,
            sold_qty: sold_qty,
            update_ts: Date.now()//getting the current ts
        }
        console.log(payloadObj);
        crud.update(tableName, myobj, myObjFilter, payloadObj).then(function (updateResponse) {
            console.log("Inventory item updated");
            resolve(updateResponse);
        }).catch(function (errorData) {
            console.log("Inventory item error");
            reject(errorData);
            return;
        });
    });
}
function rollback(rollBackData) {
    // console.log("Operations failed");
    var crud = require('./../util/crud.js');

    if (rollBackData.length > 0) {
        var connection = require('./../util/common.js');
        connection.dbConn().then(function (resp) {
            var dbo = resp.obj,
                db = resp.db;
            var rbCount = 0;
            function rollbackRecursive(rollBackData) {
                if (rollBackData[rbCount].data[0].status === "new") {
                    crud.delete(rollBackData[rbCount].tableName, rollBackData[rbCount].data[0].pendingTransaction._id).then(function (deleteResponse) {
                        console.log("newly created document deleted");
                        rbCount++;
                        if (rollBackData.length > rbCount)
                            rollbackRecursive(rollBackData);
                    });

                } else if (rollBackData[rbCount].data[0].status === "inProcess") {
                    // Update with previous data
                    var mongo = require('mongodb');
                    var myQuery = { _id: new mongo.ObjectID(rollBackData[rbCount].id) };
                    var oData = rollBackData[rbCount].data[0].pendingTransaction;
                    var payloadObj = {
                        sellPrice: oData[0].sellPrice,
                        warrenty: oData[0].warrenty,
                        status: 1,
                        sellInvoiceID: "",
                        update_ts: oData[0].update_ts
                    }
                    var newPayload = { $set: payloadObj };
                    console.log(rollBackData[rbCount].tableName);
                    console.log("rollback query:" + myQuery);
                    console.log("rollback payload:" + newPayload);
                    dbo.collection(rollBackData[rbCount].tableName).update(myQuery, newPayload, function (err, res) {
                        rbCount++;
                        if (rollBackData.length > rbCount)
                            rollbackRecursive(rollBackData);
                    });
                }
            }
            rollbackRecursive(rollBackData);
        });
    }
}