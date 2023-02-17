const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
require ('dotenv').config();
module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    // console.log (authorization);
    if (!authorization) {
        return res.status(401).send({ error: 'Key not given.' });
    }
    const token = authorization.replace('Bearer ', '');
    // console.log(token);
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
        if (err) {
            return res.status(401).send({ error: 'You must be logged in, Token Invalid' });
        }
        const { _id } = payload;
        User.findById(_id).then((userdata) => {
            req.user = userdata;
            next();
        });

    });
};