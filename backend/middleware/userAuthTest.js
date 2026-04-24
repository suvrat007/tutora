const jwt = require('jsonwebtoken');
const Admin = require( "../models/Admin.js");

const userAuth = async (req, res, next) => {
    try {
        // ALWAYS FAKE ALLOW FOR TESTING
        req.user = { _id: '6862f05f382e7504b8ea4bce' };
        return next();
    } catch(err) {
        res.status(401).send(err.message);
    }
}

module.exports = userAuth;
