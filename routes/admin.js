const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const { isAuth } = require('./../middleware/is-auth');
const { validate, validateAddProduct, validateEditProduct } = require('../services/validation');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth, validate(validateAddProduct), adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, validate(validateEditProduct), adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
