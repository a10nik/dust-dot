var jwt = require('jsonwebtoken');
let expressJwt = require("express-jwt");

class Authentication {
    constructor(secret) {
        this.secret = secret;
    }

    middleware() {
        return expressJwt({ secret: this.secret, credentialsRequired: false});
    }

    sign(obj) {
        return jwt.sign(obj, this.secret, {expiresIn: "2 days"});
    }

    decode(token) {
        return jwt.decode(token, this.secret);
    }
}

module.exports = Authentication;