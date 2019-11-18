
/**
 * an example for request
 * example url params: req?name=sandeep&colg=arya&laptop=dell
 * output: {"name": "sandeep","colg": "arya","laptop": "dell"}
 */
exports.demoParams = function (req, res) {
    console.log(req.query);
    res.send(req.query);
};

/**
 * an example for request getting the ID
 * example url params: /req/sandeep
 * output: sandeep
 */
exports.demoParamsWithId = function (req, res) {
    console.log(req.params);
    res.send(req.params['name']);
};

