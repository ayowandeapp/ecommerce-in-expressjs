const { User } = require("../models");
const bcrypt = require('bcryptjs');
const sendMail = require('./../services/mailer')


exports.getLogin = async (req, res, next) => {

    let message = req.flash('error')
    message = message.length > 0 ? message : null

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false,
        errorMsg: message
    });
};

exports.postLogin = async (req, res, next) => {
    try {

        const { email, password } = req.body;

        let user = await User.findOne({ where: { email: email } })

        if (!user) {
            console.log('User not found');
            req.flash('error', 'Invalid credentials')
            return res.redirect('/login')
        }

        const matched = await bcrypt.compare(password, user.password)

        if (!matched) {
            console.log('Password incorrect');
            req.flash('error', 'Invalid credentials')
            return res.redirect('/login')
        }
        req.session.isAuthenticated = matched;
        req.session.user = user;

        await req.session.save();

        // console.log(req.session.isAuthenticated, matched, req.session.user, 'session')
        return res.redirect('/')
    } catch (error) {

        console.log(error, 'error')

        return res.redirect('/login');
    }
};


exports.postLogout = async (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect('/')
    })
};


exports.getSignup = async (req, res, next) => {

    let message = req.flash('error')
    message = message.length > 0 ? message : null

    res.render('auth/signup', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false,
        errorMsg: message
    });
};

exports.postSignup = async (req, res, next) => {

    try {

        const email = req.body.email
        const password = req.body.password
        const confirmPassword = req.body.confirmPassword

        if (!email || !password) {
            req.flash('error', 'Credentials required!')
            return res.redirect('/signup')
        }

        const user = await User.findOne({ where: { email: email } })

        if (!!user) {
            // throw new Error("A user with the email already exist!");
            req.flash('error', 'A user with the email already exist!')
            return res.redirect('/signup')
        }

        bcrypt.hash(password, 12, function (err, hash) {
            User.create({ email: email, name: ' ', password: hash })
        })

        await sendMail(
            email,
            'Welcome to Our App!',
            'Thank you for signing up.',
            '<h1>Welcome to Our App!</h1><p>We are excited to have you. Kindly login with your email and password to continue.</p>'
        );
        return res.redirect('/login')
    } catch (error) {

    }
};