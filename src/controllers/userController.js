const userModel = require('../models/userModel')
const jwt = require("jsonwebtoken");

//validation.....................................................................
const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'Number' && value.toString().trim().length === 0) return false
    return true
}


const createUser = async function(req, res) {
    try {

    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}

const loginUser = async function(req, res) {
    try {
        const data = req.body;
        if (!Object.keys(data).length) return res.status(400).send({ status: false, msg: "Please Provides the Details" })

        let regex = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
        let regex1 = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/
       

       
        if (!isValid(data.email)) {
            res.status(400).send({ status: false, message: "Email is required" })
            return
        }

        if (!regex.test(data.email)) {
            res.status(400).send({ status: false, message: "Email should be a valid email address" })
            return
        }

        if (!isValid(data.password)) {
            res.status(400).send({ status: false, message: "password is required" })
            return
        }
      
        if (!regex1.test(data.password)) {
            res.status(400).send({ status: false, message: "password is invalid" })
            return
        }

        const user = await userModel.findOne({ email:data.email});
        if (!user) {
            res.status(400).send({ status: false, message: "Invalid email credentials" });
            return
        }
        let checkPassword = await bcrypt.compare(data.password,user.password)
        if (!checkPassword) return res.status(400).send({ status: false, msg: " Invalid password credentials" })

        
        const token = jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
        }, 'securedprivatekey')
        res.header('x-user-key', token)
        const userData = {
            userId: user._id,
            token: token
        }
        res.status(200).send({ status: true, message: "User successfully logged in", data: userData })
    }

    catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }
}





module.exports = {
    createUser,
    loginUser
}


