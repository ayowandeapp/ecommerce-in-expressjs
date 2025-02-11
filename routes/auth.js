const path = require('path');

const express = require('express');

const authController = require('../controllers/auth');

const { isAuth } = require('../middleware/is-auth');

const { validateUserRegistration, validateUserLogin, validate, validatePasswordReset, validatePasswordResetConfirm } = require('../services/validation');


const router = express.Router();

router.get('/login', authController.getLogin)

router.post('/login', validate(validateUserLogin), authController.postLogin)

router.get('/signup', authController.getSignup)

router.post('/signup', validate(validateUserRegistration), authController.postSignup)

router.post('/logout', isAuth, authController.postLogout)

router.get('/reset', authController.getReset)

router.post('/reset',validate(validatePasswordResetConfirm), authController.postReset)

router.get('/reset/:token', authController.getNewPassword)

router.post('/new-password', validate(validatePasswordReset), authController.postNewPassword)

module.exports = router