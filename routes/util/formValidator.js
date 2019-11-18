/**
 * responsible for validating the API valued
 * @since 20180327
 * @author Gunjan Bothra
 */
module.exports = {

    /**
    * responsible for all the vaidation
    * @param queryObj = {name:'sandeep', email: 'sandeep@mail.com'}
    * @param validateObj = {name:['is_empty', 'min'], email: ['is_empty', 'is_mail']}
    * @return true || {name: {msg: "name is a mandatory field"}}
    */
    validate: function (myobj, objValid) {
        var validator = require('validator');
        var finalValue = {};
        //   console.log(myobj);
        for (var key in myobj) {
            var value = myobj[key];
            var typeofValid = objValid[key];
            if (!typeofValid)
                continue;

            for (var i = 0; i < typeofValid.length; i++) {

                //validate mandatory fields
                // if (typeofValid[i] === "is_empty") {
                //     if (isNaN(value) && typeof value != 'string') {
                //         finalValue[key] = { msg: key + " can not be empty. #1" }
                //         break;
                //     }
                //     if (typeof value != "number" && (value == "NaN" || value == undefined || validator.isEmpty(value))) {
                //         finalValue[key] = { msg: key + " can not be empty. #2" }
                //         break;
                //     }
                // }
                //validate password length
                if (typeofValid[i] === "isPassword") {
                    if (!validator.isByteLength(value, { min: 8 })) {
                        finalValue[key] = { msg: key + " must be 8 characters." }
                        break;
                    }
                }

                if (typeofValid[i] === "isMobile") {
                    if (!validator.isByteLength(value, { min: 10, max: 14 })) {
                        finalValue[key] = { msg: key + " must be atleast 10 digits." }
                        break;
                    }
                }
                if (typeofValid[i] === "isOnlyEmail") {
                    if (!validator.isEmail(value))
                        finalValue[key] = { msg: key + " is an invalid email id." }
                }
                // validate email and user id
                if (typeofValid[i] === "isEmail") {
                    var regex = new RegExp("^[a-zA-Z0-9_.]*$");
                    var isEmailValidate, isValidUser;
                    if (value.includes("@")) {
                        isEmailValidate = validator.isEmail(value);
                        if (!isEmailValidate) {
                            finalValue[key] = { msg: "Enter valid " + key }
                            break;
                        }
                    }
                    /* validate uname[special charactetrs(except underscore or dot), space not allowed] */
                    else if (regex.test(value)) {
                        isValidUser = true;
                    }
                    else {
                        finalValue[key] = { msg: "Enter valid " + key }
                        break;
                    }
                }
            }

        }
        // console.log(finalValue);
        return finalValue;
    }
}