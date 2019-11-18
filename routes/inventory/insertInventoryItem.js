/**
 * inventory related insert operation are maintained here
 * @author Gunjan Bothra
 * @since 20180626
 */
module.exports = {
    /**
     * responsible for creating a db connection
     */
    insertInventoryItem: function (successData, masterData) {
        return new Promise(function (resolve, reject) {
            var mongo = require('mongodb');
            var crud = require('./../util/crud.js');
            // var inventoryData = req.body.data[1].inventoryData;
            var inventoryData = masterData.bsid;
            if (inventoryData.length) {
                var myInventoryObj = [];
                for (var i = 0; i < inventoryData.length; i++) {
                    myInventoryObj.push({
                        bsid: new mongo.ObjectID(successData.data[0]._id),
                        purchasePrice: parseInt(inventoryData[i].purchasePrice),
                        initialQty: parseInt(inventoryData[i].initialQty),
                        availableQty: parseInt(inventoryData[i].initialQty),
                        type: parseInt(inventoryData[i].type),
                        unit: inventoryData[i].unit,
                        estSellPrice: parseInt(inventoryData[i].estSellPrice),
                        productId: inventoryData[i].productId,
                        status: 1,
                        sold_qty: "",
                        create_ts: Date.now(),//getting the current ts
                        update_ts: Date.now(),
                    });
                }
                var myInventoryObjFilter = {
                    bsid: [],
                    purchasePrice: ["is_empty"],
                    initialQty: ["is_empty"],
                    availableQty: [],
                    type: ["is_empty"],
                    unit: ["is_empty"],
                    estSellPrice: ["is_empty"],
                    productId: ["is_empty"],
                    status: [],
                    sold_qty: [],
                    create_ts: [],//getting the current ts
                    update_ts: []
                }
            }
            crud.create(global.data.table.inventoryItem, myInventoryObj, myInventoryObjFilter).then(function (myInventoryObjData) {
                // response.send(myInventoryObj);
                // console.log(myInventoryObjData);
                resolve(myInventoryObjData);
            }).catch(function (errorData) {
                /* all is not well */
                reject("error" + errorData);
            });
        })
    },
    insertUnbreakableInventoryItem: function (myInventoryObjSuccess, masterData) {
        return new Promise(function (resolve, reject) {
            var mongo = require('mongodb');
            var crud = require('./../util/crud.js');

            var inventoryData = masterData.bsid;

            var unbreakableItem = [];
            for (i = 0; i < inventoryData.length; i++) {
                if (parseInt(inventoryData[i].type) === 1) {
                    var unbreakableItemArr = inventoryData[i].inventoryId;
                    for (j = 0; j < unbreakableItemArr.length; j++) {
                        unbreakableItem.push({
                            inv_it_id: new mongo.ObjectID(myInventoryObjSuccess.data[0][i]._id),
                            uniqueNo: unbreakableItemArr[j].uniqueNo,
                            availableInShop: unbreakableItemArr[j].availableInShop,
                            status: 1,
                            sellInvoiceID: "",
                            sellPrice: "",
                            warrenty: "",
                            create_ts: Date.now(),//getting the current ts
                            update_ts: Date.now(),
                        });
                    }
                }
            }
            // console.log(unbreakableItem);
            var unbreakableItemObjFilter = {
                inv_it_id: [],
                uniqueNo: ["is_empty"],
                availableInShop: ["is_empty"],
                status: [],
                sellInvoiceID: [],
                sellPrice: [],
                warrenty: [],
                create_ts: [],//getting the current ts
                update_ts: [],
            }
            crud.create(global.data.table.invUnbreakableItem, unbreakableItem, unbreakableItemObjFilter).then(function (unbreakableData) {
                // response.send(myInventoryObj);
                // console.log(myInventoryObjData);
                resolve(unbreakableData);
            }).catch(function (errorData) {
                /* all is not well */
                reject("error" + errorData);
            });
        })
    }
}