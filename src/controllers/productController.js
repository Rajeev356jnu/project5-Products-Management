const { default: mongoose } = require('mongoose');
const aws = require('../aws/aws')
const productModel = require('../models/productModel');

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


//---------------------------------------get product by filter--------------------------------------------------------------//

const getProduct = async function(req, res) {
    try {
        const queryData = req.query
            // const resultData={}
        let filter = { isDeleted: false }
        const { size, name, priceGreaterThan, priceLessThan, priceSort } = queryData
        // console.log(priceGreaterThan)
        if (isValid(size)) {
            let sizeKeys=['S','M','L','X','XS','XL','XXL']
            const sizeArray=size.trim().split(',').map(value=>value.trim().toUpperCase())
            for (let i = 0; i < sizeArray.length; i++) {
                const sizePresent=sizeKeys.includes(sizeArray[i])
                if (!sizePresent) {
                    return res.status(400).send({ status: false, message: "Please give proper sizes among XS,S,M,X,L,XXL,XL" })
                }
            }
    
            filter['availableSizes'] = sizeArray
        }

        if (isValid(name)) {

            filter['title'] = {$regex:name,$options:'i'}

        }
        let flag=true
        
        if (flag) {
            if ("priceLessThan" in queryData && 'priceGreaterThan' in queryData) {
                if (isNaN(Number(priceLessThan)) || isNaN(Number(priceGreaterThan))) {
                    return res.status(400).send({ status: false, message: 'please enter a valid price' })
                }
                if (priceGreaterThan <= 0 || priceLessThan<=0) {
                    return res.status(400).send({ status: false, message: 'price cannot be zero or less than zero' })
                }
                filter['price']={$gte:Number(priceGreaterThan),$lte:Number(priceLessThan)}
                flag=false
            }
        }
        
        if (flag) {
            if (isValid(priceLessThan)) {
                if (isNaN(Number(priceLessThan))) {
                    return res.status(400).send({ status: false, message: 'please enter a valid price' })
                }
                if (priceLessThan <= 0) {
                    return res.status(400).send({ status: false, message: 'price cannot be zero or less than zero' })
                }
               
                filter['price']={ $lte:Number(priceLessThan) } //to find products less than or equal to pricepoint
    
            }
            
            
    
            if (isValid(priceGreaterThan)) {
                if (isNaN(Number(priceGreaterThan))) {
                    return res.status(400).send({ status: false, message: 'please enter a valid price' })
                }
                if (priceGreaterThan <= 0) {
                    return res.status(400).send({ status: false, message: 'price cannot be zero or less than zero' })
                }
                filter['price']= {$gte:Number(priceGreaterThan)} //to find products greater than or equal to pricepoint
            }
    
        }
        // console.log(flag)

        if (isValid(priceSort)) {
            if (!(priceSort == 1 || priceSort == -1)) {
                return res.status(400).send({ status: false, message: 'price sort should be 1 or -1' })
            }
        }
        console.log(filter)
        const products = await productModel.find(filter).sort({ price: priceSort })
        if (products.length === 0) {
            return res.status(400).send({ status: false, message: 'No product found' })
        }
        return res.status(200).send({ status: true, message: 'product list', data: products })


    } catch (error) {
        return res.status(500).send({ message: 'error', error: error.message })
    }
}


//---------------------------------------getproduct by id----------------------------------------------------------------//
const getProductById = async function(req, res) {
    try {
        const productId = req.params.productId
        if (Object.keys(productId) == 0) {
            return res.status(400).send({ status: false, message: 'kindly provide product is in params path' })
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: 'product id is invalid' })
        }
        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(400).send({ status: false, message: 'product does not exist' })
        }
        return res.status(200).send({ status: true, data: product })
    } catch (error) {
        return res.status(500).send({ message: 'error', error: error.message })
    }
}



//---------------------------------------Update Product by id-------------------------------------------------------------------//
const updateByBookId = async(req, res) => {
    try {
        let productId = req.params.productId
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: " productId is not valid" })
        }
        const productFind = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!productFind) { return res.status(400).send({ status: false, msg: "No product found with this productId" }) }
        let data = req.body
        if (!Object.keys(data).length) { return res.status(400).send({ status: false, msg: " provide some data" }) }
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data

        if ("title" in data) {
            if (!isValid(title)) {
                return res.status(400).send({ status: false, Message: "title is required" })
            }
        }
        //  -----------------------check title duplicacy----------------------------//
        let titleCheck = await productModel.findOne({ title: title })
        if (titleCheck) return res.status(400).send({ status: false, msg: 'Title  already exists' })

        if ("description" in data) {
            if (!isValid(description)) {
                return res.status(400).send({ status: false, Message: "description is required" })
            }
        }

        if ("price" in data) {
            if (!isValid(price)) {
                return res.status(400).send({ status: false, Message: "price is required" })
            }
        }

        if ("currencyId" in data) {
            if (!isValid(currencyId)) {
                return res.status(400).send({ status: false, Message: "currencyId is required" })
            }
        }

        if ("currencyFormat" in data) {
            if (!isValid(currencyFormat)) {
                return res.status(400).send({ status: false, Message: "currencyFormat is required" })
            }
        }

        if ("style" in data) {
            if (!isValid(style)) {
                return res.status(400).send({ status: false, Message: "style is required" })
            }
        }

        if ("installments" in data) {
            if (!isValid(installments)) {
                return res.status(400).send({ status: false, Message: "installments is required" })
            }
        }

        if ("productImage" in data) {

            let files = req.files
            if (files && files.length > 0) {
                let productImage = await uploadFile(files[0])
            }
        }

        if ("availableSizes" in data) {
            if (!isValid(availableSizes)) {
                return res.status(400).send({ status: false, Message: "availableSizes is required" })
            }

            let availableSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            availableSizes = JSON.parse(availableSizes)

            let sizeArr = availableSizes.split("").map(x => x)
            for (let i = 0; i < sizeArr.length; i++) {
                if (!(availableSizes.includes(sizeArr[i]))) {
                    return res.status(400).send({ status: false, message: `availableSizes should be among [${availableSizes}]` })
                }
            }
        }

        if ("isFreeShipping" in data) {
            if (!isValid(isFreeShipping)) {
                return res.status(400).send({ status: false, Message: "isFreeShipping is required" })
            }
        }
        if (!((isFreeShipping === "true") || (isFreeShipping === "false"))) {

            return res.status(400).send({ status: false, message: 'isFreeShipping should be a boolean value' })
        }

        let updateProduct = await productModel.findOneAndUpdate({ _id: productId }, {
            $set: {
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




module.exports = { createProduct, getProduct, getProductById, updateByBookId, deleteproductsBYId }