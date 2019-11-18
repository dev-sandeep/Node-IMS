// Not used anywhere
/**
 * responsible for doing all the validations 
 * @author Sandeep G
 * @since 20180324
 */

module.exports = {
    /**
     * responsible for all the vaidation
     * @param queryObj = {name:'sandeep', email: 'sandeep@mail.com'}
     * @param validateObj = {name:['is_empty', 'min'], email: ['is_empty', 'is_mail']}
     * @return true || {name: {msg: "name is a mandatory field"}}
     */
    test: function (queryObj, validateObj) {
        var validator = require('validator');
        var status = true;
        var finalObj = {};
        var currentValidateType = '';
        var currentValue = '';

        // if (!validator.isByteLength(req.body.name, { min: 1 }))
        //     return false;

        /* first parse the main object which is having value */
        for (var key in queryObj) {
            /* now parse the asked validation */
            for (var i = 0; i < validateObj[key].length; i++) {
                currentValidateType = validateObj[key][i];
                currentValue = queryObj[key];
                /* now all the core validations goes here */
                /* check is_empty */
                if (currentValidateType == 'is_empty') {
                    if (validator.isEmpty(currentValue)) {
                        finalObj[key] = { msg: key + " can not be empty." }
                    }
                }
                /* check is_email */
                if (currentValidateType == 'is_email') {
                    if (!validator.isEmail(currentValue))
                        finalObj[key] = { msg: key + " is an invalid email id." }
                }

                /* check is_alpha_numeric */
                if (currentValidateType == 'is_alpha_numeric') {
                    if (!validator.isAlphanumeric(currentValue))
                        finalObj[key] = { msg: "only alpha numeric values are allowed in " + key }
                }

                /* @dear coder now add as many validators you like */
                /* but make sure you follow the samw format */
                /* check is_empty */
                /* check is_empty */
                /* check is_empty */
                /* check is_empty */
                /* check is_empty */
                /* check is_empty */
            }
        }

        return finalObj;
    }
}