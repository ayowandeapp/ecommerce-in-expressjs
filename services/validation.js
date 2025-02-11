const { body, validationResult, matchedData, check } = require('express-validator');
const { User } = require('../models');


const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const flasMsg = errors.array().map(error => `${error.path}: ${error.msg}`).join('\n')
            req.flash('error', flasMsg)
            req.session.oldInput = req.body;
            // return res.status(400).json({ errors: errors.array() });
            return res.status(422).redirect(req.get('referer') || '/')
        }
        next();
    };
};

/**
 * Validation rules for user registration
 */
const validateUserRegistration = [
    // body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format')
    .custom(async value => {
        
        const user = await User.findOne({ where: { email: value } })

        if (user) {
            // throw new Error("A user with the email already exist!");
            throw new Error('A user with the email already exist!')
            
        }

    }),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirmPassword').trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
];

/**
 * Validation rules for user login
 */
const validateUserLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password').trim().notEmpty().withMessage('Password is required')
];

/**
 * Validation rules for password reset
 */
const validatePasswordReset = [
    check('passwordToken').notEmpty().withMessage('Invalid token'),
    check('userId').notEmpty().withMessage('Invalid token'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('passwordConfirm').trim().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
];

const validatePasswordResetConfirm = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format')
];

const validateAddProduct = [
    body('title').trim().notEmpty().isString().isLength({ min: 3}).withMessage('Product title is required!'),
    body('imageUrl').trim().notEmpty().isURL().withMessage('Product image_url is required!'),
    body('price').trim().notEmpty().isNumeric().withMessage('Product price is required!'),
    body('description').trim().notEmpty().isLength({ min: 8}).withMessage('Product description is required!'),
]

const validateEditProduct = [
    ...validateAddProduct,
    body('productId').trim().notEmpty().withMessage('Product is required!'),
]
module.exports = {
    validate,
    validateUserRegistration,
    validateUserLogin,
    validatePasswordReset,
    validatePasswordResetConfirm,
    validateEditProduct,
    validateAddProduct
};
