/**
 * All the routes goes here
 * @author Gunjan Bothra and Sandeep G
 * @since 20180222
 */
app = require('../app');

var shopMgmt = require('./shop/shop.mgmt');
var brandMgmt = require('./brand/brand.mgmt');
var itemMgmt = require('./item/item.mgmt');
var customerMgmt = require('./customer/customer.mgmt');
var sellerMgmt = require('./seller/seller.mgmt');
var attributeMgmt = require('./attribute/attribute.mgmt');
var attributeValueMgmt = require('./attribute/attributeValue.mgmt');
var modelMgmt = require('./model/model.mgmt');
var userMgmt = require('./user/user.mgmt');
var sessionMgmt = require('./user/session.mgmt');
//var userValidation = require('./util/userValidation');
//var userActivity = require('./util/userActivity.js');
var autoComplete = require('./util/autoComplete.js');
//var validateInventoryMaster = require('./util/validateInventoryMaster.js');
var inventoryMasterMgmt = require('./inventory/inventoryMaster.mgmt');
// var inventoryItemMgmt = require('./inventory/insertinventoryItem');
var inventoryStockMgmt = require('./inventory/inventoryStock.mgmt');
var invoiceMgmt = require('./inventory/invoice.mgmt');
var revenueMgmt = require('./revenue/profitLoss.mgmt');
MongoClient = require('mongodb').MongoClient;

global.baseUrl = "mongodb://localhost:27017/";
global.data = {
    table: {
        brand: 'brand',
        item: 'item',
        model: 'model',
        product: 'product',
        shop: 'shop',
        userActivity: 'user_activity',
        userInfo: 'user_info',
        userShopInfo: 'user_shop_info',
        seller: 'seller',
        attribute: 'attribute',
        attributevalue: 'attribute_value',

        /* inventory tables goes here */
        buyStock: 'buy_stock',
        inventoryItem: 'inventory_item',
        invUnbreakableItem: 'inv_unbreakable_item',
        //   invUnbreakableSellItem: 'inv_unbreakable_sell_item',
        invBreakableItem: 'inv_breakable_item',
        // invBreakableSellItem: 'inv_unbreakable_sell_item',
        customerInvoice: 'customer_invoice',

        seller: 'seller',
        customer: 'customer'
    }
}
url = global.baseUrl;
global.isDev = true;

/*****************************************************************
 * The Amazing Authentication Process!
 * 1. check the token
 * 1a. token expired(5 mins) > logout process
 * 1b. token invalidate/not exists > return false
 * 1c. token valid > next()
 *****************************************************************/

/**
 * In this section we will do the basic authentication processes
 * @todo: basic authentication process, GET, DETAILS
 */
app.delete("/*", function (req, res, next) {

    if (global.isDev) {
        next();
        return;
    }

    var userAuth = require('./util/userAuthentication.js');
    userAuth.userAuthentication(req).then(function (res) {
        console.log("auth");
        next();

    }, function (err) {//DB or technical error
        console.log('Caught an error!', err);
        return;
    });
    // next();
});

app.post("/*", function (req, res, next) {

    if (global.isDev) {
        next();
        return;
    }
    /**
     * 1. get the header token(req.header.token)
     * 2. make internal api call, to check token exists && status == 1 && user_permission == 1
     * 3. if(authenticated) > next(); //proceed to actual POST call  
     */
    /* when authenticated */

    var loginUrl = req.url;
    if (loginUrl.indexOf("login") >= 0) {
        console.log("Login");
        next();
    } else {
        console.log("test shop");
        var userAuth = require('./util/userAuthentication.js');
        userAuth.userAuthentication(req).then(function (res) {
            console.log("auth");
            next();

        }, function (err) {//DB or technical error
            res.send(err);

            return;
        });
    }
});
app.get("/*", function (req, res, next) {

    if (global.isDev) {
        next();
        return;
    }
    //  console.log("zzzzzzzzzzzzzzz");
    var userAuth = require('./util/userAuthentication.js');
    userAuth.userAuthentication(req).then(function (res) {
        console.log("auth");
        next();

    }, function (err) {//DB or technical error
        console.log('Caught an error!', err);
        return;
    });
    // next();
});

/*******************************************************************
 * all the routings are defined here
 * @author Gunjan, Sandeep
 * @since 20180312
 *******************************************************************/

