const productModel = require('../models/productModel')
const { default: mongoose } = require('mongoose');
// const moment = require('moment')
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

const createProduct = async function(req, res) {
    try {
        const data = req.body
        const files = req.files
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data

        const priceValidator = /^(?:0|[1-9]\d*)(?:\.(?!.*000)\d+)?$/

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Body is required" })
        }

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "title is required" })
        }

        let isRegisteredTitle = await productModel.findOne({ title }).lean();

        if (isRegisteredTitle) {
            return res.status(400).send({ status: false, message: "Title already registered" });
        }
        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "Description is required" })
        }
        if (!isValid(price)) {
            return res.status(400).send({ status: false, message: "price is required" })
        }

        if (!priceValidator.test(price)) {
            return res.status(400).send({ status: false, message: "plz enter a valid Price" });
        }
        if (!isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "CurrencyId is required" })
        }
        if (currencyId !== 'INR') {
            return res.status(400).send({ status: false, message: "CurrencyId Should be in INR" })
        }
        if (!isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "CurrencyFormat is required" })
        }
        if (currencyFormat !== '₹') {
            return res.status(400).send({ status: false, message: "Currency Format Should be in ₹" })
        }

        if (!isValidFiles(files)) {
            return res.status(400).send({ status: false, message: "Product Image is required" })
        }
        if (!isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "Available sizes is required or at least provide one size" })
        }
        if (availableSizes) {
            var availableSize = availableSizes.toUpperCase().split(",") //Creating an array
            if (availableSize.length === 0) {
                return res.status(400).send({ status: false, message: "Please provide product sizes" })
            }
            for (let i = 0; i < availableSize.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"]).includes(availableSize[i])) {
                    return res.status(400).send({ status: false, message: 'Sizes should be ${["S", "XS", "M", "X", "L", "XXL", "XL"]}' })
                }
            }
        }
        if (installments) { if (!installments.match(/^\d*\.?\d*$/)) return res.status(400).send({ status: false, message: "Installment must be an integer" }) }


        productImage = await aws.uploadFile(files[0])

        const productData = { title: title, description: description, price: price, currencyId: currencyId, currencyFormat: currencyFormat, isFreeShipping: isFreeShipping, productImage: productImage, style: style, availableSizes: availableSize, installments: installments }

        const productCreated = await productModel.create(productData)
        res.status(201).send({ status: true, message: "Product Created Successfully", data: productCreated })
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}


const getproductsById = async function(req, res) {
    try {
        const productId = req.params.productId

        if (!productId) {
            return res.status(400).send({ status: false, message: "Product-Id is required" })
        }

        if ((!isValidObjectId(productId))) {
            return res.status(400).send({ status: false, message: "Invalid Product-Id" });
        }

        const isproductInDB = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!isproductInDB) {
            return res.status(404).send({ status: false, message: "Product-Id is not present in DB" });
        }
        return res.status(200).send({ status: true, message: "Success", message: 'Product list', data: isproductInDB })


    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}


//========================================DELETE /books/:bookId==========================================================


const deleteproductsBYId = async function(req, res) {

    try {
        let productId = req.params.productId
        const queryParams = req.query
        const requestBody = req.body

        if (isValidRequestBody(queryParams)) {
            return res.status(400).send({ status: false, message: "Data is not required in quary params" })
        }

        if (isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Data is not required in request body" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid Product-Id" });
        }

        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!checkProduct) {
            return res.status(404).send({ status: false, message: 'Product already deleted' })
        }

        let updateProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: Date.now() }, { new: true })

        res.status(200).send({ status: true, message: 'Product sucessfully deleted', data: updateProduct })

    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

module.exports = { createProduct, getproductsById, updateByBookId, deleteproductsBYId }