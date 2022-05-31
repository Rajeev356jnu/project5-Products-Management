const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const cartController=require("../controllers/cartController")
const { authentication, authorization } = require("../middleWare/userAuth")


// User routes
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/user/:userId/profile', authentication, userController.getUserProfile)
router.put('/user/:userId/profile', authentication, authorization, userController.updateUserProfile)


//Product routes
router.post('/products', productController.createProduct);
router.get('/products', productController.getProduct)
router.get('/products/:productId', productController.getProductById);
router.put('/products/:productId', productController.updateByBookId);
router.delete('/products/:productId', productController.deleteproductsBYId);

//cart routes
router.post('/users/:userId/cart',cartController.createCart)
router.put('/users/:userId/cart',cartController.updateCart)
router.get('/users/:userId/cart',cartController.getCart)
router.delete('/users/:userId/cart',cartController.deleteCart)


module.exports = router;