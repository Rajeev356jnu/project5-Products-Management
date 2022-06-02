const jwt = require('jsonwebtoken');
const { default: mongoose } = require("mongoose");
const userModel = require('../models/userModel');


//----------------------------------------authentication----------------------------------------------------*/

const authentication = async(req, res, next) => {
        try {
            const token = req.header('Authorization', 'Bearer Token')
            console.log('token: ',token)
            if (!token) {
                return res.status(400).send({ status: false, message: 'Missing required token in request' })
            }
            const validToken = token.split(' ')
            console.log('validtoken',validToken)
            const decodedToken = jwt.verify(validToken[1], "securedprivatekey")
            console.log('decodetoken',decodedToken)
            if (!decodedToken) {
                return res.status(403).send({ status: false, message: 'Invalid token' })
            }
            let exp = decodedToken.exp
            let iatNow = Math.floor(Date.now() / 1000)
            if (exp < iatNow) {
                return res.status(401).send({ status: false, message: 'session expired, please login again' })
            }
            req.decodedToken = decodedToken;
            req.userId = decodedToken.userId
            next()

        } catch (err) {
            console.log(err.massage)
            res.status(500).send({ status: false, message: err.message })
        }
    }
    //--------------------------------------authentication end----------------------------------------------------*/

//----------------------------------------authorization----------------------------------------------------*/

let authorization = async(req, res, next) => {
    try {

        let userId = req.params.userId
        const decodedToken = req.decodedToken

        if (!userId) {
            return res.status(400).send({ status: false, message: 'user Id is must be present !!!!!!!' });

        } else if (mongoose.Types.ObjectId.isValid(userId) == false) {
            return res.status(400).send({ status: false, message: "user id is not valid !!!!!!" });

        }

        let userById = await userModel.findOne({ _id: userId})

        if (!userById) {
            return res.status(404).send({ status: false, message: 'user Id is not found  !!!!!!!' });

        } else if (decodedToken.userId != userById.userId) {
            return res.status(403).send({ status: false, message: 'unauthorized access' });

        }
        next();
    } catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { authentication, authorization }

//------------------------------------authorization end ----------------------------------------------------*/