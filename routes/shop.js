const path = require('path');

const { isAuth } = require('./../middleware/is-auth')

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:product_id', shopController.showProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.addCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/create-order', isAuth, shopController.submitOrder);

router.get('/checkout', isAuth, shopController.getCheckout);

module.exports = router;
