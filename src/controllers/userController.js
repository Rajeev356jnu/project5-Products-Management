const userModel = require('../models/userModel')
const jwt = require("jsonwebtoken");
const { default: mongoose } = require('mongoose');
const objectId=mongoose.Types.ObjectId
const bcrypt=require('bcrypt')
const aws=require('../aws/aws')

const isValid = function(value) {

    if (!value || typeof value != "string" || value.trim().length == 0) return false;
    return true;
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const createUser = async function(req, res) {
        try {
            const data = req.body
            const files=req.files
            let { fname, lname, email, profileImage, phone, password, address } = data
    
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
            // if (!isValid(profileImage)) {
            //     return res.status(400).send({ status: false, message: "Profile Image is required" })
            // }
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
            if (password.length < 8 || password.length>15) {
                return res.status(400).send({ status: false, message: "Your password must be at least 8 characters" })
            }
           
            data.address = JSON.parse(address)
           
            const salt = await bcrypt.genSalt(10);
            // now we set user password to hashed password
            data.password = await bcrypt.hash(password, salt);
            if (!(files && files.length > 0)) {
                return res.status(400).send({ status: false, message: "Please provide your image" })
            }
            
            data.profileImage = await aws.uploadFile(files[0])
            const userCreated = await userModel.create(data)
            res.status(201).send({ status: true, message: "User Created Successfully", data: userCreated })
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}


const loginUser = async function(req, res) {
    try {
        const data = req.body;
        let {email,password}=data
        if (!Object.keys(data).length) return res.status(400).send({ status: false, msg: "Please Provides the Details" })

        let regex = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
        // let regex1 = /^(?=.?[A-Z])(?=.?[a-z])(?=.?[0-9])(?=.?[#?!@$%^&*-]).{8,15}$/
       

       
        if (!isValid(email)) {
            res.status(400).send({ status: false, message: "Email is required" })
            return
        }

        if (!regex.test(email)) {
            res.status(400).send({ status: false, message: "Email should be a valid email address" })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, message: "password is required" })
            return
        }
      
        // if (!regex1.test(password)) {
        //     res.status(400).send({ status: false, message: "password is invalid" })
        //     return
        // }

        const user = await userModel.findOne({ email:email});
        if (!user) {
            res.status(400).send({ status: false, message: "Invalid email credentials" });
            return
        }
        let checkPassword = await bcrypt.compare(password,user.password)
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
        res.status(200).send({ status: true, message: "User successfully logged in", data:{userId:`${user._id}`,token:token} })
    }

    catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }
}

const getUserProfile=async function (req,res) {
    try {
        const userId=req.params.userId
        if (Object.keys(userId)==0) { 
           return res.status(400).send({status:false,message:'kindly provide userid in params path'})  
        }
        const resultData=await userModel.findById(userId)
        const isValidId=objectId.isValid(userId)
        if (!isValidId) {
           return res.status(400).send({status:false,message:'userid is invalid'}) 
        }
        if (!resultData) {
           return res.status(400).send({status:false,message:'userid does not exist'})  
        }
        return res.status(200).send({status:true,message:'User created successfully',data:resultData})
    } catch (error) {
        res.status(500).send({ status: false, error: err.message });
    }
}


const updateUserProfile=async function (req,res) {
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



module.exports = {createUser,loginUser,getUserProfile,updateUserProfile}
