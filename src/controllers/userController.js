const userModel = require('../models/userModel')
const jwt = require("jsonwebtoken");
const { default: mongoose } = require('mongoose');
const objectId = mongoose.Types.ObjectId
const bcrypt = require('bcrypt')
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

//---------------------------------------Create User-------------------------------------------------------------------//
const createUser = async function(req, res) {
    try {
        const data = req.body
        const files = req.files
        let { fname, lname, email, phone, password, address } = data

        const phoneValidator = /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/

        const emailValidator = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Body is required" })
        }

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "First Name is required" })
        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "Last Name is required" })
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" })
        }

        if (!emailValidator.test(email)) {
            return res.status(400).send({ status: false, message: "plz enter a valid Email" });
        }

        const isRegisteredEmail = await userModel.findOne({ email }).lean();
        if (isRegisteredEmail) {
            return res.status(400).send({ status: false, message: "email id already registered" });
        }
        if (!isValidFiles(files)) {
            return res.status(400).send({ status: false, message: "Profile Image is required" })
        }
        if (!(phone)) {
            return res.status(400).send({ status: false, message: "Phone No. is required" })
        }

        if (!phoneValidator.test(phone)) {
            return res.status(400).send({ status: false, message: "plz enter a valid Phone no" });
        }

        const isRegisteredphone = await userModel.findOne({ phone }).lean();

        if (isRegisteredphone) {
            return res.status(400).send({ status: false, message: "phoneNo. number already registered" });
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password is required" })
        }
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "Your password must be at least 8 characters or not more than 15 charcters" })
        }
        if (!isValid(address)) {
            return res.status(400).send({ status: false, message: "Address is required" })
        }

        let parseaddress = JSON.parse(address)

        if (parseaddress) {
            if (parseaddress.shipping != undefined) {
                if (parseaddress.shipping.street != undefined) {
                    if (typeof parseaddress.shipping.street != 'string' || parseaddress.shipping.street.trim().length == 0) {
                        return res.status(400).send({ status: false, message: "street can not be a empty string in shipping address" })
                    }
                }

                if (parseaddress.shipping.city != undefined) {
                    if (typeof parseaddress.shipping.city != 'string' || parseaddress.shipping.city.trim().length == 0) {
                        return res.status(400).send({ status: false, message: "city can not be a empty string in shipping address" })
                    }
                }

                if (parseaddress.shipping.pincode != undefined) {
                    if (parseaddress.shipping.pincode.toString().trim().length == 0 || parseaddress.shipping.pincode.toString().trim().length != 6) {
                        return res.status(400).send({ status: false, message: "Pincode can not be a empty string or must be 6 digit number in shipping address" })
                    }
                }
            } else {
                return res.status(400).send({ status: false, Message: "Please Provide your shipping address" })
            }
            if (parseaddress.billing != undefined) {
                if (parseaddress.billing.street != undefined) {
                    if (typeof parseaddress.billing.street != 'string' || parseaddress.billing.street.trim().length == 0) {
                        return res.status(400).send({ status: false, message: "street can not be a empty string in billing address" })
                    }
                }

                if (parseaddress.billing.city != undefined) {
                    if (typeof parseaddress.billing.city != 'string' || parseaddress.billing.city.trim().length == 0) {
                        return res.status(400).send({ status: false, message: "city can not be a empty string in billing address" })
                    }
                }

                if (parseaddress.billing.pincode != undefined) {
                    if (parseaddress.billing.pincode.toString().trim().length == 0 || parseaddress.billing.pincode.toString().trim().length != 6) {
                        return res.status(400).send({ status: false, message: "Pincode can not be a empty string or must be 6 digit number in billing address " })
                    }
                }
            } else {
                return res.status(400).send({ status: false, Message: "Please Provide your shipping address" })
            }
        }
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(password, salt);
        data.profileImage = await aws.uploadFile(files[0])

        const userData = { fname: fname, lname: lname, profileImage: data.profileImage, email: email, phone: phone, password: data.password, address: parseaddress }

        const userCreated = await userModel.create(userData)
        res.status(201).send({ status: true, message: "User Created Successfully", data: userCreated })
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}

//---------------------------------------Login User-------------------------------------------------------------------//

const loginUser = async function(req, res) {
    try {
        const data = req.body;
        let { email, password } = data
        if (!Object.keys(data).length) return res.status(400).send({ status: false, msg: "Please Provides the Details" })

        const emailValidator = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" })
        }

        if (!emailValidator.test(email)) {
            return res.status(400).send({ status: false, message: "Email should be a valid email address" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }

        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(400).send({ status: false, message: "Invalid email credentials" });
        }
        let checkPassword = await bcrypt.compare(password, user.password)
        if (!checkPassword) return res.status(400).send({ status: false, msg: " Invalid password credentials" })


        const token = jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
        }, 'securedprivatekey')
        res.header('Authorisation', token)
        const userData = {
            userId: user._id,
            token: token
        }
        return res.status(200).send({ status: true, message: "User successfully logged in", data: userData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const getUserProfile = async function(req, res) {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'userid is invalid' })
        const resultData = await userModel.findById(userId)
        if (!resultData) {
            return res.status(400).send({ status: false, message: 'userid does not exist' })
        }
        return res.status(200).send({ status: true, message: 'User Details', data: resultData })
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}


const updateUserProfile = async function(req, res) {
    try {
        // const data=req.body
        // const userIdFromToken=req.userId
        // const userId=req.params.userId
        // const files=req.files

        // if (files) {
        //     if (files && files.length>0) {
        //         // const uploadedFileUrl=await 
        //     }
        // }
    } catch (error) {
        res.status(500).send({ status: false, error: err.message });
    }
}



module.exports = { createUser, loginUser, getUserProfile, updateUserProfile }