/*  APIS related to user */
app.post('/user/add_user', userMgmt.addUser);
app.post('/user/login', userMgmt.login);
app.post('/user/logout', sessionMgmt.logout);
app.get('/user', userMgmt.get);
app.get('/user/:page/:resultperpage', userMgmt.get);
// app.post('/user/change_password', userMgmt.changePassword);
// app.post('/user/forget_password', userMgmt.forgetPassword);

// /*  APIS related to shop */
app.post('/shop/create', shopMgmt.create);
app.post('/shop/edit', shopMgmt.edit);
app.post('/shop/staus_change', shopMgmt.stausChange);
app.delete('/shop', shopMgmt.delete);
app.get('/shop', shopMgmt.get);
app.get('/shop/:page/:resultperpage', shopMgmt.get);
app.get('/shop/:id', shopMgmt.detail);

// /*  APIS related to brand */
app.post('/brand/create', brandMgmt.create);
app.post('/brand/edit', brandMgmt.edit);
app.post('/brand/staus_change', brandMgmt.stausChange);
app.delete('/brand', brandMgmt.delete);
app.get('/brand', brandMgmt.get);
app.get('/brand/:page/:resultperpage', brandMgmt.get);
app.get('/brand/:id', brandMgmt.detail);

// /*  APIS related to model */
app.post('/model/create', modelMgmt.create);
app.post('/model/edit', modelMgmt.edit);
app.post('/model/staus_change', modelMgmt.stausChange);
app.delete('/model', modelMgmt.delete);
app.get('/model', modelMgmt.get);
app.get('/model/:page/:resultperpage', modelMgmt.get);
app.get('/model/:id', modelMgmt.detail);

// /*  APIS related to item */
app.post('/item/create', itemMgmt.create);
app.post('/item/edit', itemMgmt.edit);
app.post('/item/staus_change', itemMgmt.stausChange);
app.delete('/item', itemMgmt.delete);
app.get('/item', itemMgmt.get);
app.get('/item/:page/:resultperpage', itemMgmt.get);
app.get('/item/:id', itemMgmt.detail);

/* Sandeep: APIs related to customer[CRUD] */
app.get('/customer', customerMgmt.get);
app.post('/customer/create', customerMgmt.create);
app.post('/customer/edit', customerMgmt.edit);
app.get('/customer/:id', customerMgmt.detail);
app.post('/customer/status', customerMgmt.stausChange);

/* Sandeep: APIs related to seller[CRUD] */
app.get('/seller', sellerMgmt.get);
app.post('/seller/create', sellerMgmt.create);
app.post('/seller/edit', sellerMgmt.edit);
app.get('/seller/:id', sellerMgmt.detail);
app.post('/seller/status', sellerMgmt.stausChange);

/* Sandeep: APIs related to attribute[CRUD] */
app.get('/attribute', attributeMgmt.get);
app.post('/attribute/create', attributeMgmt.create);
app.post('/attribute/edit', attributeMgmt.edit);
app.get('/attribute/:id', attributeMgmt.detail);
app.post('/attribute/status', attributeMgmt.stausChange);

/* Sandeep: APIs related to attribute value[CRUD] */
app.get('/attributevalue', attributeValueMgmt.get);
app.post('/attributevalue/create', attributeValueMgmt.create);
app.post('/attributevalue/edit', attributeValueMgmt.edit);
app.get('/attributevalue/:id', attributeValueMgmt.detail);
app.post('/attributevalue/status', attributeValueMgmt.stausChange);

//search autocomplete->seller, customer, product, shop , user
app.get('/seller/search', autoComplete.sellerSearch);
app.get('/customer/search', autoComplete.customerSearch);
app.get('/product/search', autoComplete.productSearch);
app.get('/shop/search', autoComplete.shopSearch);
app.get('/user/search', autoComplete.userSearch);

// app.post('/seller/sellerValidate', validateInventoryMaster.sellerValidate); 
//API to Insert buyStock, inventoryItem and unbreakableItem data
app.post('/buy_stock/create', inventoryMasterMgmt.create);

//API to get AvailableUnbreakableItemDetail
app.get('/unbreakableStock/:productId', inventoryStockMgmt.get);
app.get('/unbreakableAvailableStock/:productId', inventoryStockMgmt.getAvailableStock);
app.get('/breakableStock/:productId', inventoryStockMgmt.getBreakableAvailableStock);

app.post('/invoice/create', invoiceMgmt.create);
app.get('/calculate/profitLoss', revenueMgmt.profitLoss);