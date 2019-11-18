/**
 * responsible for managing the inventory master data in the database
 * @author Gunjan Bothra
 * @since 20180626
 */

exports.create = function (req, response) {
    var crud = require('./../util/crud.js');
    var inventoryItem = require('./../inventory/insertInventoryItem.js');
    /* now call the generic method to create */

    /* validating the payload */
    //Master Data 

    var masterData = req.body.data[0].masterData;
    var myobj = {
        sellerId: masterData.sellerId,
        orderDate: Date(masterData.orderDate),
        deliveryDate: Date(masterData.deliveryDate),
        totalAmount: parseInt(masterData.totalAmount),
        tax: parseInt(masterData.tax),
        buyInvoiceId: masterData.buyInvoiceId,
        recipientId: masterData.recipientId,
        adminId: masterData.adminId,
        deliveryAddress: masterData.deliveryAddress,
        shopId: masterData.shopId,
        status: 1,
        create_ts: Date.now(),//getting the current ts
        update_ts: Date.now(),
    }

    /* check the basic validation */
    var myObjFilter = {
        sellerId: ["is_empty"],
        orderDate: ["is_empty"],
        deliveryDate: [],
        totalAmount: ["is_empty"],
        tax: [],
        buyInvoiceId: [],
        recipientId: ["is_empty"],
        adminId: [],
        deliveryAddress: [],
        shopId: [],
        status: [],
        create_ts: [],//getting the current ts
        update_ts: [],
    }

    crud.create(global.data.table.buyStock, myobj, myObjFilter).then(function (successData) {

        if (successData.status) {
            inventoryItem.insertInventoryItem(successData, masterData).then(function (myInventoryObjData) {
                console.log("myInventoryObjData", myInventoryObjData.data[0]);
                console.log("Alpha #1");
                // response.send(myInventoryObjData);

                if (myInventoryObjData.status) {
                    console.log("Alpha #1a");
                    // response.send(myInventoryObj);
                    // console.log("Inventory item inserted");
                    inventoryItem.insertUnbreakableInventoryItem(myInventoryObjData, masterData).then(function (unbreakableData) {
                        console.log("Alpha #1c");
                        response.send(unbreakableData);
                    }).catch(function (errorData) {
                        console.log("Alpha #1d");
                        /* all is not well */
                        response.send(errorData);
                    });
                }
            }).catch(function (errorData) {
                console.log("Alpha #1b");
                /* all is not well */
                response.send(errorData);
            });
        }
    }).catch(function (errorData) {
        console.log("Alpha #2");
        /* all is not well */
        response.send(errorData);
    });
}
