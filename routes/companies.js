
/*
 * GET users listing.
 */

exports.list = function (req, res) {
    res.send({ companies: ["SAP", "IBM", "GOOGLE"] });
};