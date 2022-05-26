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






















//---------------------------------------Update Product-------------------------------------------------------------------//
const updateProduct = async (req, res) => {
    try {
        let productId = req.params.productId
        if (!isValidObjectId(productId)) { 
            return res.status(400).send({ status: false, message: " productId is not valid" })}
    const productFind = await productModel.findOne({ _id: productId, isDeleted: false });
    if (!productFind) { return res.status(400).send({ status: false, msg: "No product found with this productId" }) }
    let data = req.body
    if (!Object.keys(data).length) { return res.status(400).send({ status: false, msg: " provide some data" }) }
    let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data

    if ("title" in data) {
        if (!isValid(title)) {
         return res.status(400).send({ status: false, Message: "title is required" })}}
        //  -----------------------check title duplicacy----------------------------//
        let titleCheck = await productModel.findOne({ title: title })
        if (titleCheck) return res.status(400).send({ status: false, msg: 'Title  already exists' })

         if ("description" in data) {
            if (!isValid(description)) {
             return res.status(400).send({ status: false, Message: "description is required" })}}
    
         if ("price" in data) {
                if (!isValid(price)) {
                 return res.status(400).send({ status: false, Message: "price is required" })}}

        if ("currencyId" in data) {
                    if (!isValid(currencyId)) {
                     return res.status(400).send({ status: false, Message: "currencyId is required" })}}

        if ("currencyFormat" in data) {
                        if (!isValid(currencyFormat)) {
                         return res.status(400).send({ status: false, Message: "currencyFormat is required" })}}

     if ("style" in data) {
                            if (!isValid(style)) {
                             return res.status(400).send({ status: false, Message: "style is required" })}}

    if ("installments" in data) {
                                if (!isValid(installments)) {
                                 return res.status(400).send({ status: false, Message: "installments is required" })}}
    
     if ("productImage" in data) {
         
    let files= req.files
    if(files && files.length>0){
    let productImage= await uploadFile( files[0] )}}

    if ("availableSizes" in data) {
        if (!isValid(availableSizes)) {
         return res.status(400).send({ status: false, Message: "availableSizes is required" })}

         let availableSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
         availableSizes= JSON.parse(availableSizes)
        
             let sizeArr = availableSizes.split("").map(x => x)
             for (let i = 0; i < sizeArr.length; i++) {
                 if (!(availableSizes.includes(sizeArr[i]))) {
                     return res.status(400).send({ status: false, message: `availableSizes should be among [${availableSizes}]` })
                 }
             }}

     if ("isFreeShipping" in data) {
                if (!isValid(isFreeShipping)) {
                 return res.status(400).send({ status: false, Message: "isFreeShipping is required" })}}
     if (!((isFreeShipping === "true") || (isFreeShipping === "false"))) {

     return res.status(400).send({ status: false, message: 'isFreeShipping should be a boolean value' })}

     let updateProduct = await productModel.findOneAndUpdate({ _id: productId },
        {
            $set:
            {
                title: title,
                description: description,
                price: price,
                currencyId: currencyId,
                currencyFormat: currencyFormat,
                style: style,
                installments: installments,
                productImage: productImage,
                availableSizes: availableSizes,
                isFreeShipping: isFreeShipping
            }
        }, { new: true })
    return res.status(200).send({ status: true, data: updateProduct })
}
catch (error) {
    return res.status(500).send({ status: false, error: error.message })
}
}

                





                                   

                                 

                         
        
        

        





    
           
        
