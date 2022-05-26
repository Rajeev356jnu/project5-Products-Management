const userModel = require('../models/productModel')
const { default: mongoose } = require('mongoose');
const aws = require('../aws/aws')

//---------------------------------------Valid Functions-------------------------------------------------------------------//
const isValid = function(value) {

    if (!value || typeof value != "string" || value.trim().length == 0) return false;
    return true;
}
const isValidFiles = (files) => {
    if (files && files.length > 0)
        return true;
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


//---------------------------------------Create Product-------------------------------------------------------------------//