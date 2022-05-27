const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const { authentication, authorization } = require("../middleWare/userAuth")


// User routes
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/user/:userId/profile', authentication, userController.getUserProfile)
router.put('/user/:userId/profile', authentication, authorization, userController.updateUserProfile)

//Product routes
router.post('/products', productController.createProduct);
router.get('/products/:productId', productController.getproductsById);
router.put('/products/:productId', productController.updateByBookId);
router.delete('/products/:productId', productController.deleteproductsBYId);

module.exports = router;