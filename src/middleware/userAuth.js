const jwt = require('jsonwebtoken');
// const { default: mongoose } = require("mongoose");
// const userModel = require('../models/userModel');

const userAuth=async (req,res,next)=>{
    try {
        const token=req.header('Authorization','Bearer token')
        if (!token) {
            return res.status(400).send({status:false,message:'Missing required token in request'})
        }
        const validToken=token.split(' ')
        const decodedToken=jwt.verify(validToken[1],"group44")
        if (!decodedToken) {
            return res.status(403).send({status:false,message:'Invalid token'})
        }

        req.userId=decodedToken.userId
        next()
    } catch (error) {
        return res.status(500).send({ status:'error',msg: error.message });
    }
}

module.exports={userAuth}