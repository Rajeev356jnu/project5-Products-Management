const userModel = require('../models/userModel')
const jwt = require("jsonwebtoken");


const createUser = async function(req, res) {
    try {

    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}

const loginUser = async function(req, res) {
    try {

    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}



module.exports = {
    createUser,
    loginUser
}