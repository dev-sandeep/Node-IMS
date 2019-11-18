
/*
 * GET users listing.
 */

exports.list = function (req, res) {
  res.send({ users: ["sandeep", "gunjan"] });
};