function validateAddUser(req, dbo, response, db, validator, uname) {
    /* validate email */
    if(uname.includes("@")){
    var isValidate = validator.validate(uname);
    if(isValidate){
        var myQuery = { uname: uname };
       // console.log(myQuery);
        dbo.collection("user_info").find(myQuery).project({ uname: 1 }).toArray(function (err, res) {
            if (err) throw err;
            response.send({ result: res });
          //  console.log(res);
         //   console.log(req.connection.remoteAddress);
            if(res.length > 0){
                console.error("User Already exist");
            }
            else {
            }
          //  db.close();
        });
}
    }
    /* validate uname[special charactetrs(except underscore or dot), space not allowed] */
}