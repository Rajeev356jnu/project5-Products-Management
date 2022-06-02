const cartModel=require('../models/cartModel');
const orderModel = require('../models/orderModel');
const productModel=require('../models/productModel');
const userModel = require('../models/userModel');

//validation Part
const isValid = function(value) {

    if (!value || typeof value != "string" || value.trim().length == 0) return false;
    return true;
}

const isValidRequestBody=function (requestBody) {
    return Object.keys(requestBody).length>0
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const createOrder=async function (req,res) {
    try {
        
    } catch (error) {
        return res.status(500).send({status:false,message:error.message})
    }
}

const updateOrder=async function (req,res) {
    try {
        const userId=req.params.userId
        const {orderId}=req.body
        if (Object.keys(userId)==0) {
            return res.status(400).send({status:false,message:'kindly provide userid in path params'})
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({status:false,message:'invalid userid!!'})
        }
        const user =await userModel.findOne({_id:userId})
        if (!user) {
            return res.status(404).send({status:false,message:'user not found'})
        }
        if (!isValidRequestBody(req.body)) {
            return res.status(400).send({status:false,message:'provide appropriate details in request body'})
        }
        if (!isValid(orderId)) {
            return res.status(400).send({status:false,message:'enter orderId'})
        }
        if (!isValidObjectId(orderId)) {
            return res.status(400).send({status:false,message:'invalid orderId'})
        }
        const order=await orderModel.findOne({_id:orderId,isDeleted:false})
        if (!order) {
            return res.status(403).send({status:false,message:'order not found'})
        }
        if (order._id!=userId) {
            return res.status(400).send({status:false,Message:'this order does not belong to you,enter appropriate order id'})
        }
        if (order.cancellable==true) {
            const filterData={}
            filterData['isDeleted']=true
            filterData['DeletedAt']=new Date()
            filterData['status']='cancelled'
            const updatedStatus=await orderModel.findOneAndUpdate({_id:orderId},filterData,{new:true})
            return res.status(200).send({status:true,message:'successfully updated the order status',data:updatedStatus})
        }
        else{
            return res.status(200).send({status:true,message:'Once order placed ,it can not be cancelled'})
        }

        
        // if (order.status=='pending' && status.toLowerCase()=='cancelled' && order.cancellable==true) {
        //     const filterData={}
        //     filterData['isDeleted']=true
        //     filterData['DeletedAt']=new Date()
        //     filterData['status']=status.toLowerCase()
        //     const updatedStatus=await orderModel.findOneAndUpdate({_id:orderId},filterData,{new:true})
        //     return res.status(200).send({status:true,message:'successfully updated the order status',data:updatedStatus})
        // }
        // if (order.status=='pending' && status.toLowerCase()=='cancelled' && order.cancellable==false) {
        //     return res.status(400).send({status:false,message:'order is not allowed to cancel'})
        // }
        // if (order.status=='pending' && status.toLowerCase()=='pending') {
        //     return res.status(400).send({status:false,message:'unable to update or change the status,because it is already pending'})
        // }
        // if (order.status=='pending' && status.toLowerCase()=='completed') {
        //     const updatedStatus=await orderModel.findOneAndUpdate({_id:orderId},{status:status.toLowerCase()},{new:true})
        //     return res.status(400).send({status:false,message:'successfully updated the order status',data:updatedStatus})
        // }
        // if ((order.status=='completed') && (status.toLowerCase()=='pending' || status.toLowerCase()=='completed' || status.toLowerCase()=='cancelled')) {
        //     return res.status(400).send({status:false,message:'order is already completed'})
        // }
        // if ((order.status=='cancelled') && (status.toLowerCase()=='cancelled' || status.toLowerCase()=='pending' || status.toLowerCase()=='completed')) {
        //     return res.status(400).send({status:false,message:'order is already cancelled'})
        // }
   

    } catch (error) {
        return res.status(500).send({status:false,message:error.message})
    }

   
}


module.exports={createOrder,updateOrder}