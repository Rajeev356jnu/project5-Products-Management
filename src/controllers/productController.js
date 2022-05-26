// const userModel = require('../models/productModel')
const { default: mongoose } = require('mongoose');
const aws = require('../aws/aws');
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


//---------------------------------------get product filter--------------------------------------------------------------//

const getProduct=async function (req,res) {
    try {
        const queryData=req.query
        // const resultData={}
        let filter={isDeleted:false}
        const {size,name,priceGreaterThan,priceLessThan,priceSort}=queryData
        if (isValid(size)) {
            
            filter['availableSizes']=size
        }

        if (isValid(name)) {

            filter['title']=name
        }

        if (isValid(priceLessThan)) {
          if (isNaN(Number(priceLessThan))) {
            return res.status(400).send({status:false,message:'please enter a valid number'})
          }
          if (priceLessThan<=0) {
            return res.status(400).send({status:false,message:'price cannot be zero or less than zero'})  
          }
          filter['price']['$gte']= Number(priceLessThan)                           //to find products less than or equal to pricepoint
        }

        if (isValid(priceGreaterThan)) {
            if (isNaN(Number(priceGreaterThan))) {
              return res.status(400).send({status:false,message:'please enter a valid number'})
            }
            if (priceGreaterThan<=0) {
              return res.status(400).send({status:false,message:'price cannot be zero or less than zero'})  
            }
            filter['price']['$lte']= Number(priceGreaterThan) //to find products less than or equal to pricepoint
        }

        if (isValid(priceSort)) {
            if (!(priceSort==1 || priceSort==-1)) {
              return res.status(400).send({status:false,message:'price sort should be 1 or -1'})  
            }
        }

        const products=await productModel.find(filter).sort({price:priceSort})
        if (products.length===0) {
            return res.status(400).send({status:false,message:'No product found'})
        }
        return res.status(200).send({status:true,message:'product list',data:products})


    } catch (error) {
        return res.status(500).send({message:'error',error:error.message})
    }
}

//---------------------------------------getproduct by id----------------------------------------------------------------//
const getProductById=async function (req,res) {
    try {
        const productId=req.params.productId
        if (Object.keys(productId)==0) {
            return res.status(400).send({status:false,message:'kindly provide product is in params path'})
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({status:false,message:'product id is invalid'})
        }
        const product=await productModel.findById(productId)
        if (!product) {
            return res.status(400).send({status:false,message:'product does not exist'})
        }
        return res.status(200).send({status:true,data:product})
    } catch (error) {
        return res.status(500).send({message:'error',error:error.message})
    }
}



module.exports={getProductById,getProduct}
